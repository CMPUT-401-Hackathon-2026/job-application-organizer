from rest_framework import serializers
from .models import JobApplication
class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = [
            "id",
            "company",
            "title",
            "location",
            "description",
            "date",
            "tech_stack",
            "salary_min",
            "salary_max",
        ]
