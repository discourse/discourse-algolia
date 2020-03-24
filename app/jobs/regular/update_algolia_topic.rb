module Jobs
  class UpdateAlgoliaTopic < ::Jobs::Base
    def execute(args)
      DiscourseAlgolia::AlgoliaHelper.index_topic(args[:topic_id], args[:discourse_event])
    end
  end
end
