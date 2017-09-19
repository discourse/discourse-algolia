desc "push everything to algolia"
task "algolia:index_all" => :environment do
  algolia_index_all
end

desc "push users to algolia"
task "algolia:index_users" => :environment do
  algolia_index_users
end

desc "push posts to algolia"
task "algolia:index_posts" => :environment do
  algolia_index_posts
end

def algolia_index_users
  puts "[Starting] Pushing users to Algolia"
  user_objects = []
  User.all.each do |user|
    user_objects << DiscourseAlgolia::AlgoliaHelper.to_user_object(user)
  end
  puts "[Progress] Gathered users from Discourse"
  DiscourseAlgolia::AlgoliaHelper.algolia_index(
    DiscourseAlgolia::AlgoliaHelper::USERS_INDEX).add_objects(user_objects)
  puts "[Finished] Successfully pushed #{user_objects.length} users to Algolia"
end

def algolia_index_posts
  puts "[Starting] Pushing posts to Algolia"
  post_objects = []
  Post.all.includes(:user, :topic).each do |post|
    post_objects << DiscourseAlgolia::AlgoliaHelper.to_post_object(post)
  end
  puts "[Progress] Gathered posts from Discourse"
  post_objects.each_slice(50) do |slice|
    DiscourseAlgolia::AlgoliaHelper.algolia_index(
      DiscourseAlgolia::AlgoliaHelper::POSTS_INDEX).add_objects(slice)
    puts "[Progress] Pushed 100 posts to Algolia"
  end
  puts "[Finished] Successfully pushed #{post_objects.length} posts to Algolia"
end

def algolia_index_all
  algolia_index_users
  algolia_index_posts
end
