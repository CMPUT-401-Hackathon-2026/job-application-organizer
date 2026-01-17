from rest_framework.views import APIView
from rest_framework.response import Response
from .models import JobApplication

class JobApplicationAPIView(APIView):
    def get(self, request):
        jobs = JobApplication.objects.all().values(
            "id",
            "title",
            "company",
            "location",
            "description",
            "salary_min",
            "salary_max",
            "tech_stack",
            "date",
        )
        return Response(list(jobs))

