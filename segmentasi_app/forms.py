from django import forms
from .models import UploadedImage
from django.core.exceptions import ValidationError

class UploadImageForm(forms.ModelForm):
    class Meta:
        model = UploadedImage
        fields = ['image']

    def clean_image(self):
        image = self.cleaned_data['image']
        if not image.name.lower().endswith(('.jpg', '.png', '.tif')):
            raise ValidationError("Hanya file .jpg, .png, dan .tif yang diperbolehkan.")
        return image