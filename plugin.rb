# frozen_string_literal: true

# name: discourse-algolia
# about: Use Algolia to power the search on your Discourse
# version: 0.3.0
# authors: Josh Dzielak, Gianluca Bargelli, Paul-Louis Nech
# url: https://github.com/discourse/discourse-algolia
# transpile_js: true

gem 'net-http-persistent', '4.0.1', require_name: 'net/http/persistent'

if Gem::Version.new(Faraday::VERSION) >= Gem::Version.new("2.0")
  gem 'faraday-net_http_persistent', '2.1.0', require_name: 'faraday/net_http_persistent'
else
  # TODO: To be removed after Discourse 2.9.0.beta10 is released
  # HACK: Faraday tries to load `net/http/persistent` before this file is loaded
  # and caches that `require` result. These lines retry to load the library.
  Faraday::Adapter::NetHttpPersistent.instance_variable_set(:@load_error, nil)
  Faraday::Adapter::NetHttpPersistent.dependency('net/http/persistent')
end

gem 'algolia', '2.3.0'

enabled_site_setting :algolia_enabled

register_asset 'lib/algoliasearch.js'
register_asset 'lib/autocomplete.js'
register_asset 'stylesheets/variables.scss'
register_asset 'stylesheets/discourse-algolia-base.scss'
register_asset 'stylesheets/discourse-algolia-layout.scss'

after_initialize do
  require_relative 'app/jobs/scheduled/update_indexes'
  require_relative 'lib/discourse_algolia'
  require_relative 'lib/discourse_algolia/indexer'
  require_relative 'lib/discourse_algolia/post_indexer'
  require_relative 'lib/discourse_algolia/tag_indexer'
  require_relative 'lib/discourse_algolia/topic_indexer'
  require_relative 'lib/discourse_algolia/user_indexer'

  %i{user_created user_updated user_destroyed}.each do |event|
    on(event) do |user|
      DiscourseAlgolia::UserIndexer.enqueue(user.id)
    end
  end

  %i{tag_created tag_updated tag_destroyed}.each do |event|
    on(event) do |tag|
      DiscourseAlgolia::TagIndexer.enqueue(tag.id)
    end
  end

  on(:post_created) do |post|
    DiscourseAlgolia::PostIndexer.enqueue(post.id)
  end

  on(:post_edited) do |post, topic_changed|
    if post.post_number == 1 && topic_changed
      DiscourseAlgolia::TopicIndexer.enqueue(post.id)
    else
      DiscourseAlgolia::PostIndexer.enqueue(post.id)
    end
  end

  %i{post_destroyed post_recovered}.each do |event|
    on(event) do |post|
      if post.post_number == 1
        DiscourseAlgolia::TopicIndexer.enqueue(post.id)
      else
        DiscourseAlgolia::PostIndexer.enqueue(post.id)
      end

      Jobs.enqueue(:update_indexes)
    end
  end
end
