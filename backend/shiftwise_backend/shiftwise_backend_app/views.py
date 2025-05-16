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
from django.shortcuts import get_object_or_404
from django.db.models import F

from .authentication import verify_jwt
from .models import Doctor, Team, OffRequest, OTP, Roster, AlgoPlan, WorkHistory, Dependents
from .serializers import DoctorSerializer, TeamSerializer, OffRequestSerializer, RosterSerializer, AlgoPlanSerializer, DependentsSerializer, WorkHistorySerializer
from .utils import generate_jwt,generate_otp

from datetime import date, datetime, timedelta
from calendar import monthrange

# Adjusting the system path for algorithm imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../algorithm')))
from main import generate_roster, check_roster

class AlgoPlanFilterView(generics.ListAPIView):
    serializer_class = AlgoPlanSerializer

    def get_queryset(self):
        # Get the current date
        current_date = datetime.now().date()

        # Calculate the date 3 days after today
        three_days_after = current_date + timedelta(days=3)

        filtered_plans = AlgoPlan.objects.filter(
            start_date__lte=three_days_after.day,  
            end_date__gte=current_date.day         
        )

        return filtered_plans
    
class AlgoPlanCreateView(generics.CreateAPIView):
    queryset = AlgoPlan.objects.all()
    serializer_class = AlgoPlanSerializer

    def perform_create(self, serializer):
        algo_plan = serializer.save()

        if algo_plan.start_date == 1:
            doctors = Doctor.objects.all()

            for doctor in doctors:
                # Reset doctor's shift data
                doctor.total_no_of_shifts = 0
                doctor.no_of_night_shifts = 0
                doctor.no_of_day_shifts = 0
                doctor.no_of_leaves = 0
                doctor.no_of_working_sundays = 0
                doctor.no_of_working_saturday = 0
                doctor.save()

class AlgoPlanListView(generics.ListAPIView):
    queryset = AlgoPlan.objects.all()
    serializer_class = AlgoPlanSerializer

class AlgoPlanListByIDView(generics.ListAPIView):
    serializer_class = AlgoPlanSerializer

    def get_queryset(self):
        roster_id = self.kwargs['roster_id']
        return AlgoPlan.objects.filter(roster_id=roster_id)

class DependentsCreateView(generics.CreateAPIView):
    queryset = Dependents.objects.all()
    serializer_class = DependentsSerializer

    def create(self, request, *args, **kwargs):
        # Handle multiple dependent objects
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save()

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

class DoctorDetailView(generics.RetrieveAPIView):
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

class TeamsByRosterView(generics.ListAPIView):
    serializer_class = TeamSerializer

    def get_queryset(self):
        roster_id = self.kwargs['roster_id']
        return Team.objects.filter(roster_id=roster_id)

class DeleteTeamsByRosterView(APIView):
    def delete(self, request, roster_id):
        teams_to_delete = Team.objects.filter(roster_id=roster_id)
        deleted_count = teams_to_delete.count()
        teams_to_delete.delete()
        return Response(
            {"message": f"{deleted_count} team(s) deleted for roster_id {roster_id}."},
            status=status.HTTP_200_OK
        )

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
    
class OffRequestByDoctorView(generics.ListAPIView):
    serializer_class = OffRequestSerializer

    def get_queryset(self):
        doctor_id = self.kwargs['doctor_id']
        return OffRequest.objects.filter(doctor_id=doctor_id)

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

class OffRequestsByDateRangeView(APIView):
    def get(self, request):
        try:
            start_year = int(request.query_params.get('start_year'))
            start_month = int(request.query_params.get('start_month'))
            start_day = int(request.query_params.get('start_day'))

            end_year = int(request.query_params.get('end_year'))
            end_month = int(request.query_params.get('end_month'))
            end_day = int(request.query_params.get('end_day'))

            start_date = date(start_year, start_month, start_day)
            end_date = date(end_year, end_month, end_day)

            all_requests = OffRequest.objects.all()

            filtered = [
                req for req in all_requests
                if start_date <= date(req.year, req.month, req.date) <= end_date
            ]

            serializer = OffRequestSerializer(filtered, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# API to generate roster
class RosterView(APIView):
    def post(self, request):
        roster_id = request.data.get('roster_id')
        
        if not roster_id:
            return Response({"error": "roster_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. Fetch AlgoPlan
        algo_plan = get_object_or_404(AlgoPlan, roster_id=roster_id)
        scheduling_month = algo_plan.month
        scheduling_year = algo_plan.year
        start_date = algo_plan.start_date
        end_date = algo_plan.end_date
        
        # 2. Fetch Teams
        team_objs = Team.objects.filter(roster_id=roster_id)
        teams_dict = {}
        for team in team_objs:
            teams_dict.setdefault(team.team_id, []).append(team.doctor.name)
        
        teams = list(teams_dict.values())
        
        # 3. Build doctor_input_details
        doctors = Doctor.objects.filter(doctor_id__in=[team.doctor.doctor_id for team in team_objs])
        
        # Fetch dependents
        dependent_objs = Dependents.objects.filter(roster_id=roster_id)
        dependent_map = {dep.doctor.doctor_id: dep for dep in dependent_objs}
        
        doctor_input_details = {}

        for doctor in doctors:
            # Fetch off requests between start_date and end_date
            off_requests = OffRequest.objects.filter(
                doctor=doctor,
                year=scheduling_year,
                month=scheduling_month,
                date__gte=start_date,
                date__lte=end_date,
            )
            off_requested_dates = [off.date for off in off_requests]
            period_no_of_leaves = len(off_requested_dates)

            dep = dependent_map.get(doctor.doctor_id)

            doctor_input_details[doctor.name] = {
                "total_no_of_shifts": doctor.total_no_of_shifts,
                "no_of_night_shifts": doctor.no_of_night_shifts,
                "no_of_day_shifts": doctor.no_of_day_shifts,
                "no_of_working_sundays": doctor.no_of_working_sundays,
                "no_of_working_saturday": doctor.no_of_working_saturday,
                "no_of_leaves": doctor.no_of_leaves,
                "period_no_of_leaves": period_no_of_leaves,
                "no_of_consecutive_working_days": doctor.no_of_consecutive_working_days,
                "no_of_consecutive_night_shifts": doctor.no_of_consecutive_night_shifts,
                "no_of_consecutive_offs": doctor.no_of_consecutive_offs,
                "worked_last_shift": doctor.worked_last_shift,
                "off_requested": off_requested_dates,
                "dependent": bool(dep),
                "dep_start": dep.dep_start if dep else 0,
                "dep_end": dep.dep_end if dep else 0,
            }

        # 4. Call generate_roster
        try:
            roster_result, doctor_result = generate_roster(
                scheduling_month,
                scheduling_year,
                start_date,
                end_date,
                teams,
                doctor_input_details
            )
            for doctor in doctors:
                WorkHistory.objects.create(
                    doctor=doctor,
                    roster_id=algo_plan,
                    no_of_consecutive_working_days = doctor.no_of_consecutive_working_days,
                    no_of_consecutive_night_shifts = doctor.no_of_consecutive_night_shifts,
                    no_of_consecutive_offs = doctor.no_of_consecutive_offs,
                    worked_last_shift = doctor.worked_last_shift,
                    total_no_of_shifts=doctor.total_no_of_shifts,
                    no_of_night_shifts=doctor.no_of_night_shifts,
                    no_of_day_shifts=doctor.no_of_day_shifts,
                    no_of_leaves=doctor.no_of_leaves,
                    no_of_working_sundays=doctor.no_of_working_sundays,
                    no_of_working_saturday=doctor.no_of_working_saturday,
                )
            
            # 5. Save the roster into Roster model
            for day, shifts in roster_result.items():
                day_shift_doctors = []
                night_shift_doctors = []

                # Names are given — map back to IDs
                for doctor_name in shifts.get('day', []):
                    doc_obj = Doctor.objects.filter(name=doctor_name).first()
                    if doc_obj:
                        day_shift_doctors.append(doc_obj.doctor_id)
                for doctor_name in shifts.get('night', []):
                    doc_obj = Doctor.objects.filter(name=doctor_name).first()
                    if doc_obj:
                        night_shift_doctors.append(doc_obj.doctor_id)
                
                Roster.objects.create(
                    roster_id=algo_plan,
                    date=day,
                    day_shift_doctors=day_shift_doctors,
                    night_shift_doctors=night_shift_doctors,
                )
            
            # 6. Update each doctor model
            for doctor_name, updated_data in doctor_result.items():
                doctor_obj = Doctor.objects.filter(name=doctor_name).first()
                if doctor_obj:
                    doctor_obj.total_no_of_shifts = updated_data.get('total_no_of_shifts', doctor_obj.total_no_of_shifts)
                    doctor_obj.no_of_night_shifts = updated_data.get('no_of_night_shifts', doctor_obj.no_of_night_shifts)
                    doctor_obj.no_of_day_shifts = updated_data.get('no_of_day_shifts', doctor_obj.no_of_day_shifts)
                    doctor_obj.no_of_working_sundays = updated_data.get('no_of_working_sundays', doctor_obj.no_of_working_sundays)
                    doctor_obj.no_of_working_saturday = updated_data.get('no_of_working_saturday', doctor_obj.no_of_working_saturday)
                    doctor_obj.no_of_leaves = updated_data.get('no_of_leaves', doctor_obj.no_of_leaves)
                    doctor_obj.no_of_consecutive_working_days = updated_data.get('no_of_consecutive_working_days', doctor_obj.no_of_consecutive_working_days)
                    doctor_obj.no_of_consecutive_night_shifts = updated_data.get('no_of_consecutive_night_shifts', doctor_obj.no_of_consecutive_night_shifts)
                    doctor_obj.no_of_consecutive_offs = updated_data.get('no_of_consecutive_offs', doctor_obj.no_of_consecutive_offs)
                    doctor_obj.worked_last_shift = updated_data.get('worked_last_shift', doctor_obj.worked_last_shift)
                    doctor_obj.save()
            
            return Response({"message": "Roster generation completed successfully!"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        roster_id = request.data.get('roster_id')
        roster = roster = {int(k): v for k, v in request.data.get('roster', {}).items()}

        if not roster_id:
            return Response({"error": "roster_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. Fetch AlgoPlan
        algo_plan = get_object_or_404(AlgoPlan, roster_id=roster_id)
        scheduling_month = algo_plan.month
        scheduling_year = algo_plan.year
        start_date = algo_plan.start_date
        end_date = algo_plan.end_date
        
        # 2. Fetch Teams
        team_objs = Team.objects.filter(roster_id=roster_id)
        teams_dict = {}
        for team in team_objs:
            teams_dict.setdefault(team.team_id, []).append(team.doctor.name)
        
        teams = list(teams_dict.values())

        print([type(team.doctor) for team in team_objs])

        # 3. Build doctor_input_details
        doctors = WorkHistory.objects.filter(
            roster_id=algo_plan,
            doctor__in=[team.doctor for team in team_objs]
        )

        # Fetch dependents
        dependent_objs = Dependents.objects.filter(roster_id=roster_id)
        dependent_map = {dep.doctor.doctor_id: dep for dep in dependent_objs}
        
        doctor_input_details = {}

        for doctor in doctors:
            # Fetch off requests between start_date and end_date
            off_requests = OffRequest.objects.filter(
                doctor=doctor.doctor,
                year=scheduling_year,
                month=scheduling_month,
                date__gte=start_date,
                date__lte=end_date,
            )
            off_requested_dates = [off.date for off in off_requests]
            period_no_of_leaves = len(off_requested_dates)

            dep = dependent_map.get(doctor.doctor.doctor_id)

            doctor_input_details[doctor.doctor.name] = {
                "total_no_of_shifts": doctor.total_no_of_shifts,
                "no_of_night_shifts": doctor.no_of_night_shifts,
                "no_of_day_shifts": doctor.no_of_day_shifts,
                "no_of_working_sundays": doctor.no_of_working_sundays,
                "no_of_working_saturday": doctor.no_of_working_saturday,
                "no_of_leaves": doctor.no_of_leaves,
                "period_no_of_leaves": period_no_of_leaves,
                "no_of_consecutive_working_days": doctor.no_of_consecutive_working_days,
                "no_of_consecutive_night_shifts": doctor.no_of_consecutive_night_shifts,
                "no_of_consecutive_offs": doctor.no_of_consecutive_offs,
                "worked_last_shift": doctor.worked_last_shift,
                "off_requested": off_requested_dates,
                "dependent": bool(dep),
                "dep_start": dep.dep_start if dep else 0,
                "dep_end": dep.dep_end if dep else 0,
            }
        print(doctor_input_details)

        try:
            message,_ = check_roster(
                roster,
                teams,
                doctor_input_details,
                scheduling_month,
                scheduling_year,
                start_date,
                end_date
            )
            
            return Response({"message": message}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RosterByRosterIDView(generics.ListAPIView):
    serializer_class = RosterSerializer

    def get_queryset(self):
        roster_id = self.kwargs['roster_id']
        return Roster.objects.filter(roster_id=roster_id)

class RosterUpdateView(APIView):
    def post(self, request):
        roster_id = request.data.get('roster_id')
        roster = roster = {int(k): v for k, v in request.data.get('roster', {}).items()}

        if not roster_id:
            return Response({"error": "roster_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not roster:
            return Response({"error": "roster is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. Fetch AlgoPlan
        algo_plan = get_object_or_404(AlgoPlan, roster_id=roster_id)
        scheduling_month = algo_plan.month
        scheduling_year = algo_plan.year
        start_date = algo_plan.start_date
        end_date = algo_plan.end_date
        
        # 2. Fetch Teams
        team_objs = Team.objects.filter(roster_id=roster_id)
        teams_dict = {}
        for team in team_objs:
            teams_dict.setdefault(team.team_id, []).append(team.doctor.name)
        
        teams = list(teams_dict.values())

        print([type(team.doctor) for team in team_objs])

        # 3. Build doctor_input_details
        doctors = WorkHistory.objects.filter(
            roster_id=algo_plan,
            doctor__in=[team.doctor for team in team_objs]
        )

        # Fetch dependents
        dependent_objs = Dependents.objects.filter(roster_id=roster_id)
        dependent_map = {dep.doctor.doctor_id: dep for dep in dependent_objs}
        
        doctor_input_details = {}

        for doctor in doctors:
            # Fetch off requests between start_date and end_date
            off_requests = OffRequest.objects.filter(
                doctor=doctor.doctor,
                year=scheduling_year,
                month=scheduling_month,
                date__gte=start_date,
                date__lte=end_date,
            )
            off_requested_dates = [off.date for off in off_requests]
            period_no_of_leaves = len(off_requested_dates)

            dep = dependent_map.get(doctor.doctor.doctor_id)

            doctor_input_details[doctor.doctor.name] = {
                "total_no_of_shifts": doctor.total_no_of_shifts,
                "no_of_night_shifts": doctor.no_of_night_shifts,
                "no_of_day_shifts": doctor.no_of_day_shifts,
                "no_of_working_sundays": doctor.no_of_working_sundays,
                "no_of_working_saturday": doctor.no_of_working_saturday,
                "no_of_leaves": doctor.no_of_leaves,
                "period_no_of_leaves": period_no_of_leaves,
                "no_of_consecutive_working_days": doctor.no_of_consecutive_working_days,
                "no_of_consecutive_night_shifts": doctor.no_of_consecutive_night_shifts,
                "no_of_consecutive_offs": doctor.no_of_consecutive_offs,
                "worked_last_shift": doctor.worked_last_shift,
                "off_requested": off_requested_dates,
                "dependent": bool(dep),
                "dep_start": dep.dep_start if dep else 0,
                "dep_end": dep.dep_end if dep else 0,
            }

        try:
            _,doctor_result = check_roster(
                roster,
                teams,
                doctor_input_details,
                scheduling_month,
                scheduling_year,
                start_date,
                end_date
            )
            
            Roster.objects.filter(roster_id=algo_plan).delete()

            for day, shifts in roster.items():
                day_shift_doctors = []
                night_shift_doctors = []

                # Names are given — map back to IDs
                for doctor_name in shifts.get('day', []):
                    doc_obj = Doctor.objects.filter(name=doctor_name).first()
                    if doc_obj:
                        day_shift_doctors.append(doc_obj.doctor_id)
                for doctor_name in shifts.get('night', []):
                    doc_obj = Doctor.objects.filter(name=doctor_name).first()
                    if doc_obj:
                        night_shift_doctors.append(doc_obj.doctor_id)
                
                Roster.objects.create(
                    roster_id=algo_plan,
                    date=day,
                    day_shift_doctors=day_shift_doctors,
                    night_shift_doctors=night_shift_doctors,
                )
            
            # 6. Update each doctor model(need to think about this a little bit)
            latest_plan = WorkHistory.objects.order_by('-roster_id').first()
            if latest_plan:
                max_id = latest_plan.roster_id
            else:
                max_id = None  # or handle as needed
            if max_id and roster_id+1<=max_id.roster_id:
                for doctor_name, updated_data in doctor_result.items():
                    doc = Doctor.objects.filter(name=doctor_name).first()
                    algo_plan_1_gt = AlgoPlan.objects.filter(roster_id=roster_id+1).first()
                    doctor_obj = WorkHistory.objects.filter(roster_id=algo_plan_1_gt).filter(doctor=doc).first()
                    if doctor_obj:
                        # update the consecutive values
                        doctor_obj.no_of_leaves = updated_data.get('no_of_leaves', doctor_obj.no_of_leaves)
                        doctor_obj.no_of_consecutive_working_days = updated_data.get('no_of_consecutive_working_days', doctor_obj.no_of_consecutive_working_days)
                        doctor_obj.no_of_consecutive_night_shifts = updated_data.get('no_of_consecutive_night_shifts', doctor_obj.no_of_consecutive_night_shifts)
                        doctor_obj.no_of_consecutive_offs = updated_data.get('no_of_consecutive_offs', doctor_obj.no_of_consecutive_offs)
                        doctor_obj.worked_last_shift = updated_data.get('worked_last_shift', doctor_obj.worked_last_shift)
                        
                        # Calculate deltas for each attribute
                        delta_total_no_of_shifts = updated_data.get('total_no_of_shifts', doctor_obj.total_no_of_shifts) - doctor_obj.total_no_of_shifts
                        delta_no_of_night_shifts = updated_data.get('no_of_night_shifts', doctor_obj.no_of_night_shifts) - doctor_obj.no_of_night_shifts
                        delta_no_of_day_shifts = updated_data.get('no_of_day_shifts', doctor_obj.no_of_day_shifts) - doctor_obj.no_of_day_shifts
                        delta_no_of_working_sundays = updated_data.get('no_of_working_sundays', doctor_obj.no_of_working_sundays) - doctor_obj.no_of_working_sundays
                        delta_no_of_working_saturday = updated_data.get('no_of_working_saturday', doctor_obj.no_of_working_saturday) - doctor_obj.no_of_working_saturday

                        # Apply deltas - add a check to make sure it's not the last period of the month
                        if algo_plan_1_gt.end_date!=monthrange(scheduling_year, scheduling_month)[1]:
                            doctor_obj.total_no_of_shifts += delta_total_no_of_shifts
                            doctor_obj.no_of_night_shifts += delta_no_of_night_shifts
                            doctor_obj.no_of_day_shifts += delta_no_of_day_shifts
                            doctor_obj.no_of_working_sundays += delta_no_of_working_sundays
                            doctor_obj.no_of_working_saturday += delta_no_of_working_saturday

                        doctor_obj.save()

                        last_day_of_month = monthrange(scheduling_year, scheduling_month)[1]

                        if algo_plan_1_gt.end_date!=monthrange(scheduling_year, scheduling_month)[1]:
                            WorkHistory.objects.filter(
                                roster_id__month=scheduling_month,
                                roster_id__year=scheduling_year,
                                roster_id__roster_id__gt=roster_id + 1,
                                doctor=doc
                            ).update(
                                total_no_of_shifts=F('total_no_of_shifts') + delta_total_no_of_shifts,
                                no_of_night_shifts=F('no_of_night_shifts') + delta_no_of_night_shifts,
                                no_of_day_shifts=F('no_of_day_shifts') + delta_no_of_day_shifts,
                                no_of_working_sundays=F('no_of_working_sundays') + delta_no_of_working_sundays,
                                no_of_working_saturday=F('no_of_working_saturday') + delta_no_of_working_saturday,
                            )

                            latest_algo_plan = AlgoPlan.objects.order_by('-roster_id').first()

                            if latest_algo_plan.month == scheduling_month:
                                doc.total_no_of_shifts += delta_total_no_of_shifts
                                doc.no_of_night_shifts += delta_no_of_night_shifts
                                doc.no_of_day_shifts += delta_no_of_day_shifts
                                doc.no_of_working_sundays += delta_no_of_working_sundays
                                doc.no_of_working_saturday += delta_no_of_working_saturday
                                doc.save()
                                


            elif max_id:
                for doctor_name, updated_data in doctor_result.items():
                    doctor_obj = Doctor.objects.filter(name=doctor_name).first()
                    if doctor_obj:
                        doctor_obj.total_no_of_shifts = updated_data.get('total_no_of_shifts', doctor_obj.total_no_of_shifts)
                        doctor_obj.no_of_night_shifts = updated_data.get('no_of_night_shifts', doctor_obj.no_of_night_shifts)
                        doctor_obj.no_of_day_shifts = updated_data.get('no_of_day_shifts', doctor_obj.no_of_day_shifts)
                        doctor_obj.no_of_working_sundays = updated_data.get('no_of_working_sundays', doctor_obj.no_of_working_sundays)
                        doctor_obj.no_of_working_saturday = updated_data.get('no_of_working_saturday', doctor_obj.no_of_working_saturday)
                        doctor_obj.no_of_leaves = updated_data.get('no_of_leaves', doctor_obj.no_of_leaves)
                        doctor_obj.no_of_consecutive_working_days = updated_data.get('no_of_consecutive_working_days', doctor_obj.no_of_consecutive_working_days)
                        doctor_obj.no_of_consecutive_night_shifts = updated_data.get('no_of_consecutive_night_shifts', doctor_obj.no_of_consecutive_night_shifts)
                        doctor_obj.no_of_consecutive_offs = updated_data.get('no_of_consecutive_offs', doctor_obj.no_of_consecutive_offs)
                        doctor_obj.worked_last_shift = updated_data.get('worked_last_shift', doctor_obj.worked_last_shift)
                        doctor_obj.save()
            
            return Response({"message": "Roster update completed successfully!"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class WorkHistoryByRosterIDView(generics.ListAPIView):
    serializer_class = WorkHistorySerializer

    def get_queryset(self):
        roster_id = self.kwargs['roster_id']
        return WorkHistory.objects.filter(roster_id=roster_id)

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
