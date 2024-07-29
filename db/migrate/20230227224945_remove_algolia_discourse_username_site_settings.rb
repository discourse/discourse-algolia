# frozen_string_literal: true

class RemoveAlgoliaDiscourseUsernameSiteSettings < ActiveRecord::Migration[7.0]
  def up
    execute "DELETE FROM site_settings WHERE name = 'algolia_discourse_username'"
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
