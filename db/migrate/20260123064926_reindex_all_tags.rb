# frozen_string_literal: true

class ReindexAllTags < ActiveRecord::Migration[7.0]
  def up
    tag_ids = execute("SELECT id FROM tags").map { |r| r["id"].to_i }

    tag_ids.in_groups_of(500) { |batch| Discourse.redis.rpush("algolia-tags", batch.compact) }
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
