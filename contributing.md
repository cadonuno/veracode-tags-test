# Veracode Community Projects

This project generates a [webpage](https://cadonuno.github.io/veracode-tags-test) and a markdown file ([README.md](https://github.com/cadonuno/veracode-tags-test/blob/main/README.md)) which lists all plugins found in [database.xlsx](https://github.com/cadonuno/veracode-tags-test/blob/main/database.xlsx).

## How to contribute:
* Fork this repository, make your changes:
    * To add a project, open the [database.xlsx](https://github.com/cadonuno/veracode-tags-test/blob/main/database.xlsx).
    * You can add or modify lines (tags are comma-delimited).
        * You can add links to the project description by using a combination of `[` and `|`.
            * Example: `[LINK DESCRIPTION|LINK URL]`
        * Add descriptive tags to make searching easy, I recommend tagging all repositories with at least one of the following:
            * Automation Script
            * Automation Example
            * Container
            * Insecure Application
            * Library
            * One-of run
            * Plugin
            * Security Example
        * Categories will be parsed to create the [README.md](https://github.com/cadonuno/veracode-tags-test/blob/main/README.md) file.
        * Any content not in English must be tagged with its language.
* Once your changes are done, open a Pull Request. Once the PR is merged, the [webpage](https://cadonuno.github.io/veracode-tags-test) will be updated automatically.
