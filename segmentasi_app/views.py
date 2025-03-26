import torch
import numpy as np
import matplotlib.pyplot as plt
from django.shortcuts import render, redirect
from django.conf import settings
import os
from .forms import UploadImageForm
from .models import UploadedImage
from PIL import Image
from torchvision import transforms
from .unet import UNet

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

num_class = 1
model = UNet(num_class).to(device)
model.load_state_dict(torch.load(os.path.join(settings.BASE_DIR, 'segmentasi_app', 'model', 'New_Model.pth')))
model.eval()

transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((256, 256)), 
    transforms.ToTensor(),
])

def predict_unet(image_path):
    """Fungsi untuk melakukan prediksi segmentasi"""
    image = Image.open(image_path).convert("L")  # Convert ke grayscale

    if image.format == "TIFF":
        temp_path = image_path.replace(".tif", ".png").replace(".tiff", ".png")
        image.save(temp_path)
        image_path = temp_path 

    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        pred = model(image)
        pred = torch.sigmoid(pred).cpu().numpy()[0, 0]  # Ambil output pertama

    pred_binary = (pred > 0.5).astype(np.uint8) * 255  # Binarisasi output

    result_path = os.path.join(settings.MEDIA_ROOT, 'results', os.path.basename(image_path))
    os.makedirs(os.path.dirname(result_path), exist_ok=True)
    result_path = result_path.replace(".tif", ".png")  # Ganti format ke PNG
    Image.fromarray(pred_binary).save(result_path, format="PNG")
    # Image.fromarray(pred_binary).save(result_path)

    # return os.path.join(settings.MEDIA_URL, 'results', os.path.basename(image_path))
    return f"{settings.MEDIA_URL}results/{os.path.basename(result_path)}"

def upload(request):
    if request.method == 'POST':
        form = UploadImageForm(request.POST, request.FILES)
        if form.is_valid():
            uploaded_image = form.save()
            image_path = uploaded_image.image.path

            # Jalankan prediksi U-Net
            segmented_image_url = predict_unet(image_path)

            return render(request, 'segmentasi_app/hasil.html', {
                'image': uploaded_image,
                'segmented_image_url': segmented_image_url
            })
    else:
        form = UploadImageForm()
    return render(request, 'segmentasi_app/upload.html', {'form': form})

def home(request):
    return render(request, 'segmentasi_app/home.html')

def hasil(request):
    # Ambil gambar terakhir yang diupload
    latest_image = UploadedImage.objects.last()
    return render(request, 'segmentasi_app/hasil.html', {'image': latest_image})