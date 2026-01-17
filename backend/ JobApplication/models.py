from django.db import models

class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
    ]

    company_name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='applied'
    )
    date_applied = models.DateField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.company_name} - {self.position}"
