desc "configure indices and upload data"
task "algolia:initialize" => :environment do
  Rake::Task["algolia:configure"].invoke
  Rake::Task["algolia:reindex"].invoke
end

desc "configure algolia index settings"
task "algolia:configure" => :environment do
  algolia_configure_users
  algolia_configure_posts
  algolia_configure_tags
end

desc "reindex everything to algolia"
task "algolia:reindex" => :environment do
  algolia_reindex_users
  algolia_reindex_posts
  algolia_reindex_tags
end

desc "reindex users in algolia"
task "algolia:reindex_users" => :environment do
  algolia_reindex_users
end

desc "reindex posts in algolia"
task "algolia:reindex_posts" => :environment do
  algolia_reindex_posts
end

desc "reindex tags in algolia"
task "algolia:reindex_tags" => :environment do
  algolia_reindex_tags
end

def algolia_configure_users
  puts "[Starting] Pushing users index settings to Algolia"
  DiscourseAlgolia::AlgoliaHelper.algolia_index(
    DiscourseAlgolia::AlgoliaHelper::USERS_INDEX).set_settings(
      "searchableAttributes" => ["unordered(username)", "unordered(name)"],
      "attributesToHighlight" => [:username, :name],
      "attributesToRetrieve" => [:username, :name, :url, :avatar_template, :likes_received, :days_visited],
      "customRanking" => ["desc(likes_received)", "desc(days_visited)"],
    )
  puts "[Finished] Successfully configured users index in Algolia"
end

def algolia_configure_posts
  puts "[Starting] Pushing posts index settings to Algolia"
  DiscourseAlgolia::AlgoliaHelper.algolia_index(
    DiscourseAlgolia::AlgoliaHelper::POSTS_INDEX).set_settings(
      "ranking" => ["typo", "geo", "words", "filters", "proximity", "attribute", "custom"],
      "searchableAttributes" => ["unordered(topic.title)", "unordered(topic.tags)", "unordered(content)"],
      "attributesToHighlight" => ["topic.title", "topic.tags", "content"],
      "attributesToSnippet" => ["content:30"],
      "attributesForFaceting" => ["category.name", "topic.tags", "user.username"],
      "attributesToRetrieve" => [
        "post_number", "content", "url", "image_url",
        "topic.title", "topic.tags", "topic.slug", "topic.url", "topic.views",
        "user.username", "user.name", "user.avatar_template", "user.url",
        "category.name", "category.color", "category.slug", "category.url"],
      "customRanking" => [
        "desc(is_wordy)", "desc(topic.views)", "asc(post_number)", "asc(part_number)"],
      "attributeForDistinct" => "topic.id",
      "distinct" => 1,
      "advancedSyntax" => true
    )
  puts "[Finished] Successfully configured posts index in Algolia"
end

def algolia_configure_tags
  puts "[Starting] Pushing tags index settings to Algolia"
  DiscourseAlgolia::AlgoliaHelper.algolia_index(
    DiscourseAlgolia::AlgoliaHelper::TAGS_INDEX).set_settings(
      "searchableAttributes" => [:name],
      "attributesToHighlight" => [:name],
      "attributesToRetrieve" => [:name, :url, :topic_count],
      "customRanking" => ["desc(topic_count)"],
    )
  puts "[Finished] Successfully configured tags index in Algolia"
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

def algolia_reindex_tags
  puts "[Starting] Clearing tags in Algolia"
  DiscourseAlgolia::AlgoliaHelper.algolia_index(
    DiscourseAlgolia::AlgoliaHelper::TAGS_INDEX).clear_index
  puts "[Finished] Successfully deleted all tags in Algolia"

  puts "[Starting] Pushing tags to Algolia"
  tag_records = []
  Tag.all.each do |tag|
    if DiscourseAlgolia::AlgoliaHelper.should_index_tag?(tag)
      tag_records << DiscourseAlgolia::AlgoliaHelper.to_tag_record(tag)
    end
  end
  puts "[Progress] Gathered tags from Discourse"
  DiscourseAlgolia::AlgoliaHelper.algolia_index(
    DiscourseAlgolia::AlgoliaHelper::TAGS_INDEX).add_objects(tag_records)
  puts "[Finished] Successfully pushed #{tag_records.length} tags to Algolia"
end
