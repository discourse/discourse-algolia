# frozen_string_literal: true

class DiscourseAlgolia
  def self.process!
    return if !SiteSetting.algolia_enabled?

    DistributedMutex.synchronize("algolia-queue", validity: 1.minute) do
      %i[user tag topic post].each { |type| indexer(type).process! }
    end
  end

  def self.indexer(type)
    client =
      Algolia::Search::Client.create(
        SiteSetting.algolia_application_id,
        SiteSetting.algolia_admin_api_key,
      )
    guardian = Guardian.new

    case type.to_sym
    when :user
      DiscourseAlgolia::UserIndexer.new(client, guardian)
    when :tag
      DiscourseAlgolia::TagIndexer.new(client, guardian)
    when :topic
      DiscourseAlgolia::TopicIndexer.new(client, guardian)
    when :post
      DiscourseAlgolia::PostIndexer.new(client, guardian)
    end
  end
end
