import random
import sys
import copy
import math


from utils import *
random.seed(12)

def initialise_docs_info(teams,doctor_input_details):
    """
    Initialize doc_info for all doctors in the provided teams.

    This function creates a dictionary containing doc_info for 
    each doctor.

    Args:
        teams (list of list of str): A 2D list where each inner list represents a team, 
                                     and each element in the inner list is a doctor's name.
        doctor_input_details (dict): A dictionary where keys are doctor names, and values are lists 
                             of days in the month that the doctor has requested off.

    Returns:
        dict: A dictionary where each key is a doctor's name, and the value is another 
              dictionary containing the following fields:
              - "total_no_of_shifts" (int): Total number of shifts assigned.
              - "no_of_consecutive_working_days" (int): Number of consecutive working days.
              - "no_of_consecutive_night_shifts" (int): Number of consecutive night shifts.
              - "no_of_night_shifts" (int): Total number of night shifts.
              - "no_of_day_shifts" (int): Total number of day shifts.
              - "no_of_working_sundays" (int): Total number of Sundays worked.
              - "no_of_working_saturday" (int): Total number of Saturdays worked.
              - "no_of_consecutive_offs" (int): Number of consecutive off days.
              - "worked_last_shift" (bool): Whether the doctor worked the last shift.
              - "off_requested" (list): Days of the month the doctor has requested off.

    Example:
        teams = [["Dr. Smith", "Dr. Jones"], ["Dr. Patel", "Dr. Lee"]]
        off_requests = {
            "Dr. Smith": [1, 15],
            "Dr. Lee": [10, 20]
        }

        docs_info = initialise_docs_info(teams, off_requests)

        # Result:
        # {
        #     "Dr. Smith": {
        #         "total_no_of_shifts": 0,
        #         "no_of_consecutive_working_days": 0,
        #         "no_of_consecutive_night_shifts": 0,
        #         "no_of_night_shifts": 0,
        #         "no_of_day_shifts": 0,
        #         "no_of_working_sundays": 0,
        #         "no_of_working_saturday": 0,
        #         "no_of_consecutive_offs": 0,
        #         "worked_last_shift": False,
        #         "off_requested": [1, 15]
        #     },
        #     "Dr. Jones": {
        #         ...
        #     }
        # }
    """
    docs_info={}
    for team in teams:
        for doctor in team:
            docs_info[doctor]={
                "total_no_of_shifts":0,
                "no_of_consecutive_working_days":doctor_input_details[doctor]["no_of_consecutive_working_days"], #take previous
                "no_of_consecutive_night_shifts":doctor_input_details[doctor]["no_of_consecutive_night_shifts"], #take previous
                "no_of_night_shifts":0,
                "no_of_day_shifts":0,
                "no_of_working_sundays":0,
                "no_of_working_saturday":0,
                "no_of_consecutive_offs":doctor_input_details[doctor]["no_of_consecutive_offs"], #take previous
                "worked_last_shift":doctor_input_details[doctor]["worked_last_shift"], #take previous
                "off_requested":doctor_input_details[doctor]["off_dates"],
                "no_of_leaves":doctor_input_details[doctor]["no_of_leaves"]
            }
    return docs_info

def initialise_docs_info_histroy(num_days,teams, second_half=False):
    """
    Initialize a historical tracking structure for doc_info.

    This function creates a nested dictionary to store daily doc_info
    for each doctor over a specified number of days in the 
    scheduling month. Each doctor has a dictionary(to store doc_info) for each day and their shifts.

    Args:
        num_days (int): The number of days in the scheduling month.
        teams (list of list of str): A 2D list where each inner list represents a team, 
                                     and each element in the inner list is a doctor's name.

    Returns:
        dict: A dictionary where each key is a doctor's name, and the value is another 
              dictionary with keys representing the days of the month (0-indexed). 
              Each day's value is an empty dictionary, ready to store information.

    Example:
        num_days = 30
        teams = [["Dr. Smith", "Dr. Jones"], ["Dr. Patel", "Dr. Lee"]]

        docs_info_history = initialise_docs_info_history(num_days, teams)

        # Result:
        # {
        #     "Dr. Smith": {
        #         0: {},
        #         1: {},
        #         ...
        #         29: {}
        #     },
        #     "Dr. Jones": {
        #         0: {},
        #         1: {},
        #         ...
        #         29: {}
        #     },
        #     ...
        # }
    """
    docs_info_history={}
    for team in teams:
        for doctor in team:
            docs_info_history[doctor]={}
            for day in range(15*second_half,num_days+(15*second_half)):
                docs_info_history[doctor][day]={}
    return docs_info_history

def check_eligible(doc_info, day, shift, scheduling_month, scheduling_year,weekend_relaxation=False,verbose=0):

    if doc_info["worked_last_shift"] == True:
        if verbose==1:
            print("worked last shift")
        return False

    # Check the total number of shifts
    if doc_info["total_no_of_shifts"] >= 19:
        if verbose==1:
            print("worked 19 shifts already")
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

    # If it's a day shift, check day shift limits
    elif shift == "day":
        if doc_info["no_of_day_shifts"] >= 10:
            if verbose ==1:
                print("Already worked 10 day shifts")
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

def check_compulsory(doc_info, date, shift, scheduling_month, scheduling_year):
    if check_eligible(doc_info, date, shift, scheduling_month, scheduling_year, weekend_relaxation=True):
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
    if selected_doctor==None:
        sys.exit()
    # print(f"{day+1}, {shift}, {selected_doctor}, {max_pick_score}")
    return selected_doctor

def update_docs_info(selected_doctors,docs_info, docs_info_history,team,day,shift,scheduling_month, scheduling_year):
    for doctor in team:
        docs_info_history[doctor][day][shift] = copy.deepcopy(docs_info[doctor])
        doc_info=docs_info[doctor]
        if doctor in selected_doctors:
            doc_info["total_no_of_shifts"]+=1
            doc_info["no_of_consecutive_working_days"]+=1
            doc_info["no_of_consecutive_offs"]=0
            doc_info["worked_last_shift"]=True

            if shift == "day":
                doc_info["no_of_day_shifts"]+=1
            else:
                doc_info["no_of_night_shifts"]+=1
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

def create_stage_one_roster(teams, doctor_input_details, scheduling_month, num_days, scheduling_year, scheduling_half=1, docs_info=None):
    # scheduling_month, num_days, scheduling_year = get_scheduling_info()
    # scheduling_month, num_days, scheduling_year = (12, 31, 2024)
    roster={}
    second_half=True if scheduling_half==2 else False
    docs_info=docs_info if docs_info else initialise_docs_info(teams,doctor_input_details)
    docs_info_history=initialise_docs_info_histroy(num_days,teams,second_half)
    for day in range((scheduling_half-1)*15,num_days+((scheduling_half-1)*15)):
        temp={}
        for shift in ["day","night"]:
            temp[shift]=[]
            for team in teams:
                eligible_list=[]
                compulsory_list=[]
                for doctor in team:
                    if check_eligible(docs_info[doctor],day,shift,scheduling_month,scheduling_year):
                        eligible_list.append(doctor)
                    if check_compulsory(docs_info[doctor],day,shift,scheduling_month,scheduling_year):
                        compulsory_list.append(doctor)
                if not eligible_list:
                    for doctor in team:
                        if check_eligible(docs_info[doctor],day,shift,scheduling_month,scheduling_year,weekend_relaxation=True):
                            eligible_list.append(doctor)
                if not compulsory_list:
                    if eligible_list:
                        # selected_doctor=random.choice(eligible_list)
                        selected_doctor=pick_doctor(eligible_list,docs_info,day, shift, scheduling_month, scheduling_year)
                        temp[shift].append(selected_doctor)
                        docs_info,docs_info_history=update_docs_info([selected_doctor],docs_info,docs_info_history,team,day,shift,scheduling_month, scheduling_year)
                    else:
                        print(f"{day+1} {shift} {team} no doctor from team was eligible")
                        for doctor in team:
                            print(doctor)
                            check_eligible(docs_info[doctor],day,shift,scheduling_month,scheduling_year,weekend_relaxation=True,verbose=1)
                        return docs_info,docs_info_history,None
                else:
                    temp[shift].extend(compulsory_list)
                    docs_info,docs_info_history=update_docs_info(compulsory_list,docs_info,docs_info_history,team,day,shift,scheduling_month, scheduling_year)
        roster[day]=temp
    return docs_info,docs_info_history,roster
