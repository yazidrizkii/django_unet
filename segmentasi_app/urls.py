from django.urls import path
from . import views

app_name = 'segmentasi_app'

urlpatterns = [
    path('', views.home, name='home'),  # URL untuk halaman utama
]