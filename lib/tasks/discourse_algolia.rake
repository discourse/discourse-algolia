desc "configure indices and upload data"
task "algolia:initialize" => :environment do
  Rake::Task["algolia:configure"].invoke
  Rake::Task["algolia:reindex"].invoke
end

desc "configure algolia index settings"
task "algolia:configure" => :environment do
  algolia_configure_posts
end

desc "reindex everything to algolia"
task "algolia:reindex" => :environment do
  algolia_reindex_posts
end

desc "reindex posts in algolia"
task "algolia:reindex_posts" => :environment do
  algolia_reindex_posts
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
      "advancedSyntax" => true,
      "removeWordsIfNoResults" => "allOptional"
    )
  puts "[Finished] Successfully configured posts index in Algolia"
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
