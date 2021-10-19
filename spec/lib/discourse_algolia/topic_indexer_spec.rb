# frozen_string_literal: true

require 'rails_helper'

describe DiscourseAlgolia::TopicIndexer do
  let(:subject) { DiscourseAlgolia.indexer(:topic) }
  let(:post_indexer) { DiscourseAlgolia.indexer(:post) }

  fab!(:admin) { Fabricate(:admin) }
  fab!(:post) { Fabricate(:post, post_number: 1) }
  fab!(:post_2) { Fabricate(:post, topic: post.topic, post_number: 2) }

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

  context 'destroyed topics' do
    it 'deletes posts from destroyed topics' do
      PostDestroyer.new(admin, post).destroy

      subject.index.expects(:save_objects).never
      subject.index.expects(:delete_objects).with([post.id, post_2.id])
      subject.process!
      expect(post_indexer.queue_ids).to eq([])
    end
  end

  context 'recovered topics' do
    before do
      PostDestroyer.new(admin, post).destroy
      Discourse.redis.del(DiscourseAlgolia::TopicIndexer::QUEUE_NAME)
    end

    it 'enqueues all posts from recovered topic' do
      PostDestroyer.new(admin, post).recover

      subject.index.expects(:save_objects).with([post_indexer.to_object(post)])
      subject.index.expects(:delete_objects).never
      subject.process!
      expect(post_indexer.queue_ids).to eq([post_2.id])
    end
  end
end
