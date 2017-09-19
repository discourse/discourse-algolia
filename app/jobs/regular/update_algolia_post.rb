module Jobs
  class UpdateAlgoliaPost < Jobs::Base
    def execute(args)
      DiscourseAlgolia::AlgoliaHelper.index_post(args[:post_id], args[:discourse_event])
    end
  end
end
