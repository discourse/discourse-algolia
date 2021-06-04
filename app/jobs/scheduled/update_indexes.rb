# frozen_string_literal: true

module Jobs
  class UpdateIndexes < ::Jobs::Scheduled
    every 5.minutes

    def execute(args)
      DiscourseAlgolia.process_queue!
    end
  end
end
