module Jobs
  class UpdateAlgoliaUser < Jobs::Base
    def execute(args)
      DiscourseAlgolia::AlgoliaHelper.index_user(args[:user_id], args[:discourse_event])
    end
  end
end
