import pandas as pd
import json

# Load the spreadsheet
file_path = 'hehe.xlsx'  # Replace with the path to your file
spreadsheet = pd.ExcelFile(file_path)
df = spreadsheet.parse("Skala MBTI")

# Define category mappings for each cell
category_map = {
    "I": ["D63", "D55", "C48", "C41", "D38", "C34", "C32", "D31", "C23", "C18", "C14", "C13", "D10", "D8", "C5"],
    "S": ["C56", "C54", "C49", "C46", "C44", "C39", "C37", "C30", "C28", "D25", "D21", "C19", "C16", "C11", "D9"],
    "T": ["C61", "C60", "C58", "D52", "C51", "C45", "D42", "C40", "C26", "D35", "C33", "C20", "D12", "C7", "D17"],
    "J": ["D62", "C59", "C57", "D53", "C50", "D47", "D43", "D36", "D29", "C27", "D24", "C22", "D15", "C6", "D4"],
    "E": ["C63", "C55", "D48", "D41", "C38", "D34", "D32", "C31", "D23", "D18", "D14", "D13", "C10", "C8", "D5"],
    "N": ["D56", "D54", "D49", "D46", "D44", "D39", "D37", "D30", "D28", "C25", "C21", "D19", "D16", "D11", "C9"],
    "F": ["D61", "D60", "D58", "C52", "D51", "D45", "C42", "D40", "C35", "D33", "D26", "D20", "D17", "C12", "D7"],
    "P": ["C62", "D59", "D57", "C53", "D50", "C47", "C43", "C36", "C29", "D27", "C24", "D22", "C15", "D6", "C4"]
}

# Helper function to get the category based on cell ID
def get_category(cell_id):
    # Return the category associated with the cell
    return [cat for cat, cells in category_map.items() if cell_id in cells]

# Extract cells C3 to C63 and D3 to D63 for first and second questions, respectively
first_questions = df.loc[2:61, 'Unnamed: 1']  # C3 to C63
second_questions = df.loc[2:61, 'Unnamed: 4']  # D3 to D63

# Build JSON data with correct category assignment using the previous cell index for category lookup
json_data = []
for idx, (first, second) in enumerate(zip(first_questions, second_questions), start=3):
    # Use cell index - 1 for category lookup
    cell_first = f"C{idx + 1}"
    cell_second = f"D{idx + 1}"
    
    # Get categories for both cells and combine them
    categories = get_category(cell_first) + get_category(cell_second)
    
    # Append the question pair and category to the JSON data
    json_data.append({
        "first": first,
        "second": second,
        "category": categories
    })

# Save JSON to file
output_path = 'sdfdsfll.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(json_data, f, ensure_ascii=False, indent=4)

print(f"JSON file saved to {output_path}")
