desc "configure indices and upload data"
task "algolia:initialize" => :environment do
  algolia_configure_users
  algolia_configure_posts
  algolia_index_all
end

desc "configure algolia index settings"
task "algolia:configure" => :environment do
  algolia_configure_users
  algolia_configure_posts
end

desc "push everything to algolia"
task "algolia:index_all" => :environment do
  algolia_index_all
end

desc "index users in algolia"
task "algolia:index_users" => :environment do
  algolia_index_users
end

desc "index posts in algolia"
task "algolia:index_posts" => :environment do
  algolia_index_posts
end

def algolia_index_all
  algolia_index_users
  algolia_index_posts
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

def algolia_index_users
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

def algolia_configure_posts
  puts "[Starting] Pushing posts index settings to Algolia"
  DiscourseAlgolia::AlgoliaHelper.algolia_index(
    DiscourseAlgolia::AlgoliaHelper::POSTS_INDEX).set_settings(
      "searchableAttributes" => ["topic.title", "topic.tags", "post.content"],
      "attributesToHighlight" => ["topic.title", "topic.tags", "post.content"],
      "attributesToRetrieve" => [
        "topic.title", "topic.tags", "topic.slug",
        "post_number", "content", "image_url",
        "user.username", "user.avatar_template",
        "category.name", "category.color", "category.slug"],
      "customRanking" => ["desc(topic.views)", "desc(like_count)"],
      "attributeForDistinct" => "topic.id"
    )
  puts "[Finished] Successfully configured posts index in Algolia"
end

def algolia_index_posts
  puts "[Starting] Pushing posts to Algolia"
  post_records = []
  Post.all.includes(:user, :topic).each do |post|
    post_records << DiscourseAlgolia::AlgoliaHelper.to_post_record(post)
  end
  puts "[Progress] Gathered posts from Discourse"
  post_records.each_slice(50) do |slice|
    DiscourseAlgolia::AlgoliaHelper.algolia_index(
      DiscourseAlgolia::AlgoliaHelper::POSTS_INDEX).add_objects(slice)
    puts "[Progress] Pushed 100 posts to Algolia"
  end
  puts "[Finished] Successfully pushed #{post_records.length} posts to Algolia"
end
