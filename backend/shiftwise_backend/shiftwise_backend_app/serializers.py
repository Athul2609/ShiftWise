# shiftwise_backend_app/serializers.py

from rest_framework import serializers
from .models import Doctor, Team, OffRequest, Roster, AlgoPlan, Team_backup, AlgoPlan_archives

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = [
            'doctor_id',
            'role',
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
class TeamBackupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team_backup
        fields = [
            'team_id',
            'doctor',
            'scheduling_half',
        ] 

class OffRequestSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)

    class Meta:
        model = OffRequest
        fields = ['doctor', 'doctor_name', 'date', 'type']

class RosterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roster
        fields = ['date', 'day_shift_doctors', 'night_shift_doctors']

class AlgoPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlgoPlan
        fields = '__all__'

class AlgoPlanArchiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlgoPlan_archives
        fields = '__all__'