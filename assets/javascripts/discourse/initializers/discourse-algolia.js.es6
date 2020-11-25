import I18n from "I18n";
import { h } from "virtual-dom";
import DiscourseURL from "discourse/lib/url";
import { withPluginApi } from "discourse/lib/plugin-api";
import discourseAutocomplete from "./discourse-autocomplete";
import { schedule } from "@ember/runloop";

export default {
  name: "discourse-algolia",
  initialize() {
    withPluginApi("0.8.8", (api) => {
      api.createWidget("algolia", {
        tagName: "li.algolia-holder",

        didRenderWidget() {
          if (
            this.siteSettings.algolia_enabled &&
            this.siteSettings.algolia_autocomplete_enabled
          ) {
            schedule("afterRender", () => {
              document.body.classList.add("algolia-enabled");

              const searchBox = document.querySelector("#search-box");
              searchBox &&
                searchBox.addEventListener(
                  "focus",
                  this._selectSearchBoxContent
                );

              this._search = discourseAutocomplete._initialize({
                algoliaApplicationId: this.siteSettings.algolia_application_id,
                algoliaSearchApiKey: this.siteSettings.algolia_search_api_key,
                algoliaAnswersEnabled: this.siteSettings
                  .algolia_answers_enabled,
                imageBaseURL: "",
                debug: document.location.host.indexOf("localhost") > -1,
                onSelect(event, suggestion) {
                  DiscourseURL.routeTo(suggestion.url);
                },
              });
            });
          }
        },

        willRerenderWidget() {
          const searchBox = document.querySelector("#search-box");
          searchBox &&
            searchBox.removeEventListener("focus", this._selectSearchBox);

          this._search && this._search.autocomplete.destroy();
        },

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
                  placeholder: I18n.t(
                    "discourse_algolia.search_box_placeholder"
                  ),
                  autocomplete: "off",
                }),
              ]
            ),
          ];
        },

        _selectSearchBoxContent(event) {
          event.target.select();
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
