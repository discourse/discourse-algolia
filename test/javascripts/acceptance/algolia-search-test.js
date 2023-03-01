import {
  acceptance,
  exists,
  query,
  queryAll,
} from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";
import { click, currentURL, fillIn, settled, visit } from "@ember/test-helpers";
import discoveryFixture from "discourse/tests/fixtures/discovery-fixtures";
import { cloneJSON } from "discourse-common/lib/object";

acceptance("Discourse Algolia - Search", function (needs) {
  needs.settings({
    algolia_enabled: true,
    algolia_autocomplete_enabled: true,
    algolia_application_id: "123",
    algolia_search_api_key: "key",
    algolia_admin_api_key: "adminkey",
  });
  needs.site({ can_tag_topics: true });

  needs.pretender((server, helper) => {
    server.get(`/tag/bug/l/latest.json`, () => {
      return helper.response(
        cloneJSON(discoveryFixture["/tag/important/l/latest.json"])
      );
    });
    server.post("https://123-dsn.algolia.net/1/indexes/*/queries", () => [
      200,
      { "Content-Type": "application/json" },
      JSON.stringify({
        results: [
          {
            hits: [
              {
                url: "/t/internationalization-localization/280/1",
                post_number: 1,
                image_url: null,
                content: "Content\n of the topic",
                user: {
                  url: "/u/eviltrout",
                  name: "Robin",
                  username: "eviltrout",
                  avatar_template:
                    "/user_avatar/localhost/eviltrout/{size}/13_2.png",
                },
                topic: {
                  url:
                    "http://localhost:3000/t/internationalization-localization/280h",
                  title: "Internationalization / localization",
                  views: 4369,
                  slug: "internationalization-localization",
                  tags: [],
                },
                category: {
                  url: "/c/feature",
                  name: "feature",
                  color: "1b8653",
                  slug: "feature",
                },
                objectID: "183",
                _snippetResult: {
                  content: {
                    value: "Internationalization / localization",
                    matchLevel: "none",
                  },
                },
                _highlightResult: {
                  content: {
                    value: "Content\n of the topic",
                    matchLevel: "none",
                    matchedWords: [],
                  },
                  topic: {
                    title: {
                      value:
                        "__aa-highlight__Internationalization__/aa-highlight__s / localization",
                      matchLevel: "full",
                      fullyHighlighted: false,
                      matchedWords: ["internationalization"],
                    },
                  },
                },
              },
            ],
            nbHits: 1,
            page: 0,
            nbPages: 1,
            hitsPerPage: 4,
            exhaustiveNbHits: true,
            exhaustiveTypo: true,
            exhaustive: {
              nbHits: true,
              typo: true,
            },
            query: "internationalization",
            params:
              "query=internationalization&hitsPerPage=4&highlightPreTag=__aa-highlight__&highlightPostTag=__%2Faa-highlight__",
            index: "discourse-posts",
            renderingContent: {},
            processingTimeMS: 1,
          },
          {
            hits: [
              {
                url: "/u/eviltrout",
                name: "Robin",
                username: "eviltrout",
                avatar_template:
                  "/user_avatar/localhost/eviltrout/{size}/16_2.png",
                likes_received: 18,
                days_visited: 98,
                objectID: "1",
                _highlightResult: {
                  name: {
                    value: "",
                    matchLevel: "none",
                    matchedWords: [],
                  },
                  username: {
                    value: "__aa-highlight__eviltrout__/aa-highlight__",
                    matchLevel: "full",
                    fullyHighlighted: false,
                    matchedWords: ["eviltrout"],
                  },
                },
              },
            ],
            nbHits: 1,
            page: 0,
            nbPages: 1,
            hitsPerPage: 4,
            exhaustiveNbHits: true,
            exhaustiveTypo: true,
            exhaustive: {
              nbHits: true,
              typo: true,
            },
            query: "eviltrout",
            params:
              "query=eviltrout&hitsPerPage=4&highlightPreTag=__aa-highlight__&highlightPostTag=__%2Faa-highlight__",
            index: "discourse-users",
            renderingContent: {},
            processingTimeMS: 1,
          },
          {
            hits: [
              {
                url: "/tag/bug",
                name: "bug",
                topic_count: 6,
                objectID: "27",
                _highlightResult: {
                  name: {
                    value: "__aa-highlight__bug__/aa-highlight__",
                    matchLevel: "full",
                    fullyHighlighted: false,
                    matchedWords: ["bug"],
                  },
                },
              },
            ],
            nbHits: 1,
            page: 0,
            nbPages: 1,
            hitsPerPage: 4,
            exhaustiveNbHits: true,
            exhaustiveTypo: true,
            exhaustive: {
              nbHits: true,
              typo: true,
            },
            query: "bug",
            params:
              "query=bug&hitsPerPage=4&highlightPreTag=__aa-highlight__&highlightPostTag=__%2Faa-highlight__",
            index: "discourse-tags",
            renderingContent: {},
            processingTimeMS: 1,
          },
        ],
      }),
    ]);
  });
  test("search posts, users and tags", async function (assert) {
    await visit("/");
    await fillIn(".aa-Input", "internationalization");
    await settled();

    const posts = queryAll(".hit-post-topic-title");
    assert.strictEqual(posts.length, 1);
    assert.strictEqual(
      posts[0].textContent.trim(),
      "Internationalizations / localization"
    );
    await click(".hit-post-topic-title");
    assert.strictEqual(
      currentURL(),
      "/t/internationalization-localization/280",
      "redirects to topic"
    );

    await fillIn(".aa-Input", "internationalization");
    await settled();
    await click(".hit-post-category-name");
    assert.strictEqual(
      currentURL(),
      "/c/feature",
      "redirects to category of the topic"
    );

    await fillIn(".aa-Input", "internationalization");
    await settled();
    await click(".hit-post-username");
    assert.strictEqual(
      currentURL(),
      "/u/eviltrout/summary",
      "redirects to author user profile"
    );

    await fillIn(".aa-Input", "eviltrout");
    await settled();
    assert.strictEqual(
      query(".hit-user-custom-ranking").innerText.trim(),
      "❤18",
      "displayes amount of likes"
    );
    await click(".hit-user-username");
    assert.strictEqual(
      currentURL(),
      "/u/eviltrout/summary",
      "redirects to user profile"
    );

    await fillIn(".aa-Input", "bug");
    await settled();
    assert.strictEqual(
      query(".hit-tag-topic_count").innerText.trim(),
      "6",
      "displayes amount of topics with tag"
    );
    await click(".hit-tag-name");
    assert.strictEqual(currentURL(), "/tag/bug", "redirects to tag page");
  });

  test("search not visible when site is requiring login", async function (assert) {
    this.siteSettings.login_required = true;
    await visit("/");
    assert.ok(!exists(document.querySelector(".algolia-search")));
  });
});
