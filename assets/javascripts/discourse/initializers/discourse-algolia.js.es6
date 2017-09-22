import {withPluginApi} from 'discourse/lib/plugin-api';

export default {
  name : "discourse-algolia",
  initialize() {
    $(document).ready(() => {
      withPluginApi('0.8.8', (api) => {

        var myComponent = Ember.Component.extend({
          didInsertElement() {
            this._super();
            console.log("JOSH");
          }
        });

        var tpl = `<div class="discourse-instantsearch">
             <input class="search-input" id="search-box" placeholder="Search..."/>
             <div id="hits-container"></div>
         </div>`;

        $('.d-header .wrap .contents').append(tpl);

        var searchInput = '#search-box';
        var $hits = $('#hits-container');
        var client = algoliasearch('', '');
        var index = client.initIndex('posts');

        autocomplete(searchInput, {
          hint: false,
          debug: true
        }, [
          {
            source: autocomplete.sources.hits(index, {hitsPerPage: 4}),
            displayKey: 'title',
            templates: {
              suggestion: function(s) {
                return `<div>
                         <div class="topic-title">
                           ${s._highlightResult.topic.title.value}
                           <div class="topic-category">
                             <span class="badge-wrapper bullet" style="margin-right: 0;">
                               <span class="badge-category-bg" style="background-color: #${s.category.color};"></span>
                             </span>
                             <span>${s.category.name}</span>
                           </div>
                         </div>
                         <div class="topic-excerpt">${s._highlightResult.content.value}</span>
                       </div>`;
              }
            }
          }
        ]);
      });
    });
  }
}
