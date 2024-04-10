import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import { Promise } from "rsvp";
import { apiInitializer } from "discourse/lib/api";
import loadScript from "discourse/lib/load-script";
import DiscourseURL from "discourse/lib/url";
import { isDevelopment } from "discourse-common/config/environment";
import I18n from "I18n";

function initializeAutocomplete(options) {
  const algoliasearch = window.algoliasearch;
  const { autocomplete, getAlgoliaResults } =
    window["@algolia/autocomplete-js"];

  const autocompleteElement = document
    .getElementsByClassName("algolia-search")[0]
    .getElementsByClassName("aa-Autocomplete");
  if (autocompleteElement.length > 0) {
    return;
  }

  const searchClient = algoliasearch(
    options.algoliaApplicationId,
    options.algoliaSearchApiKey
  );
  const hitsPerPage = 4;

  const autocompleteSearch = autocomplete({
    container: ".algolia-search",
    panelContainer: ".algolia-autocomplete",
    debug: options.debug,
    detachedMediaQuery: "none",
    placeholder: I18n.t("discourse_algolia.search_box_placeholder"),
    getSources() {
      return [
        {
          sourceId: "posts",
          getItemInputValue: ({ item }) => item.query,
          getItems({ query }) {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: "discourse-posts",
                  query,
                  params: {
                    hitsPerPage,
                  },
                },
              ],
            });
          },
          templates: {
            item({ item, components, html }) {
              let tags = [];
              let baseTags = item.topic.tags;
              if (baseTags) {
                baseTags.forEach((baseTag, index) => {
                  tags.push(html`<a
                    class="hit-post-tag"
                    onClick="${(event) => {
                      DiscourseURL.routeTo(`/tags/${baseTag}`);
                      autocompleteSearch.setIsOpen(false);
                      event.preventDefault();
                      event.stopPropagation();
                    }}"
                  >
                    ${components.Highlight({
                      hit: item,
                      attribute: ["topic", "tags", index],
                    })}
                  </a>`);
                });
              }
              return html` <div class="hit-post">
                <div class="hit-post-title-holder">
                  <span class="hit-post-topic-title">
                    ${components.Highlight({
                      hit: item,
                      attribute: ["topic", "title"],
                    })}
                  </span>
                  <span
                    class="hit-post-topic-views"
                    title="${I18n.t("discourse_algolia.topic_views")}"
                  >
                    ${item.topic.views}
                  </span>
                </div>
                <div class="hit-post-category-tags">
                  <span class="hit-post-category">
                    <span class="badge-wrapper bullet">
                      <span
                        class="badge-category-bg"
                        style="background-color: #${item.category?.color};"
                      />
                      <a
                        class="badge-category hit-post-category-name"
                        onClick="${(event) => {
                          DiscourseURL.routeTo(item.category.url);
                          autocompleteSearch.setIsOpen(false);
                          event.preventDefault();
                          event.stopPropagation();
                        }}"
                        >${item.category?.name}</a
                      >
                    </span>
                  </span>
                  <span class="hit-post-tags">${tags}</span>
                </div>
                <div class="hit-post-content-holder">
                  <a
                    class="hit-post-username"
                    onClick="${(event) => {
                      DiscourseURL.routeTo(item.user.url);
                      autocompleteSearch.setIsOpen(false);
                      event.preventDefault();
                      event.stopPropagation();
                    }}"
                    >@${item.user.username}</a
                  >:
                  <span class="hit-post-content">
                    ${components.Snippet({
                      hit: item,
                      attribute: "content",
                    })}
                  </span>
                </div>
              </div>`;
            },
            noResults({ html }) {
              return html`<div class="aa-empty">
                ${I18n.t("discourse_algolia.no_posts")}
              </div>`;
            },
          },
          onSelect({ item }) {
            DiscourseURL.routeTo(item.url);
          },
        },
        {
          sourceId: "users",
          getItemInputValue: ({ item }) => item.query,
          getItems({ query }) {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: "discourse-users",
                  query,
                  params: {
                    hitsPerPage,
                  },
                },
              ],
            });
          },
          templates: {
            item({ item, components, html }) {
              let likesElement = "";

              if (item.likes_received > 0) {
                likesElement = html`<span class="hit-user-like-heart">❤</span>
                  ${item.likes_received}`;
              }
              const usernameElement = components.Highlight({
                hit: item,
                attribute: item.name ? "name" : "username",
              });

              return html`<div class="hit-user-left">
                  <img
                    class="hit-user-avatar"
                    src="${options.imageBaseURL}${item.avatar_template.replace(
                "{size}",
                50
              )}"
                  />
                </div>
                <div class="hit-user-right">
                  <div class="hit-user-username-holder">
                    <span class="hit-user-username">
                      @${components.Highlight({
                        hit: item,
                        attribute: "username",
                      })}
                    </span>
                    <span
                      class="hit-user-custom-ranking"
                      title="${I18n.t("discourse_algolia.user_likes")}"
                    >
                      ${likesElement}
                    </span>
                  </div>
                  <div class="hit-user-name">${usernameElement}</div>
                </div>`;
            },
          },
          onSelect({ item }) {
            DiscourseURL.routeTo(item.url);
          },
        },
        {
          sourceId: "tags",
          getItemInputValue: ({ item }) => item.query,
          getItems({ query }) {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: "discourse-tags",
                  query,
                  params: {
                    hitsPerPage,
                  },
                },
              ],
            });
          },
          templates: {
            item({ item, components, html }) {
              return html`<div class="hit-tag">
                #<span class="hit-tag-name">
                  ${components.Highlight({
                    hit: item,
                    attribute: "name",
                  })}</span
                >
                <span
                  class="hit-tag-topic_count"
                  title="${I18n.t("discourse_algolia.topic_tags")}"
                  >${item.topic_count}</span
                >
              </div> `;
            },
          },
          onSelect({ item }) {
            DiscourseURL.routeTo(item.url);
          },
        },
      ];
    },

    render({ elements, render, html }, root) {
      const { posts, users, tags } = elements;
      render(
        html`<div class="aa-dropdown-menu">
          <div class="left-container">
            <div class="aa-dataset-posts">${posts}</div>
          </div>
          <div class="right-container">
            <span class="aa-dataset-users">${users}</span>
            <span class="aa-dataset-tags">${tags}</span>
          </div>
          <div class="aa-footer">
            <div class="left-container">
              <a
                class="advanced-search"
                onClick="${(event) => {
                  DiscourseURL.routeTo("/search");
                  autocompleteSearch.setIsOpen(false);
                  event.preventDefault();
                  event.stopPropagation();
                }}"
                >${I18n.t("discourse_algolia.advanced_search")}</a
              >
            </div>
            <div class="right-container">
              <a
                target="_blank"
                class="algolia-logo"
                href="https://algolia.com/"
                title="${I18n.t("discourse_algolia.powered_by")}"
              ></a>
            </div>
          </div>
        </div>`,
        root
      );
    },
  });
  return autocompleteSearch;
}

export default apiInitializer("0.8", (api) => {
  const siteSettings = api.container.lookup("service:site-settings");
  const currentUser = api.getCurrentUser();
  const shouldDisplay = () =>
    siteSettings.algolia_enabled &&
    siteSettings.algolia_autocomplete_enabled &&
    (!siteSettings.login_required || currentUser);

  let search;

  function renderAlgolia() {
    search?.destroy();

    Promise.all([
      loadScript("/plugins/discourse-algolia/javascripts/autocomplete.js"),
      loadScript("/plugins/discourse-algolia/javascripts/algoliasearch.js"),
    ]).then(() => {
      document.body.classList.add("algolia-enabled");
      search = initializeAutocomplete({
        algoliaApplicationId: siteSettings.algolia_application_id,
        algoliaSearchApiKey: siteSettings.algolia_search_api_key,
        imageBaseURL: "",
        debug: isDevelopment(),
      });
    });
  }

  api.headerIcons.add("algolia", <template>
    {{#if (shouldDisplay)}}
      <li class="algolia-holder" {{didInsert renderAlgolia}}>
        <div class="algolia-search"></div>
        <div class="algolia-autocomplete"></div>
      </li>
    {{/if}}
  </template>);
});
