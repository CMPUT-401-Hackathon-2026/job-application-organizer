# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import ApplicationViewSet
# from JobApplication.views import JobApplicationAPIView, JobDetailAPIView

# # Create router for viewsets
# router = DefaultRouter()
# router.register(r'applications', ApplicationViewSet, basename='application')

# # URL patterns
# urlpatterns = [
#     # Viewset routes (list, create, retrieve, update, destroy)
#     path('', include(router.urls)),
    
#     # Job endpoints
#     path('', JobApplicationAPIView.as_view(), name='job-list'),
#     path('<int:job_id>/', JobDetailAPIView.as_view(), name='job-detail'),
# ]
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import ApplicationViewSet

# # Create router for application CRUD operations
# router = DefaultRouter()
# router.register(r'', ApplicationViewSet, basename='application')

# urlpatterns = [
#     # This creates:
#     # GET    /api/applications/       - List all user's applications
#     # POST   /api/applications/       - Create new application
#     # GET    /api/applications/{id}/  - Get specific application
#     # PATCH  /api/applications/{id}/  - Update application
#     # DELETE /api/applications/{id}/  - Delete application
#     path('', include(router.urls)),
# ]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicationViewSet

# Create router for application CRUD operations
router = DefaultRouter()
router.register(r'', ApplicationViewSet, basename='application')

urlpatterns = [
    # This creates:
    # GET    /api/applications/       - List all user's applications
    # POST   /api/applications/       - Create new application
    # GET    /api/applications/{id}/  - Get specific application
    # PATCH  /api/applications/{id}/  - Update application
    # DELETE /api/applications/{id}/  - Delete application
    path('', include(router.urls)),
]

