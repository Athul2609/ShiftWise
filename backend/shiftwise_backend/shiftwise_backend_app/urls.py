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
    RosterListView,
    send_otp, 
    verify_otp,
)

urlpatterns = [
    path('doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('doctors/create/', DoctorCreateView.as_view(), name='doctor-create'),
    path('doctors/<int:doctor_id>/', DoctorUpdateView.as_view(), name='doctor-update'),
    path('doctors/delete/<int:doctor_id>/', DoctorDeleteView.as_view(), name='doctor-delete'),
    path('teams/create/', TeamCreateView.as_view(), name='team-create'),
    path('teams/', TeamListView.as_view(), name='team-list'),
    path('off-requests/create/', OffRequestCreateView.as_view(), name='create-off-request'),
    path('off-requests/', OffRequestListView.as_view(), name='list-off-requests'),
    path('off-requests/date/<int:date>/', OffRequestByDateView.as_view(), name='off-requests-by-date'),
    path('off-requests/<int:doctor_id>/<int:date>/', OffRequestDeleteView.as_view(), name='offrequest-delete'),
    path('roster/generate/', RosterView.as_view(), name='roster-view'),
    path('roster/list/', RosterListView.as_view(), name='roster-list'),
    path('send-otp/', send_otp, name='send_otp'),
    path('verify-otp/', verify_otp, name='verify_otp'),
]
