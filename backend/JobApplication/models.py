from django.db import models

class JobApplication(models.Model):

    company = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    date = models.DateField(null=True, blank=True) #date posted

    tech_stack = models.JSONField(default=list)
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.company} - {self.title}"
