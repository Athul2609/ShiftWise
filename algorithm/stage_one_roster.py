import random
import sys
import copy


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

def check_eligible(doc_info, day, shift, scheduling_month, scheduling_year,weekend_relaxation=False):

    if doc_info["worked_last_shift"] == True:
        return False

    # Check the total number of shifts
    if doc_info["total_no_of_shifts"] >= 19:
        return False

    # Check consecutive working days
    if doc_info["no_of_consecutive_working_days"] >= 5:
        return False

    # If it's a night shift, check night shift limits
    if shift == "night":
        if doc_info["no_of_consecutive_night_shifts"] >= 2:
            return False
        if doc_info["no_of_night_shifts"] >= 10:
            return False

    # If it's a day shift, check day shift limits
    elif shift == "day":
        if doc_info["no_of_day_shifts"] >= 10:
            return False

    if day in doc_info["off_requested"]:
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

    pick_score+=len(doc_info["off_requested"])-(doc_info["no_of_leaves"]/2)

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
                        return docs_info,docs_info_history,None
                else:
                    temp[shift].extend(compulsory_list)
                    docs_info,docs_info_history=update_docs_info(compulsory_list,docs_info,docs_info_history,team,day,shift,scheduling_month, scheduling_year)
        roster[day]=temp
    return docs_info,docs_info_history,roster

def stage_one_roster_test():
    # Possible configurations for teams
    team_configurations = [
        [
            ["Dr. A", "Dr. B", "Dr. C","Dr. D"],
            ["Dr. E", "Dr. F", "Dr. G","Dr. H"],
            ["Dr. I", "Dr. J", "Dr. K","Dr. L"],
            ["Dr. M", "Dr. N", "Dr. O","Dr. P"],
        ],
    ]

    # Test data for various types of off requests
    off_request_cases = [
        # # Single doctor off for one day
        # {"Dr. A": [1]},  

        # # Multiple doctors off for the same day
        # {"Dr. A": [1], "Dr. B": [1]},  

        # # Single doctor off for multiple days
        # {"Dr. A": [1, 15, 30]},  

        # # Multiple doctors off for multiple different days
        # {"Dr. A": [1, 2], "Dr. C": [15, 20]},  

        {
            "Dr. A": [1, 2, 3, 4, 10, 15, 20, 25, 26, 27, 28],  # 11 off days, no more than 4 consecutive
            "Dr. B": [1, 5, 6, 7, 8, 12, 16, 21, 30],  # 9 off days, no more than 4 consecutive
            # "Dr. C": [2, 3, 4, 9, 13, 17, 22, 23, 29],  # 9 off days, no more than 4 consecutive
            # "Dr. D": [2, 6, 7, 8, 14, 18, 24, 28],  # 8 off days, no more than 4 consecutive
            # "Dr. E": [3, 7, 11, 19, 25],  # 5 off days, no more than 4 consecutive
            # "Dr. F": [4, 8, 12, 20, 26],  # 5 off days, no more than 4 consecutive
            # "Dr. G": [5, 9, 13, 21, 27],  # 5 off days, no more than 4 consecutive
            # "Dr. H": [6, 10, 14, 22, 28],  # 5 off days, no more than 4 consecutive
        }

        # Edge case: doctor off for every day of the month
        # {"Dr. A": list(range(1, 32))},  
    ]

    # Months of a regular year and leap year
    months_days_regular = [(1, 31), (2, 28), (3, 31), (4, 30), (5, 31), (6, 30), (7, 31), (8, 31), (9, 30), (10, 31), (11, 30), (12, 31)]
    months_days_leap = [(1, 31), (2, 29), (3, 31), (4, 30), (5, 31), (6, 30), (7, 31), (8, 31), (9, 30), (10, 31), (11, 30), (12, 31)]

    # Test both regular and leap years
    years = [2023, 2024]  # 2023 is a regular year, 2024 is a leap year

    failed_tests = 0

    # Run tests for all combinations of team configurations, off requests, and months in each year
    for year in years:
        for team_config in team_configurations:
            for off_requests in off_request_cases:
                for month, num_days in (months_days_leap if year == 2024 else months_days_regular):
                    try:
                        # Generate the roster for each combination
                        docs_info,docs_info_history,roster = create_stage_one_roster(team_config, off_requests, month, num_days, year)
                        if roster is None:
                            print(f"Test failed for {len(team_config)} teams, off requests {off_requests}, month {month}, year {year} (Returned None)")
                            failed_tests += 1
                    except Exception as e:
                        print(f"Test failed for {len(team_config)} teams, off requests {off_requests}, month {month}, year {year} with error: {e}")
                        failed_tests += 1

    # Summary of test results
    if failed_tests == 0:
        print("All test cases passed successfully.")
    else:
        print(f"{failed_tests} test cases failed.")


if __name__ == "__main__":
    stage_one_roster_test()