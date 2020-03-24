# name: discourse-algolia
# about: Use Algolia to power the search on your Discourse
# version: 0.1
# authors: Josh Dzielak and Gianluca Bargelli
# url: https://github.com/algolia/discourse-algolia

gem 'json', '2.3.0'
gem 'httpclient', '2.8.3'
gem 'algoliasearch', '1.26.0'

enabled_site_setting :algolia_enabled

register_asset 'stylesheets/variables.scss'
register_asset 'stylesheets/discourse-algolia-layout.scss'
register_asset 'stylesheets/discourse-algolia-base.scss'
register_asset 'lib/algoliasearch.js'
register_asset 'lib/autocomplete.js'

after_initialize do
  load File.expand_path('../lib/discourse_algolia/algolia_helper.rb', __FILE__)

  module ::DiscourseAlgolia
    PLUGIN_NAME = "discourse-algolia".freeze

    class Engine < ::Rails::Engine
      engine_name DiscourseAlgolia::PLUGIN_NAME
      isolate_namespace DiscourseAlgolia
    end
  end

  require_dependency File.expand_path('../app/jobs/regular/update_algolia_post.rb', __FILE__)
  require_dependency File.expand_path('../app/jobs/regular/update_algolia_user.rb', __FILE__)
  require_dependency File.expand_path('../app/jobs/regular/update_algolia_topic.rb', __FILE__)
  require_dependency File.expand_path('../app/jobs/regular/update_algolia_tags.rb', __FILE__)
  require_dependency 'discourse_event'

  [:user_created, :user_updated].each do |discourse_event|
    DiscourseEvent.on(discourse_event) do |user|
      if SiteSetting.algolia_enabled?
        Jobs.enqueue_in(0,
          :update_algolia_user,
          user_id: user.id,
          discourse_event: discourse_event
        )
      end
    end
  end

  [:topic_created, :topic_edited, :topic_destroyed, :topic_recovered].each do |discourse_event|
    DiscourseEvent.on(discourse_event) do |topic|
      if SiteSetting.algolia_enabled?
        Jobs.enqueue_in(0,
          :update_algolia_topic,
          topic_id: topic.id,
          discourse_event: discourse_event
        )
        Jobs.enqueue_in(0,
          :update_algolia_tags,
          tags: topic.tags.map(&:name),
          discourse_event: discourse_event
        )
      end
    end
  end

  [:post_created, :post_edited, :post_destroyed, :post_recovered].each do |discourse_event|
    DiscourseEvent.on(discourse_event) do |post|
      if SiteSetting.algolia_enabled?
        Jobs.enqueue_in(0,
          :update_algolia_post,
          post_id: post.id,
          discourse_event: discourse_event
        )
        if post.topic
          Jobs.enqueue_in(0,
            :update_algolia_tags,
            tags: post.topic.tags.map(&:name),
            discourse_event: discourse_event
          )
        end
      end
    end
  end
end
