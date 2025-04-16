from flask import Blueprint, render_template, current_app
from app.login import login_required

# Define the blueprint
main_routes = Blueprint('main_routes', __name__)


@main_routes.route('/')
@login_required
def index():
    return render_template('login.html')

@main_routes.route('/Index')
@login_required
def home():
    return render_template('index.html')

@main_routes.route('/ev_recommend')
@login_required
def ev_recommend():
    return render_template('ev_recommendation.html')

@main_routes.route('/recommendation_details')
@login_required
def recommendation_details():
    return render_template('recommendation_details.html')

@main_routes.route('/EvCompare')
@login_required
def ev_compare():
    return render_template('ev_compare.html')

@main_routes.route('/EVCost')
@login_required
def ev_cost():
    return render_template('ev_price_compare.html')


@main_routes.route('/Incentives')
@login_required
def Incentives():
    return render_template('incentives.html')

@main_routes.route('/ev_map')
@login_required
def ev_map():
    return render_template('ev_map.html')

@main_routes.route('/recycling_locations')
@login_required
def recycling_locations():
    return render_template('recycling_locations.html')

@main_routes.app_errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404