desc "configure indices and upload data"
task "algolia:initialize" => :environment do
  Rake::Task["algolia:configure"].invoke
  Rake::Task["algolia:reindex"].invoke
end

desc "configure algolia index settings"
task "algolia:configure" => :environment do
  algolia_configure_users
  algolia_configure_posts
end

desc "reindex everything to algolia"
task "algolia:reindex" => :environment do
  algolia_reindex_users
  algolia_reindex_posts
end

desc "reindex users in algolia"
task "algolia:reindex_users" => :environment do
  algolia_reindex_users
end

desc "reindex posts in algolia"
task "algolia:reindex_posts" => :environment do
  algolia_reindex_posts
end

def algolia_configure_users
  puts "[Starting] Pushing users index settings to Algolia"
  DiscourseAlgolia::AlgoliaHelper.algolia_index(
    DiscourseAlgolia::AlgoliaHelper::USERS_INDEX).set_settings(
      "searchableAttributes" => [:username, :name],
      "attributesToHighlight" => [:username, :name],
      "attributesToRetrieve" => [:username, :name, :avatar_template],
      "customRanking" => ["desc(days_visited_count)"],
    )
  puts "[Finished] Successfully configured users index in Algolia"
end

def algolia_configure_posts
  puts "[Starting] Pushing posts index settings to Algolia"
  DiscourseAlgolia::AlgoliaHelper.algolia_index(
    DiscourseAlgolia::AlgoliaHelper::POSTS_INDEX).set_settings(
      "searchableAttributes" => ["topic.title", "topic.tags", "content"],
      "attributesToHighlight" => ["topic.title", "topic.tags", "content"],
      "attributesToSnippet" => ["content:30"],
      "attributesToRetrieve" => [
        "topic.title", "topic.tags", "topic.slug",
        "post_number", "content", "url", "image_url",
        "user.username", "user.avatar_template",
        "category.name", "category.color", "category.slug"],
      "customRanking" => [
        "desc(topic.views)", "asc(post_number)", "asc(part_number)"],
      "attributeForDistinct" => "topic.id",
      "distinct" => 1
    )
  puts "[Finished] Successfully configured posts index in Algolia"
end

def algolia_reindex_users
  puts "[Starting] Clearing users in Algolia"
  DiscourseAlgolia::AlgoliaHelper.algolia_index(
    DiscourseAlgolia::AlgoliaHelper::USERS_INDEX).clear_index
  puts "[Finished] Successfully deleted all users in Algolia"

  puts "[Starting] Pushing users to Algolia"
  user_records = []
  User.all.each do |user|
    user_records << DiscourseAlgolia::AlgoliaHelper.to_user_record(user)
  end
  puts "[Progress] Gathered users from Discourse"
  DiscourseAlgolia::AlgoliaHelper.algolia_index(
    DiscourseAlgolia::AlgoliaHelper::USERS_INDEX).add_objects(user_records)
  puts "[Finished] Successfully pushed #{user_records.length} users to Algolia"
end

def algolia_reindex_posts
  puts "[Starting] Clearing posts in Algolia"
  DiscourseAlgolia::AlgoliaHelper.algolia_index(
    DiscourseAlgolia::AlgoliaHelper::POSTS_INDEX).clear_index
  puts "[Finished] Successfully deleted all posts in Algolia"

  puts "[Starting] Pushing posts to Algolia"
  post_records = []
  Post.all.includes(:user, :topic).each do |post|
    if DiscourseAlgolia::AlgoliaHelper.should_index_post?(post)
      post_records << DiscourseAlgolia::AlgoliaHelper.to_post_records(post)
    end
  end
  post_records.flatten!
  puts "[Progress] Gathered posts from Discourse"
  post_records.each_slice(100) do |slice|
    DiscourseAlgolia::AlgoliaHelper.algolia_index(
      DiscourseAlgolia::AlgoliaHelper::POSTS_INDEX).add_objects(slice.flatten)
    puts "[Progress] Pushed #{slice.length} post records to Algolia"
  end
  puts "[Finished] Successfully pushed #{post_records.length} posts to Algolia"
end
