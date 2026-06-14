import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import logging

logger = logging.getLogger(__name__)
prediction_bp = Blueprint('prediction', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@prediction_bp.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided in request"}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image file selected"}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_dir = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_dir, exist_ok=True)
        
        image_path = os.path.join(upload_dir, filename)
        file.save(image_path)
        
        try:
            # Run detection
            detector = current_app.config['DETECTOR']
            db = current_app.config['DB_MANAGER']
            
            static_results_dir = os.path.join(current_app.static_folder, 'results')
            detection_results = detector.detect(image_path, static_results_dir)
            
            # Update database inventory with the counts of detected items
            # (Note: In a shelf monitoring environment, detection count represents current stock level)
            for product in detection_results["products"]:
                db.update_inventory(product["name"], product["count"])
                
            return jsonify(detection_results), 200
            
        except Exception as e:
            logger.error(f"Error during detection process: {e}")
            return jsonify({"error": f"Detection failed: {str(e)}"}), 500
            
    return jsonify({"error": "File type not supported. Use PNG, JPG, JPEG, or WEBP"}), 400
