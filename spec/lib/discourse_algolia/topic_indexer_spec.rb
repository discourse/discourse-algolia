# frozen_string_literal: true

describe DiscourseAlgolia::TopicIndexer do
  subject(:topic_indexer) { DiscourseAlgolia.indexer(:topic) }

  let(:post_indexer) { DiscourseAlgolia.indexer(:post) }
  fab!(:admin) { Fabricate(:admin) }
  fab!(:post) { Fabricate(:post, post_number: 1) }
  fab!(:post_2) { Fabricate(:post, topic: post.topic, post_number: 2) }

  before { setup_algolia_tests }

  context "with destroyed topics" do
    it "deletes posts from destroyed topics" do
      PostDestroyer.new(admin, post).destroy

      topic_indexer.index.expects(:save_objects).never
      topic_indexer.index.expects(:delete_objects).with([post.id, post_2.id])
      topic_indexer.process!
      expect(post_indexer.queue_ids).to eq([])
    end
  end

  context "with recovered topics" do
    before do
      PostDestroyer.new(admin, post).destroy
      Discourse.redis.del(DiscourseAlgolia::TopicIndexer::QUEUE_NAME)
    end

    it "enqueues all posts from recovered topic" do
      PostDestroyer.new(admin, post).recover

      topic_indexer.index.expects(:save_objects).with([post_indexer.to_object(post)])
      topic_indexer.index.expects(:delete_objects).never
      topic_indexer.process!
      expect(post_indexer.queue_ids).to eq([post_2.id])
    end
  end
end
