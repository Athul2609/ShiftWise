# shiftwise_backend_app/serializers.py

from rest_framework import serializers
from .models import Doctor, Team, OffRequest, Roster

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = [
            'doctor_id',
            'name',
            'email',
            'no_of_consecutive_working_days',
            'no_of_consecutive_night_shifts',
            'no_of_consecutive_offs',
            'worked_last_shift',
        ]

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = [
            'team_id',
            'doctor',
            'scheduling_half',
        ] 

class OffRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = OffRequest
        fields = [
            'doctor',
            'date',
            'type',
        ]

class RosterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roster
        fields = ['date', 'day_shift_doctors', 'night_shift_doctors']