# frozen_string_literal: true

class DiscourseAlgolia::UserIndexer < DiscourseAlgolia::Indexer
  QUEUE_NAME = "algolia-users"
  INDEX_NAME = "discourse-users"
  SETTINGS = {
    "attributesToHighlight" => %i[username name],
    "attributesToRetrieve" => %i[username name url avatar_template likes_received days_visited],
    "customRanking" => %w[desc(likes_received) desc(days_visited)],
    "removeWordsIfNoResults" => "allOptional",
    "searchableAttributes" => ["username,name"],
  }

  def queue(ids)
    User.includes(:user_profile, :user_stat).where(id: ids)
  end

  def should_index?(user)
    @guardian.can_see?(user)
  end

  def to_object(user)
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
end
