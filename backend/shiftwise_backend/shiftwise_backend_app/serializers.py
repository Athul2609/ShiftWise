# shiftwise_backend_app/serializers.py

from rest_framework import serializers
from .models import Doctor, Team, OffRequest

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['doctor_id', 'name', 'email']

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['team_id', 'doctor'] 

class OffRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = OffRequest
        fields = ['doctor', 'date']