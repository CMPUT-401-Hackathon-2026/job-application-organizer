from django.urls import path
from . import views

urlpatterns = [
    path("resume/<int:resume_id>/", views.get_resume),
    path("resume/<int:resume_id>/section/<str:section>/", views.update_section),
    path("resume/<int:resume_id>/latex/", views.download_latex),
    path("resume/<int:resume_id>/ats/", views.ats_score),
]
