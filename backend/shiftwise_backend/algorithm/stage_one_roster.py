import random
import sys
import copy
import math


from utils import *
random.seed(12)

def initialise_docs_info(teams,doctor_input_details):
    """
    Some values which we need from the previous periods along with offs and leaves are present in doctor_input_details
    """
    docs_info={}
    for team in teams:
        for doctor in team:
            docs_info[doctor]={
                "total_no_of_shifts":doctor_input_details[doctor]["total_no_of_shifts"],
                "period_no_of_shifts":0,
                "no_of_consecutive_working_days":doctor_input_details[doctor]["no_of_consecutive_working_days"], #take previous
                "no_of_consecutive_night_shifts":doctor_input_details[doctor]["no_of_consecutive_night_shifts"], #take previous
                "no_of_night_shifts":doctor_input_details[doctor]["no_of_night_shifts"],
                "period_no_of_night_shifts":0,
                "no_of_day_shifts":doctor_input_details[doctor]["no_of_day_shifts"],
                "period_no_of_day_shifts":0,
                "no_of_working_sundays":doctor_input_details[doctor]["no_of_working_sundays"],
                "no_of_working_saturday":doctor_input_details[doctor]["no_of_working_saturday"],
                "no_of_consecutive_offs":doctor_input_details[doctor]["no_of_consecutive_offs"],
                "worked_last_shift":doctor_input_details[doctor]["worked_last_shift"],
                "off_requested":doctor_input_details[doctor]["off_requested"],
                "no_of_leaves":doctor_input_details[doctor]["no_of_leaves"],
                "period_no_of_leaves":doctor_input_details[doctor]["period_no_of_leaves"],
                "dependent":doctor_input_details[doctor]["dependent"],
                "dep_start":doctor_input_details[doctor]["dep_start"],
                "dep_end":doctor_input_details[doctor]["dep_end"]
            }
    return docs_info

def initialise_docs_info_histroy(start_date,end_date,teams):
    """
    Initialize a historical tracking structure for doc_info.
        Result:
        {
            "Dr. Smith": {
                0: {},
                1: {},
                ...
                29: {}
            },
            "Dr. Jones": {
                0: {},
                1: {},
                ...
                29: {}
            },
            ...
        }
    """
    docs_info_history={}
    for team in teams:
        for doctor in team:
            docs_info_history[doctor]={}
            for day in range(start_date,end_date+1):
                docs_info_history[doctor][day]={}
    return docs_info_history

def check_eligible(doc_info, day, shift, scheduling_month, scheduling_year,start_date,end_date,dependent_allowed=False,weekend_relaxation=False,verbose=0):
    if not dependent_allowed:
        if doc_info["dependent"] and day in range(doc_info["dep_start"],doc_info["dep_end"]+1):
            return False
    
    if doc_info["worked_last_shift"] == True:
        if verbose==1:
            print("worked last shift")
        return False

    # Check the total number of shifts
    if doc_info["total_no_of_shifts"] >= 19:
        if verbose==1:
            print("worked 19 shifts already")
        return False
    if doc_info["period_no_of_shifts"] >= math.ceil((19/30)*(end_date-start_date+1)):
        if verbose==1:
            print("worked calculated amount of shifts for the period already")
        return False

    # Check consecutive working days
    if doc_info["no_of_consecutive_working_days"] >= 5:
        if verbose == 1:
            print("worked 4 consecutive days")
        return False

    # If it's a night shift, check night shift limits
    if shift == "night":
        if doc_info["no_of_consecutive_night_shifts"] >= 2:
            if verbose == 1:
                print("Already worked 2 consecutive night shifts")
            return False
        if doc_info["no_of_night_shifts"] >= 10:
            if verbose ==1:
                print("Already worked 10 night shifts")
            return False
        if doc_info["period_no_of_night_shifts"] >= math.ceil((10/30)*(end_date-start_date+1)):
            if verbose ==1:
                print("Already worked number of night shifts for period")
            return False

    # If it's a day shift, check day shift limits
    elif shift == "day":
        if doc_info["no_of_day_shifts"] >= 10:
            if verbose ==1:
                print("Already worked 10 day shifts")
            return False
        if doc_info["period_no_of_day_shifts"] >= math.ceil((10/30)*(end_date-start_date+1)):
            if verbose ==1:
                print("Already worked number of day shifts for period")
            return False

    if day+1 in doc_info["off_requested"]:
        if verbose ==1:
            print("Doctor is on leave")
        return False

    if not weekend_relaxation:
        # Check for Sunday eligibility
        if is_sunday(day, scheduling_month, scheduling_year):
            if doc_info["no_of_working_sundays"] >= 2:
                return False

        # Check for Saturday eligibility
        if is_saturday(day, scheduling_month, scheduling_year):
            if doc_info["no_of_working_saturday"] >= 2:
                return False

    # If none of the conditions disqualify the doctor, they are eligible
    return True

def check_compulsory(doc_info, date, shift, scheduling_month, scheduling_year, start_date, end_date,dependent_allowed=False):
    if check_eligible(doc_info, date, shift, scheduling_month, scheduling_year, start_date, end_date,dependent_allowed, weekend_relaxation=True):
        if(doc_info["no_of_consecutive_offs"]==4):
            return True
    return False

def generate_pick_score(doc_info, day, shift, scheduling_month, scheduling_year):
    pick_score=0

    pick_score-=doc_info["total_no_of_shifts"]
    pick_score-=doc_info["no_of_consecutive_working_days"]

    if shift == "night":
        pick_score-= doc_info["no_of_consecutive_night_shifts"]
        pick_score-=doc_info["no_of_night_shifts"]
    elif shift == "day":
        pick_score-= doc_info["no_of_day_shifts"]

    if is_sunday(day, scheduling_month, scheduling_year):
        pick_score-=doc_info["no_of_working_sundays"]

    # Check for Saturday eligibility
    if is_saturday(day, scheduling_month, scheduling_year):
        pick_score-=doc_info["no_of_working_saturday"]
    
    pick_score+=doc_info["no_of_consecutive_offs"]

    for off_day in doc_info["off_requested"]:
        if off_day == day + 4:
            pick_score += 1
        elif off_day == day + 3:
            pick_score += 2
        elif off_day == day + 2:
            if shift == "night":
                pick_score += 3
            else:
                pick_score -=10

    return pick_score

def pick_doctor(eligible_list,docs_info,day, shift, scheduling_month, scheduling_year):
    selected_doctor=None
    max_pick_score=-sys.maxsize - 1

    for doctor in eligible_list:
        score=generate_pick_score(docs_info[doctor], day, shift, scheduling_month, scheduling_year)
        if score>max_pick_score:
            max_pick_score=score
            selected_doctor=doctor
    return selected_doctor

def update_docs_info(selected_doctors,docs_info, docs_info_history,team,day,shift,scheduling_month, scheduling_year): 
    for doctor in team:
        docs_info_history[doctor][day][shift] = copy.deepcopy(docs_info[doctor])
        doc_info=docs_info[doctor]
        if doctor in selected_doctors:
            doc_info["total_no_of_shifts"]+=1
            doc_info["period_no_of_shifts"]+=1
            doc_info["no_of_consecutive_working_days"]+=1
            doc_info["no_of_consecutive_offs"]=0
            doc_info["worked_last_shift"]=True

            if shift == "day":
                doc_info["no_of_day_shifts"]+=1
                doc_info["period_no_of_day_shifts"]+=1
            else:
                doc_info["no_of_night_shifts"]+=1
                doc_info["period_no_of_night_shifts"]+=1
                doc_info["no_of_consecutive_night_shifts"]+=1

            if is_sunday(day,scheduling_month,scheduling_year):
                doc_info["no_of_working_sundays"]+=1

            if is_saturday(day,scheduling_month,scheduling_year):
                doc_info["no_of_working_saturday"]+=1
        else:
            if shift == "night":
                doc_info["no_of_consecutive_night_shifts"]=0
                if not doc_info["worked_last_shift"]: #refers to workled_last_shift where shift is previous shift
                    doc_info["no_of_consecutive_working_days"]=0
                    doc_info["no_of_consecutive_offs"]+=1
            doc_info["worked_last_shift"]=False
        docs_info[doctor]=doc_info
    return docs_info,docs_info_history

def create_stage_one_roster(teams, doctor_input_details, scheduling_month, scheduling_year, start_date, end_date):
    roster={}
    docs_info=initialise_docs_info(teams,doctor_input_details)
    docs_info_history=initialise_docs_info_histroy(start_date,end_date,teams)
    for day in range(start_date,end_date+1):
        temp={}
        for shift in ["day","night"]:
            temp[shift]=[]
            for team in teams:
                eligible_list=[]
                compulsory_list=[]
                selected_doctors=[]
                for doctor in team:
                    if check_eligible(docs_info[doctor],day,shift,scheduling_month,scheduling_year,start_date, end_date):
                        eligible_list.append(doctor)
                    if check_compulsory(docs_info[doctor],day,shift,scheduling_month,scheduling_year, start_date, end_date):
                        compulsory_list.append(doctor)
                if not eligible_list:
                    for doctor in team:
                        if check_eligible(docs_info[doctor],day,shift,scheduling_month,scheduling_year, start_date, end_date,weekend_relaxation=True):
                            eligible_list.append(doctor)
                if not compulsory_list:
                    if eligible_list:
                        selected_doctor=pick_doctor(eligible_list,docs_info,day, shift, scheduling_month, scheduling_year)
                        temp[shift].append(selected_doctor)
                        selected_doctors.append(selected_doctor)
                        # docs_info,docs_info_history=update_docs_info([selected_doctor],docs_info,docs_info_history,team,day,shift,scheduling_month, scheduling_year)
                    else:
                        temp[shift].append("")
                        print(f"{day+1} {shift} {team} no doctor from team was eligible")
                        # docs_info,docs_info_history=update_docs_info([],docs_info,docs_info_history,team,day,shift,scheduling_month, scheduling_year)
                else:
                    temp[shift].extend(compulsory_list)
                    selected_doctors.extend(compulsory_list)
                    docs_info,docs_info_history=update_docs_info(compulsory_list,docs_info,docs_info_history,team,day,shift,scheduling_month, scheduling_year)
                dependent_eligible_list=[]
                dependent_compulsory_list=[]
                for doctor in team:
                    if docs_info[doctor]["dependent"] and day in range(docs_info[doctor]["dep_start"],docs_info[doctor]["dep_end"]+1):
                        if check_eligible(docs_info[doctor],day,shift,scheduling_month,scheduling_year,start_date, end_date,dependent_allowed=True,weekend_relaxation=True):
                            dependent_eligible_list.append(doctor)
                        if check_compulsory(docs_info[doctor],day,shift,scheduling_month,scheduling_year, start_date, end_date,dependent_allowed=True):
                            dependent_compulsory_list.append(doctor)
                if not dependent_compulsory_list:
                    if dependent_eligible_list:
                        selected_doctor=pick_doctor(dependent_eligible_list,docs_info,day, shift, scheduling_month, scheduling_year)
                        temp[shift].append(selected_doctor)
                        selected_doctors.append(selected_doctor)
                    docs_info,docs_info_history=update_docs_info(selected_doctors,docs_info,docs_info_history,team,day,shift,scheduling_month, scheduling_year)
                else:
                    temp[shift].extend(dependent_compulsory_list)
                    selected_doctors.extend(dependent_compulsory_list)
                    docs_info,docs_info_history=update_docs_info(selected_doctors,docs_info,docs_info_history,team,day,shift,scheduling_month, scheduling_year)
        roster[day]=temp
    return docs_info,docs_info_history,roster
