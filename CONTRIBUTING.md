# Local development setup

Using the **Docker** setup for Discourse development:

- Clone this repository as `discourse-algolia`: `git clone git@github.com:discourse/discourse-algolia.git`
- Clone the `discourse` repository: `git@github.com:discourse/discourse.git`
- Create a symbolic link between to your local version of `discourse-algolia` in the `plugins` directory of discourse. For example, if both projects are in the same parent folder:
    ```
    > cd discourse/plugins
    > ln -s ../../discourse-algolia .
    ```

- Once the link is created, you can follow the [Developing with Docker](https://meta.discourse.org/t/beginners-guide-to-install-discourse-for-development-using-docker/102009) instructions:
  - Install Docker
  - Start the container
