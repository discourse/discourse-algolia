import { h } from 'virtual-dom';
import { on } from 'ember-addons/ember-computed-decorators';
import { withPluginApi } from 'discourse/lib/plugin-api';
import discourseAutocomplete from './discourse-autocomplete';

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
              discourseAutocomplete._initialize(
                this.siteSettings.algolia_application_id,
                this.siteSettings.algolia_search_api_key,
                "/"
              );
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

    });
  }
}
