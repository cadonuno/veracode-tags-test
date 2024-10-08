from openpyxl import load_workbook

class DatabaseItem:
    repo_url = ''
    repo_name = ''
    repo_description = ''
    author_name = ''
    author_url = ''
    repo_tags = ''
    categories = []
    
    def get_description_for_readme(self):
        base_description = self.repo_description
        if not "[" in base_description:
            return base_description
        				
        splitDescription = base_description.split("[")
        newDescription = splitDescription[0]
        currentLinkIndex = 1
        while currentLinkIndex < len(splitDescription):
            linkTagEndSplit = splitDescription[currentLinkIndex].split("]")
            linkTagUrlAndDescriptionSplit = linkTagEndSplit[0].split("|")
            newDescription+=f"[{linkTagUrlAndDescriptionSplit[0]}]({linkTagUrlAndDescriptionSplit[1]}){linkTagEndSplit[1]}"
            currentLinkIndex+=1

        return newDescription

    def build_for_readme(self):
        return f"- [{self.repo_name}]({self.repo_url}) ([{self.author_name}]({self.author_url})) - {self.get_description_for_readme()}\n"
    
    def build_for_database(self):
        return f"{self.repo_name}\t{self.repo_description}\t{self.author_name}\t{self.repo_tags}\t{self.repo_url}\t{self.author_url}"


def load_database() -> list[DatabaseItem]:
    worksheet = load_workbook('database.xlsx', data_only=True)['database']

    database : list[DatabaseItem] = []
    for row in list(worksheet.rows) [1:]:
        line_data = DatabaseItem()
        line_data.repo_url = row[0].value
        line_data.repo_name = row[1].value
        line_data.repo_description = row[2].value
        line_data.author_name = row[3].value
        line_data.author_url = row[4].value
        line_data.repo_tags = row[5].value
        line_data.categories = row[6].value.split(">")
        database.append(line_data)

    return database

def get_database_lines(database : list[DatabaseItem]) -> list[str]:
    lines : list[str] = []
    for database_item in database:
        lines.append(database_item.build_for_database())
    return lines

def save_as_txt_database(database : list[DatabaseItem]):
    with open('database.txt', 'w') as database_file:
        database_file.write("repo-url	repo-name	repo-description	author-name	author-url	repo-tags\n")
        database_file.writelines(f"{database_line}\n" for database_line in get_database_lines(database))

def parse_database(database : list[DatabaseItem]) -> tuple[list[str], dict[str, set[str]], dict[str, list[str]]]:
    categories_in_order : list[str] = []
    categories_to_items_dict : dict[str, list[str]] = dict()
    categories_to_subcategories_dict : dict[str, set[str]] = dict()

    for database_item in database:
        previous_category = ''
        for current_category in database_item.categories:
            if previous_category:
                subcategories = categories_to_subcategories_dict.get(previous_category, [])
                if not current_category in subcategories:
                    subcategories.append(current_category)
                    categories_to_subcategories_dict[previous_category] = subcategories

            if not current_category in categories_in_order and not previous_category:
                categories_in_order.append(current_category)

            previous_category = current_category

        items_for_category = categories_to_items_dict.get(current_category, [])        

        items_for_category.append(database_item.build_for_readme())

        categories_to_items_dict[current_category] = items_for_category

    return categories_in_order, categories_to_items_dict, categories_to_subcategories_dict


def write_category_to_file(category : str, readme_file, categories_to_items_dict : dict[str, list[str]], categories_to_subcategories_dict : dict[str, set[str]], level: int):
    readme_file.write(f"{level*"#"} {category}\n\n")
    for item in categories_to_items_dict.get(category, []):
        readme_file.write(f"{item}\n\n")
    for sub_category in categories_to_subcategories_dict.get(category, []):
        write_category_to_file(sub_category, readme_file, categories_to_items_dict, categories_to_subcategories_dict, level + 1)

def write_category_to_table_of_contents(category: str, readme_file, categories_to_subcategories_dict : dict[str, set[str]], level: int):
    readme_file.write(f"{level*"  "}- [{category}](#{category.lower().replace(" ", "-")})\n")
    for sub_category in categories_to_subcategories_dict.get(category, []):
        write_category_to_table_of_contents(sub_category, readme_file, categories_to_subcategories_dict, level + 1)

def write_table_of_contents(readme_file, categories_in_order : list[str], categories_to_subcategories_dict : dict[str, set[str]]):
    level = 0
    for category in categories_in_order:
        write_category_to_table_of_contents(category, readme_file, categories_to_subcategories_dict, level)
    readme_file.write("\n\n<!-- END doctoc generated TOC please keep comment here to allow auto update -->\n")

def save_as_markdown(categories_in_order : list[str], categories_to_items_dict : dict[str, list[str]], categories_to_subcategories_dict : dict[str, set[str]]):
    with open('README.md', 'w') as readme_file:
        with open('header.md', 'r') as header:
            readme_file.write(header.read())
        write_table_of_contents(readme_file, categories_in_order, categories_to_subcategories_dict)
        level = 2
        for category in categories_in_order:
            write_category_to_file(category, readme_file, categories_to_items_dict, categories_to_subcategories_dict, level)

def main():
    database = load_database()
    save_as_txt_database(database)
    save_as_markdown(*parse_database(database))

if __name__ == "__main__":
    main()
