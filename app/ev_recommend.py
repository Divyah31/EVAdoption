from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import create_engine, text
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import numpy as np
import logging
import os
import urllib.parse

ev_recommend_bp = Blueprint('ev_recommend', __name__)

# Configuration log
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database connections
db_connection_string = "mysql+mysqlconnector://admin:gREENcOMMUTE99@melbournebicycle.cxmk8kmsyqwc.ap-southeast-2.rds.amazonaws.com/bicyclemelbourne"
engine = create_engine(db_connection_string)

# Initialise MinMaxScaler
scaler = MinMaxScaler()

def get_image_url(model):
       # Construct possible file paths
    image_filename = f"{model}.jpg"
    image_path = os.path.join(current_app.static_folder, 'images', 'ev', image_filename)
    
   # Check if the file exists
    if os.path.exists(image_path):
          # URL encoding of filenames
        encoded_filename = urllib.parse.quote(image_filename)
        return f"/static/images/ev/{encoded_filename}"
    else:
        return "/static/images/ev/default.jpg"

@ev_recommend_bp.route('/api/recommend', methods=['POST'])
def recommend_ev():
    try:
        data = request.json
        logger.info(f"Received recommendation request: {data}")

        # Get user input
        min_budget = data.get('minBudget', 0) * 1000  # Convert to AUD
        max_budget = data.get('maxBudget', 250) * 1000  # Convert to AUD
        weekday_range = data.get('weekdayRange', 0)
        weekday_trip_type = data.get('weekdayTripType', 'roundTrip')
        preferences = data.get('preferences', [])
        
        # Adjust distance for round trip
        if weekday_trip_type == 'roundTrip':
            weekday_range *= 2  # Multiply by 2 for round trips

        logger.info(f"User input: budget={min_budget}-{max_budget}, "
                    f"weekday_range={weekday_range}, weekday_trip_type={weekday_trip_type}, "
                    f"preferences={preferences}")

        # Build SQL query
        query = """
        SELECT ed.*, em.model, vt.type_name
        FROM EVDetails ed
        JOIN EVModel em ON ed.evmodel_id = em.evmodel_id
        JOIN VehicleType vt ON ed.vehicletype_id = vt.vehicletype_id
        WHERE ed.listed_price_aud BETWEEN :min_budget AND :max_budget
        """

        # Execute query
        try:
            with engine.connect() as connection:
                params = {
                    'min_budget': min_budget,
                    'max_budget': max_budget
                }
                result = connection.execute(text(query), params)
                df = pd.DataFrame(result.fetchall(), columns=result.keys())

            logger.info(f"Query returned {len(df)} results")

            if df.empty:
                logger.warning("No vehicles match the criteria")
                return jsonify({'message': 'No vehicles match your criteria'}), 404

        except Exception as e:
            logger.error(f"Database error: {e}")
            return jsonify({'message': 'Error querying the database'}), 500

        # Data pre-processing
        df['fast_charge_time_minutes'] = df['fast_charge_time_minutes'].str.extract(r'(\d+)').astype(float)
        
        # Features prepared for scoring
        features = ['range_km', 'energy_consumption_kwh_per_100km', 'fast_charge_time_minutes', 'listed_price_aud']
        X = df[features].values

        # Set weights based on user preferences
        preference_mapping = {
            'Range': 0,
            'Efficiency': 1,
            'Fast Charge Speed': 2,
            'Price': 3
        }
        weights = np.ones(len(features))
        for i, pref in enumerate(preferences):
            if pref in preference_mapping:
                weights[preference_mapping[pref]] = 2 - (i * 0.25)  # 2, 1.75, 1.5, 1.25

        # Standardize features
        scaler = MinMaxScaler()
        X_scaled = scaler.fit_transform(X)

        # Create idealized user preference vector
        ideal_range = weekday_range * 1.2  # Increase the desired range
        user_prefs = [
            ideal_range,
            df['energy_consumption_kwh_per_100km'].min(),  
            df['fast_charge_time_minutes'].min(),  
            (min_budget + max_budget) / 2  
        ]
        user_prefs_scaled = scaler.transform([user_prefs])

        # Calculate the weighted Euclidean distance
        try:
            distances = np.sqrt(np.sum(((X_scaled - user_prefs_scaled) ** 2) * weights, axis=1))
            
            # Handle NaN values
            if np.isnan(distances).any():
                logger.warning("NaN values found in distances. Replacing with max distance.")
                max_distance = np.nanmax(distances)
                distances = np.nan_to_num(distances, nan=max_distance)

            # Normalize distances to 0-1 range
            min_distance = np.min(distances)
            max_distance = np.max(distances)
            if min_distance == max_distance:
                normalized_distances = np.zeros_like(distances)
            else:
                normalized_distances = (distances - min_distance) / (max_distance - min_distance)

            # Calculate match scores
            match_scores = 1 - normalized_distances

            # Get recommendations and calculate match percentages
            top_indices = match_scores.argsort()[::-1]  # Sort in descending order
            recommendations = df.iloc[top_indices].copy()
            
            # Calculate match percentages
            base_percentage = 60  # Set base match percentage
            match_percentages = base_percentage + (match_scores[top_indices] * (100 - base_percentage))
            recommendations['matchPercentage'] = np.round(match_percentages).clip(0, 100).astype(int)

        except Exception as e:
            logger.error(f"Error in recommendation calculation: {e}", exc_info=True)
            return jsonify({'message': 'Error in recommendation algorithm'}), 500

        # Prepare response data
        result = recommendations[['model', 'variant_details', 'fast_charge_time_minutes', 
                                'range_km', 'energy_consumption_kwh_per_100km', 
                                'listed_price_aud', 'type_name', 'matchPercentage']].to_dict('records')

        # Add image URLs
        for car in result:
            car['image_url'] = get_image_url(car['model'])

        logger.info(f"Recommendations generated successfully: {result}")
        return jsonify(result)

    except Exception as e:
        logger.error(f"Unexpected error in recommend_ev: {e}", exc_info=True)
        return jsonify({'message': 'An unexpected error occurred'}), 500