# frozen_string_literal: true

require 'algoliasearch'

module DiscourseAlgolia
  class AlgoliaHelper

    USERS_INDEX = "discourse-users".freeze
    POSTS_INDEX = "discourse-posts".freeze
    TAGS_INDEX = "discourse-tags".freeze

    # rank fragments with just a few words lower than others
    # usually they contain less substance
    WORDINESS_THRESHOLD = 5

    # detect salutations to avoid indexing with these common words
    SKIP_WORDS = ["thanks", "thank", "hi", "hey", "hello", "bye",
      "goodbye", "sincerely", "regards", "cheers", "ok", "heyo",
      "heya", "dear"]

    def self.index_user(user_id, discourse_event)
      user = User.find_by(id: user_id)
      return if user.blank? || !guardian.can_see?(user)

      user_record = to_user_record(user)
      add_algolia_record(USERS_INDEX, user_record, user_id)
    end

    def self.to_user_record(user)
      {
        objectID: user.id,
        url: "/u/#{user.username}",
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
        last_seen_at: user.last_seen_at
      }
    end

    def self.index_topic(topic_id, discourse_event)
    end

    def self.index_post(post_id, discourse_event)
      post = Post.find_by(id: post_id)
      if should_index_post?(post)
        post_records = to_post_records(post)
        add_algolia_records(POSTS_INDEX, post_records)
      end
    end

    def self.should_index_post?(post)
      return false if post.blank? || post.post_type != Post.types[:regular] || !guardian.can_see?(post)
      topic = post.topic
      return false if topic.blank? || topic.archetype == Archetype.private_message
      true
    end

    def self.to_post_records(post)

      post_records = []

      doc = Nokogiri::HTML(post.cooked)
      parts = doc.text.split(/\n/)

      parts.reject! do |content|
        content.strip.empty?
      end

      # for debugging, print the skips after the loop
      # to see what was excluded from indexing
      skips = []

      parts.each_with_index do |content, index|

        # skip anything without any alpha characters
        # commonly formatted code lines with only symbols
        unless content =~ /\w/
          skips.push(content)
          next
        end

        words = content.split(/\s+/)

        # don't index short lines that are probably saluations
        words.map! do |word|
          word.downcase.gsub(/[^0-9a-z]/i, '')
        end
        if (words.length <= WORDINESS_THRESHOLD && (SKIP_WORDS & words).length > 0)
          skips.push(content)
          next
        end

        record = {
          objectID: "#{post.id}-#{index}",
          url: "/t/#{post.topic.slug}/#{post.topic.id}/#{post.post_number}",
          post_id: post.id,
          part_number: index,
          post_number: post.post_number,
          created_at: post.created_at.to_i,
          updated_at: post.updated_at.to_i,
          reads: post.reads,
          like_count: post.like_count,
          image_url: post.image_url,
          word_count: words.length,
          is_wordy: words.length >= WORDINESS_THRESHOLD,
          content: content[0..8000]
        }

        user = post.user
        record[:user] = {
          id: user.id,
          url: "/u/#{user.username}",
          name: user.name,
          username: user.username,
          avatar_template: user.avatar_template
        }

        topic = post.topic
        if (topic)
          clean_title = topic.title.gsub(/[^\u1F600-\u1F6FF\s]/i, '')
          record[:topic] = {
            id: topic.id,
            url: "/t/#{topic.slug}/#{topic.id}",
            title: clean_title,
            views: topic.views,
            slug: topic.slug,
            like_count: topic.like_count,
            tags: topic.tags.map(&:name)
          }

          category = topic.category
          if (category)
            record[:category] = {
              id: category.id,
              url: "/c/#{category.slug}",
              name: category.name,
              color: category.color,
              slug: category.slug
            }
          end
        end

        post_records << record
      end

      post_records

    end

    def self.to_tag_record(tag)
      {
        objectID: tag.id,
        url: "/tags/#{tag.name}",
        name: tag.name,
        topic_count: tag.topic_count
      }
    end

    def self.index_tags(tag_names, discourse_event)
      tag_names.each do |tag_name|
        tag = Tag.find_by_name(tag_name)
        if (tag && should_index_tag?(tag))
          add_algolia_record(TAGS_INDEX, to_tag_record(tag), tag.id)
        end
      end
    end

    def self.should_index_tag?(tag)
      tag.topic_count > 0
    end

    def self.add_algolia_record(index_name, record, object_id)
      algolia_index(index_name).add_object(record, object_id)
    end

    def self.add_algolia_records(index_name, records)
      algolia_index(index_name).add_objects(records)
    end

    def self.algolia_index(index_name)
      Algolia.init(
        application_id: SiteSetting.algolia_application_id,
        api_key: SiteSetting.algolia_admin_api_key)
      Algolia::Index.new(index_name)
    end

    def self.guardian
      Guardian.new(User.find_by(username: SiteSetting.algolia_discourse_username))
    end
  end
end
