# frozen_string_literal: true

describe DiscourseAlgolia::PostIndexer do
  subject(:post_indexer) { DiscourseAlgolia.indexer(:post) }

  fab!(:post) { Fabricate(:post) }
  fab!(:pm_post) { Fabricate(:private_message_post) }

  before { setup_algolia_tests }

  it "does not index private posts" do
    post_indexer.index.expects(:save_objects).with([post_indexer.to_object(post)])
    post_indexer.index.expects(:delete_objects).with([pm_post.id])
    post_indexer.process!(ids: [post.id, pm_post.id])
  end
end
