# shiftwise_backend_app/views.py

import os
import sys
import calendar


from django.conf import settings
from django.core.mail import send_mail
from django.http import Http404, JsonResponse
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .authentication import verify_jwt
from .models import Doctor, Team, OffRequest, OTP, Roster, AlgoPlan, AlgoPlan_archives, Team_backup
from .serializers import DoctorSerializer, TeamSerializer, OffRequestSerializer, RosterSerializer, AlgoPlanSerializer, AlgoPlanArchiveSerializer, TeamBackupSerializer
from .utils import generate_jwt,generate_otp

# Adjusting the system path for algorithm imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../algorithm')))
from main import generate_full_month_roster, generate_full_month_roster_half_by_half

class AlgoPlanCreateView(generics.CreateAPIView):
    queryset = AlgoPlan.objects.all()
    serializer_class = AlgoPlanSerializer

class AlgoPlanListView(generics.ListAPIView):
    queryset = AlgoPlan.objects.all()
    serializer_class = AlgoPlanSerializer

class AlgoPlanArchiveListView(generics.ListAPIView):
    queryset = AlgoPlan_archives.objects.all()
    serializer_class = AlgoPlanArchiveSerializer

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
    lookup_field = 'doctor_id' 

# API to delete a doctor
class DoctorDeleteView(generics.DestroyAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    lookup_field = 'doctor_id' 


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

class TeamBackupListView(generics.ListAPIView):
    queryset = Team_backup.objects.all()
    serializer_class = TeamBackupSerializer

# API to create off request
class OffRequestCreateView(generics.CreateAPIView):
    queryset = OffRequest.objects.all()
    serializer_class = OffRequestSerializer

# API to view off request
class OffRequestListView(generics.ListAPIView):
    queryset = OffRequest.objects.all()
    serializer_class = OffRequestSerializer

# API to view off request by date
class OffRequestByDateView(generics.ListAPIView):
    serializer_class = OffRequestSerializer

    def get_queryset(self):
        date = self.kwargs['date']
        return OffRequest.objects.filter(date=date)

    def get(self, request, *args, **kwargs):
        # Remove the authentication check for now
        # doctor_id = verify_jwt(request)

        # If you still want to return a response for unauthenticated users, 
        # you can skip the authentication block.
        # For now, we will directly call the parent class's get method.
        return super().get(request, *args, **kwargs)


# API to delete off request
class OffRequestDeleteView(generics.DestroyAPIView):
    queryset = OffRequest.objects.all()
    serializer_class = OffRequestSerializer

    def get_object(self):
        doctor_id = self.kwargs.get('doctor_id')
        date = self.kwargs.get('date')
        
        try:
            return OffRequest.objects.get(doctor_id=doctor_id, date=date)
        except OffRequest.DoesNotExist:
            raise Http404("Off request not found.")


# API to generate roster
class RosterView(APIView):

    def get(self, request):
        algoplan = AlgoPlan.objects.first()  # Assumes there is always one row

        if algoplan:
            scheduling_month = algoplan.month
            scheduling_year = algoplan.year
            roster_type = algoplan.algorithm
        num_days=calendar.monthrange(scheduling_year, scheduling_month)[1]
        if roster_type.lower()=="full":
            print("we are inside type full")
            teams_queryset = Team.objects.select_related('doctor').all()
            off_requests_queryset = OffRequest.objects.select_related('doctor').all()

            teams = []
            team_dict = {}
            doctor_input_details ={}

            for team in teams_queryset:
                doctor_id = team.doctor.doctor_id
                team_id = team.team_id
                
                if doctor_id not in doctor_input_details:
                    doctor_input_details[doctor_id] = {
                        'no_of_consecutive_working_days': team.doctor.no_of_consecutive_working_days, 
                        'no_of_consecutive_night_shifts': team.doctor.no_of_consecutive_night_shifts, 
                        'no_of_consecutive_offs': team.doctor.no_of_consecutive_offs, 
                        'worked_last_shift': team.doctor.worked_last_shift, 
                        'off_dates': [], 
                        'no_of_leaves': 0
                    }

                if team_id not in team_dict:
                    teams.append([])
                    team_dict[team_id]=len(teams)-1
                teams[team_dict[team_id]].append(doctor_id)
                        
            for off_request in off_requests_queryset:
                doctor_id = off_request.doctor.doctor_id
                date = off_request.date
                doctor_input_details[doctor_id]["off_dates"].append(date)
                doctor_input_details[doctor_id]["no_of_leaves"] = OffRequest.objects.filter(doctor_id=doctor_id, type='leave').count()

            roster, docs_info = generate_full_month_roster(scheduling_month, num_days, scheduling_year,teams, doctor_input_details)
        else:
            first_half_teams_queryset = Team.objects.select_related('doctor').filter(scheduling_half=1)
            second_half_teams_queryset = Team.objects.select_related('doctor').filter(scheduling_half=2)
            off_requests_queryset = OffRequest.objects.select_related('doctor').all()
            first_half_teams = []
            first_half_team_dict = {}
            doctor_input_details ={}

            for team in first_half_teams_queryset:
                doctor_id = team.doctor.doctor_id
                team_id = team.team_id
                
                if doctor_id not in doctor_input_details:
                    doctor_input_details[doctor_id] = {
                        'no_of_consecutive_working_days': team.doctor.no_of_consecutive_working_days, 
                        'no_of_consecutive_night_shifts': team.doctor.no_of_consecutive_night_shifts, 
                        'no_of_consecutive_offs': team.doctor.no_of_consecutive_offs, 
                        'worked_last_shift': team.doctor.worked_last_shift, 
                        'off_dates': [], 
                        'no_of_leaves': 0
                    }

                if team_id not in first_half_team_dict:
                    first_half_teams.append([])
                    first_half_team_dict[team_id]=len(first_half_teams)-1
                first_half_teams[first_half_team_dict[team_id]].append(doctor_id)
            
            second_half_teams = []
            second_half_team_dict = {}

            for team in second_half_teams_queryset:
                doctor_id = team.doctor.doctor_id
                team_id = team.team_id

                if team_id not in second_half_team_dict:
                    second_half_teams.append([])
                    second_half_team_dict[team_id]=len(second_half_teams)-1
                second_half_teams[second_half_team_dict[team_id]].append(doctor_id)

            for off_request in off_requests_queryset:
                doctor_id = off_request.doctor.doctor_id
                date = off_request.date
                
                doctor_input_details[doctor_id]["off_dates"].append(date)
                doctor_input_details[doctor_id]["no_of_leaves"] = OffRequest.objects.filter(doctor_id=doctor_id, type='leave').count()
            
            roster, docs_info=generate_full_month_roster_half_by_half(scheduling_month, num_days, scheduling_year,first_half_teams, second_half_teams, doctor_input_details)
        if roster is None:
            return Response({"error": "Error generating roster"}, status=status.HTTP_400_BAD_REQUEST)
        
        Roster.objects.all().delete()
        OffRequest.objects.all().delete()

        Team_backup.objects.all().delete()
        team_objects = []
        for record in Team.objects.all():
            data = record.__dict__.copy()
            data.pop('_state')
            obj = Team_backup(**data)
            obj.pk = None 
            team_objects.append(obj)

        Team_backup.objects.bulk_create(team_objects)
        Team.objects.all().delete()

        AlgoPlan_archives.objects.all().delete()
        record = AlgoPlan.objects.first()
        if record:
            data = record.__dict__.copy()
            data.pop('_state')
            data['id'] = None
            AlgoPlan_archives.objects.create(**data)
        AlgoPlan.objects.all().delete()

        for doctor_id, details in docs_info.items():
            try:
                # Get the doctor instance by name
                doctor = Doctor.objects.get(doctor_id=doctor_id)
                
                # Update the fields using the nested dictionary
                doctor.no_of_consecutive_working_days = details.get("no_of_consecutive_working_days", doctor.no_of_consecutive_working_days)
                doctor.no_of_consecutive_night_shifts = details.get("no_of_consecutive_night_shifts", doctor.no_of_consecutive_night_shifts)
                doctor.no_of_consecutive_offs = details.get("no_of_consecutive_offs", doctor.no_of_consecutive_offs)
                doctor.worked_last_shift = details.get("worked_last_shift", doctor.worked_last_shift)
                
                # Save the updated doctor instance
                doctor.save()
                
                # print(f"Updated {doctor_id}'s details successfully.")
            except Doctor.DoesNotExist:
                print(f"Doctor {doctor_id} does not exist.")

        for date, shifts in roster.items():
            day_shift_doctors = shifts.get('day', [])
            night_shift_doctors = shifts.get('night', [])

            # Create or update the Roster entry for the given date
            Roster.objects.update_or_create(
                date=date,
                defaults={
                    'day_shift_doctors': day_shift_doctors,
                    'night_shift_doctors': night_shift_doctors,
                }
            )
        return Response(roster)

class RosterListView(APIView):
    """
    API to get the roster data.
    """

    def get(self, request):
        # Fetch all roster entries from the database
        rosters = Roster.objects.all()

        # Serialize the roster data
        serializer = RosterSerializer(rosters, many=True)

        # Return the serialized data
        return Response(serializer.data, status=status.HTTP_200_OK)

class RosterGenerationCheckView(APIView):
    def post(self, request):
        doctor_id_request = request.data.get('doctor_id')  # Gets doctor_id
        dates_request = request.data.get('dates', [])
        no_of_leaves_request = request.data.get("no_of_leaves",0)
        algoplan = AlgoPlan.objects.first()  # Assumes there is always one row
        if algoplan:
            scheduling_month = algoplan.month
            scheduling_year = algoplan.year
            roster_type = algoplan.algorithm
        num_days=calendar.monthrange(scheduling_year, scheduling_month)[1]
        if roster_type.lower()=="full":
            print("we are inside type full")
            teams_queryset = Team.objects.select_related('doctor').all()
            off_requests_queryset = OffRequest.objects.select_related('doctor').all()

            teams = []
            team_dict = {}
            doctor_input_details ={}

            for team in teams_queryset:
                doctor_id = team.doctor.doctor_id
                team_id = team.team_id
                
                if doctor_id not in doctor_input_details:
                    doctor_input_details[doctor_id] = {
                        'no_of_consecutive_working_days': team.doctor.no_of_consecutive_working_days, 
                        'no_of_consecutive_night_shifts': team.doctor.no_of_consecutive_night_shifts, 
                        'no_of_consecutive_offs': team.doctor.no_of_consecutive_offs, 
                        'worked_last_shift': team.doctor.worked_last_shift, 
                        'off_dates': [], 
                        'no_of_leaves': 0
                    }

                if team_id not in team_dict:
                    teams.append([])
                    team_dict[team_id]=len(teams)-1
                teams[team_dict[team_id]].append(doctor_id)
                        
            for off_request in off_requests_queryset:
                doctor_id = off_request.doctor.doctor_id
                date = off_request.date
                doctor_input_details[doctor_id]["off_dates"].append(date)
                doctor_input_details[doctor_id]["no_of_leaves"] = OffRequest.objects.filter(doctor_id=doctor_id, type='leave').count()
            doctor_input_details[doctor_id_request]["off_dates"].extend(dates_request)
            doctor_input_details[doctor_id_request]["no_of_leaves"]+=no_of_leaves_request

            roster, docs_info = generate_full_month_roster(scheduling_month, num_days, scheduling_year,teams, doctor_input_details)
        else:
            first_half_teams_queryset = Team.objects.select_related('doctor').filter(scheduling_half=1)
            second_half_teams_queryset = Team.objects.select_related('doctor').filter(scheduling_half=2)
            off_requests_queryset = OffRequest.objects.select_related('doctor').all()
            first_half_teams = []
            first_half_team_dict = {}
            doctor_input_details ={}

            for team in first_half_teams_queryset:
                doctor_id = team.doctor.doctor_id
                team_id = team.team_id
                
                if doctor_id not in doctor_input_details:
                    doctor_input_details[doctor_id] = {
                        'no_of_consecutive_working_days': team.doctor.no_of_consecutive_working_days, 
                        'no_of_consecutive_night_shifts': team.doctor.no_of_consecutive_night_shifts, 
                        'no_of_consecutive_offs': team.doctor.no_of_consecutive_offs, 
                        'worked_last_shift': team.doctor.worked_last_shift, 
                        'off_dates': [], 
                        'no_of_leaves': 0
                    }

                if team_id not in first_half_team_dict:
                    first_half_teams.append([])
                    first_half_team_dict[team_id]=len(first_half_teams)-1
                first_half_teams[first_half_team_dict[team_id]].append(doctor_id)
            
            second_half_teams = []
            second_half_team_dict = {}

            for team in second_half_teams_queryset:
                doctor_id = team.doctor.doctor_id
                team_id = team.team_id

                if team_id not in second_half_team_dict:
                    second_half_teams.append([])
                    second_half_team_dict[team_id]=len(second_half_teams)-1
                second_half_teams[second_half_team_dict[team_id]].append(doctor_id)

            for off_request in off_requests_queryset:
                doctor_id = off_request.doctor.doctor_id
                date = off_request.date
                
                doctor_input_details[doctor_id]["off_dates"].append(date)
                doctor_input_details[doctor_id]["no_of_leaves"] = OffRequest.objects.filter(doctor_id=doctor_id, type='leave').count()
            doctor_input_details[doctor_id_request]["off_dates"].extend(dates_request)
            doctor_input_details[doctor_id_request]["no_of_leaves"]+=no_of_leaves_request
            roster, docs_info=generate_full_month_roster_half_by_half(scheduling_month, num_days, scheduling_year,first_half_teams, second_half_teams, doctor_input_details)
        if roster is None:
            return Response({"result": "false"})
        else:
            return Response({"result": "true"})

@api_view(['POST'])
def send_otp(request):
    email = request.data.get('email')
    
    # Check if doctor exists
    try:
        doctor = Doctor.objects.get(email=email)
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor with this email not found'}, status=404)
    
    # Generate OTP
    otp = generate_otp()

    # Remove any previous OTPs for this doctor
    OTP.objects.filter(doctor=doctor).delete()

    # Save the new OTP with timestamp
    OTP.objects.create(doctor=doctor, otp=otp, timestamp=timezone.now())

    # Send the OTP via email (configure email settings in settings.py)
    send_mail(
        'ShiftWise OTP Code',
        f'Your OTP for ShiftWise is {otp}',
        'shiftwise.johns@gmail.com',  # sender's email
        [doctor.email],  # receiver's email
        fail_silently=False,
    )

    return JsonResponse({'message': 'OTP sent to your email'}, status=200)

@api_view(['POST'])
def verify_otp(request):
    email = request.data.get('email')
    otp_input = request.data.get('otp')

    # Check if doctor exists
    try:
        doctor = Doctor.objects.get(email=email)
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor with this email not found'}, status=404)
    
    # Check if OTP exists and is valid
    try:
        otp_record = OTP.objects.get(doctor=doctor)
    except OTP.DoesNotExist:
        return JsonResponse({'error': 'OTP not found'}, status=400)

    # Check OTP validity and expiration (e.g., OTP valid for 10 minutes)
    if otp_record.otp != otp_input:
        return JsonResponse({'error': 'Invalid OTP'}, status=400)

    otp_age = timezone.now() - otp_record.timestamp
    if otp_age.total_seconds() > 600:  # 600 seconds = 10 minutes
        return JsonResponse({'error': 'OTP expired'}, status=400)

    # OTP is valid, generate JWT token
    token = generate_jwt(doctor)

    # Set the cookie with the JWT token
    response = JsonResponse({'message': 'OTP verified successfully', 'token': token}, status=200)
    response.set_cookie(
        key='jwt',          # Name of the cookie
        value=token,       # The JWT token to be stored
        httponly=True,     # Prevents JavaScript access
        secure=True,       # Use this in production to ensure it’s sent over HTTPS
        samesite='Lax',    # Adjust according to your CSRF policy
        expires=timezone.now() + timezone.timedelta(days=1)  # Optional expiration
    )

    return response
