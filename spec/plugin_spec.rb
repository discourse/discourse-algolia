# frozen_string_literal: true

require 'rails_helper'

describe DiscourseAlgolia do
  fab!(:user) { Fabricate(:user) }
  fab!(:admin) { Fabricate(:admin) }
  fab!(:post) { Fabricate(:post, post_number: 1) }
  fab!(:post_2) { Fabricate(:post, topic: post.topic, post_number: 2) }

  let(:user_indexer) { DiscourseAlgolia.indexer(:user) }
  let(:tag_indexer) { DiscourseAlgolia.indexer(:tag) }
  let(:topic_indexer) { DiscourseAlgolia.indexer(:topic) }
  let(:post_indexer) { DiscourseAlgolia.indexer(:post) }

  before do
    setup_algolia_tests
  end

  context 'users' do
    context 'event user_created' do
      it 'enqueues new user' do
        user = Fabricate(:user)

        expect(user_indexer.queue_ids).to contain_exactly(user.id)
      end
    end

    context 'event user_updated' do
      it 'enqueues updated user' do
        user_updater = UserUpdater.new(user, user).update(bio_raw: 'I am a Discourse user')

        expect(user_indexer.queue_ids).to contain_exactly(user.id)
      end
    end

    context 'event user_destroyed' do
      it 'enqueues destroyed user' do
        UserDestroyer.new(admin).destroy(user)

        expect(user_indexer.queue_ids).to contain_exactly(user.id)
      end
    end
  end

  context 'tags' do
    fab!(:tag) { Fabricate(:tag) }

    context 'event tag_created' do
      it 'enqueues new tag' do
        tag = Fabricate(:tag)

        expect(tag_indexer.queue_ids).to contain_exactly(tag.id)
      end
    end

    context 'event tag_updated' do
      it 'enqueues updated tag' do
        tag.update!(name: 'new-tag-name')
        expect(tag_indexer.queue_ids).to contain_exactly(tag.id)
      end
    end

    context 'event tag_destroyed' do
      it 'enqueues destroyed tag' do
        tag.destroy!

        expect(tag_indexer.queue_ids).to contain_exactly(tag.id)
      end
    end
  end

  context 'posts and topics' do
    context 'event post_created' do
      it 'enqueues new topic' do
        new_post = PostCreator.create(
          user,
          title: 'hello world this is title',
          raw: 'this is my first topic'
        )

        expect(topic_indexer.queue_ids).to contain_exactly()
        expect(post_indexer.queue_ids).to contain_exactly(new_post.id)
      end

      it 'enqueues new post' do
        new_post = PostCreator.create(
          user,
          topic_id: post.topic_id,
          raw: 'this is my first topic'
        )

        expect(topic_indexer.queue_ids).to contain_exactly()
        expect(post_indexer.queue_ids).to contain_exactly(new_post.id)
      end
    end

    context 'event post_edited' do
      it 'enqueue edited post' do
        post.revise(admin, raw: 'new content to be indexed')

        expect(topic_indexer.queue_ids).to contain_exactly()
        expect(post_indexer.queue_ids).to contain_exactly(post.id)
      end
    end

    context 'event post_destroyed' do
      it 'enqueues destroyed topics' do
        PostDestroyer.new(admin, post).destroy

        expect(Jobs::UpdateIndexes.jobs.size).to eq(1)
        expect(topic_indexer.queue_ids).to contain_exactly(post.id)
        expect(post_indexer.queue_ids).to contain_exactly()
      end

      it 'enqueues destroyed post' do
        PostDestroyer.new(admin, post_2).destroy

        # A post must be scrubbed immediately from the index when it is
        # destroyed
        expect(Jobs::UpdateIndexes.jobs.size).to eq(1)
        expect(topic_indexer.queue_ids).to contain_exactly()
        expect(post_indexer.queue_ids).to contain_exactly(post_2.id)
      end
    end

    context 'event post_recovered' do
      before do
        PostDestroyer.new(admin, post).destroy
        PostDestroyer.new(admin, post_2).destroy

        Discourse.redis.del(DiscourseAlgolia::TopicIndexer::QUEUE_NAME)
        Discourse.redis.del(DiscourseAlgolia::PostIndexer::QUEUE_NAME)
      end

      it 'enqueues recovered topics' do
        PostDestroyer.new(admin, post).recover

        expect(topic_indexer.queue_ids).to contain_exactly(post.id)
        expect(post_indexer.queue_ids).to contain_exactly()
      end

      it 'enqueues recovered post' do
        PostDestroyer.new(admin, post_2).recover

        expect(topic_indexer.queue_ids).to contain_exactly()
        expect(post_indexer.queue_ids).to contain_exactly(post_2.id)
      end
    end
  end
end
