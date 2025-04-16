from flask import Blueprint, jsonify, request
import requests
import configparser

ev_map_bp = Blueprint('ev_map_bp', __name__)
config = configparser.ConfigParser()
config.read('./config.ini')
GOOGLE_MAPS_API_KEY = config['google_api']['g_api']

# vehicles data
vehicles = {
    'Large Car': {
        'energy_consumption_kwh_per_100km': 18.0,
        'range_km': 600,
        'fast_charge_time_minutes': 30
    },
    'Medium Car': {
        'energy_consumption_kwh_per_100km': 16.5,
        'range_km': 520,
        'fast_charge_time_minutes': 38
    },
    'People Mover': {
        'energy_consumption_kwh_per_100km': 24.0,
        'range_km': 450,
        'fast_charge_time_minutes': 45
    },
    'Small Car': {
        'energy_consumption_kwh_per_100km': 14.0,
        'range_km': 435,
        'fast_charge_time_minutes': 50
    },
    'Sports Car': {
        'energy_consumption_kwh_per_100km': 22.0,
        'range_km': 450,
        'fast_charge_time_minutes': 22
    },
    'Ute (2WD)': {
        'energy_consumption_kwh_per_100km': 21.0,
        'range_km': 505,
        'fast_charge_time_minutes': 35
    },
    'Van': {
        'energy_consumption_kwh_per_100km': 27.0,
        'range_km': 415,
        'fast_charge_time_minutes': 45
    }
}

@ev_map_bp.route('/api/plan_route', methods=['POST'])
def plan_route():
    data = request.json
    start = data['start']
    end = data['destination']
    vehicle_type = data['vehicle']
    battery_departure = float(data['batteryDeparture'])
    battery_arrival = float(data['batteryArrival'])

    vehicle = vehicles.get(vehicle_type)
    if not vehicle:
        return jsonify({'error': 'Invalid vehicle type'}), 400

    # Calculate the initial and final range based on the battery levels
    initial_range_km = (battery_departure / 100) * vehicle['range_km']
    final_range_km = (battery_arrival / 100) * vehicle['range_km']
    required_distance_km = initial_range_km - final_range_km

    # Call Google Directions API to get multiple routes with alternatives
    directions_url = f"https://maps.googleapis.com/maps/api/directions/json?origin={start}&destination={end}&key={GOOGLE_MAPS_API_KEY}&alternatives=true"
    directions_response = requests.get(directions_url)
    directions_data = directions_response.json()

    if directions_data['status'] != 'OK':
        return jsonify({'error': 'Error fetching route data'}), 500

    # Initialize a list to store information about each route
    routes_info = []

    # Loop through each alternative route to calculate energy savings
    for route in directions_data['routes']:
        total_distance_km = route['legs'][0]['distance']['value'] / 1000.0

        # Collect all path points from the route to get elevation data
        path = [
            f"{step['end_location']['lat']},{step['end_location']['lng']}"
            for step in route['legs'][0]['steps']
        ]
        path_str = '|'.join(path)

        # Call Google Elevation API to get elevation data for the path
        elevation_url = f"https://maps.googleapis.com/maps/api/elevation/json?locations={path_str}&key={GOOGLE_MAPS_API_KEY}"
        elevation_response = requests.get(elevation_url)
        elevation_data = elevation_response.json()

        # Check for successful elevation data response
        if elevation_data['status'] != 'OK':
            return jsonify({'error': 'Error fetching elevation data'}), 500

        # Calculate energy savings based on elevation gain/loss
        energy_saved_percentage = calculate_energy_saved(elevation_data['results'], vehicle['energy_consumption_kwh_per_100km'])
        # Debug print statement
        print(f"Energy Saved for this route: { energy_saved_percentage} kWh")
        # Determine if a charging station is needed for this route
        charging_station = None
        if total_distance_km > required_distance_km:
            halfway_distance_km = required_distance_km
            steps = route['legs'][0]['steps']
            current_distance = 0
            halfway_location = None

            for step in steps:
                step_distance_km = step['distance']['value'] / 1000.0
                if current_distance + step_distance_km >= halfway_distance_km:
                    halfway_location = step['end_location']
                    break
                current_distance += step_distance_km

            if not halfway_location:
                halfway_location = route['legs'][0]['end_location']

            # Search for nearby charging stations
            places_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={halfway_location['lat']},{halfway_location['lng']}&radius=5000&keyword=electric vehicle charging station&key={GOOGLE_MAPS_API_KEY}"
            places_response = requests.get(places_url)
            places_data = places_response.json()

            if places_data['status'] == 'OK' and places_data['results']:
                nearest_station = places_data['results'][0]
                charging_station = {
                    'name': nearest_station['name'],
                    'place_id': nearest_station['place_id'],
                    'vicinity': nearest_station.get('vicinity', 'N/A'),
                    'location': nearest_station['geometry']['location']
                }
                
                # Debug print statement to see the energy savings for each route
                print(f"Route: {route['summary']} | Energy Saved: {energy_saved_percentage}%")

        # Add this route's information to the routes_info list
        routes_info.append({
            'total_distance_km': total_distance_km,
            'required_distance_km': required_distance_km,
            'charging_station': charging_station,
            'route': route,
            'energy_saved_percentage': energy_saved_percentage  # Energy savings for this route
        })
    # Debug print statement to check the content of routes_info
    print("Routes Info:", routes_info)
    # Return all routes information to the frontend
    return jsonify({'routes_info': routes_info})

# Function to calculate energy saved based on elevation data
def calculate_energy_saved(elevation_data, energy_consumption_per_100km):
    total_energy_saved_percentage = 0
    total_elevation_gain = 0
    total_elevation_loss = 0

    for i in range(1, len(elevation_data)):
        elevation_diff = elevation_data[i]['elevation'] - elevation_data[i - 1]['elevation']
        
        if elevation_diff < 0:  # Downhill sections recover energy
            total_elevation_loss += abs(elevation_diff)
        else:  # Uphill sections consume more energy
            total_elevation_gain += elevation_diff

    # Approximate savings: energy saved on downhill as a percentage of the total
    if total_elevation_gain + total_elevation_loss > 0:
        total_energy_saved_percentage = (total_elevation_loss / (total_elevation_gain + total_elevation_loss)) * 100

    return total_energy_saved_percentage   
    
    
@ev_map_bp.route('/api/calculate_range', methods=['POST'])
def calculate_range():
    data = request.json
    address = data.get('address')
    vehicle_type = data.get('vehicle')

    vehicle = vehicles.get(vehicle_type)
    if not vehicle:
        return jsonify({'error': 'Invalid vehicle type'}), 400

    # Call Google Geocode API to get the latitude and longitude of an address
    geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GOOGLE_MAPS_API_KEY}"
    geocode_response = requests.get(geocode_url)
    geocode_data = geocode_response.json()

    if geocode_data['status'] != 'OK':
        return jsonify({'error': 'Error fetching geocode data'}), 500

    location = geocode_data['results'][0]['geometry']['location']

    # Calculation of the maximum number of kilometres that can be driven
    max_range_km = vehicle['range_km']

    return jsonify({
        'location': location,
        'range_km': max_range_km
    })
