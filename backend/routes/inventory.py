from flask import Blueprint, request, jsonify, current_app
import logging

logger = logging.getLogger(__name__)
inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/inventory', methods=['GET'])
def get_inventory():
    try:
        db = current_app.config['DB_MANAGER']
        items = db.get_inventory()
        return jsonify(items), 200
    except Exception as e:
        logger.error(f"Error fetching inventory: {e}")
        return jsonify({"error": f"Failed to retrieve inventory: {str(e)}"}), 500

@inventory_bp.route('/inventory/update', methods=['POST'])
def update_inventory():
    data = request.get_json()
    if not data or 'product_name' not in data or 'quantity' not in data:
        return jsonify({"error": "Missing 'product_name' or 'quantity' in request body"}), 400
        
    product_name = data['product_name']
    try:
        quantity = int(data['quantity'])
    except ValueError:
        return jsonify({"error": "Quantity must be an integer"}), 400
        
    try:
        db = current_app.config['DB_MANAGER']
        db.update_inventory(product_name, quantity)
        return jsonify({"message": f"Successfully updated inventory for '{product_name}'", "product_name": product_name, "quantity": quantity}), 200
    except Exception as e:
        logger.error(f"Error updating inventory: {e}")
        return jsonify({"error": f"Failed to update inventory: {str(e)}"}), 500
