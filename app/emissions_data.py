import json
from flask import Blueprint, jsonify, logging, render_template, request
from matplotlib import pyplot as plt
import numpy as np
from sqlalchemy import create_engine, text
import matplotlib.colors as mcolors
from shapely.wkt import loads as wkt_loads
import geopandas as gpd

# Define the blueprint
emissions_data_bp = Blueprint('emissions_data', __name__)

# Set up the database engine
db_connection_string = "mysql+mysqlconnector://admin:gREENcOMMUTE99@melbournebicycle.cxmk8kmsyqwc.ap-southeast-2.rds.amazonaws.com/bicyclemelbourne"
engine = create_engine(db_connection_string)



@emissions_data_bp.route('/emissions_data')
def emissions_data():
    # Get the year from the user input, default to 2023 if not provided
    year = request.args.get('year', 2023)

    # Query to get total CO2 emissions and geometry for each LGA
    query = """
    SELECT
        g.lga_name,
        ST_AsText(g.geometry) AS wkt_geometry,
        COALESCE(SUM(co2.full_co2e_tons), 0) AS total_emissions
    FROM
        LGA_Geometry g
    JOIN
        EmissionLGA e ON g.lga_name = e.lga_name
    LEFT JOIN
        CO2Emissions co2 ON e.emissionlga_id = co2.emissionlga_id AND co2.emissionyear_id = (SELECT emissionyear_id FROM EmissionYear WHERE year_value = :year)
    GROUP BY
        g.lga_name, g.geometry;
    """
    
    with engine.connect() as connection:
        results = connection.execute(text(query), {'year': year}).fetchall()

    # Convert to a GeoDataFrame and prepare GeoJSON data
    data = []
    emissions = []
    for row in results:
        lga_name, wkt_geometry, total_emissions = row
        data.append({'lga_name': lga_name, 'geometry': wkt_geometry, 'total_emissions': total_emissions})
        emissions.append(total_emissions)
    
    # Check if emissions array is empty before proceeding
    if not emissions:
        return jsonify({"error": "No emissions data found for the selected year."}), 404

    # Proceed if emissions data is available
    gdf = gpd.GeoDataFrame(data, geometry=gpd.GeoSeries([wkt_loads(wkt) for wkt in [d['geometry'] for d in data]]))
    gdf = gdf.set_crs(epsg=4326)
    
    # Create a red-to-yellow colormap
    colors = ["yellow", "red"]
    cmap = mcolors.LinearSegmentedColormap.from_list("RedYellow", colors)
    
    # Normalize based on the data range
    emissions_array = np.array(emissions)
    norm = mcolors.Normalize(vmin=emissions_array.min(), vmax=emissions_array.max())

    # Create GeoJSON data with color mapping
    geojson_data = {
        "type": "FeatureCollection",
        "features": []
    }

    for _, row in gdf.iterrows():
        feature = {
            "type": "Feature",
            "geometry": row['geometry'].__geo_interface__,
            "properties": {
                "lga": row['lga_name'],
                "total_emissions": row['total_emissions'],
                "color": mcolors.to_hex(cmap(norm(row['total_emissions'])))
            }
        }
        geojson_data["features"].append(feature)

    # Convert GeoJSON data to a JSON string
    geojson_data_str = json.dumps(geojson_data)

    # Pass the GeoJSON data and selected year to the template
    return render_template('emissions_data.html', geojson_data=geojson_data_str, selected_year=year)


@emissions_data_bp.route('/get_transport_emissions')
def get_transport_emissions():
    lga_name = request.args.get('lga_name')
    year = request.args.get('year', 2023)

    # Query to get the breakdown of emissions by travel mode for the selected LGA and year
    breakdown_query = """
    SELECT 
        tm.mode_name AS mode_name,
        SUM(co2.full_co2e_tons) AS total_emissions
    FROM 
        CO2Emissions co2
    JOIN 
        EmissionLGA lga ON co2.emissionlga_id = lga.emissionlga_id
    JOIN 
        TravelMode tm ON co2.travelmode_id = tm.travelmode_id
    WHERE 
        lga.lga_name = :lga_name
        AND co2.emissionyear_id = (SELECT emissionyear_id FROM EmissionYear WHERE year_value = :year)
    GROUP BY 
        tm.mode_name;
    """

    # Query to get the total emissions for the LGA in the selected year
    total_emissions_query = """
    SELECT 
        SUM(co2.full_co2e_tons) AS total_emissions
    FROM 
        CO2Emissions co2
    JOIN 
        EmissionLGA lga ON co2.emissionlga_id = lga.emissionlga_id
    WHERE 
        lga.lga_name = :lga_name
        AND co2.emissionyear_id = (SELECT emissionyear_id FROM EmissionYear WHERE year_value = :year);
    """

    with engine.connect() as connection:
        # Fetch the breakdown by transport mode
        breakdown_results = connection.execute(text(breakdown_query), {'lga_name': lga_name, 'year': year}).fetchall()
        
        # Fetch the total emissions
        total_emissions_result = connection.execute(text(total_emissions_query), {'lga_name': lga_name, 'year': year}).fetchone()
        total_emissions = total_emissions_result[0] if total_emissions_result else 1  # Avoid division by zero
    
    # Print the raw results to the terminal for debugging
    print(f"Breakdown Results for {lga_name} in {year}: {breakdown_results}")
    print(f"Total Emissions for {lga_name} in {year}: {total_emissions}")

    # Convert the results to a dictionary for the JSON response, adding percentage calculations
    emissions_data = {}
    for row in breakdown_results:
        mode_name = row[0]
        mode_emissions = row[1]
        percentage = (mode_emissions / total_emissions) * 100 if total_emissions > 0 else 0
        emissions_data[mode_name] = {
            'total_emissions': mode_emissions,
            'percentage': round(percentage, 2)  # Round to 2 decimal places
        }
    
    # Print the emissions data for debugging purposes
    print(f"Emissions Data for {lga_name}: {emissions_data}")

    return jsonify(emissions_data)

@emissions_data_bp.route('/ev_data_by_lga')
def ev_data_by_lga():
    # Get the LGA name from the user input, default to 'Melbourne' if not provided
    lga_name = request.args.get('lga_name', 'Melbourne')

    # SQL query to get EV data (year, vehicle type, total number of vehicles)
    ev_query = """
    SELECT 
        epy.year_value AS year,
        ept.type_name AS vehicle_type,
        SUM(epd.value) AS total_number_of_vehicles
    FROM 
        ev_projection_data epd
    JOIN 
        ev_projection_year epy ON epd.ev_projection_year_id = epy.ev_projection_year_id
    JOIN 
        ev_projection_vehicle_type ept ON epd.ev_projection_vehicle_type_id = ept.ev_projection_vehicle_type_id
    JOIN 
        EmissionLGA el ON epd.emissionlga_id = el.emissionlga_id
    WHERE 
        el.lga_name = :lga_name
    GROUP BY 
        epy.year_value, ept.type_name
    ORDER BY 
        epy.year_value, ept.type_name;
    """

    with engine.connect() as connection:
        # Execute the query with the provided LGA name
        results = connection.execute(text(ev_query), {'lga_name': lga_name}).fetchall()

    # Debug: Print the results to ensure we have data
    print("Projection Data:", results)
    
    # Prepare data to return as JSON
    ev_data = []
    for row in results:
        year, vehicle_type, total_vehicles = row
        ev_data.append({
            'year': year,
            'vehicle_type': vehicle_type,
            'total_number_of_vehicles': total_vehicles
        })

    # Return the EV data as JSON
    return jsonify(ev_data)
