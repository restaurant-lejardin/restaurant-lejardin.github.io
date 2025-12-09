import json
from bs4 import BeautifulSoup
import argparse
# from collections import defaultdict


def parse_food_data(html_file, output_json, food_type):
    """
    Parse food data from an HTML file and convert it into JSON format.

    Args:
        html_file (str): Path to the HTML file containing food data.
        output_json (str): Path to the output JSON file.
    """
    with open(html_file, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file, 'html.parser')

    categories = []

    # Find all dessert categories
    category_divs = soup.find_all('div', class_=f'{food_type}-category')
    for category_div in category_divs:
        category = {
            'id': category_div.get('id', ''),
            'title': category_div.find('h2', class_='banner').get_text(strip=True) if category_div.find('h2', class_='banner') else '',
            'items': []
        }

        # Find all dessert items within the category
        item_divs = category_div.find_all('div', class_='menu-item')
        for item_div in item_divs:
            item = {}
            name_div = item_div.find('span', class_=f'{food_type}-name')
            if name_div:
                item['name'] = name_div.get_text(strip=True)

            price_div = item_div.find('span', class_=f'{food_type}-price')
            if price_div:
                item['price'] = price_div.get_text(strip=True).rstrip('€')

            image_div = item_div.find('img')
            if image_div:
                item['image'] = image_div['data-src']

            description_div = item_div.find('p', class_=f'{food_type}-ingredients')
            if description_div:
                item['description'] = description_div.get_text(strip=True)
            category['items'].append(item)

        categories.append(category)

    # Write the parsed data to a JSON file
    with open(output_json, 'w', encoding='utf-8') as json_file:
        json.dump({'categories': categories}, json_file, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert food data from HTML to JSON.")
    parser.add_argument("--type", help="Type of food data to convert (e.g., desserts, entrees).")
    parser.add_argument("--html_file", help="Path to the HTML file containing food data.")
    parser.add_argument("--output_json", help="Path to the output JSON file.")
    args = parser.parse_args()

    parse_food_data(args.html_file, args.output_json, args.type)