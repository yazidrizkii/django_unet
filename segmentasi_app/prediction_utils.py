import torch
import torch.nn as nn
import numpy as np
from PIL import Image
import cv2
from .pre_processing import normalization, clahe_equalized, adjust_gamma
from .unet import UNet
import os
from django.conf import settings

class ToothImpactionPredictor:
    def __init__(self, model_path_crop, model_path_full):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Load models for crop and full
        self.model_crop = UNet(n_class=1).to(self.device)
        self.model_full = UNet(n_class=1).to(self.device)
        
        # Load model weights
        self.model_crop.load_state_dict(torch.load(model_path_crop, map_location=self.device))
        self.model_full.load_state_dict(torch.load(model_path_full, map_location=self.device))
        
        self.model_crop.eval()
        self.model_full.eval()
        
    def preprocess_image(self, image_path):
        """Preprocess image following the same pipeline as training"""
        # Load image
        image = np.asarray(Image.open(image_path))
        
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply preprocessing
        image = clahe_equalized(image)
        image = adjust_gamma(image, 1.2)
        image = normalization(image)
        
        # Add channel dimension and convert to tensor
        image = np.expand_dims(image, axis=0)
        image_tensor = torch.from_numpy(image).float().unsqueeze(0)
        
        return image_tensor
    
    def predict(self, image_path, prediction_type="crop"):
        """
        Perform prediction on image
        Args:
            image_path: Path to input image
            prediction_type: "crop" or "full" to select appropriate model
        Returns:
            dict with prediction results and accuracy
        """
        # Select appropriate model
        model = self.model_crop if prediction_type == "crop" else self.model_full
        
        # Preprocess image
        image_tensor = self.preprocess_image(image_path).to(self.device)
        
        with torch.no_grad():
            # Get prediction
            outputs = model(image_tensor)
            probs = torch.sigmoid(outputs)
            preds = (probs > 0.5).float()
            
            # Convert to numpy for processing
            pred_np = preds.cpu().numpy()[0, 0]
            input_np = image_tensor.cpu().numpy()[0, 0]
            
            # Calculate confidence/accuracy metrics
            confidence = float(torch.max(probs).cpu().numpy())
            impaction_percentage = float(torch.sum(preds).cpu().numpy() / preds.numel() * 100)
            
        return {
            'prediction': pred_np,
            'input_image': input_np,
            'confidence': confidence,
            'impaction_percentage': impaction_percentage,
            'has_impaction': impaction_percentage > 1.0  # Threshold for impaction detection
        }
    
    def create_annotated_image(self, input_img, prediction):
        """Create annotated image with overlay"""
        # Normalize input image to 0-255
        input_img_norm = (input_img * 255).astype(np.uint8)
        
        # Create binary mask from prediction
        pred_binary = (prediction > 0.5).astype(np.uint8) * 255
        
        # Create RGB image
        annotated = np.zeros((input_img.shape[0], input_img.shape[1], 3), dtype=np.uint8)
        
        # Set all channels to input image
        for ch in range(3):
            annotated[:, :, ch] = input_img_norm
        
        # Overlay prediction in red channel
        annotated[:, :, 0] = np.where(pred_binary > 0, 255, annotated[:, :, 0])
        
        return annotated
    
    def save_results(self, input_img, prediction, base_filename):
        """Save prediction results"""
        results_dir = os.path.join(settings.MEDIA_ROOT, 'results')
        os.makedirs(results_dir, exist_ok=True)
        
        # Create annotated image
        annotated = self.create_annotated_image(input_img, prediction)
        
        # Save annotated image
        annotated_path = os.path.join(results_dir, f"annotated_{base_filename}")
        Image.fromarray(annotated).save(annotated_path)
        
        # Save prediction mask
        pred_binary = (prediction > 0.5).astype(np.uint8) * 255
        mask_path = os.path.join(results_dir, f"mask_{base_filename}")
        Image.fromarray(pred_binary).save(mask_path)
        
        return {
            'annotated_url': f"{settings.MEDIA_URL}results/annotated_{base_filename}",
            'mask_url': f"{settings.MEDIA_URL}results/mask_{base_filename}"
        }
