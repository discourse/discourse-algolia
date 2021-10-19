# frozen_string_literal: true

class DiscourseAlgolia::Indexer
  QUEUE_SIZE = 100

  attr_accessor :index

  def initialize(client, guardian)
    @client = client
    @guardian = guardian

    @index = client.init_index(self.class::INDEX_NAME)
    @index.set_settings(self.class::SETTINGS) if !@index.exists?
  end

  def process!(ids: nil)
    ids ||= queue_ids
    return if ids.blank?

    objects = []
    queue(ids).find_each do |object|
      if should_index?(object)
        objects << to_object(object)
        ids.delete(object.id)
      end
    end

    # At this point, `objects` contains objects that should be indexed and
    # `ids` contains IDs that were not found or should not be indexed, so they
    # should be removed.

    @index.save_objects(objects) if objects.present?
    @index.delete_objects(ids) if ids.present?
  end

  def queue_ids
    Discourse.redis.lpop(self.class::QUEUE_NAME, 100)&.map(&:to_i)&.uniq || []
  end

  def queue(ids)
    raise NotImplementedError
  end

  def should_index?(object)
    raise NotImplementedError
  end

  def to_object(object)
    raise NotImplementedError
  end

  def self.enqueue(id)
    Discourse.redis.rpush(self::QUEUE_NAME, id)
  end
end
