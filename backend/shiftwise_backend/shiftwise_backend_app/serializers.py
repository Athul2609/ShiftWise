# shiftwise_backend_app/serializers.py

from rest_framework import serializers
from .models import Doctor, Team, OffRequest, Roster, AlgoPlan, WorkHistory, Dependents

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'

class AlgoPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlgoPlan
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = "__all__" 

class OffRequestSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)

    class Meta:
        model = OffRequest
        fields = ['doctor', 'doctor_name', 'date', 'type', 'month', 'year']

class RosterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roster
        fields = '__all__'

class WorkHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkHistory
        fields = '__all__'

class DependentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependents
        fields = '__all__'