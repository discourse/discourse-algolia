# frozen_string_literal: true

require "algolia"

class DiscourseAlgolia
  PROCESSING_QUEUE_NAME ||= "discourse-algolia-processing-queue"

  POSTS_SETTINGS ||= {
    "advancedSyntax" => true,
    "attributeForDistinct" => "topic.id",
    "attributesToHighlight" => ["topic.title", "topic.tags", "content"],
    "attributesToRetrieve" => [
      "post_number", "content", "url", "image_url",
      "topic.title", "topic.tags", "topic.slug", "topic.url", "topic.views",
      "user.username", "user.name", "user.avatar_template", "user.url",
      "category.name", "category.color", "category.slug", "category.url",
    ],
    "attributesToSnippet" => ["content:30"],
    "customRanking" => ["desc(topic.views)", "asc(post_number)"],
    "distinct" => 1,
    "ranking" => ["typo", "words", "filters", "proximity", "attribute", "custom"],
    "removeWordsIfNoResults" => "allOptional",
    "searchableAttributes" => ["topic.title,topic.tags,content"],
  }

  USERS_SETTINGS ||= {
    "attributesToHighlight" => [:username, :name],
    "attributesToRetrieve" => [:username, :name, :url, :avatar_template, :likes_received, :days_visited],
    "customRanking" => ["desc(likes_received)", "desc(days_visited)"],
    "removeWordsIfNoResults" => "allOptional",
    "searchableAttributes" => ["username,name"],
  }

  TAGS_SETTINGS ||= {
    "attributesToRetrieve" => [:name, :url, :topic_count],
    "customRanking" => ["desc(topic_count)"],
    "removeWordsIfNoResults" => "allOptional",
    "searchableAttributes" => [:name],
  }

  def self.enqueue_record(type, id)
    Discourse.redis.rpush(PROCESSING_QUEUE_NAME, [type, id].to_json)
  end

  def self.dequeue_records(count = 1000)
    Discourse.redis.lrange(PROCESSING_QUEUE_NAME, 0, count).map { |r| JSON.parse(r) }
  end

  def self.process_queue!
    return unless SiteSetting.algolia_enabled?
    return unless algolia_client

    DistributedMutex.synchronize("algolia-queue", validity: 1.minute) do
      records = dequeue_records

      return if records.blank?

      first_post_ids = []
      post_ids = []
      user_ids = []
      tag_ids = []

      records.each do |type, id|
        case type
        when "topic" then first_post_ids << id
        when "post"  then post_ids << id
        when "user"  then user_ids << id
        when "tag"   then tag_ids << id
        end
      end

      process_topics!(first_post_ids)
      process_posts!(post_ids)
      process_users!(user_ids)
      process_tags!(tag_ids)
    end
  end

  def self.process_topics!(post_ids)
    return if post_ids.blank?

    posts = []
    deleted_topic_ids = []
    recovered_topic_ids = []

    Post.includes(:user, topic: [:tags, :category, :shared_draft]).where(id: post_ids).find_each do |post|
      if should_index_post?(post)
        posts << post_to_object(post)
        post_ids.delete(post.id)
        recovered_topic_ids << post.topic_id if post.topic.posts_count > 1
      else
        deleted_topic_ids << post.topic_id
      end
    end

    # delete all the posts in the deleted topics
    post_ids |= Post.unscoped.where(topic_id: deleted_topic_ids).pluck(:id) if deleted_topic_ids.present?

    # re-index all the posts in the recovered topics
    Post.where("post_number > 1").where(topic_id: recovered_topic_ids).pluck(:id).each do |post_id|
      DiscourseAlgolia.enqueue_record(:post, post_id)
    end

    posts_index.save_objects(posts) if posts.present?
    posts_index.delete_objects(post_ids) if post_ids.present?
  end

  def self.process_posts!(ids)
    return if ids.blank?

    posts = []

    Post.includes(:user, topic: [:tags, :category, :shared_draft]).where(id: ids).find_each do |post|
      if should_index_post?(post)
        posts << post_to_object(post)
        ids.delete(post.id)
      end
    end

    posts_index.save_objects(posts) if posts.present?
    posts_index.delete_objects(ids) if ids.present?
  end

  def self.process_users!(ids)
    return if ids.blank?

    users = []

    User.includes(:user_profile, :user_stat).where(id: ids).find_each do |user|
      if should_index_user?(user)
        users << user_to_object(user)
        ids.delete(user.id)
      end
    end

    users_index.save_objects(users) if users.present?
    users_index.delete_objects(ids) if ids.present?
  end

  def self.process_tags!(ids)
    return if ids.blank?

    tags = []

    Tag.where(id: ids).find_each do |tag|
      if should_index_tag?(tag)
        tags << tag_to_object(tag)
        ids.delete(tag.id)
      end
    end

    tags_index.save_objects(tags) if tags.present?
    tags_index.delete_objects(ids) if ids.present?
  end

  def self.should_index_post?(post)
    algolia_guardian.can_see?(post)
  end

  def self.should_index_user?(user)
    algolia_guardian.can_see?(user)
  end

  def self.should_index_tag?(tag)
    algolia_guardian.can_see?(tag) && tag.topic_count > 0
  end

  def self.post_to_object(post)
    {
      objectID: post.id,
      url: post.url,
      post_id: post.id,
      post_number: post.post_number,
      created_at: post.created_at.to_i,
      updated_at: post.updated_at.to_i,
      reads: post.reads,
      like_count: post.like_count,
      image_url: post.image_url,
      word_count: post.word_count,
      content: Nokogiri::HTML5.fragment(post.cooked).text,
      user: {
        id: post.user.id,
        url: "/u/#{post.user.username_lower}",
        name: post.user.name,
        username: post.user.username,
        avatar_template: post.user.avatar_template,
      },
      topic: {
        id: post.topic.id,
        url: post.topic.url,
        title: post.topic.title,
        views: post.topic.views,
        slug: post.topic.slug,
        like_count: post.topic.like_count,
        tags: post.topic.tags.map(&:name),
      },
      category: {
        id: post.topic.category.id,
        url: post.topic.category.url,
        name: post.topic.category.name,
        color: post.topic.category.color,
        slug: post.topic.category.slug,
      }
    }
  end

  def self.user_to_object(user)
    {
      objectID: user.id,
      url: "/u/#{user.username_lower}",
      name: user.name,
      username: user.username,
      avatar_template: user.avatar_template,
      bio_raw: user.user_profile.bio_raw,
      post_count: user.post_count,
      badge_count: user.badge_count,
      likes_given: user.user_stat.likes_given,
      likes_received: user.user_stat.likes_received,
      days_visited: user.user_stat.days_visited,
      topic_count: user.user_stat.topic_count,
      posts_read: user.user_stat.posts_read_count,
      time_read: user.user_stat.time_read,
      created_at: user.created_at.to_i,
      updated_at: user.updated_at.to_i,
      last_seen_at: user.last_seen_at,
    }
  end

  def self.tag_to_object(tag)
    {
      objectID: tag.id,
      url: tag.url,
      name: tag.name,
      topic_count: tag.topic_count,
    }
  end

  def self.posts_index
    @posts_index ||= algolia_index("discourse-posts", POSTS_SETTINGS)
  end

  def self.users_index
    @users_index ||= algolia_index("discourse-users", USERS_SETTINGS)
  end

  def self.tags_index
    @tags_index ||= algolia_index("discourse-tags", TAGS_SETTINGS)
  end

  @algolia_indexes = {}

  def self.algolia_index(name, settings)
    @algolia_indexes[name] ||= begin
      index = algolia_client.init_index(name)
      index.set_settings(settings) unless index.exists?
      index
    end
  end

  def self.algolia_client
    @algolia_client ||= Algolia::Search::Client.create(SiteSetting.algolia_application_id, SiteSetting.algolia_admin_api_key)
  end

  def self.algolia_guardian
    @algolia_guardian ||= Guardian.new(User.find_by(username: SiteSetting.algolia_discourse_username))
  end
end
