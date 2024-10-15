# scheduler/models.py

from django.db import models

class Doctor(models.Model):
    doctor_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.name


class Team(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    team_id = models.CharField(max_length=50)

    def __str__(self):
        return f'Team {self.team_id} - {self.doctor.name}'


class OffRequest(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    date = models.IntegerField()

    def __str__(self):
        return f'Off request for {self.doctor.name} on {self.date}'

