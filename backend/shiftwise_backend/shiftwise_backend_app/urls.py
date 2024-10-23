# shiftwise_backend_app/urls.py

from django.urls import path
from .views import (
    DoctorCreateView,
    DoctorListView,
    DoctorUpdateView,
    DoctorDeleteView,
    TeamCreateView,
    TeamListView,
    OffRequestCreateView, 
    OffRequestListView, 
    OffRequestByDateView, 
    OffRequestDeleteView,
    RosterView,
    send_otp, 
    verify_otp
)

urlpatterns = [
    path('doctors/', DoctorListView.as_view(), name='doctor-list'),  # GET all doctors
    path('doctors/create/', DoctorCreateView.as_view(), name='doctor-create'),  # POST create a new doctor
    path('doctors/<int:doctor_id>/', DoctorUpdateView.as_view(), name='doctor-update'),  # PATCH update doctor
    path('doctors/delete/<int:doctor_id>/', DoctorDeleteView.as_view(), name='doctor-delete'),  # DELETE a doctor
    path('teams/create/', TeamCreateView.as_view(), name='team-create'),  # POST create teams
    path('teams/', TeamListView.as_view(), name='team-list'),  # GET all teams
    path('off-requests/create/', OffRequestCreateView.as_view(), name='create-off-request'),
    path('off-requests/', OffRequestListView.as_view(), name='list-off-requests'),
    path('off-requests/date/<int:date>/', OffRequestByDateView.as_view(), name='off-requests-by-date'),
    path('off-requests/<int:doctor_id>/<int:date>/', OffRequestDeleteView.as_view(), name='offrequest-delete'),
    path('roster/', RosterView.as_view(), name='roster-view'),
    path('send-otp/', send_otp, name='send_otp'),
    path('verify-otp/', verify_otp, name='verify_otp'),
]
