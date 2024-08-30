import sys
from openpyxl import load_workbook

class DatabaseItem:
    repo_url = ''
    repo_name = ''
    repo_description = ''
    author_name = ''
    author_url = ''
    repo_tags = ''
    categories = []

def load_database() -> list[DatabaseItem]:
    worksheet = load_workbook('database.xls', data_only=True)['database']

    database : list[DatabaseItem] = [] 
    # Pull information from specific cells.
    for row in list(worksheet.rows):
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
        lines.append(f"{database_item.repo_url}\t{database_item.repo_name}\t{database_item.repo_description}\t{database_item.author_name}\t{database_item.author_url}\t{database_item.repo_tags}")
    return lines

def save_as_txt_database(database : list[DatabaseItem]):
    with open('database.txt', 'w') as database_file:
        database_file.write("repo-url	repo-name	repo-description	author-name	author-url	repo-tags\n")
        database_file.writelines(get_database_lines(database))

def save_as_markdown(database : list[DatabaseItem]):
    categories_in_order : dict[str, list[str]] = dict()
    categories_to_items_dict : dict[str, list[DatabaseItem]] = dict()
    categories_to_subcategories_dict : dict[str, list[str]] = dict()

    for database_item in database:
        previous_category = ''
        for current_category in database_item.categories:
            items_to_assign = categories_to_items_dict.get(current_category, [])
            if not current_category in categories_to_items_dict:
                categories_in_order.append(current_category)
            items_to_assign

            previous_category = current_category
        

    with open('header.md', 'r') as header:
        with open('README.md', 'w') as readme_file:
            readme_file.write(header.read())
            



def main():
    database = load_database()
    save_as_txt_database(database)
    save_as_markdown(database)

if __name__ == "__main__":
    main(sys.argv[1:])
