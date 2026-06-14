import os
from flask import Flask  # type: ignore
from flask_cors import CORS  # type: ignore
from dotenv import load_dotenv  # type: ignore

# Import database manager & YOLOv8 detector
from database.db_manager import DBManager
from yolov8.detector import ProductDetector

# Import routes
from routes.prediction import prediction_bp
from routes.inventory import inventory_bp
from routes.alerts import alerts_bp

load_dotenv()

def create_app():
    # Make sure static and upload directories are configured
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
    upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    os.makedirs(static_dir, exist_ok=True)
    os.makedirs(upload_dir, exist_ok=True)
    os.makedirs(os.path.join(static_dir, 'results'), exist_ok=True)

    app = Flask(__name__, static_folder=static_dir, static_url_path='/static')
    CORS(app)  # Enable Cross-Origin Resource Sharing for frontend

    # App configurations
    app.config['UPLOAD_FOLDER'] = upload_dir
    
    # Initialize global singletons
    app.config['DB_MANAGER'] = DBManager()
    app.config['DETECTOR'] = ProductDetector()

    # Register blueprints
    app.register_blueprint(prediction_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(alerts_bp)

    @app.route('/health', methods=['GET'])
    def health():
        return {"status": "healthy", "mode": "demo" if app.config['DETECTOR'].is_mock else "production"}, 200

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
