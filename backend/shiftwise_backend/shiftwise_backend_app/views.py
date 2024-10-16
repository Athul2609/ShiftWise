# shiftwise_backend_app/views.py

from rest_framework import generics, status
from .models import Doctor, Team, OffRequest
from .serializers import DoctorSerializer, TeamSerializer, OffRequestSerializer
from rest_framework.response import Response
from django.http import Http404
from rest_framework.views import APIView

import sys
import os

# Add the path to the `algorithm` directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../algorithm')))

from main import main

# API to create a new doctor
class DoctorCreateView(generics.CreateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

# API to get all doctors
class DoctorListView(generics.ListAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

# API to update doctor information
class DoctorUpdateView(generics.UpdateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    lookup_field = 'doctor_id'  # Use doctor_id to identify the doctor

# API to delete a doctor
class DoctorDeleteView(generics.DestroyAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    lookup_field = 'doctor_id'  # Use doctor_id to identify the doctor


# API to create multiple teams
class TeamCreateView(generics.CreateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    def create(self, request, *args, **kwargs):
        # Validate the input data
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# API to get all teams
class TeamListView(generics.ListAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class OffRequestCreateView(generics.CreateAPIView):
    queryset = OffRequest.objects.all()
    serializer_class = OffRequestSerializer

class OffRequestListView(generics.ListAPIView):
    queryset = OffRequest.objects.all()
    serializer_class = OffRequestSerializer

class OffRequestByDateView(generics.ListAPIView):
    serializer_class = OffRequestSerializer

    def get_queryset(self):
        date = self.kwargs['date']
        return OffRequest.objects.filter(date=date)

class OffRequestDeleteView(generics.DestroyAPIView):
    queryset = OffRequest.objects.all()
    serializer_class = OffRequestSerializer

    def get_object(self):
        # Get the doctor ID and date from the URL parameters
        doctor_id = self.kwargs.get('doctor_id')
        date = self.kwargs.get('date')
        
        # Fetch the object based on doctor and date
        try:
            return OffRequest.objects.get(doctor_id=doctor_id, date=date)
        except OffRequest.DoesNotExist:
            # Return a 404 error if the object does not exist
            raise Http404("Off request not found.")

class RosterView(APIView):

    def get(self, request):
        # Fetch teams and off requests from the database
        teams_queryset = Team.objects.select_related('doctor').all()
        off_requests_queryset = OffRequest.objects.select_related('doctor').all()

        # Format teams into the specified structure
        teams = []
        team_dict = {}
        
        for team in teams_queryset:
            doctor_id = team.doctor.doctor_id
            team_id = team.team_id
            
            if team_id not in team_dict:
                teams.append([])
                team_dict[team_id]=len(teams)-1
            teams[team_dict[team_id]].append(doctor_id)
            
        # Format off requests into the specified structure
        off_requests = {}
        
        for off_request in off_requests_queryset:
            doctor_id = off_request.doctor.doctor_id
            date = off_request.date
            
            if doctor_id not in off_requests:
                off_requests[doctor_id] = []
            off_requests[doctor_id].append(date)

        # Call the main function to get the roster
        roster = main(teams, off_requests)

        return Response(roster)
