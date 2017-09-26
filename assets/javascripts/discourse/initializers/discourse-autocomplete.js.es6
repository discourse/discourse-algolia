export default {

  name: "discourse-autocomplete",
  initialize() {},
  _initialize(algoliaApplicationId, algoliaSearchApiKey, baseURL) {

    var searchInput = '#search-box';
    var client = algoliasearch(algoliaApplicationId, algoliaSearchApiKey);
    var postsIndex = client.initIndex('posts');
    var tagsIndex = client.initIndex('tags');
    var usersIndex = client.initIndex('users');

    autocomplete(searchInput, {
      openOnFocus: true,
      hint: false,
      debug: true,
      templates: {
        dropdownMenu: `
          <div class="left-container">
            <div class="aa-dataset-posts" />
          </div>
          <div class="right-container">
            <span class="aa-dataset-users" />
            <span class="aa-dataset-tags" />
          </div>`,
        footer: `
          <div class="aa-footer">
            <div class="left-container">
            </div>
            <div class="right-container">
              <a target="_blank" class="algolia-logo" href="https://algolia.com/"
                title="Powered by the discourse-algolia search plugin"></a>
            </div>
          </div>
        `
      }
    }, [
      {
        source: autocomplete.sources.hits(usersIndex, {hitsPerPage: 4}),
        name: 'users',
        displayKey: 'users',
        templates: {
          empty: "",
          suggestion: function(hit) {
            return `
              <div class='hit-user-left'>
                <img class="hit-user-avatar" src="${baseURL}${hit.avatar_template.replace("\{size}", 50)}" />
              </div>
              <div class='hit-user-right'>
                <div class="hit-user-username-holder">
                  <span class="hit-user-username">
                    @${hit._highlightResult.username.value}
                  </span>
                  <span class="hit-user-custom-ranking" title="Number of likes the user has received">
                    ${hit.likes_received > 0 ? `❤ ${hit.likes_received}` : ''}
                  </span>
                </div>
                <div class="hit-user-name">
                  ${autocomplete.escapeHighlightedString(hit._highlightResult.name ? hit._highlightResult.name.value : hit.name)}
                </div>
              </div>
              `
          }
        }
      },
    {
        source: autocomplete.sources.hits(tagsIndex, {hitsPerPage: 4}),
        name: 'tags',
        displayKey: 'tags',
        templates: {
          empty: "",
          suggestion: function(hit) {
            return `
              <div class='hit-tag'>
                <span class="hit-tag-name">#${autocomplete.escapeHighlightedString(hit._highlightResult.name ? hit._highlightResult.name.value : hit.name)}</span>
                <span class="hit-tag-topic_count" title="Number of topics with this tag">${hit.topic_count}</span>
              </div>
              `
          }
        }
      },
      {
        source: autocomplete.sources.hits(postsIndex, {hitsPerPage: 4}),
        name: 'posts',
        displayKey: 'posts',
        templates: {
          empty: `<div class="aa-empty">No matching posts.</div>`,
          suggestion: function(hit) {
            let tags = "";
            let baseTags = hit.topic.tags;
            let highlightedTags = hit._highlightResult.topic.tags;
            let date = new Date(hit.updated_at * 1000);
            let dateStr = (date.getMonth() + 1) + '/' + date.getDate() + '/';
            if (baseTags && highlightedTags) {
              for (var i = 0; i < baseTags.length; i++) {
                tags += `<a class="hit-post-tag" href="/tags/${baseTags[i]}">${autocomplete.escapeHighlightedString(highlightedTags[i].value)}</a>`;
              }
            }
            return `
              <div class="hit-post">
                <div class="hit-post-title-holder">
                  <span class="hit-post-topic-title">
                    ${hit._highlightResult.topic.title.value}
                  </span>
                  <span class="hit-post-topic-views" title="Number of times the topic has been viewed">
                    ${hit.topic.views}
                  </span>
                </div>
                <div class="hit-post-category-tags">
                  <span class="hit-post-category">
                    <span class="badge-wrapper bullet">
                      <span class="badge-category-bg" style="background-color: #${hit.category.color};" />
                      <a class='badge-category hit-post-category-name' href="${hit.category.url}">${hit.category.name}</a>
                    </span>
                  </span>
                  <span class="hit-post-tags">${tags}</span>
                </div>
                <div class="hit-post-content-holder">
                  <a class="hit-post-username" href="${hit.user.url}">@${hit.user.username}</a>:
                  <span class="hit-post-content">${autocomplete.escapeHighlightedString(hit._snippetResult.content.value)}</span>
                </div>
              </div>`;
          }
        }
      }
    ]).on('autocomplete:selected', function(event, suggestion, dataset) {
      DiscourseURL.routeTo(suggestion.url);
    });
    $("#search-box").on('focus', function (event) {
      $(this).select();
    });
  }
}
