from django.urls import path
from .views import (
    AIOverviewView,
    TheftPredictionsListView,
    CrashPredictionsListView,
    AIPredictionDetailView,
    PredictionActionView,
    VehicleRiskDetailView,
    RiskDistributionView,
    AIPerformanceView,
    AIProviderManagementView,
    AIProviderTestConnectionView,
    AIEventInvestigationView
)

app_name = 'ai_engine'

urlpatterns = [
    # Overview
    path('overview/', AIOverviewView.as_view(), name='ai-overview'),
    
    # Theft Detections
    path('theft-detections/', TheftPredictionsListView.as_view(), name='theft-detections-list'),
    path('theft-detections/<uuid:id>/', AIPredictionDetailView.as_view(), name='theft-detection-detail'),
    
    # Crash Detections
    path('crash-detections/', CrashPredictionsListView.as_view(), name='crash-detections-list'),
    path('crash-detections/<uuid:id>/', AIPredictionDetailView.as_view(), name='crash-detection-detail'),
    
    # Actions on predictions
    path('predictions/<uuid:pk>/<str:action>/', PredictionActionView.as_view(), name='prediction-action'),
    
    # Vehicle Risk
    path('vehicles/<uuid:vehicle_id>/risk/', VehicleRiskDetailView.as_view(), name='vehicle-risk-detail'),
    path('risk-distribution/', RiskDistributionView.as_view(), name='risk-distribution'),
    
    # Performance & Providers
    path('performance/', AIPerformanceView.as_view(), name='ai-performance'),
    path('providers/', AIProviderManagementView.as_view(), name='ai-providers-list'),
    path('providers/<uuid:pk>/', AIProviderManagementView.as_view(), name='ai-provider-detail'),
    path('providers/test/', AIProviderTestConnectionView.as_view(), name='ai-provider-test'),
    
    # Event Investigation Assistant
    path('events/<str:event_id>/analyze/', AIEventInvestigationView.as_view(), name='event-analyze'),
]
