# Veracode Community Projects

This project generates a [webpage](https://cadonuno.github.io/veracode-tags-test) which lists all plugins found in [database.txt](https://github.com/cadonuno/veracode-tags-test/blob/main/database.txt).

## How to contribute:
* Fork this repository, make your changes:
    * To add a project, open the [database.txt](https://github.com/cadonuno/veracode-tags-test/blob/main/database.txt) file as a table using Excel (or equivalent).
    * You can add or modify lines (tags are comma-delimited).
        * You can add links to the project description by using a combination of `[` and `|`.
            * Example: `[LINK DESCRIPTION|LINK URL]`
        * Avoid using double quotes as Excel adds them to the tags field in [database.txt](https://github.com/cadonuno/veracode-tags-test/blob/main/database.txt).
        * Add descriptive tags to make searching easy, I recommend tagging all repositories with at least one of the following:
            * Automation Script
            * Automation Example
            * Plugin
            * One-of run
            * Insecure Application
            * Container
            * Library
            * Security Example
    * After modifying the [database.txt](https://github.com/cadonuno/veracode-tags-test/blob/main/database.txt) file, it is recommended to perform a find-and-replace to remove all double quotes.
* Once your changes are done, open a Pull Request. Once the PR is merged, the [webpage](https://cadonuno.github.io/veracode-tags-test) will be updated automatically.
