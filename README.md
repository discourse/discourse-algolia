discourse-algolia [beta]
============================

Power the search on your Discourse with [Algolia](https://algolia.com/) 🔎🎉

The discourse-algolia plugin indexes user, post, topic and tag activity with Algolia and adds a multi-category implementation of [autocomplete.js](https://github.com/algolia/autocomplete.js) to the Discourse header. Try it live on [Algolia's Community Forum](https://discourse.algolia.com/):

![discourse-algolia autocomplete](https://cl.ly/203G0j3Z0m1E/Screenshot%202017-10-04%2014.27.24.png)

## Features

The discourse-algolia plugin uses the Algolia API to provide a search that's both fast and relevant.

- Topics are ranked by their *number of views*, users by their number of *likes received*, and tags by their *topic count*. This makes sure the most popular content stays near the top of your search results.
- Algolia's distinct faceting feature is used to make sure each topic only appears once in the search results, leaving more room for other topics. Additional ranking signals are used within topics - including the order of posts in the topic and paragraphs in the post - to provide the best matches within a topic even when there are many.
- Natively, Algolia handles typos, multiple languages, highlighting and snippeting results, and providing results as-you-type from the first keystroke.
- The multi-category autocomplete searches posts, topics, users and tags simultaneously, displaying them in different parts of the autocomplete for readability. Keyboard navigation is supported with the up/down arrows.

## Prerequisites

You'll need an Algolia account.

* If you don't have one already, go here to [sign up](https://algolia.com/users/sign_up). You'll get 10,000 records and 100,000 indexing operations for free every month.
* If you're using Discourse for an open source project and need higher limits, check out our [Algolia for Open Source](https://algolia.com/for-open-source) page to see if you qualify.
* If you need higher limits for your business, we're happy to help you [find the right plan](mailto:hey@algolia.com).

## Installation

Add this repository's `git clone` url to your container's `app.yml` file, at the bottom of the `cmd` section:

```yml
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          - mkdir -p plugins
          - git clone https://github.com/algolia/docker_manager.git
          - git clone https://github.com/algolia/discourse-algolia.git
```

Rebuild your container:

```
cd /var/discourse
git pull
./launcher rebuild app
```

## Configuration

Once you've installed the plugin and restarted your Discourse, you will see a new plugin available in your admin configuration. Click the `Settings` button next to the `discourse-algolia` plugin.

![Discourse admin plugins list](https://cl.ly/0D3e0a2A2C0Y/[93746251235ab2720a904dda08be4c49]_Screenshot%202017-10-04%2013.38.35.png)

You will now see all of the plugin configuration options available.

![discourse-algolia configuration options](https://cl.ly/0o1d1h361M33/Screenshot%202017-10-04%2013.41.16.png)

Populate the settings as follows:

- **algolia enabled**: Check this box to enable indexing new content with Algolia.
- **algolia autocomplete enabled**: Check this box to replace the default Discourse autocomplete with the Algolia autocomplete. It is recommended to do this only once you have all content indexed (see below).
- **algolia application id**: The ID of an Algolia application you have created.
- **algolia search api key**: A search-only API key of the Algolia application. Do not use an admin API key, as this will be visible to the clients of your Discourse.
- **algolia admin api key**: The admin API key of your Discourse application, or any API key that can write and configure indices.
- **algolia discourse username**: If content is visible to this Discourse user, it will be indexed. If not, it will be skipped. This defaults to `system`, which is an admin account and can see content in all categories, including Staff. (Private messages, however, are always excluded from indexing.) It is recommended that you create a dummy separate user who can only see content you consider to be public, and change this value to their username.

You can find the **algolia application id**, **algolia search api key**, and **algolia admin api key** in the **API Keys** page of your [Algolia dashboard](https://algolia.com/dashboard/).

![Algolia dashboard API Keys page](https://cl.ly/380F0e1Y220Z/Screenshot%202017-10-04%2013.51.02.png)

Once all of the settings are turned on and populated, the plugin configuration should look like this:

![discourse-algolia populated configuration options](https://cl.ly/0A3T431l0t0B/Screenshot%202017-10-04%2014.00.09.png)

## Initial indexing

Before you perform the initial indexing, you must have enabled Algolia above and provided an application ID and an admin API key. Run the following rake task in your Discourse directory:

```shell
LOAD_PLUGINS=1 bundle exec rails algolia:initialize
```

This will create and configure three indices - `users`, `posts`, and `tags` - and then populate them by loading data from your database and sending it to Algolia. The data will be searchable as soon as the task is finished. You can now enable the **algolia autocomplete enabled** setting of the plugin, reload the page of your Discourse, and try the autocomplete search.

## Styling with CSS

To see how you can change the look and feel of the autocomplete, see the CSS styles in the plugin's [assets/stylesheets](https://github.com/algolia/discourse-algolia/tree/master/assets/stylesheets) directory.

```
 .algolia-holder .aa-input {
    color: #919191;
    font-family: Open Sans, Arial, sans-serif;
    border: solid 1px rgba(137,149,199,0.2);
    border-radius: 6px;
    font-size: 13px;
    line-height: 13px;
    padding: 8px 10px 8px 35px;
    height: auto;
    width: 250px;
    outline: 0;
    background-image: url("data:image/svg+xml;utf8,<svg width='14' height='14' viewBox='0 0 14 14' xmlns='http://www.w3.org/2000/svg'><path d='M12.5 11h-.79l-.28-.27C12.41 9.59 13 8.11 13 6.5 13 2.91 10.09 0 6.5 0S0 2.91 0 6.5 2.91 13 6.5 13c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L17.49 16l-4.99-5zm-6 0C4.01 11 2 8.99 2 6.5S4.01 2 6.5 2 11 4.01 11 6.5 8.99 11 6.5 11z' fill='%237C8A94' fill-rule='evenodd'/></svg>");
    background-size: 14px 14px;
    background-repeat: no-repeat;
    background-position: 10px center;
  }
```

You'll see style definitions like this, which you can override by creating a fork of the plugin or more easily by using the CSS/HTML customization that Discourse makes available in the Admin tool.

## Customizing ranking

You can use the full power of your Algolia dashboard to change the way that users, topics, posts and tags are ranked in the results - without ever touching any of the plugin code. The plugin pushes a large number of attributes from each object to Algolia, anticipating that some may be usable as ranking signals for different plugin users. While a full treatment of ranking, relevance and the Algolia dashboard is out of scope here, we encourage you to head over to the [Algolia documentation](https://algolia.com/doc/) and start digging in.

## Support

Have a question? Ran into an issue? If it's code-related, please file an issue in this repository and include as much information as possible. If it's a general question, please post it on the [Algolia Community Forum](https://discourse.algolia.com/) and add the tag `#discourse-algolia`. We look forward to hearing from you!
