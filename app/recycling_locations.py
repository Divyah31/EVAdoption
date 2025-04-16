import pandas as pd
from sqlalchemy import create_engine
from flask import Blueprint, jsonify, request
from geopy.distance import geodesic  # You'll need to install geopy for distance calculation

# Create a blueprint for recycling locations
recycling_locations_bp = Blueprint('recycling_locations_bp', __name__)

# Database connection string
db_connection_string = "mysql+mysqlconnector://admin:gREENcOMMUTE99@melbournebicycle.cxmk8kmsyqwc.ap-southeast-2.rds.amazonaws.com/bicyclemelbourne"

# Create a connection engine
engine = create_engine(db_connection_string)

@recycling_locations_bp.route('/api/recycling_locations', methods=['GET'])
def get_recycling_locations():
    # Get the latitude, longitude, and radius from query parameters
    user_lat = float(request.args.get('lat'))
    user_lng = float(request.args.get('lng'))
    radius = float(request.args.get('radius'))

    # Query to fetch name, latitude, and longitude from the database
    query = "SELECT name, latitude, longitude FROM Recycling_Location;"
    df = pd.read_sql(query, engine)
    
    # Filter locations within the radius
    filtered_locations = []
    user_location = (user_lat, user_lng)

    for _, row in df.iterrows():
        location = (row['latitude'], row['longitude'])
        distance = geodesic(user_location, location).km

        if distance <= radius:
            filtered_locations.append({
                'name': row['name'],
                'latitude': row['latitude'],
                'longitude': row['longitude'],
                'distance': distance
            })
    
    # Return the filtered locations as JSON
    return jsonify(filtered_locations)
