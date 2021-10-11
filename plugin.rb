# frozen_string_literal: true

# name: discourse-algolia
# about: Use Algolia to power the search on your Discourse
# version: 0.3.0
# authors: Josh Dzielak, Gianluca Bargelli and Paul-Louis Nech
# url: https://github.com/discourse/discourse-algolia

gem 'net-http-persistent', '4.0.1', require_name: 'net/http/persistent'
gem 'algolia', '2.1.1'

# HACK: Faraday tries to load `net/http/persistent` before this file is loaded
# and caches that `require` result. These lines retry to load the library.
Faraday::Adapter::NetHttpPersistent.instance_variable_set(:@load_error, nil)
Faraday::Adapter::NetHttpPersistent.dependency('net/http/persistent')

enabled_site_setting :algolia_enabled

register_asset 'lib/algoliasearch.js'
register_asset 'lib/autocomplete.js'
register_asset 'stylesheets/variables.scss'
register_asset 'stylesheets/discourse-algolia-base.scss'
register_asset 'stylesheets/discourse-algolia-layout.scss'

after_initialize do
  require_relative 'app/jobs/scheduled/update_indexes.rb'
  require_relative 'lib/discourse_algolia.rb'

  USER_EVENTS ||= %i{
    user_created
    user_updated
    user_destroyed
  }

  POST_EVENTS ||= %i{
    post_created
    post_edited
    post_destroyed
    post_recovered
  }

  TAG_EVENTS ||= %i{
    tag_created
    tag_updated
    tag_destroyed
  }

  USER_EVENTS.each do |event|
    DiscourseEvent.on(event) do |user|
      next if !SiteSetting.algolia_enabled?

      DiscourseAlgolia.enqueue_record(:user, user.id)
    end
  end

  POST_EVENTS.each do |event|
    DiscourseEvent.on(event) do |post|
      next if !SiteSetting.algolia_enabled?

      type = post.post_number == 1 ? :topic : :post
      DiscourseAlgolia.enqueue_record(type, post.id)
      Scheduler::Defer.later("flush algolia queue") { DiscourseAlgolia.process_queue! }
    end
  end

  TAG_EVENTS.each do |event|
    DiscourseEvent.on(event) do |tag|
      next if !SiteSetting.algolia_enabled?

      DiscourseAlgolia.enqueue_record(:tag, tag.id)
    end
  end
end
