from django.db import models

class Resume(models.Model):
    title = models.CharField(max_length=200)
    data = models.JSONField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
