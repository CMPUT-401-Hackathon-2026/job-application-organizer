from django.db import models
from JobApplication.models import JobApplication

class Resume(models.Model):
    job_application = models.OneToOneField(
        JobApplication, 
        on_delete=models.CASCADE, 
        related_name='resume'
    )
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Resume for {self.job_application.job.title}"