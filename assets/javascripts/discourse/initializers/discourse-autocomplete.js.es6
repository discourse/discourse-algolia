export default {

  name: "discourse-autocomplete",
  initialize() {},
  _initialize(options) {

    var searchInput = '#search-box';
    var client = algoliasearch(options.algoliaApplicationId, options.algoliaSearchApiKey);
    var postsIndex = client.initIndex('discourse-posts');

    autocomplete(searchInput, {
      openOnFocus: true,
      hint: false,
      debug: options.debug,
      templates: {
        dropdownMenu: `
          <div class="left-container">
            <div class="aa-dataset-posts" />
          </div>`,
        footer: `
          <div class="aa-footer">
            <div class="left-container">
              <a class="advanced-search" onclick="document.location.href='/community/search'; document.reload();" href="/community/search">advanced search</a>
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
    ]).on('autocomplete:selected', options.onSelect);

    $("#search-box").on('focus', function (event) {
      $(this).select();
    });
  }
}
