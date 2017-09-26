import {withPluginApi} from 'discourse/lib/plugin-api';
import {default as computed, on} from 'ember-addons/ember-computed-decorators';
import {h} from 'virtual-dom';

export default {
  name : "discourse-algolia",
  initialize(container) {
    withPluginApi('0.8.8', (api) => {

      api.modifyClass('component:site-header', {
        @on("didInsertElement")
        initializeAlgolia() {
          this._super();
          if (this.siteSettings.algolia_enabled) {
            $("body").addClass("algolia-enabled");
            setTimeout(() => {
              initSearch(this.siteSettings.algolia_application_id,
                this.siteSettings.algolia_search_api_key);
            }, 100);
          }
        }
      });

      api.createWidget('algolia', {
        tagName: 'li.algolia-holder',
        html() {
          return [
            h('input.aa-input#search-box', {
              placeholder: "Search the forum...",
              autocomplete: "off"
            })
          ];
        }
      });

      api.decorateWidget('header-icons:before', function(helper) {
        if (helper.widget.siteSettings.algolia_enabled) {
          return helper.attach('algolia');
        }
      });

      function initSearch(algoliaApplicationId, algoliaSearchApiKey) {

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
                  <a target="_blank" class="algolia-logo" href="https://algolia.com/"></a>
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
                    <img class="hit-user-avatar" src="http://localhost:3000/${hit.avatar_template.replace("\{size}", 50)}" />
                  </div>
                  <div class='hit-user-right'>
                    <div class="hit-user-username-holder">
                      <span class="hit-user-username">
                        @${hit._highlightResult.username.value}
                      </span>
                      <span class="hit-user-custom-ranking">
                        ${hit.likes_received > 0 ? `❤ ${hit.likes_received}` : ''}
                      </span>
                    </div>
                    <div class="hit-user-name">
                      ${autocomplete.escapeHighlightedString(hit._highlightResult.name.value)}
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
                    <span class="hit-tag-name">#${autocomplete.escapeHighlightedString(hit._highlightResult.name.value)}</span>
                    <span class="hit-tag-topic_count">${hit.topic_count}</span>
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
                      <span class="hit-post-topic-views">
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
                      <a href="${hit.user.url}" class="hit-post-username">@${hit.user.username}</a>:
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
    });
  }
}
