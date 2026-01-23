# frozen_string_literal: true

describe DiscourseAlgolia::PostIndexer do
  subject(:post_indexer) { DiscourseAlgolia.indexer(:post) }

  fab!(:post)
  fab!(:pm_post, :private_message_post)

  before { setup_algolia_tests }

  it "does not index private posts" do
    post_indexer.index.expects(:save_objects).with([post_indexer.to_object(post)])
    post_indexer.index.expects(:delete_objects).with([pm_post.id])
    post_indexer.process!(ids: [post.id, pm_post.id])
  end

  describe "#to_object" do
    fab!(:tag1) { Fabricate(:tag, name: "bug") }
    fab!(:tag2) { Fabricate(:tag, name: "feature-request") }
    fab!(:topic_with_tags) { Fabricate(:topic, tags: [tag1, tag2]) }
    fab!(:post_with_tags) { Fabricate(:post, topic: topic_with_tags) }

    it "indexes tags as objects with id, name, and slug" do
      object = post_indexer.to_object(post_with_tags)

      expect(object[:topic][:tags]).to contain_exactly(
        { id: tag1.id, name: "bug", slug: "bug" },
        { id: tag2.id, name: "feature-request", slug: "feature-request" },
      )
    end
  end
end
