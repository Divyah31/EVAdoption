import pandas as pd

# Load the Excel file
file_path = 'recycling_dropoff.xlsx'  # Replace with your file path
df = pd.read_excel(file_path)

# Assuming the second column contains latitude and longitude
# Extract the latitude and longitude
df[['latitude', 'longitude']] = df.iloc[:, 1].str.split(',', expand=True)

# Convert the new columns to numeric for proper handling
df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')

selected_columns = df[['name', 'latitude', 'longitude']]

# Save the selected columns to a CSV file
output_file = 'recycling_dropoff.csv'
selected_columns.to_csv(output_file, index=False)
