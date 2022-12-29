# frozen_string_literal: true

def setup_algolia_tests
  SiteSetting.algolia_enabled = true
  SiteSetting.algolia_application_id = "appid"
  SiteSetting.algolia_search_api_key = "searchapikey"
  SiteSetting.algolia_admin_api_key = "adminapikey"

  [
    DiscourseAlgolia::UserIndexer,
    DiscourseAlgolia::TagIndexer,
    DiscourseAlgolia::PostIndexer,
    DiscourseAlgolia::TopicIndexer,
  ].each do |indexer_class|
    stub_request(
      :get,
      "https://#{SiteSetting.algolia_application_id}-dsn.algolia.net/1/indexes/#{indexer_class::INDEX_NAME}/settings?getVersion=2",
    ).to_return(status: 200, body: "{}")

    Discourse.redis.del(indexer_class::QUEUE_NAME)
  end
end
