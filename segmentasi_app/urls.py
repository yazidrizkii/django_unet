from django.urls import path
from . import views

app_name = 'segmentasi_app'

urlpatterns = [
    path('', views.home, name='home'),  # URL untuk halaman utama
    path('upload/', views.upload, name='upload'),  # URL untuk halaman upload
    path('hasil/', views.hasil, name='hasil'),  # URL untuk halaman hasil
]