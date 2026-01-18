# resumes/models.py
from django.db import models


class Resume(models.Model):
    """
    Stores the generated resume data for a job application.
    Links to JobApplication, not Application.
    """
    job_application = models.OneToOneField(
        "JobApplication.JobApplication",
        on_delete=models.CASCADE,
        related_name="resume"
    )
    
    # Structured resume data (JSON from DeepSeek)
    data = models.JSONField(default=dict)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Resume for {self.job_application}"

    class Meta:
        ordering = ['-updated_at']