import { withPluginApi } from "discourse/lib/plugin-api";
import DiscourseURL from "discourse/lib/url";

const algoliasearch = window.algoliasearch;
const { autocomplete, getAlgoliaResults } = window["@algolia/autocomplete-js"];

function escapeHighlightedString(str) {
  return str
    .replace(/__aa-highlight__/, '<span class="highlighted">')
    .replace(/__\/aa-highlight__/, "</span>");
}

function initializeAutocomplete(options) {
  const searchClient = algoliasearch(
    options.algoliaApplicationId,
    options.algoliaSearchApiKey
  );

  const hitsPerPage = 4;

  return autocomplete({
    container: "li.algolia-holder",
    openOnFocus: true,
    debug: options.debug,
    detachedMediaQuery: "none",
    render({ elements, createElement }) {
      // TODO: use Preact's render
      return createElement(
        "div",
        { className: "autocomplete-results" },
        createElement("div", { className: "left-container" }, [elements.posts]),
        createElement("div", { className: "right-container" }, [
          elements.users,
          elements.tags,
        ])
      );
    },
    getSources() {
      return [
        {
          sourceId: "posts",
          getItems({ query }) {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: "discourse-posts",
                  query,
                  params: { hitsPerPage },
                },
              ],
            });
          },
          templates: {
            empty: `<div class="aa-empty">No matching posts.</div>`,
            item({ item, createElement }) {
              let tags = "";
              let baseTags = item.topic.tags;
              let highlightedTags = item._highlightResult.topic.tags;

              if (baseTags && highlightedTags) {
                baseTags.forEach((baseTag, index) => {
                  tags += `<a class="item-post-tag" href="/tags/${baseTag}">${escapeHighlightedString(
                    highlightedTags[index].value
                  )}</a>`;
                });
              }

              return createElement("div", {
                dangerouslySetInnerHTML: {
                  __html: `
                    <div class="item-post">
                      <div class="item-post-title-holder">
                        <span class="item-post-topic-title">
                          ${item._highlightResult.topic.title.value}
                        </span>
                        <span class="item-post-topic-views" title="Number of times the topic has been viewed">
                          ${item.topic.views}
                        </span>
                      </div>
                      <div class="item-post-category-tags">
                        <span class="item-post-category">
                          <span class="badge-wrapper bullet">
                            <span class="badge-category-bg" style="background-color: #${
                              item.category?.color
                            };" />
                            <a class='badge-category item-post-category-name' href="${
                              item.category?.url
                            }">${item.category?.name}</a>
                          </span>
                        </span>
                        <span class="item-post-tags">${tags}</span>
                      </div>
                      <div class="item-post-content-holder">
                        <a class="item-post-username" href="${
                          item.user.url
                        }">@${item.user.username}</a>:
                        <span class="item-post-content">${escapeHighlightedString(
                          item._snippetResult.content.value
                        )}</span>
                      </div>
                    </div>`,
                },
              });
            },
          },
        },
        {
          sourceId: "users",
          getItems({ query }) {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: "discourse-users",
                  query,
                  params: { hitsPerPage },
                },
              ],
            });
          },
          templates: {
            noResults() {},
            item({ item, createElement }) {
              return createElement("div", {
                dangerouslySetInnerHTML: {
                  __html: `
                    <div class='item-user-left'>
                      <img class="item-user-avatar" src="${
                        options.imageBaseURL
                      }${item.avatar_template.replace("{size}", 50)}" />
                    </div>
                    <div class='item-user-right'>
                      <div class="item-user-username-holder">
                        <span class="item-user-username">
                          @${item._highlightResult.username.value}
                        </span>
                        <span class="item-user-custom-ranking" title="Number of likes the user has received">
                          ${
                            item.likes_received > 0
                              ? `<span class="item-user-like-heart">❤</span> ${item.likes_received}`
                              : ""
                          }
                        </span>
                      </div>
                      <div class="item-user-name">
                        ${escapeHighlightedString(
                          item._highlightResult.name
                            ? item._highlightResult.name.value
                            : item.name
                            ? item.name
                            : item.username
                        )}
                      </div>
                    </div>
                  `,
                },
              });
            },
          },
        },
        {
          sourceId: "tags",
          getItems({ query }) {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: "discourse-tags",
                  query,
                  params: { hitsPerPage },
                },
              ],
            });
          },
          templates: {
            noResults() {},
            item({ item, createElement }) {
              return createElement("div", {
                dangerouslySetInnerHTML: {
                  __html: `
                    <div class='item-tag'>
                      <span class="item-tag-name">#${escapeHighlightedString(
                        item._highlightResult.name
                          ? item._highlightResult.name.value
                          : item.name
                      )}</span>
                      <span class="item-tag-topic_count" title="Number of topics with this tag">${
                        item.topic_count
                      }</span>
                    </div>
                  `,
                },
              });
            },
          },
        },
      ];
    },
  });
}

export default {
  name: "discourse-algolia",

  initialize() {
    withPluginApi("0.8.8", (api) => {
      api.createWidget("algolia", {
        tagName: "li.algolia-holder",

        didRenderWidget() {
          if (
            !this.siteSettings.algolia_enabled ||
            !this.siteSettings.algolia_autocomplete_enabled
          ) {
            return;
          }

          document.body.classList.add("algolia-enabled");

          this._search = initializeAutocomplete({
            algoliaApplicationId: this.siteSettings.algolia_application_id,
            algoliaSearchApiKey: this.siteSettings.algolia_search_api_key,
            algoliaAnswersEnabled: this.siteSettings.algolia_answers_enabled,
            imageBaseURL: "",
            debug: document.location.host.indexOf("localhost") > -1,
            onSelect(event, item) {
              DiscourseURL.routeTo(item.url);
            },
          });
        },

        willRerenderWidget() {
          if (this._search) {
            this._search.setIsOpen(false);
            this._search.destroy();
            this._search = null;
          }

          document.body.classList.remove("algolia-enabled");
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
