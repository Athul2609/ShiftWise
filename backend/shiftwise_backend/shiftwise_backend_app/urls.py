# shiftwise_backend_app/urls.py

from django.urls import path
from .views import (
    DoctorCreateView,
    DoctorListView,
    DoctorUpdateView,
    DoctorDeleteView,
    DoctorDetailView,
    DependentsCreateView,
    TeamCreateView,
    TeamListView,
    TeamsByRosterView,
    DeleteTeamsByRosterView,
    OffRequestCreateView, 
    OffRequestListView, 
    OffRequestByDateView,
    OffRequestByDoctorView, 
    OffRequestDeleteView,
    OffRequestsByDateRangeView,
    RosterView,
    RosterListView,
    RosterGenerationCheckView,
    RosterByRosterIDView,
    AlgoPlanListView,
    AlgoPlanCreateView,
    AlgoPlanFilterView,
    WorkHistoryByRosterIDView,
    send_otp, 
    verify_otp,
)

urlpatterns = [
    path('algoplan/', AlgoPlanListView.as_view(), name='algoplan-list'), #checked
    path('algoplan/create/', AlgoPlanCreateView.as_view(), name='algoplan-create'), #checked
    path('algoplan/filter/', AlgoPlanFilterView.as_view(), name='algoplan-filter'),
    path('doctors/', DoctorListView.as_view(), name='doctor-list'), #checked
    path('doctors/create/', DoctorCreateView.as_view(), name='doctor-create'), #checked
    path('doctors/<int:doctor_id>/', DoctorUpdateView.as_view(), name='doctor-update'), #checked
    path('doctors/delete/<int:doctor_id>/', DoctorDeleteView.as_view(), name='doctor-delete'), #checked
    path('doctor/<int:doctor_id>/', DoctorDetailView.as_view(), name='doctor-detail'), #checked
    path('dependents/bulk-create/', DependentsCreateView.as_view(), name='dependents-bulk-create'), #checked
    path('teams/create/', TeamCreateView.as_view(), name='team-create'), #checked
    path('teams/delete/<int:roster_id>/', DeleteTeamsByRosterView.as_view(), name='delete-teams-by-roster'), #checked
    path('teams/<int:roster_id>/', TeamsByRosterView.as_view(), name='teams-by-roster'), #checked
    path('teams/', TeamListView.as_view(), name='team-list'), #checked
    path('off-requests/create/', OffRequestCreateView.as_view(), name='create-off-request'), #checked
    path('off-requests/', OffRequestListView.as_view(), name='list-off-requests'), #checked
    path('off-requests/date/<int:date>/', OffRequestByDateView.as_view(), name='off-requests-by-date'), #checked
    path('off-requests/<int:doctor_id>/<int:date>/', OffRequestDeleteView.as_view(), name='offrequest-delete'),
    path('off-requests/<int:doctor_id>/', OffRequestByDoctorView.as_view(), name='off-requests-by-doctor'), #checked
    path('off-requests/range/', OffRequestsByDateRangeView.as_view(), name='off-requests-range'), #checked
    path('roster/generate/', RosterView.as_view(), name='roster-view'), 
    path('roster/list/', RosterListView.as_view(), name='roster-list'), #checked
    path('roster/check/', RosterGenerationCheckView.as_view(), name='roster-check'),
    path('roster/<int:roster_id>/', RosterByRosterIDView.as_view(), name='rosters-by-roster-id'), #checked
    path('work-history/<int:roster_id>/',WorkHistoryByRosterIDView.as_view(),name='work-history-by-roster-id'),
    path('send-otp/', send_otp, name='send_otp'),
    path('verify-otp/', verify_otp, name='verify_otp'),
]
