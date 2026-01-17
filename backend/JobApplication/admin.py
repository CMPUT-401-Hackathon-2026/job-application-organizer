# jobs/admin.py
from django.contrib import admin
from .models import JobApplication

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "company",
        "location",
        "salary_min",
        "salary_max",
    )

    search_fields = ("title", "company", "location")

