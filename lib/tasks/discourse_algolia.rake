# frozen_string_literal: true

desc "reindex everything to algolia"
task "algolia:reindex" => :environment do
  algolia_reindex(User, DiscourseAlgolia.indexer(:user))
  algolia_reindex(Tag, DiscourseAlgolia.indexer(:tag))
  algolia_reindex(Post, DiscourseAlgolia.indexer(:post))
end

desc "reindex users in algolia"
task "algolia:reindex_users" => :environment do
  algolia_reindex(User, DiscourseAlgolia.indexer(:user))
end

desc "reindex tags in algolia"
task "algolia:reindex_tags" => :environment do
  algolia_reindex(Tag, DiscourseAlgolia.indexer(:tag))
end

desc "reindex posts in algolia"
task "algolia:reindex_posts" => :environment do
  algolia_reindex(Post, DiscourseAlgolia.indexer(:post))
end

def algolia_reindex(model_class, indexer)
  model_name = model_class.name.downcase.pluralize

  puts "Clearing #{model_name} from Algolia"
  indexer.index.clear_objects

  puts "Pushing #{model_name} to Algolia"
  count = 0
  model_class.in_batches do |objects|
    ids = objects.where_values_hash["id"]
    count += ids.size
    indexer.process!(ids: ids)
    putc "."
  end
  puts "."

  puts "Successfully pushed #{count} #{model_name} to Algolia"
end
