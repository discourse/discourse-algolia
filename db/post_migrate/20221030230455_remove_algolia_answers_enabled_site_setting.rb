# frozen_string_literal: true

class RemoveAlgoliaAnswersEnabledSiteSetting < ActiveRecord::Migration[7.0]
  def up
    execute <<~SQL
      DELETE FROM site_settings
      WHERE name = 'algolia_answers_enabled'
    SQL
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
