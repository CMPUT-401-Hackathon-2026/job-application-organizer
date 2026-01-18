from django.urls import path
from . import views

urlpatterns = [
    # path("resume/<int:resume_id>/", views.get_resume),
    # path("resume/<int:resume_id>/section/<str:section>/", views.update_section),
    # path("resume/<int:resume_id>/latex/", views.download_latex),
    # path("resume/<int:resume_id>/ats/", views.ats_score),
    # path("applications/<int:app_id>/resume/", views.application_resume),
    # path("applications/<int:app_id>/resume/latex/", views.application_resume_latex),
    # path("applications/<int:app_id>/resume/ats/", views.application_resume_ats),
    # path("resume/build", views.build_resume),
    # path("resume/<int:resume_id>", views.update_resume),
    # path("resume/<int:resume_id>/latex", views.resume_latex),
    # path("resume/<int:resume_id>/ats-scan", views.resume_ats),
    path(
        "applications/<int:app_id>/resume/",
        views.application_resume
    ),
    path ("applications/<int:app_id>/resume/build/", views.build_application_resume),]
