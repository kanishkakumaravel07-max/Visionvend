import os
import random
import logging
from PIL import Image, ImageDraw, ImageFont
import numpy as np

logger = logging.getLogger(__name__)

class ProductDetector:
    def __init__(self):
        self.model = None
        self.weights_path = os.path.join(os.path.dirname(__file__), 'best.pt')
        self.is_mock = True
        
        # Available product categories to detect
        self.categories = [
            "CocaCola", "Pepsi", "Water Bottle", 
            "Chips Packet", "Biscuit", "Juice Carton"
        ]
        
        # Color map for bounding boxes
        self.color_map = {
            "CocaCola": (220, 38, 38),      # Red
            "Pepsi": (37, 99, 235),         # Blue
            "Water Bottle": (14, 165, 233),  # Cyan
            "Chips Packet": (234, 179, 8),  # Yellow
            "Biscuit": (139, 92, 246),      # Purple
            "Juice Carton": (249, 115, 22)   # Orange
        }

        # Try to load real YOLOv8
        try:
            from ultralytics import YOLO
            if os.path.exists(self.weights_path):
                logger.info(f"Loading YOLOv8 model from {self.weights_path}...")
                self.model = YOLO(self.weights_path)
                self.is_mock = False
                logger.info("Real YOLOv8 model loaded successfully.")
            else:
                logger.warning(f"YOLOv8 weights not found at {self.weights_path}. Running in Demo/Mock Mode.")
        except Exception as e:
            logger.warning(f"Could not load ultralytics YOLO: {e}. Running in Demo/Mock Mode.")

    def detect(self, image_path, output_dir):
        """
        Runs inference on the image.
        Saves the annotated image to output_dir.
        Returns a dictionary containing products list and overall counts.
        """
        os.makedirs(output_dir, exist_ok=True)
        filename = os.path.basename(image_path)
        output_path = os.path.join(output_dir, filename)

        if not self.is_mock and self.model is not None:
            return self._run_real_yolo(image_path, output_path)
        else:
            return self._run_mock_detector(image_path, output_path)

    def _run_real_yolo(self, image_path, output_path):
        """Runs actual YOLOv8 inference and parses results."""
        results = self.model(image_path)
        result = results[0]
        
        # Save annotated image
        result.save(filename=output_path)
        
        detected_products = {}
        total_products = 0
        
        # Parse boxes, classes, confidences
        for box in result.boxes:
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())
            class_name = self.model.names[class_id]
            
            # Map detected names to project standard categories if necessary
            # (or use standard naming from model classes)
            if class_name not in detected_products:
                detected_products[class_name] = {"count": 0, "sum_conf": 0.0}
            
            detected_products[class_name]["count"] += 1
            detected_products[class_name]["sum_conf"] += confidence
            total_products += 1

        products_list = []
        for name, data in detected_products.items():
            avg_conf = round(data["sum_conf"] / data["count"], 2)
            products_list.append({
                "name": name,
                "count": data["count"],
                "confidence": avg_conf
            })

        return {
            "products": products_list,
            "total_products": total_products,
            "annotated_image": f"/static/results/{os.path.basename(output_path)}"
        }

    def _run_mock_detector(self, image_path, output_path):
        """Simulates product detection and draws high-quality annotated boxes."""
        try:
            img = Image.open(image_path)
        except Exception as e:
            logger.error(f"Failed to open image for detection: {e}")
            raise e

        draw = ImageDraw.Draw(img)
        w, h = img.size
        
        # Decide how many items to mock detect (between 3 and 8)
        num_detections = random.randint(3, 8)
        
        # Distribute detections across categories
        detected_items = []
        for _ in range(num_detections):
            category = random.choice(self.categories)
            confidence = round(random.uniform(0.82, 0.98), 2)
            
            # Pick a random bounding box that is within the image dimensions
            box_w = random.randint(int(w * 0.1), int(w * 0.3))
            box_h = random.randint(int(h * 0.2), int(h * 0.5))
            x1 = random.randint(0, w - box_w)
            y1 = random.randint(0, h - box_h)
            x2 = x1 + box_w
            y2 = y1 + box_h
            
            detected_items.append({
                "name": category,
                "confidence": confidence,
                "box": (x1, y1, x2, y2)
            })

        # Draw annotations
        # Try to load a clean font, fallback to default if not present
        try:
            font = ImageFont.load_default()
        except:
            font = None

        for item in detected_items:
            name = item["name"]
            conf = item["confidence"]
            x1, y1, x2, y2 = item["box"]
            color = self.color_map.get(name, (99, 102, 241)) # Default indigo

            # Draw outer rectangle
            # Draw thickness by drawing slightly shifted rects
            for offset in range(3):
                draw.rectangle([x1 + offset, y1 + offset, x2 - offset, y2 - offset], outline=color)
            
            # Draw label box
            label_text = f"{name} {int(conf * 100)}%"
            
            # Draw a solid label background tab
            draw.rectangle([x1, y1 - 18, x1 + len(label_text) * 7 + 6, y1], fill=color)
            draw.text((x1 + 4, y1 - 16), label_text, fill=(255, 255, 255), font=font)

        # Save annotated image
        img.save(output_path)
        
        # Aggregate counts
        summary = {}
        for item in detected_items:
            name = item["name"]
            if name not in summary:
                summary[name] = {"count": 0, "total_conf": 0.0}
            summary[name]["count"] += 1
            summary[name]["total_conf"] += item["confidence"]

        products_list = []
        for name, data in summary.items():
            products_list.append({
                "name": name,
                "count": data["count"],
                "confidence": round(data["total_conf"] / data["count"], 2)
            })

        return {
            "products": products_list,
            "total_products": len(detected_items),
            "annotated_image": f"/static/results/{os.path.basename(output_path)}"
        }
