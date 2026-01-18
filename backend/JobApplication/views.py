from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import JobApplication
from django.db.models import Q

class JobApplicationAPIView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access for now
    
    def get(self, request):
        # Get query parameter for search
        query = request.GET.get('q', '')
        
        # Get all jobs or filter based on query
        jobs = JobApplication.objects.all()
        
        if query:
            jobs = jobs.filter(
                Q(title__icontains=query) |
                Q(company__icontains=query) |
                Q(description__icontains=query) |
                Q(location__icontains=query)
            )
        
        # Transform data to match frontend expectations
        jobs_data = []
        for job in jobs:
            # Format salary
            salary = ''
            if job.salary_min and job.salary_max:
                salary = f"${job.salary_min:,} - ${job.salary_max:,}"
            elif job.salary_min:
                salary = f"${job.salary_min:,}+"
            elif job.salary_max:
                salary = f"Up to ${job.salary_max:,}"
            
            jobs_data.append({
                'id': str(job.id),
                'title': job.title,
                'company': job.company,
                'location': job.location or '',
                'description': job.description or '',
                'tags': job.tech_stack if job.tech_stack else [],  # tech_stack -> tags
                'salary': salary,
                'postedDate': job.date.strftime('%Y-%m-%d') if job.date else '',
            })
        
        return Response(jobs_data)


class JobDetailAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, job_id):
        try:
            job = JobApplication.objects.get(id=job_id)
            
            # Format salary
            salary = ''
            if job.salary_min and job.salary_max:
                salary = f"${job.salary_min:,} - ${job.salary_max:,}"
            elif job.salary_min:
                salary = f"${job.salary_min:,}+"
            elif job.salary_max:
                salary = f"Up to ${job.salary_max:,}"
            
            job_data = {
                'id': str(job.id),
                'title': job.title,
                'company': job.company,
                'location': job.location or '',
                'description': job.description or '',
                'tags': job.tech_stack if job.tech_stack else [],
                'salary': salary,
                'postedDate': job.date.strftime('%Y-%m-%d') if job.date else '',
            }
            
            return Response(job_data)
        except JobApplication.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)

