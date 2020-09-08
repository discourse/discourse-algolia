import I18n from "I18n";
import { h } from "virtual-dom";
import { on } from "ember-addons/ember-computed-decorators";
import DiscourseURL from "discourse/lib/url";
import { withPluginApi } from "discourse/lib/plugin-api";
import discourseAutocomplete from "./discourse-autocomplete";

export default {
  name: "discourse-algolia",
  initialize() {
    withPluginApi("0.8.8", (api) => {
      api.modifyClass("component:site-header", {
        @on("didInsertElement")
        initializeAlgolia() {
          this._super();
          if (
            this.siteSettings.algolia_enabled &&
            this.siteSettings.algolia_autocomplete_enabled
          ) {
            $("body").addClass("algolia-enabled");

            setTimeout(() => {
              discourseAutocomplete._initialize({
                algoliaApplicationId: this.siteSettings.algolia_application_id,
                algoliaSearchApiKey: this.siteSettings.algolia_search_api_key,
                imageBaseURL: "",
                debug: document.location.host.indexOf("localhost") > -1,
                onSelect(event, suggestion) {
                  DiscourseURL.routeTo(suggestion.url);
                },
              });
            }, 100);
          }
        },
      });

      api.createWidget("algolia", {
        tagName: "li.algolia-holder",
        html() {
          return [
            h(
              "form",
              {
                action: "/search",
                method: "GET",
              },
              [
                h("input.aa-input#search-box", {
                  name: "q",
                  placeholder: I18n.t("discourse_algolia.search_box_placeholder"),
                  autocomplete: "off",
                }),
              ]
            ),
          ];
        },
      });

      api.decorateWidget("header-icons:before", function (helper) {
        if (
          helper.widget.siteSettings.algolia_enabled &&
          helper.widget.siteSettings.algolia_autocomplete_enabled
        ) {
          return helper.attach("algolia");
        }
      });
    });
  },
};
