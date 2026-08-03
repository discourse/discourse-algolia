# frozen_string_literal: true

class InMemoryAlgoliaIndex
  attr_reader :objects

  def initialize(search_api_key)
    @search_api_key = search_api_key
    @objects = {}
  end

  def exists?
    true
  end

  def save_objects(objects)
    objects.each { |object| @objects[object[:objectID]] = object }
  end

  def delete_objects(ids)
    ids.each { |id| @objects.delete(id) }
  end

  def clear_objects
    @objects.clear
  end

  def search(query, api_key:)
    return [] if api_key != @search_api_key

    @objects.values.select { |object| object[:content].include?(query) }
  end
end

class InMemoryAlgoliaClient
  def initialize(search_api_key)
    @search_api_key = search_api_key
    @indexes = {}
  end

  def init_index(name)
    @indexes[name] ||= InMemoryAlgoliaIndex.new(@search_api_key)
  end
end

RSpec.describe CategoriesController do
  fab!(:admin)
  fab!(:attacker, :user)
  fab!(:category) { Fabricate(:category, user: admin) }
  fab!(:secret_topic) { Fabricate(:topic, category: category) }
  fab!(:secret_first_post) do
    Fabricate(
      :post,
      topic: secret_topic,
      post_number: 1,
      raw: "Embargoed project Juniper starts next quarter",
    )
  end
  fab!(:secret_reply) do
    Fabricate(
      :post,
      topic: secret_topic,
      post_number: 2,
      raw: "Embargoed project Juniper has a confidential budget",
    )
  end
  fab!(:public_post) { Fabricate(:post, raw: "Public control post") }

  let(:algolia_client) { InMemoryAlgoliaClient.new(SiteSetting.algolia_search_api_key) }
  let(:post_index) { algolia_client.init_index(DiscourseAlgolia::PostIndexer::INDEX_NAME) }

  before do
    setup_algolia_tests
    Jobs.run_immediately!
    Algolia::Search::Client.stubs(:create).returns(algolia_client)

    DiscourseAlgolia.indexer(:post).process!(
      ids: [secret_first_post.id, secret_reply.id, public_post.id],
    )
  end

  describe "#update" do
    it "synchronizes every post in the public Algolia index when category access changes" do
      get "/site.json"

      expect(response).to have_http_status(:ok)
      anonymous_search_key = response.parsed_body["algolia_search_api_key"]
      expect(anonymous_search_key).to eq(SiteSetting.algolia_search_api_key)
      expect(
        post_index.search("Embargoed project Juniper", api_key: anonymous_search_key),
      ).to contain_exactly(
        post_index.objects.fetch(secret_first_post.id),
        post_index.objects.fetch(secret_reply.id),
      )

      sign_in(admin)
      put "/categories/#{category.id}.json",
          params: {
            permissions: {
              Group[:admins].name => CategoryGroup.permission_types[:full],
            },
          }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("category", "read_restricted")).to eq(true)

      sign_out
      sign_in(attacker)
      get "/t/#{secret_topic.id}.json"

      expect(response).to have_http_status(:not_found)
      expect(response.body).not_to include(secret_first_post.raw)
      expect(
        post_index.search("Embargoed project Juniper", api_key: anonymous_search_key),
      ).to be_empty
      expect(post_index.objects.keys).to contain_exactly(public_post.id)

      sign_in(admin)
      put "/categories/#{category.id}.json",
          params: {
            permissions: {
              Group[:everyone].name => CategoryGroup.permission_types[:full],
            },
          }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("category", "read_restricted")).to eq(false)
      expect(
        post_index.search("Embargoed project Juniper", api_key: anonymous_search_key),
      ).to contain_exactly(
        post_index.objects.fetch(secret_first_post.id),
        post_index.objects.fetch(secret_reply.id),
      )
      expect(post_index.objects.keys).to contain_exactly(
        secret_first_post.id,
        secret_reply.id,
        public_post.id,
      )
    end
  end
end
