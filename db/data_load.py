import pandas as pd

csv_file_path = 'Melbourne_Emission/merged_data_emission.csv'

# Load the CSV file into a DataFrame
df = pd.read_csv(csv_file_path)

# Filter rows where the 'travel_bounds' column has the value "TOTAL"
filtered_df = df[df['travel_bounds'] == 'TOTAL']

# Select the desired columns
selected_columns = ['mode', 'travel_bounds', 'full_co2e_tons', 'gpc_co2e_tons', 'year', 'lga']
filtered_df = filtered_df[selected_columns]

# Remove rows where the 'mode' column is one of the specified modes
modes_to_remove = ['CYCLING', 'FERRYBOAT', 'ON FOOT', 'RAIL', 'TRAM']
filtered_df = filtered_df[~filtered_df['mode'].isin(modes_to_remove)]

# Display the rows with any null values
null_values_df = filtered_df[filtered_df.isnull().any(axis=1)]
print("Rows with null values:")
print(null_values_df)

# Optionally, save the filtered data to a new CSV file without the removed modes
output_file = 'filtered_emission_data.csv'
filtered_df.to_csv(output_file, index=False)

print(f"Filtered and cleaned data saved to {output_file}")
