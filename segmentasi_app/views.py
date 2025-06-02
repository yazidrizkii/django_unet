import torch
import numpy as np
import os
from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from .forms import UploadImageForm
from .models import UploadedImage
from PIL import Image
from .prediction_utils import ToothImpactionPredictor

# Initialize predictor (you'll need to update these paths to your actual model files)
CROP_MODEL_PATH = os.path.join(settings.BASE_DIR, 'segmentasi_app', 'model', 'crop_model.pth')
FULL_MODEL_PATH = os.path.join(settings.BASE_DIR, 'segmentasi_app', 'model', 'full_model.pth')

# Global predictor instance
predictor = None

def get_predictor():
    global predictor
    if predictor is None:
        try:
            predictor = ToothImpactionPredictor(CROP_MODEL_PATH, FULL_MODEL_PATH)
        except Exception as e:
            print(f"Error loading models: {e}")
            # Fallback to single model if separate models don't exist
            single_model_path = os.path.join(settings.BASE_DIR, 'segmentasi_app', 'model', 'bce_7000_100epoch.pth')
            predictor = ToothImpactionPredictor(single_model_path, single_model_path)
    return predictor

def upload(request):
    if request.method == 'POST':
        form = UploadImageForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                uploaded_image = form.save()
                image_path = uploaded_image.image.path
                
                # Get prediction type from request (default to crop)
                prediction_type = request.POST.get('prediction_type', 'crop')
                
                # Get predictor instance
                tooth_predictor = get_predictor()
                
                # Perform prediction
                results = tooth_predictor.predict(image_path, prediction_type)
                
                # Save annotated results
                base_filename = os.path.basename(image_path)
                name, ext = os.path.splitext(base_filename)
                base_filename = f"{name}.png"  # Convert to PNG for consistency
                
                saved_results = tooth_predictor.save_results(
                    results['input_image'], 
                    results['prediction'], 
                    base_filename
                )
                
                # Prepare response data
                response_data = {
                    'success': True,
                    'original_image_url': uploaded_image.image.url,
                    'annotated_image_url': saved_results['annotated_url'],
                    'mask_image_url': saved_results['mask_url'],
                    'confidence': round(results['confidence'] * 100, 2),
                    'impaction_percentage': round(results['impaction_percentage'], 2),
                    'has_impaction': results['has_impaction'],
                    'prediction_type': prediction_type
                }
                
                return JsonResponse(response_data)
                
            except Exception as e:
                return JsonResponse({
                    'success': False,
                    'error': f'Error during prediction: {str(e)}',
                })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Form tidak valid',
            })
    
    return JsonResponse({
        'success': False,
        'error': 'Metode tidak diizinkan',
    })

def home(request):
    return render(request, 'segmentasi_app/index.html')

def hasil(request):
    # Ambil gambar terakhir yang diupload
    latest_image = UploadedImage.objects.last()
    return render(request, 'segmentasi_app/hasil.html', {'image': latest_image})
