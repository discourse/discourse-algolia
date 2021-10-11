import { schedule } from "@ember/runloop";
import { withPluginApi } from "discourse/lib/plugin-api";
import DiscourseURL from "discourse/lib/url";
import I18n from "I18n";
import { h } from "virtual-dom";

/* global algoliasearch */
/* global autocomplete */

function initializeAutocomplete(options) {
  const client = algoliasearch(
    options.algoliaApplicationId,
    options.algoliaSearchApiKey
  );

  const postsIndex = client.initIndex("discourse-posts");
  const tagsIndex = client.initIndex("discourse-tags");
  const usersIndex = client.initIndex("discourse-users");

  const hitsPerPage = 4;

  // When Algolia Answers is enabled, use a different endpoint
  let postsSourceFallback = autocomplete.sources.hits(postsIndex, {
    hitsPerPage,
  });

  let postsSource = !options.algoliaAnswersEnabled
    ? postsSourceFallback
    : function (query, callback) {
        const data = {
          query: query,
          queryLanguages: ["en"],
          attributesForPrediction: ["content"],
          nbHits: hitsPerPage,
        };

        const URL = `https://${options.algoliaApplicationId}-dsn.algolia.net/1/answers/discourse-posts/prediction`;
        fetch(URL, {
          method: "POST",
          headers: {
            "X-Algolia-Application-Id": options.algoliaApplicationId,
            "X-Algolia-API-Key": options.algoliaSearchApiKey,
          },
          body: JSON.stringify(data),
        })
          .then((response) => response.json())
          .then((res) => {
            if (!res.hits) {
              throw new Error(`Invalid response: ${res.message}`);
            } else {
              res.hits.forEach((hit) => {
                if ("_answer" in hit && "extract" in hit["_answer"]) {
                  hit["_snippetResult"]["content"]["value"] =
                    hit["_answer"]["extract"];
                }
              });
              callback(res.hits);
            }
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error("[Algolia Answers]", err);
            return postsSourceFallback(query, callback);
          });
      };

  return autocomplete(
    "#search-box",
    {
      openOnFocus: true,
      hint: false,
      debug: options.debug,
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
            <a class="advanced-search" href="/search">advanced search</a>
          </div>
          <div class="right-container">
            <a target="_blank" class="algolia-logo" href="https://algolia.com/"
              title="Powered by the discourse-algolia search plugin"></a>
          </div>
        </div>
      `,
      },
    },
    [
      {
        source: autocomplete.sources.hits(usersIndex, {
          hitsPerPage,
        }),
        name: "users",
        displayKey: "users",
        templates: {
          empty: "",
          suggestion: function (hit) {
            return `
            <div class='hit-user-left'>
              <img class="hit-user-avatar" src="${
                options.imageBaseURL
              }${hit.avatar_template.replace("{size}", 50)}" />
            </div>
            <div class='hit-user-right'>
              <div class="hit-user-username-holder">
                <span class="hit-user-username">
                  @${hit._highlightResult.username.value}
                </span>
                <span class="hit-user-custom-ranking" title="Number of likes the user has received">
                  ${
                    hit.likes_received > 0
                      ? `<span class="hit-user-like-heart">❤</span> ${hit.likes_received}`
                      : ""
                  }
                </span>
              </div>
              <div class="hit-user-name">
                ${autocomplete.escapeHighlightedString(
                  hit._highlightResult.name
                    ? hit._highlightResult.name.value
                    : hit.name
                    ? hit.name
                    : hit.username
                )}
              </div>
            </div>
            `;
          },
        },
      },
      {
        source: autocomplete.sources.hits(tagsIndex, {
          hitsPerPage,
        }),
        name: "tags",
        displayKey: "tags",
        templates: {
          empty: "",
          suggestion: function (hit) {
            return `
            <div class='hit-tag'>
              <span class="hit-tag-name">#${autocomplete.escapeHighlightedString(
                hit._highlightResult.name
                  ? hit._highlightResult.name.value
                  : hit.name
              )}</span>
              <span class="hit-tag-topic_count" title="Number of topics with this tag">${
                hit.topic_count
              }</span>
            </div>
            `;
          },
        },
      },
      {
        source: postsSource,
        name: "posts",
        displayKey: "posts",
        templates: {
          empty: `<div class="aa-empty">No matching posts.</div>`,
          suggestion: function (hit) {
            let tags = "";
            let baseTags = hit.topic.tags;
            let highlightedTags = hit._highlightResult.topic.tags;

            if (baseTags && highlightedTags) {
              baseTags.forEach((baseTag, index) => {
                tags += `<a class="hit-post-tag" href="/tags/${baseTag}">${autocomplete.escapeHighlightedString(
                  highlightedTags[index].value
                )}</a>`;
              });
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
                    <span class="badge-category-bg" style="background-color: #${
                      hit.category.color
                    };" />
                    <a class='badge-category hit-post-category-name' href="${
                      hit.category.url
                    }">${hit.category.name}</a>
                  </span>
                </span>
                <span class="hit-post-tags">${tags}</span>
              </div>
              <div class="hit-post-content-holder">
                <a class="hit-post-username" href="${hit.user.url}">@${
              hit.user.username
            }</a>:
                <span class="hit-post-content">${autocomplete.escapeHighlightedString(
                  hit._snippetResult.content.value
                )}</span>
              </div>
            </div>`;
          },
        },
      },
    ]
  ).on("autocomplete:selected", options.onSelect);
}

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

              this._search = initializeAutocomplete({
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
          if (searchBox) {
            searchBox.removeEventListener("focus", this._selectSearchBox);
          }
          if (this._search) {
            this._search.autocomplete.destroy();
          }
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
