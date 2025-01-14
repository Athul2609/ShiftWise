from stage_one_roster import create_stage_one_roster
from stage_two_roster import create_stage_two_roster
from utils import create_shift_schedule_excel
from utils import get_next_month_scheduling_info

def generate_full_month_roster(teams,doctor_input_details):
    scheduling_month, num_days, scheduling_year=get_next_month_scheduling_info()
    docs_info,docs_info_history,roster=create_stage_one_roster(teams, doctor_input_details, scheduling_month, num_days, scheduling_year)
    if not roster:
        return None
    roster, docs_info=create_stage_two_roster(teams, doctor_input_details, scheduling_month, num_days, scheduling_year,docs_info,docs_info_history,roster)
    return roster

def generate_half_month_roster(teams,doctor_input_details, scheduling_half, scheduling_month, num_days, scheduling_year, docs_info=None):
    #scheduling_half, scheduling_month, num_days, scheduling_year = (1,1,15,2025)#get_next_half_month_info()
    docs_info,docs_info_history,roster=create_stage_one_roster(teams, doctor_input_details, scheduling_month, num_days, scheduling_year, scheduling_half, docs_info)
    if not roster:
        return None
    roster, docs_info=create_stage_two_roster(teams, doctor_input_details, scheduling_month, num_days, scheduling_year,docs_info,docs_info_history,roster, scheduling_half)
    return roster, docs_info

def generate_full_month_roster_half_by_half(teams_first_half, teams_second_half, doctor_input_details):
    scheduling_month, num_days, scheduling_year=get_next_month_scheduling_info()
    roster_first_half, docs_info = generate_half_month_roster(teams_first_half, doctor_input_details, 1, scheduling_month, 15, scheduling_year)
    roster_second_half, docs_info = generate_half_month_roster(teams_second_half, doctor_input_details, 2, scheduling_month, num_days-15, scheduling_year, docs_info)
    return {**roster_first_half,**roster_second_half}


# def main_test():
#     # Possible configurations for teams
#     team_configurations = [
#         [
#             ["Dr. A", "Dr. B", "Dr. C","Dr. D"],
#             ["Dr. E", "Dr. F", "Dr. G","Dr. H"],
#             ["Dr. I", "Dr. J", "Dr. K","Dr. L"],
#             ["Dr. M", "Dr. N", "Dr. O","Dr. P"],
#         ],
#     ]

#     # Test data for various types of off requests
#     off_request_cases = [
#         # # Single doctor off for one day
#         # {"Dr. A": [1]},  

#         # # Multiple doctors off for the same day
#         # {"Dr. A": [1], "Dr. B": [1]},  

#         # # Single doctor off for multiple days
#         {"Dr. A": [1, 15, 30]},  

#         # # Multiple doctors off for multiple different days
#         # {"Dr. A": [1, 2], "Dr. C": [15, 20]},  

#         # {
#         #     "Dr. A": [1, 2, 3, 4, 10, 15, 20, 25, 26, 27, 28],  # 11 off days, no more than 4 consecutive
#         #     "Dr. B": [1, 5, 6, 7, 8, 12, 16, 21, 30],  # 9 off days, no more than 4 consecutive
#         #     # "Dr. C": [2, 3, 4, 9, 13, 17, 22, 23, 29],  # 9 off days, no more than 4 consecutive
#         #     # "Dr. D": [2, 6, 7, 8, 14, 18, 24, 28],  # 8 off days, no more than 4 consecutive
#         #     # "Dr. E": [3, 7, 11, 19, 25],  # 5 off days, no more than 4 consecutive
#         #     # "Dr. F": [4, 8, 12, 20, 26],  # 5 off days, no more than 4 consecutive
#         #     # "Dr. G": [5, 9, 13, 21, 27],  # 5 off days, no more than 4 consecutive
#         #     # "Dr. H": [6, 10, 14, 22, 28],  # 5 off days, no more than 4 consecutive
#         # }
 
#         # {}
#     ]

#     months_days_regular = [(1, 31), (2, 28), (3, 31), (4, 30), (5, 31), (6, 30), (7, 31), (8, 31), (9, 30), (10, 31), (11, 30), (12, 31)]
#     months_days_leap = [(1, 31), (2, 29), (3, 31), (4, 30), (5, 31), (6, 30), (7, 31), (8, 31), (9, 30), (10, 31), (11, 30), (12, 31)]

#     years = [2023, 2024]  # 2023 is a regular year, 2024 is a leap year

#     failed_tests = 0

#     for year in years:
#         for team_config in team_configurations:
#             for off_requests in off_request_cases:
#                 for month, num_days in (months_days_leap if year == 2024 else months_days_regular):
#                     try:
#                         roster = main(team_config, off_requests, month, num_days, year)
#                         if roster is None:
#                             print(f"Test failed for {len(team_config)} teams, off requests {off_requests}, month {month}, year {year} (Returned None)")
#                             failed_tests += 1
#                     except Exception as e:
#                         print(f"Test failed for {len(team_config)} teams, off requests {off_requests}, month {month}, year {year} with error: {e}")
#                         failed_tests += 1

#     if failed_tests == 0:
#         print("All test cases passed successfully.")
#     else:
#         print(f"{failed_tests} test cases failed.")



if __name__ =="__main__":
    # main_test()
    teams_first_half=[
        ["Dr. A", "Dr. B", "Dr. C","Dr. D"],
        ["Dr. E", "Dr. F", "Dr. G","Dr. H"],
        ["Dr. I", "Dr. J", "Dr. K"],
        ["Dr. M", "Dr. N", "Dr. O"],
    ]

    teams_second_half = [
        ["Dr. A", "Dr. B", "Dr. C"],
        ["Dr. E", "Dr. F", "Dr. G"],
        ["Dr. I", "Dr. J", "Dr. K","Dr. H"],
        ["Dr. M", "Dr. N", "Dr. O","Dr. D"],
    ]

    teams = [
        ["Dr. A", "Dr. B", "Dr. C","Dr. D"],
        ["Dr. E", "Dr. F", "Dr. G","Dr. H"],
        ["Dr. I", "Dr. J", "Dr. K", "Dr. L"],
        ["Dr. M", "Dr. N", "Dr. O", "Dr. P"],
    ]

    # doctor_input_details={
    #             #   "Dr. A": [3, 4, 5],
    #             #   "Dr. B": [13, 14, 15],
    #             #   "Dr. C": [25, 26, 27],
    #             #   "Dr. D": [10,11,24,25],
    #             #   "Dr. E": [1,2,3],
    #             #   "Dr. F": [25,26,27],
    #             #   "Dr. G": [14,19,20],
    #             #   "Dr. H": [29,30,31],
    #             #   "Dr. I": [13,14,15],
    #             #   "Dr. J": [10,11,12],
    #             #   "Dr. K": [29, 30, 31],
    #             #   "Dr. L": [12,13,14],
    #             #   "Dr. M": [5,6,7],
    #             #   "Dr. N": [1,15,20],
    #             #   "Dr. O": [2, 9, 24],
    #             #   "Dr. P": [6,13,27]
    #             "extra" : {
    #                         "off_dates":[1,2,3,4,5,6,7,8,9],
    #                         "no_of_leaves":9
    #                     }
    #               }

    doctor_input_details={
                            'Dr. A': {
                                    'no_of_consecutive_working_days': 0,
                                    'no_of_consecutive_night_shifts': 0, 
                                    'no_of_consecutive_offs': 0, 
                                    'worked_last_shift': False, 
                                    'off_dates': [3, 5, 12, 27], 
                                    'no_of_leaves': 1
                                    }, 
                            'Dr. B': {
                                    'no_of_consecutive_working_days': 0, 
                                    'no_of_consecutive_night_shifts': 0, 
                                    'no_of_consecutive_offs': 0, 
                                    'worked_last_shift': False, 
                                    'off_dates': [2, 15, 19, 20], 
                                    'no_of_leaves': 1
                                    }, 
                            'Dr. C': {
                                'no_of_consecutive_working_days': 0, 
                                'no_of_consecutive_night_shifts': 0, 
                                'no_of_consecutive_offs': 0, 
                                'worked_last_shift': False, 
                                'off_dates': [2, 14, 17], 
                                'no_of_leaves': 0
                                }, 
                            'Dr. D': {
                                'no_of_consecutive_working_days': 0, 
                                'no_of_consecutive_night_shifts': 0, 
                                'no_of_consecutive_offs': 0, 
                                'worked_last_shift': False, 
                                'off_dates': [7, 17], 
                                'no_of_leaves': 1
                                }, 
                            'Dr. E': {
                                'no_of_consecutive_working_days': 0, 
                                'no_of_consecutive_night_shifts': 0, 
                                'no_of_consecutive_offs': 0, 
                                'worked_last_shift': False, 
                                'off_dates': [3, 9, 14, 20], 
                                'no_of_leaves': 0
                                }, 
                            'Dr. F': {
                                'no_of_consecutive_working_days': 0, 
                                'no_of_consecutive_night_shifts': 0, 
                                'no_of_consecutive_offs': 0, 
                                'worked_last_shift': False, 
                                'off_dates': [3, 13, 18], 
                                'no_of_leaves': 0
                                }, 
                            'Dr. G': {
                                'no_of_consecutive_working_days': 0, 
                                'no_of_consecutive_night_shifts': 0,
                                'no_of_consecutive_offs': 0, 
                                'worked_last_shift': False, 
                                'off_dates': [10, 13, 28], 
                                'no_of_leaves': 0
                                }, 
                            'Dr. H': {
                                'no_of_consecutive_working_days': 0, 
                                'no_of_consecutive_night_shifts': 0, 
                                'no_of_consecutive_offs': 0, 
                                'worked_last_shift': False, 
                                'off_dates': [5, 17, 20], 
                                'no_of_leaves': 0
                                }, 
                            'Dr. I': {
                                'no_of_consecutive_working_days': 0, 
                                'no_of_consecutive_night_shifts': 0, 
                                'no_of_consecutive_offs': 0, 
                                'worked_last_shift': False, 
                                'off_dates': [10, 18], 
                                'no_of_leaves': 0
                                }, 
                            'Dr. J': {
                                'no_of_consecutive_working_days': 0, 
                                'no_of_consecutive_night_shifts': 0, 
                                'no_of_consecutive_offs': 0, 
                                'worked_last_shift': False, 
                                'off_dates': [2, 17], 
                                'no_of_leaves': 0}, 
                            'Dr. K': {
                                'no_of_consecutive_working_days': 0, 
                                'no_of_consecutive_night_shifts': 0, 
                                'no_of_consecutive_offs': 0, 
                                'worked_last_shift': False, 
                                'off_dates': [13, 23], 
                                'no_of_leaves': 0
                                }, 
                            'Dr. L': {
                                'no_of_consecutive_working_days': 0, 
                                'no_of_consecutive_night_shifts': 0, 
                                'no_of_consecutive_offs': 0, 
                                'worked_last_shift': False, 
                                'off_dates': [2, 27], 
                                'no_of_leaves': 0
                                },
                            'Dr. M': {
                                'no_of_consecutive_working_days': 0, 
                                'no_of_consecutive_night_shifts': 0, 
                                'no_of_consecutive_offs': 0, 
                                'worked_last_shift': False, 
                                'off_dates': [4, 12, 20], 
                                'no_of_leaves': 0
                            }, 
                            'Dr. N': {
                                'no_of_consecutive_working_days': 0, 
                                'no_of_consecutive_night_shifts': 0, 
                                'no_of_consecutive_offs': 0, 
                                'worked_last_shift': False, 
                                'off_dates': [1, 6], 
                                'no_of_leaves': 0
                                }, 
                            'Dr. O': {
                                'no_of_consecutive_working_days': 0, 
                                'no_of_consecutive_night_shifts': 0, 
                                'no_of_consecutive_offs': 0, 
                                'worked_last_shift': False, 
                                'off_dates': [2, 27], 
                                'no_of_leaves': 0
                                },
                            'Dr. P': {
                                'no_of_consecutive_working_days': 0, 
                                'no_of_consecutive_night_shifts': 0, 
                                'no_of_consecutive_offs': 0, 
                                'worked_last_shift': False, 
                                'off_dates': [2, 27], 
                                'no_of_leaves': 0
                                }
                        }

    scheduling_month, num_days, scheduling_year=get_next_month_scheduling_info()

    # roster=generate_full_month_roster_half_by_half(teams_first_half, teams_second_half, doctor_input_details)

    roster=generate_full_month_roster(teams, doctor_input_details)

    create_shift_schedule_excel(roster,scheduling_month,scheduling_year)