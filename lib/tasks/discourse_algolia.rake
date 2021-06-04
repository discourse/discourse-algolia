# frozen_string_literal: true

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

def algolia_reindex_users
  puts "[Starting] Clearing users in Algolia"
  DiscourseAlgolia.users_index.clear_objects
  puts "[Finished] Successfully deleted all users in Algolia"

  puts "[Starting] Pushing users to Algolia"
  count = 0

  User.in_batches do |users|
    ids = users.where_values_hash["id"]
    count += ids.size
    DiscourseAlgolia.process_users!(ids)
    putc "."
  end

  puts "[Finished] Successfully pushed #{count} users to Algolia"
end

def algolia_reindex_posts
  puts "[Starting] Clearing posts in Algolia"
  DiscourseAlgolia.posts_index.clear_objects
  puts "[Finished] Successfully deleted all posts in Algolia"

  puts "[Starting] Pushing posts to Algolia"
  count = 0

  Post.in_batches do |posts|
    ids = posts.where_values_hash["id"]
    count += ids.size
    DiscourseAlgolia.process_posts!(ids)
    putc "."
  end

  puts "[Finished] Successfully pushed #{count} posts to Algolia"
end

def algolia_reindex_tags
  puts "[Starting] Clearing tags in Algolia"
  DiscourseAlgolia.tags_index.clear_objects
  puts "[Finished] Successfully deleted all tags in Algolia"

  puts "[Starting] Pushing tags to Algolia"
  count = 0

  Tag.in_batches do |tags|
    ids = tags.where_values_hash["id"]
    count += ids.size
    DiscourseAlgolia.process_tags!(ids)
    putc "."
  end

  puts "[Finished] Successfully pushed #{count} tags to Algolia"
end
