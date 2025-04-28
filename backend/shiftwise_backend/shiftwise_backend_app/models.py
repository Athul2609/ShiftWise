# scheduler/models.py

from django.db import models
from django.utils import timezone


class Doctor(models.Model):
    doctor_id = models.AutoField(primary_key=True)
    role=models.IntegerField(default=0)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    no_of_consecutive_working_days = models.IntegerField(default=0)
    no_of_consecutive_night_shifts = models.IntegerField(default=0)  
    no_of_consecutive_offs = models.IntegerField(default=0)  
    worked_last_shift = models.BooleanField(default=False)
    total_no_of_shifts = models.IntegerField(default=0)
    no_of_night_shifts = models.IntegerField(default=0)
    no_of_day_shifts = models.IntegerField(default=0)
    no_of_leaves = models.IntegerField(default=0)
    no_of_working_sundays = models.IntegerField(default=0)
    no_of_working_saturday = models.IntegerField(default=0)


class AlgoPlan(models.Model):
    roster_id = models.AutoField(primary_key=True)
    month = models.PositiveSmallIntegerField()
    year = models.PositiveIntegerField()
    start_date = models.PositiveSmallIntegerField()
    end_date = models.PositiveSmallIntegerField()

class OTP(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"OTP for {self.doctor.email}"

class Team(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    roster_id = models.ForeignKey(AlgoPlan, on_delete=models.CASCADE)
    team_id = models.CharField(max_length=50)

class OffRequest(models.Model):
    TYPE_CHOICES = [
        ('off', 'Off'),
        ('leave', 'Leave'),
    ]
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    date = models.IntegerField()
    month = models.PositiveSmallIntegerField()
    year = models.PositiveIntegerField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='off')

    
class Roster(models.Model):
    roster_id = models.ForeignKey(AlgoPlan, on_delete=models.CASCADE)
    date = models.IntegerField()
    day_shift_doctors = models.JSONField(default=list)
    night_shift_doctors = models.JSONField(default=list)

class WorkHistory(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    month = models.PositiveSmallIntegerField()
    year = models.PositiveIntegerField()
    total_no_of_shifts = models.IntegerField(default=0)
    no_of_night_shifts = models.IntegerField(default=0)
    no_of_day_shifts = models.IntegerField(default=0)
    no_of_leaves = models.IntegerField(default=0)
    no_of_working_sundays = models.IntegerField(default=0)
    no_of_working_saturday = models.IntegerField(default=0)

class Dependents(models.Model):
    roster_id = models.ForeignKey(AlgoPlan, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    dep_start = models.IntegerField()
    dep_end = models.IntegerField()