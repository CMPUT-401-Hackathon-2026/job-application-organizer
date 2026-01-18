from rest_framework import serializers
from .models import JobApplication

class JobApplicationSerializer(serializers.ModelSerializer):
    # Add computed fields that match your frontend expectations
    salary = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    postedDate = serializers.SerializerMethodField()
    
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
            # Add the computed fields
            "salary",
            "tags",
            "postedDate",
        ]
    
    def get_salary(self, obj):
        """Format salary as a string like '$100 - $9,900'"""
        if obj.salary_min and obj.salary_max:
            return f"${obj.salary_min:,} - ${obj.salary_max:,}"
        elif obj.salary_min:
            return f"${obj.salary_min:,}+"
        elif obj.salary_max:
            return f"Up to ${obj.salary_max:,}"
        return None
    
    def get_tags(self, obj):
        """Return tech_stack as tags"""
        return obj.tech_stack if obj.tech_stack else []
    
    def get_postedDate(self, obj):
        """Format date as string"""
        return obj.date.strftime('%Y-%m-%d') if obj.date else None