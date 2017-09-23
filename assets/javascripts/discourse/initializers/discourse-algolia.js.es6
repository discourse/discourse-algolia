import {withPluginApi} from 'discourse/lib/plugin-api';
import {default as computed, on} from 'ember-addons/ember-computed-decorators';
import {h} from 'virtual-dom';

export default {
  name : "discourse-algolia",
  initialize(container) {
    withPluginApi('0.8.8', (api) => {

      var algoliaWidget = api.createWidget('algolia', {
        tagName: 'div.algolia-holder',
        html() {
          return [
            h('input.aa-input#search-box', {placeholder: "Search the forum..."}),
            h('div#hits-container')
          ];
        }
      });

      api.decorateWidget('header:after', function(helper) {
        return helper.attach('algolia');
      });

      api.modifyClass('component:site-header', {
        @on("didInsertElement")
        initializeAlgolia() {
          this._super();
          setTimeout(() => {
            initSearch(this.siteSettings.algolia_application_id, this.siteSettings.algolia_search_api_key);
          }, 100);
        }
      });

      function initSearch(algoliaApplicationId, algoliaSearchApiKey) {
        var searchInput = '#search-box';
        var $hits = $('#hits-container');
        var client = algoliasearch(algoliaApplicationId, algoliaSearchApiKey);
        var index = client.initIndex('posts');
        let auto = autocomplete(searchInput, {
          hint: false,
          debug: true // remove me in prod
        }, [
          {
            source: autocomplete.sources.hits(index, {hitsPerPage: 4}),
            displayKey: 'title',
            templates: {
              empty: `<div class="aa-empty">No matching posts.</div>`,
              suggestion: function(hit) {
                return `<div>
                       <div class="topic-title">
                         ${hit._highlightResult.topic.title.value}
                         <div class="topic-category">
                           <span class="badge-wrapper bullet" style="margin-right: 0;">
                             <span class="badge-category-bg" style="background-color: #${hit.category.color};"></span>
                           </span>
                           <span>${hit.category.name}</span>
                         </div>
                       </div>
                       <div class="topic-excerpt">${hit._highlightResult.content.value}</span>
                     </div>`;
              }
            }
          }
        ]).on('autocomplete:selected', function(event, suggestion, dataset) {
          DiscourseURL.routeTo(suggestion.url);
        });;
      }
    });
  }
}
