from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_secret_key_here' 
    with app.app_context():
        from app.routes import main_routes
        from app.ev_compare import ev_compare_bp
        from app.ev_price_compare import price_compare_bp
        from app.login import login
        from app.emissions_data import emissions_data_bp
        from app.ev_recommend import ev_recommend_bp
        from app.ev_map import ev_map_bp
        from app.recycling_locations import recycling_locations_bp
        
        app.register_blueprint(main_routes)
        app.register_blueprint(ev_compare_bp)
        app.register_blueprint(price_compare_bp)
        app.register_blueprint(login)
        app.register_blueprint(emissions_data_bp)
        app.register_blueprint(ev_recommend_bp)
        app.register_blueprint(ev_map_bp)
        app.register_blueprint(recycling_locations_bp)
        
    return app

