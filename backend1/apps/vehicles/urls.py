from django.urls import path

from .views import CurrentVehicleView

app_name = 'vehicles'

urlpatterns = [
    path('current', CurrentVehicleView.as_view(), name='current'),
]
