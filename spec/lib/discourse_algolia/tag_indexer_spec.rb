# frozen_string_literal: true

describe DiscourseAlgolia::TagIndexer do
  subject(:tag_indexer) { DiscourseAlgolia.indexer(:tag) }

  fab!(:user) { Fabricate(:user) }
  fab!(:admin) { Fabricate(:admin) }
  fab!(:group) { Fabricate(:group) }
  fab!(:tag) { Fabricate(:tag) }
  fab!(:public_category) { Fabricate(:category) }
  fab!(:read_restricted_category) { Fabricate(:private_category, group: group) }
  fab!(:topic_in_public_category) { Fabricate(:topic, category: public_category, tags: [tag]) }

  fab!(:topic_in_read_restricted_category) do
    Fabricate(:topic, category: read_restricted_category, tags: [tag])
  end

  before { setup_algolia_tests }

  it "enqueues a tag for indexing" do
    tag_indexer
      .index
      .expects(:save_objects)
      .with([{ objectID: tag.id, url: tag.url, name: tag.name, topic_count: 1 }])

    tag_indexer.process!(ids: [tag.id])
  end

  it "enqueues a tag for indexing with Tag#staff_topic_count if `include_secure_categories_in_tag_counts` site setting is enabled" do
    SiteSetting.include_secure_categories_in_tag_counts = true

    tag_indexer
      .index
      .expects(:save_objects)
      .with([{ objectID: tag.id, url: tag.url, name: tag.name, topic_count: 2 }])

    tag_indexer.process!(ids: [tag.id])
  end
end
