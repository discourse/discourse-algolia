module Jobs
  class UpdateAlgoliaTags < Jobs::Base
    def execute(args)
      DiscourseAlgolia::AlgoliaHelper.index_tags(args[:tags], args[:discourse_event])
    end
  end
end
