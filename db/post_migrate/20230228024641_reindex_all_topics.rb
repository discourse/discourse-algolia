# frozen_string_literal: true

class ReindexAllTopics < ActiveRecord::Migration[7.0]
  def up
    post_ids = execute("SELECT id FROM posts WHERE post_number = 1").map { |r| r["id"].to_i }

    post_ids.in_groups_of(500) do |batch|
      Discourse.redis.rpush("algolia-first-posts", batch.compact)
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
