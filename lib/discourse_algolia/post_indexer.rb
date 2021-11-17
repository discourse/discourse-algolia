# frozen_string_literal: true

class DiscourseAlgolia::PostIndexer < DiscourseAlgolia::Indexer
  QUEUE_NAME = "algolia-posts"
  INDEX_NAME = "discourse-posts"
  SETTINGS = {
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

  def queue(ids)
    Post.includes(:user, topic: [:tags, :category, :shared_draft]).where(id: ids)
  end

  def should_index?(post)
    @guardian.can_see?(post)
  end

  def to_object(post)
    object = {
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
      }
    }

    if post.topic.category.present?
      object[:category] = {
        id: post.topic.category.id,
        url: post.topic.category.url,
        name: post.topic.category.name,
        color: post.topic.category.color,
        slug: post.topic.category.slug,
      }
    end

    object
  end
end
