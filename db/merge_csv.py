import os
import pandas as pd

folder_path = 'Melbourne_Emission/'

# Initialize an empty list to store DataFrames
data_frames = []
column_names = None  # Placeholder for column names

# Loop through all files in the specified folder
for file_name in os.listdir(folder_path):
    if file_name.endswith('.csv'):
        file_path = os.path.join(folder_path, file_name)

        # Read the CSV file to extract column names (first row)
        df_header = pd.read_csv(file_path, nrows=1)
        current_column_names = df_header.columns.tolist()

        # Store the column names from the first file
        if column_names is None:
            column_names = current_column_names

        # Read the CSV file, skip the first row, and store it in the list
        df = pd.read_csv(file_path, skiprows=1, names=current_column_names)
        data_frames.append(df)

# Concatenate all DataFrames in the list
merged_df = pd.concat(data_frames, ignore_index=True)

# Assign the column names from the skipped rows
merged_df.columns = column_names

# Save the merged data to a new CSV file
output_file = os.path.join(folder_path, 'merged_data_emission.csv')
merged_df.to_csv(output_file, index=False)

print(f"Merged data with renamed columns saved to {output_file}")
