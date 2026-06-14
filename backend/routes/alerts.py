from flask import Blueprint, jsonify, current_app
import logging

logger = logging.getLogger(__name__)
alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('/alerts', methods=['GET'])
def get_alerts():
    try:
        db = current_app.config['DB_MANAGER']
        alerts = db.get_alerts()
        return jsonify(alerts), 200
    except Exception as e:
        logger.error(f"Error fetching alerts: {e}")
        return jsonify({"error": f"Failed to retrieve alerts: {str(e)}"}), 500
