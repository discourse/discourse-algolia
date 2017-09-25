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
              placeholder: "Search the forum..."
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
        var $hits = $('#hits-container');
        var client = algoliasearch(algoliaApplicationId, algoliaSearchApiKey);
        var index = client.initIndex('posts');
        let auto = autocomplete(searchInput, {
          openOnFocus: true,
          hint: false,
          debug: true // remove me in prod
        }, [
          {
            source: autocomplete.sources.hits(index, {hitsPerPage: 4}),
            displayKey: 'title',
            templates: {
              empty: `<div class="aa-empty">No matching posts.</div>`,
              suggestion: function(hit) {
                let tags = "";
                let baseTags = hit.topic.tags;
                let highlightedTags = hit._highlightResult.topic.tags;
                if (baseTags && highlightedTags) {
                  for (var i = 0; i < baseTags.length; i++) {
                    tags += `<a class="discourse-tag simple" href="/tags/${baseTags[i]}">${highlightedTags[i].value}</a>`;
                  }
                }
                return `
                  <div>
                    <div class="topic-title">
                      ${hit._highlightResult.topic.title.value}
                    </div>
                    <div>
                      <span class="topic-category">
                        <span class="badge-wrapper bullet">
                          <span class="badge-category-bg" style="background-color: #${hit.category.color};" />
                          <a class='badge-category' href="/c/${hit.category.slug}">${hit.category.name}</a>
                        </span>
                      </span>
                      <span class="list-tags">${tags}</span>
                    </div>
                    <div class="topic-excerpt">
                      ${hit._snippetResult.content.value}
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
