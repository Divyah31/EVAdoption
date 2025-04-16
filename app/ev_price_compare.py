from flask import Blueprint, jsonify, request

price_compare_bp = Blueprint('price_compare_bp', __name__)

vehicle_cost_data = {
    'Light Electric': 0.03, 'Light Petrol': 0.11,
    'Small Electric': 0.04, 'Small Petrol': 0.13,
    'Medium Electric': 0.05, 'Medium Petrol': 0.15,
    'Large Electric': 0.06, 'Large Petrol': 0.17,
    'Upper Large Electric': 0.07, 'Upper Large Petrol': 0.20,
    'Small SUV Electric': 0.05, 'Small SUV Petrol': 0.15,
    'Medium SUV Electric': 0.06, 'Medium SUV Petrol': 0.17,
    'Large SUV Electric': 0.07, 'Large SUV Petrol': 0.20,
    'People Mover Electric': 0.08, 'People Mover Petrol': 0.22,
    'Small Van Electric': 0.04, 'Small Van Petrol': 0.13,
    'Large Van Electric': 0.06, 'Large Van Petrol': 0.17,
    'Ute Electric': 0.08, 'Ute Petrol': 0.22
}


@price_compare_bp.route('/api/price-comparison', methods=['POST'])
def compare_prices():
    data = request.json
    electric = data.get('electric')
    petrol = data.get('petrol')
    distance = data.get('distance', 20)
    days = data.get('days', 5)

    yearly_distance = distance * days * 52

    yearly_cost = {
        'electric': vehicle_cost_data[electric] * yearly_distance,
        'petrol': vehicle_cost_data[petrol] * yearly_distance
    }

    return jsonify({
        'yearly_cost': yearly_cost
    })
