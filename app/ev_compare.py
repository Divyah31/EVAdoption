from flask import Blueprint, jsonify, request

ev_compare_bp = Blueprint('ev_compare_bp', __name__)

vehicle_data = {
    'Light Electric': 40, 'Light Petrol': 193,
    'Small Electric': 56, 'Small Petrol': 247,
    'Medium Electric': 73, 'Medium Petrol': 263,
    'Large Electric': 87, 'Large Petrol': 270,
    'Upper Large Electric': 97, 'Upper Large Petrol': 320,
    'Small SUV Electric': 61, 'Small SUV Petrol': 242,
    'Medium SUV Electric': 74, 'Medium SUV Petrol': 279,
    'Large SUV Electric': 87, 'Large SUV Petrol': 304,
    'People Mover Electric': 93, 'People Mover Petrol': 302,
    'Small Van Electric': 54, 'Small Van Petrol': 257,
    'Large Van Electric': 75, 'Large Van Petrol': 295,
    'Ute Electric': 99, 'Ute Petrol': 310
}

@ev_compare_bp.route('/api/emissions', methods=['POST'])
def calculate_emissions():
    data = request.json
    electric = data.get('electric')
    petrol = data.get('petrol')
    distance = data.get('distance', 20)
    days = data.get('days', 5)

    yearly_distance = distance * days * 52
    yearly_emissions = {
        'electric': vehicle_data[electric] * yearly_distance / 1000000,
        'petrol': vehicle_data[petrol] * yearly_distance / 1000000
    }

    # Calculate lifetime emissions
    max_distance = 200000  # Assumed maximum distance in km
    lifetime_emissions = {
        'electric': [vehicle_data[electric] * d / 1000000 for d in range(0, max_distance + 1, 10000)],
        'petrol': [vehicle_data[petrol] * d / 1000000 for d in range(0, max_distance + 1, 10000)],
        'distance': list(range(0, max_distance + 1, 10000))  # Return the corresponding distances
    }

    # Calculate total emissions and percentages for carbon footprint
    total_emissions = sum(yearly_emissions.values())
    emissions_percentage = {k: round((v / total_emissions) * 100, 1) for k, v in yearly_emissions.items()}

    return jsonify({
        'yearly_emissions': yearly_emissions,
        'lifetime_emissions': lifetime_emissions,
        'total_emissions': round(total_emissions, 2),
        'emissions_percentage': emissions_percentage
    })