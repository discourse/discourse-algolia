# frozen_string_literal: true

require 'rails_helper'

describe DiscourseAlgolia::PostIndexer do
  let(:subject) { DiscourseAlgolia.indexer(:post) }

  fab!(:post) { Fabricate(:post) }
  fab!(:pm_post) { Fabricate(:private_message_post) }

  before do
    SiteSetting.algolia_enabled = true
    SiteSetting.algolia_application_id = 'appid'
    SiteSetting.algolia_search_api_key = 'searchapikey'
    SiteSetting.algolia_admin_api_key = 'adminapikey'

    [
      DiscourseAlgolia::UserIndexer,
      DiscourseAlgolia::TagIndexer,
      DiscourseAlgolia::PostIndexer,
      DiscourseAlgolia::TopicIndexer,
    ].each do |indexer_class|
      stub_request(:get, "https://#{SiteSetting.algolia_application_id}-dsn.algolia.net/1/indexes/#{indexer_class::INDEX_NAME}/settings?getVersion=2")
        .to_return(status: 200, body: '{}')

      Discourse.redis.del(indexer_class::QUEUE_NAME)
    end
  end

  it 'does not index private posts' do
    subject.index.expects(:save_objects).with([subject.to_object(post)])
    subject.index.expects(:delete_objects).with([pm_post.id])
    subject.process!(ids: [post.id, pm_post.id])
  end
end
