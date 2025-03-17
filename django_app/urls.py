from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Definisikan urlpatterns sebagai list
urlpatterns = [
   path('admin/', admin.site.urls),  # URL untuk admin Django
    path('', include('segmentasi_app.urls')),  # URL untuk aplikasi segmentasi_app
]

# Tambahkan konfigurasi media hanya di mode DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
