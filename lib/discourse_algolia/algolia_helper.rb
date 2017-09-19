module DiscourseAlgolia
  class AlgoliaHelper

    USERS_INDEX = "users".freeze
    POSTS_INDEX = "posts".freeze

    def self.index_user(user_id, discourse_event)
      user = User.find_by(id: user_id)
      return if user.blank? || !guardian.can_see?(user)

      user_object = to_user_object(user)
      add_algolia_object(USERS_INDEX, user_object, user_id)
    end

    def self.to_user_object(user)
      {
        objectID: user.id,
        name: user.name,
        username: user.username,
      }
    end

    def self.index_topic(topic_id, discourse_event)
    end

    def self.index_post(post_id, discourse_event)
      post = Post.find_by(id: post_id)
      return if post.blank? || post.post_type != Post.types[:regular] || !guardian.can_see?(post)

      topic = post.topic
      return if topic.blank? || topic.archetype == Archetype.private_message

      post_object = to_post_object(post)
      add_algolia_object(POSTS_INDEX, post_object, post_id)
    end

    def self.to_post_object(post)
      object = {
        objectID: post.id,
        post_number: post.post_number,
        created_at: post.created_at,
        updated_at: post.updated_at,
        reads: post.reads,
        like_count: post.like_count,
        score: post.score
      }

      user = post.user
      object[:user] = {
        id: user.id,
        name: user.name,
        username: user.username
      }

      topic = post.topic
      if (topic)
        object[:topic] = {
          id: topic.id,
          title: topic.title
        }

        category = topic.category
        if (category)
          object[:category] = {
            id: category.id,
            name: category.name,
            color: category.color,
            slug: category.slug
          }
        end
      end
      object
    end

    def self.add_algolia_object(index_name, object, object_id)
      algolia_index(index_name).add_object(record, object_id)
    end

    def self.algolia_index(index_name)
      Algolia.init(
        application_id: SiteSetting.algolia_application_id,
        api_key: SiteSetting.algolia_admin_api_key)
      Algolia::Index.new(index_name)
    end

    def self.guardian
      Guardian.new(User.find_by(username: SiteSetting.algolia_discourse_username))
    end
  end
end
