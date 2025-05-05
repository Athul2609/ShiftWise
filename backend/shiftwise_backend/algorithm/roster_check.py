
from utils import *
from stage_one_roster import update_docs_info, initialise_docs_info, initialise_docs_info_histroy, check_compulsory
from stage_two_roster import verify_min_shift_criteria
import math

def check_eligible_verbose(
    message, doctor, doc_info, day, shift, scheduling_month, scheduling_year,
    start_date, end_date, dependent_allowed=False, weekend_relaxation=False, verbose=1
):
    date_info = f"{shift} shift of {day}/{scheduling_month}/{scheduling_year}"

    # Check if the doctor worked the last shift
    if doc_info["worked_last_shift"]:
        if verbose:
            message += f"{doctor} already worked the previous shift as of {date_info}.\n"
        return False, message

    # Check total number of shifts
    if doc_info["total_no_of_shifts"] >= 19:
        if verbose:
            message += f"{doctor} has already worked 19 shifts this month as of {date_info}.\n"
        return False, message

    if doc_info["period_no_of_shifts"] >= math.ceil((19 / 30) * (end_date - start_date + 1)):
        if verbose:
            message += f"{doctor} has already worked the allowed number of shifts for the period as of {date_info}.\n"
        return False, message

    # Check consecutive working days
    if doc_info["no_of_consecutive_working_days"] >= 5:
        if verbose:
            message += f"{doctor} has already worked 5 consecutive days before {date_info}.\n"
        return False, message

    # Shift-specific checks
    if shift == "night":
        if doc_info["no_of_consecutive_night_shifts"] >= 2:
            if verbose:
                message += f"{doctor} has already worked 2 consecutive night shifts before {date_info}.\n"
            return False, message
        if doc_info["no_of_night_shifts"] >= 10:
            if verbose:
                message += f"{doctor} has already worked 10 night shifts this month before {date_info}.\n"
            return False, message
        if doc_info["period_no_of_night_shifts"] >= math.ceil((10 / 30) * (end_date - start_date + 1)):
            if verbose:
                message += f"{doctor} has already worked the allowed number of night shifts for the period as of {date_info}.\n"
            return False, message

    elif shift == "day":
        if doc_info["no_of_day_shifts"] >= 10:
            if verbose:
                message += f"{doctor} has already worked 10 day shifts this month before {date_info}.\n"
            return False, message
        if doc_info["period_no_of_day_shifts"] >= math.ceil((10 / 30) * (end_date - start_date + 1)):
            if verbose:
                message += f"{doctor} has already worked the allowed number of day shifts for the period as of {date_info}.\n"
            return False, message

    # Check if doctor requested this day off
    if day + 1 in doc_info["off_requested"]:
        if verbose:
            message += f"{doctor} has requested a leave on {date_info}.\n"
        return False, message

    # Weekend checks (unless relaxed)
    if not weekend_relaxation:
        if is_sunday(day, scheduling_month, scheduling_year):
            if doc_info["no_of_working_sundays"] >= 2:
                if verbose:
                    message += f"{doctor} has already worked 2 Sundays this month before {date_info}.\n"
                return False, message

        if is_saturday(day, scheduling_month, scheduling_year):
            if doc_info["no_of_working_saturday"] >= 2:
                if verbose:
                    message += f"{doctor} has already worked 2 Saturdays this month before {date_info}.\n"
                return False, message

    # All checks passed
    return True, message
def check(roster, teams, doctor_input_details, scheduling_month, scheduling_year, start_date, end_date):
    docs_info=initialise_docs_info(teams,doctor_input_details)
    docs_info_history=initialise_docs_info_histroy(start_date,end_date,teams)
    message=""
    for day in range(start_date,end_date+1):
        # temp={}
        for shift in ["day","night"]:
            # temp[shift]=[]
            for team in teams:
                eligible_list=[]
                compulsory_list=[]
                # selected_doctors=[]
                for doctor in team:
                    if check_compulsory(docs_info[doctor],day,shift,scheduling_month,scheduling_year, start_date, end_date):
                        compulsory_list.append(doctor)
                for doctor in compulsory_list:
                    if doctor not in roster[day][shift]:
                        message+=f"{doctor} has had 4 consecutive offs\n"
                for doctor in roster[day][shift]:
                    if doctor in team:
                        result, message = check_eligible_verbose(message, doctor, docs_info[doctor],day,shift,scheduling_month,scheduling_year, start_date, end_date, dependent_allowed=True, weekend_relaxation=True)
                        if result:
                            eligible_list.append(doctor)
                if not eligible_list:
                    if len(team) == 1:
                        team_str = team[0]
                    else:
                        team_str = ', '.join(team[:-1]) + ' and ' + team[-1]
                    # Then build your message
                    message += f"No doctor in the team consisting of doctors {team_str} is working on {shift} of {day}/{scheduling_month}/{scheduling_year}.\n"
                non_dep_doc=len(eligible_list)
                for doctor in eligible_list:
                    if docs_info[doctor]["dependent"] and day in range(docs_info[doctor]["dep_start"],docs_info[doctor]["dep_end"]+1):
                        non_dep_doc-=1
                if eligible_list and non_dep_doc == 0:
                    message+=f"Only dependent doctors are working on {day}, {shift} from team - {team} \n"
                docs_info,docs_info_history=update_docs_info(eligible_list,docs_info,docs_info_history,team,day,shift,scheduling_month, scheduling_year)
    for doctor in docs_info:
        if verify_min_shift_criteria(docs_info[doctor], start_date, end_date, scheduling_month,scheduling_year):
            message+=f"{doctor} is not satisfying the minimum shift criteria of the period or month\n "
    return message