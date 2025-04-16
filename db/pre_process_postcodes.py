import pandas as pd

# Load the datasets
ev_data = pd.read_csv(r"C:\Users\rrau0\Downloads\VIC (5)\FLEET_CONSUMPTION_PROJECTIONS_BEV_POSTCODE_VIC_2022-07-03.csv")
postcode_lga_data = pd.read_csv('postcodes_lga.csv')

# Convert the postcodes column in postcode_lga_data to lists of integers
postcode_lga_data['Postcodes'] = postcode_lga_data['Postcodes'].apply(lambda x: list(map(int, x.split())))
# Create a dictionary to map month abbreviations to integers
# month_to_int = {
#     'Jun': 6, 'Dec': 12
# }
#
# # Assuming the column is named 'MONTH', apply the mapping to convert months to integers
# ev_data['MONTH'] = ev_data['MONTH'].map(month_to_int)

# Create a dictionary to map postcodes to LGAs
postcode_to_lga = {}
for _, row in postcode_lga_data.iterrows():
    for postcode in row['Postcodes']:
        postcode_to_lga[postcode] = row['LGA']

# Filter the EV projection data
filtered_ev_data = ev_data[ev_data['UNIT'] == 'Number']

filtered_ev_data = filtered_ev_data.copy()
filtered_ev_data['LGA'] = filtered_ev_data['POSTCODE'].map(postcode_to_lga)

# Drop rows where LGA is NaN (those postcodes that don't match the required LGAs)
filtered_ev_data = filtered_ev_data.dropna(subset=['LGA'])
unique_vehicle_types = filtered_ev_data['VEHICLE_TYPE'].unique()
print("Unique VEHICLE_TYPE values:")
print(unique_vehicle_types)
vehicle_types_to_keep = ['RES_SMALL', 'RES_MEDIUM', 'RES_LARGE']
filtered_ev_data = filtered_ev_data[filtered_ev_data['VEHICLE_TYPE'].isin(vehicle_types_to_keep)]

# Select relevant columns for output
output_data = filtered_ev_data[['MONTH', 'YEAR', 'VEHICLE_TYPE', 'SCENARIO', 'LGA', 'VALUE']]

# Write the result to a new CSV file
output_data.to_csv('filtered_ev_projection.csv', index=False)

print("Data processing complete. Output written to 'filtered_ev_projection.csv'.")
