from django.shortcuts import render, redirect
from .forms import UploadImageForm
from .models import UploadedImage

def upload(request):
    if request.method == 'POST':
        form = UploadImageForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('segmentasi_app:hasil')
    else:
        form = UploadImageForm()
    return render(request, 'segmentasi_app/upload.html', {'form': form})

def home(request):
    return render(request, 'segmentasi_app/home.html')

def hasil(request):
    # Ambil gambar terakhir yang diupload
    latest_image = UploadedImage.objects.last()
    return render(request, 'segmentasi_app/hasil.html', {'image': latest_image})