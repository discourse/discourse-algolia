# frozen_string_literal: true

class DiscourseAlgolia::TagIndexer < DiscourseAlgolia::Indexer
  QUEUE_NAME = "algolia-tags"
  INDEX_NAME = "discourse-tags"
  SETTINGS = {
    "attributesToRetrieve" => [:name, :url, :topic_count],
    "customRanking" => ["desc(topic_count)"],
    "removeWordsIfNoResults" => "allOptional",
    "searchableAttributes" => [:name],
  }

  def queue(ids)
    Tag.where(id: ids)
  end

  def should_index?(tag)
    @guardian.can_see?(tag) && tag.topic_count > 0
  end

  def to_object(tag)
    {
      objectID: tag.id,
      url: tag.url,
      name: tag.name,
      topic_count: tag.topic_count,
    }
  end
end
