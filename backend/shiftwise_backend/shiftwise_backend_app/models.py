# scheduler/models.py

from django.db import models
from django.utils import timezone


class Doctor(models.Model):
    doctor_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    no_of_consecutive_working_days = models.IntegerField(default=0)
    no_of_consecutive_night_shifts = models.IntegerField(default=0)  
    no_of_consecutive_offs = models.IntegerField(default=0)  
    worked_last_shift = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class OTP(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"OTP for {self.doctor.email}"

class Team(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    team_id = models.CharField(max_length=50)
    scheduling_half = models.IntegerField(default=0)

    def __str__(self):
        return f'Team {self.team_id} - {self.doctor.name}'


class OffRequest(models.Model):
    TYPE_CHOICES = [
        ('off', 'Off'),
        ('leave', 'Leave'),
    ]
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    date = models.IntegerField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='off')

    class Meta:
        unique_together = ('doctor', 'date')

    def __str__(self):
        return f'Off request for {self.doctor.name} on {self.date}'

