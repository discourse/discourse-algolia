# frozen_string_literal: true

require "rails_helper"

describe DiscourseAlgolia::PostIndexer do
  let(:subject) { DiscourseAlgolia.indexer(:post) }

  fab!(:post) { Fabricate(:post) }
  fab!(:pm_post) { Fabricate(:private_message_post) }

  before { setup_algolia_tests }

  it "does not index private posts" do
    subject.index.expects(:save_objects).with([subject.to_object(post)])
    subject.index.expects(:delete_objects).with([pm_post.id])
    subject.process!(ids: [post.id, pm_post.id])
  end
end
