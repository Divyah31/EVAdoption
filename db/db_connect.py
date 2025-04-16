import csv

import pandas as pd
import mysql.connector
from mysql.connector import Error
import geopandas as gpd
import plotly.express as px
import folium
from shapely import wkt
import matplotlib.pyplot as plt
import configparser
import re


def create_connection(user, password, host, port, database):
    try:
        config = {
            'user': user,
            'password': password,
            'host': host,
            'port': port,
            'database': database,
            'raise_on_warnings': True
        }
        connection = mysql.connector.connect(**config)
        if connection.is_connected():
            print("Successfully connected to the database")
            return connection
    except Error as err:
        print(f"Error: {err}")
        return None


def create_tables(connection):
    queries = [
        # """
        # CREATE TABLE IF NOT EXISTS TravelMode (
        #     travelmode_id INT AUTO_INCREMENT PRIMARY KEY,
        #     mode_name VARCHAR(50) UNIQUE NOT NULL
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS EmissionLGA (
        #     emissionlga_id INT AUTO_INCREMENT PRIMARY KEY,
        #     lga_name VARCHAR(100) UNIQUE NOT NULL
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS EmissionYear (
        #     emissionyear_id INT AUTO_INCREMENT PRIMARY KEY,
        #     year_value INT UNIQUE NOT NULL
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS CO2Emissions (
        #     emission_id INT AUTO_INCREMENT PRIMARY KEY,
        #     travelmode_id INT,
        #     emissionlga_id INT,
        #     emissionyear_id INT,
        #     travel_bounds VARCHAR(50),
        #     full_co2e_tons FLOAT,
        #     gpc_co2e_tons FLOAT,
        #     FOREIGN KEY (travelmode_id) REFERENCES TravelMode(travelmode_id),
        #     FOREIGN KEY (emissionlga_id) REFERENCES EmissionLGA(emissionlga_id),
        #     FOREIGN KEY (emissionyear_id) REFERENCES EmissionYear(emissionyear_id)
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS LGA_Geometry (
        #     lga_geometry_id INT AUTO_INCREMENT PRIMARY KEY,
        #     lga_name VARCHAR(100),
        #     geometry GEOMETRY,
        #     UNIQUE(lga_name)
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS EVModel (
        #     evmodel_id INT AUTO_INCREMENT PRIMARY KEY,
        #     model VARCHAR(55) UNIQUE NOT NULL
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS VehicleType (
        #     vehicletype_id INT AUTO_INCREMENT PRIMARY KEY,
        #     type_name VARCHAR(20) UNIQUE NOT NULL
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS EVDetails (
        #     evdetails_id INT AUTO_INCREMENT PRIMARY KEY,
        #     evmodel_id INT,
        #     vehicletype_id INT,
        #     variant_details VARCHAR(255),
        #     fast_charge_time_minutes VARCHAR(100),
        #     range_km FLOAT,
        #     energy_consumption_kwh_per_100km FLOAT,
        #     listed_price_aud DECIMAL(15, 2),
        #     FOREIGN KEY (evmodel_id) REFERENCES EVModel(evmodel_id),
        #     FOREIGN KEY (vehicletype_id) REFERENCES VehicleType(vehicletype_id)
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS ev_projection_month (
        #     ev_projection_month_id INT AUTO_INCREMENT PRIMARY KEY,
        #     month_name VARCHAR(5) UNIQUE NOT NULL
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS ev_projection_year (
        #     ev_projection_year_id INT AUTO_INCREMENT PRIMARY KEY,
        #     year_value INT UNIQUE NOT NULL
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS ev_projection_vehicle_type (
        #     ev_projection_vehicle_type_id INT AUTO_INCREMENT PRIMARY KEY,
        #     type_name VARCHAR(20) UNIQUE NOT NULL
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS ev_projection_scenario (
        #     ev_projection_scenario_id INT AUTO_INCREMENT PRIMARY KEY,
        #     scenario_name VARCHAR(20) UNIQUE NOT NULL
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS ev_projection_data (
        #     ev_projection_data_id INT AUTO_INCREMENT PRIMARY KEY,
        #     ev_projection_month_id INT,
        #     ev_projection_year_id INT,
        #     ev_projection_vehicle_type_id INT,
        #     ev_projection_scenario_id INT,
        #     emissionlga_id INT,
        #     value FLOAT,
        #     FOREIGN KEY (ev_projection_month_id) REFERENCES ev_projection_month(ev_projection_month_id),
        #     FOREIGN KEY (ev_projection_year_id) REFERENCES ev_projection_year(ev_projection_year_id),
        #     FOREIGN KEY (ev_projection_vehicle_type_id) REFERENCES ev_projection_vehicle_type(ev_projection_vehicle_type_id),
        #     FOREIGN KEY (ev_projection_scenario_id) REFERENCES ev_projection_scenario(ev_projection_scenario_id),
        #     FOREIGN KEY (emissionlga_id) REFERENCES EmissionLGA(emissionlga_id)
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS ChargingStation (
        #     station_id INT AUTO_INCREMENT PRIMARY KEY,
        #     station_name VARCHAR(100),
        #     latitude FLOAT,
        #     longitude FLOAT,
        #     number_of_chargers INT
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS ChargerDetails (
        #     charger_id INT AUTO_INCREMENT PRIMARY KEY,
        #     station_id INT,
        #     charger_type VARCHAR(100),
        #     number_of_units INT,
        #     FOREIGN KEY (station_id) REFERENCES ChargingStation(station_id)
        # )
        # """,
        # """
        # CREATE TABLE IF NOT EXISTS Recycling_Location (
        #     id INT PRIMARY KEY AUTO_INCREMENT,
        #     name VARCHAR(100) NOT NULL,
        #     latitude FLOAT NOT NULL,
        #     longitude FLOAT NOT NULL
        # );
        # """
    ]

    cursor = connection.cursor()
    for query in queries:
        cursor.execute(query)
    connection.commit()
    cursor.close()
    print("Tables created successfully")


def get_id(connection, table, column, value):
    cursor = connection.cursor()
    cursor.execute(f"SELECT {table}_id FROM {table} WHERE {column} = %s", (value,))
    result = cursor.fetchone()
    cursor.close()
    return result[0] if result else None


def get_or_insert_reference(connection, table, column, value):
    cursor = connection.cursor()

    id_column = f"{table.lower()}_id"

    # First, try to fetch the ID if it already exists
    cursor.execute(f"SELECT {id_column} FROM {table} WHERE {column} = %s", (value,))
    result = cursor.fetchone()

    if result:
        # If the result exists, return the ID
        return result[0]
    else:
        # If the result doesn't exist, insert the new value
        cursor.execute(f"INSERT INTO {table} ({column}) VALUES (%s)", (value,))
        connection.commit()

        # Fetch and return the newly inserted ID
        cursor.execute(f"SELECT {table}_id FROM {table} WHERE {column} = %s", (value,))
        result = cursor.fetchone()

        # Close the cursor
        cursor.close()

        return result[0]


def load_emission_data_from_csv(connection, csv_file):
    df = pd.read_csv(csv_file)

    cursor = connection.cursor()

    for index, row in df.iterrows():
        travelmode_id = get_or_insert_reference(connection, 'TravelMode', 'mode_name', row['mode'])
        emissionlga_id = get_or_insert_reference(connection, 'EmissionLGA', 'lga_name', row['lga'])
        emissionyear_id = get_or_insert_reference(connection, 'EmissionYear', 'year_value', row['year'])

        insert_query = """
        INSERT INTO CO2Emissions (travelmode_id, emissionlga_id, emissionyear_id, travel_bounds, full_co2e_tons, gpc_co2e_tons)
        VALUES (%s, %s, %s, %s, %s, %s)
        """

        cursor.execute(insert_query, (
            travelmode_id,
            emissionlga_id,
            emissionyear_id,
            row['travel_bounds'],
            row['full_co2e_tons'],
            row['gpc_co2e_tons']
        ))

    connection.commit()
    cursor.close()
    print("Emission data loaded successfully from CSV")


def load_lga_shape_data(connection, shape_file_path):
    gdf = gpd.read_file(shape_file_path)

    cursor = connection.cursor()

    for index, row in gdf.iterrows():
        lga_name = row['ABB_NAME']
        geometry = row['geometry'].wkt

        # Insert geometry into LGA_Geometry table
        cursor.execute(
            "INSERT INTO LGA_Geometry (lga_name, geometry) VALUES (%s, ST_GeomFromText(%s)) ON DUPLICATE KEY UPDATE geometry = ST_GeomFromText(%s)",
            (lga_name, geometry, geometry)
        )

    connection.commit()
    cursor.close()
    print("LGA geometry data loaded successfully")


def query_database(connection, lga_name, year_value):
    query = """
    SELECT L.lga_name, Y.year_value, T.mode_name, C.full_co2e_tons, G.geometry
    FROM CO2Emissions C
    JOIN EmissionLGA L ON C.emissionlga_id = L.emissionlga_id
    JOIN TravelMode T ON C.travelmode_id = T.travelmode_id
    JOIN Year Y ON C.emissionyear_id = Y.emissionyear_id
    JOIN LGA_Geometry G ON L.emissionlga_id = G.emissionlga_id
    WHERE L.lga_name = %s AND Y.year_value = %s;
    """

    cursor = connection.cursor()
    cursor.execute(query, (lga_name, year_value))
    results = cursor.fetchall()
    cursor.close()

    for row in results:
        print(row)


def get_total_emissions(connection, lga_name, year_value):
    query = """
    SELECT SUM(C.full_co2e_tons)
    FROM CO2Emissions C
    JOIN EmissionLGA L ON C.emissionlga_id = L.emissionlga_id
    JOIN EmissionYear Y ON C.emissionyear_id = Y.emissionyear_id
    WHERE L.lga_name = %s AND Y.year_value = %s;
    """

    cursor = connection.cursor()
    cursor.execute(query, (lga_name, year_value))
    result = cursor.fetchone()
    cursor.close()

    if result[0] is not None:
        print(f"Total emissions for {lga_name} in {year_value}: {result[0]} tons of CO2")
    else:
        print(f"No emissions data found for {lga_name} in {year_value}")

    return result[0] if result[0] is not None else 0


def get_lga_geometries(connection):
    query = """
    SELECT g.lga_name, ST_AsText(g.geometry) AS wkt_geometry
    FROM LGA_Geometry g
    JOIN EmissionLGA e ON g.lga_name = e.lga_name;
    """

    cursor = connection.cursor()
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()

    # Convert to a GeoDataFrame
    data = []
    for row in results:
        lga_name, wkt_geometry = row
        data.append({'lga_name': lga_name, 'geometry': wkt_geometry})

    # Convert WKT to geometry
    gdf = gpd.GeoDataFrame(data, geometry=gpd.GeoSeries.from_wkt([d['geometry'] for d in data]))
    return gdf


def plot_lgas_on_mapbox(gdf, mapbox_access_token):
    # Ensure the GeoDataFrame is in the correct CRS (EPSG:4326 for lat/lon)
    gdf = gdf.set_crs(epsg=4326)

    # Initialize a folium map centered on Melbourne with Mapbox tiles
    m = folium.Map(
        location=[-37.8136, 144.9631],
        zoom_start=10,
        tiles=None  # No default tiles, as we will add Mapbox
    )

    # Add Mapbox tiles
    folium.TileLayer(
        tiles=f'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{{z}}/{{x}}/{{y}}?access_token={mapbox_access_token}',
        attr='Mapbox',
        name='Mapbox Streets',
        control=False
    ).add_to(m)

    # Add the LGA geometries to the map
    for _, row in gdf.iterrows():
        folium.GeoJson(
            row['geometry'],
            name=row['lga_name'],
            tooltip=row['lga_name'],  # Add a tooltip showing the LGA name
            style_function=lambda x: {
                'color': 'blue',  # Set boundary color
                'weight': 2,  # Set boundary weight (thickness)
                'fillOpacity': 0.1  # Set opacity of the fill
            }
        ).add_to(m)

    # Add a layer control to the map
    folium.LayerControl().add_to(m)

    # Save the map to an HTML file
    m.save('melbourne_lga_map_mapbox.html')
    print("Map saved to melbourne_lga_map_mapbox.html")


def load_ev_data_from_csv(connection, csv_file):
    df = pd.read_csv(csv_file)

    cursor = connection.cursor()

    for index, row in df.iterrows():
        evmodel_id = get_or_insert_reference(connection, 'EVModel', 'model', row['Model'])
        vehicletype_id = get_or_insert_reference(connection, 'VehicleType', 'type_name', row['Vehicle Type'])

        insert_query = """
        INSERT INTO EVDetails (evmodel_id, vehicletype_id, variant_details, fast_charge_time_minutes, range_km, 
                               energy_consumption_kwh_per_100km, listed_price_aud)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(insert_query, (
            evmodel_id,
            vehicletype_id,
            row['Variant Details'],
            row['Fast Charge Time (Minutes)'],
            row['Range (km)'] if not pd.isna(row['Range (km)']) else None,
            row['Energy Consumption (kWh/100km)'] if not pd.isna(row['Energy Consumption (kWh/100km)']) else None,
            row['Listed Price ($AUD)'] if not pd.isna(row['Listed Price ($AUD)']) else None
        ))

    connection.commit()
    cursor.close()
    print("EV data loaded successfully from CSV")


def load_ev_projection_data(connection, csv_file):
    df = pd.read_csv(csv_file)
    df = df[(df['YEAR'] >= 2024) & (df['YEAR'] <= 2030)]
    cursor = connection.cursor()

    for index, row in df.iterrows():
        month_id = get_or_insert_reference(connection, 'ev_projection_month', 'month_name', row['MONTH'])
        year_id = get_or_insert_reference(connection, 'ev_projection_year', 'year_value', row['YEAR'])
        vehicletype_id = get_or_insert_reference(connection, 'ev_projection_vehicle_type', 'type_name',
                                                 row['VEHICLE_TYPE'])
        scenario_id = get_or_insert_reference(connection, 'ev_projection_scenario', 'scenario_name', row['SCENARIO'])
        emissionlga_id = get_or_insert_reference(connection, 'EmissionLGA', 'lga_name', row['LGA'])

        insert_query = """
        INSERT INTO ev_projection_data (ev_projection_month_id, ev_projection_year_id, ev_projection_vehicle_type_id, ev_projection_scenario_id, emissionlga_id, value)
        VALUES (%s, %s, %s, %s, %s, %s)
        """

        cursor.execute(insert_query, (
            month_id,
            year_id,
            vehicletype_id,
            scenario_id,
            emissionlga_id,
            row['VALUE']
        ))

    connection.commit()
    cursor.close()
    print("EV projection data loaded successfully from CSV")


def get_ev_projection_data(connection):
    query = f"""
    SELECT 
    epy.year_value AS year,
    ept.type_name AS vehicle_type,
    SUM(epd.value) AS total_number_of_vehicles
    FROM 
        ev_projection_data epd
    JOIN 
        ev_projection_month epm ON epd.ev_projection_month_id = epm.ev_projection_month_id
    JOIN 
        ev_projection_year epy ON epd.ev_projection_year_id = epy.ev_projection_year_id
    JOIN 
        ev_projection_vehicle_type ept ON epd.ev_projection_vehicle_type_id = ept.ev_projection_vehicle_type_id
    JOIN 
        ev_projection_scenario eps ON epd.ev_projection_scenario_id = eps.ev_projection_scenario_id
    JOIN 
        EmissionLGA el ON epd.emissionlga_id = el.emissionlga_id
    WHERE 
        el.lga_name = 'Melbourne'
        AND epy.year_value BETWEEN 2024 AND 2030
    GROUP BY 
        epy.year_value, ept.type_name
    ORDER BY 
        epy.year_value, ept.type_name;
    """

    df = pd.read_sql(query, connection)
    return df


# Function to plot the line graph
def plot_ev_projection_graph(connection):
    # Get the EV projection data
    df = get_ev_projection_data(connection)

    # Create the plot
    plt.figure(figsize=(10, 6))

    # Loop through each vehicle type and plot the number of vehicles
    vehicle_types = df['vehicle_type'].unique()

    for vehicle_type in vehicle_types:
        subset = df[df['vehicle_type'] == vehicle_type]
        plt.plot(subset['year'], subset['total_number_of_vehicles'], marker='o', label=vehicle_type)

    # Labels and title
    plt.xlabel('Year')
    plt.ylabel('Total Number of EV Vehicles')
    plt.title(f'EV Vehicle Projections (2024-2030)')
    plt.legend(title='Vehicle Type')
    plt.grid(True)

    # Show the plot
    plt.show()


def parse_charger_detail(charger_detail):
    charger_detail = charger_detail.strip()
    number_of_units = 1  # default
    charger_type = charger_detail  # default

    # Check if 'No Chargers Available' is present
    if charger_detail.lower() == 'no chargers available':
        number_of_units = 0
        charger_type = 'No Chargers Available'
    # Check if ' x ' is present
    elif ' x ' in charger_detail:
        parts = charger_detail.split(' x ')
        if len(parts) == 2:
            number_part, charger_type_part = parts
            number_part = number_part.strip()
            charger_type_part = charger_type_part.strip()
            # Try to parse the number of units
            try:
                number_of_units = int(number_part)
                charger_type = charger_type_part
            except ValueError:
                # Default to 1 if parsing fails
                number_of_units = 1
                charger_type = charger_detail
    else:
        # Use regex to check for formats like '2x75kW Fast Charger'
        match = re.match(r'^(\d+)\s*x\s*(.*)', charger_detail)
        if match:
            number_of_units = int(match.group(1))
            charger_type = match.group(2).strip()
        else:
            # Assume the entire string is the charger type
            charger_type = charger_detail.strip()

    return number_of_units, charger_type


# Load the charging station data from CSV and insert into the database
def load_charging_station_data(connection, csv_file):
    df = pd.read_csv(csv_file)

    cursor = connection.cursor()

    for index, row in df.iterrows():
        # Insert the charging station data
        cursor.execute("""
            INSERT INTO ChargingStation (station_name, latitude, longitude, number_of_chargers)
            VALUES (%s, %s, %s, %s)
        """, (row['name'], row['latitude'], row['longitude'], row['number_of_chargers']))

        # Get the station_id of the newly inserted row
        station_id = cursor.lastrowid

        # Get the chargers column value
        chargers_value = row['chargers']

        if pd.isna(chargers_value) or chargers_value.strip() == "":
            # Skip if chargers information is missing
            continue

        # Split the chargers value by commas
        charger_details = chargers_value.split(',')

        for charger_detail in charger_details:
            number_of_units, charger_type = parse_charger_detail(charger_detail)

            # Insert charger details for this station
            cursor.execute("""
                INSERT INTO ChargerDetails (station_id, charger_type, number_of_units)
                VALUES (%s, %s, %s)
            """, (station_id, charger_type, number_of_units))

    connection.commit()
    cursor.close()
    print("Charging station data loaded successfully")


# Function to insert data into the 'Recycling_Location' table
def insert_data_into_table(connection, csv_file):
    with open(csv_file, 'r') as file:
        reader = csv.DictReader(file)

        cursor = connection.cursor()
        for row in reader:
            insert_query = """
            INSERT INTO Recycling_Location (name, latitude, longitude)
            VALUES (%s, %s, %s)
            """
            cursor.execute(insert_query, (row['name'], row['latitude'], row['longitude']))
        connection.commit()
        print("Data inserted successfully.")


def main():
    config = configparser.ConfigParser()
    config.read('../config.ini')

    # Access database credentials
    db_host = config['database']['host']
    db_user = config['database']['user']
    db_password = config['database']['password']
    db_port = config['database']['db_port']
    db_name = config['database']['db_name']
    mapbox_access_tok = config['mapbox']['access_token']

    mapbox_access_token = mapbox_access_tok

    connection = create_connection(db_user, db_password, db_host, db_port, db_name)
    if connection is not None:
        # create_tables(connection)
        # load_emission_data_from_csv(connection, 'filtered_emission_data.csv')
        #
        # load_lga_shape_data(connection, 'GDA2020/vic_lga.shp')

        # get_total_emissions(connection, 'Knox', 2020)
        # gdf = get_lga_geometries(connection)
        # plot_lgas_on_mapbox(gdf, mapbox_access_token)

        # load_ev_data_from_csv(connection, 'Vehicle Specs (2).csv')

        # load_ev_projection_data(connection, 'filtered_ev_projection.csv')

        # plot_ev_projection_graph(connection)

        # load_charging_station_data(connection, 'extracted_charging_stations/charging_stations.csv')

        # insert_data_into_table(connection, 'recycling_dropoff.csv')

        connection.close()
    else:
        print("Failed to connect to the database")


if __name__ == "__main__":
    main()
