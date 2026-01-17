from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    firebase_uid = models.CharField(max_length=255, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'auth_customuser'

    def __str__(self):
        return self.email
