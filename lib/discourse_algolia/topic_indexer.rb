# frozen_string_literal: true

class DiscourseAlgolia::TopicIndexer < DiscourseAlgolia::PostIndexer
  QUEUE_NAME = "algolia-first-posts"

  def process!(ids: nil)
    ids ||= queue_ids
    return if ids.blank?

    objects = []
    recovered_topic_ids = []
    deleted_topic_ids = []

    Post
      .unscoped
      .includes(:user, topic: %i[tags category shared_draft])
      .where(id: ids)
      .find_each do |post|
        if should_index?(post)
          objects << to_object(post)
          ids.delete(post.id)
          recovered_topic_ids << post.topic_id if post.topic.posts_count > 1
        else
          deleted_topic_ids << post.topic_id
        end
      end

    # Re-index all posts in recovered topics
    Post
      .where("post_number > 1")
      .where(topic_id: recovered_topic_ids)
      .pluck(:id)
      .each { |post_id| DiscourseAlgolia::PostIndexer.enqueue(post_id) }

    # Delete all posts in deleted topics
    ids |= Post.unscoped.where(topic_id: deleted_topic_ids).pluck(:id) if deleted_topic_ids.present?

    @index.save_objects(objects) if objects.present?
    @index.delete_objects(ids) if ids.present?
  end
end
