from stage_one_roster import create_stage_one_roster
from stage_two_roster import create_stage_two_roster
# from utils import create_shift_schedule_excel, dict_to_excel
from utils import get_next_month_scheduling_info

def generate_full_month_roster(scheduling_month, num_days, scheduling_year,teams,doctor_input_details):
    # scheduling_month, num_days, scheduling_year=get_next_month_scheduling_info()
    docs_info,docs_info_history,roster=create_stage_one_roster(teams, doctor_input_details, scheduling_month, num_days, scheduling_year)
    if not roster:
        return None,None
    roster, docs_info=create_stage_two_roster(teams, doctor_input_details, scheduling_month, num_days, scheduling_year,docs_info,docs_info_history,roster)
    if not roster:
        return None,None
    return roster, docs_info

def generate_half_month_roster(teams,doctor_input_details, scheduling_half, scheduling_month, num_days, scheduling_year, docs_info=None):
    #scheduling_half, scheduling_month, num_days, scheduling_year = (1,1,15,2025)#get_next_half_month_info()
    docs_info,docs_info_history,roster=create_stage_one_roster(teams, doctor_input_details, scheduling_month, num_days, scheduling_year, scheduling_half, docs_info)
    if not roster:
        return None,None, None
    # roster, docs_info=create_stage_two_roster(teams, doctor_input_details, scheduling_month, num_days, scheduling_year,docs_info,docs_info_history,roster, scheduling_half)
    return roster, docs_info, docs_info_history

def generate_full_month_roster_half_by_half(scheduling_month, num_days, scheduling_year,teams_first_half, teams_second_half, doctor_input_details):
    # scheduling_month, num_days, scheduling_year=get_next_month_scheduling_info()
    roster_first_half, docs_info, docs_info_history_first_half = generate_half_month_roster(teams_first_half, doctor_input_details, 1, scheduling_month, 15, scheduling_year)
    if not roster_first_half:
        return None,None
    roster_second_half, docs_info, docs_info_history_second_half = generate_half_month_roster(teams_second_half, doctor_input_details, 2, scheduling_month, num_days-15, scheduling_year, docs_info)
    if not roster_second_half:
        return None,None
    roster = {**roster_first_half,**roster_second_half}
    docs_info_history={}
    for i in docs_info_history_first_half:
        temp = {**docs_info_history_first_half[i],**docs_info_history_second_half[i]}
        docs_info_history[i] = temp
    roster, docs_info=create_stage_two_roster(teams_first_half, doctor_input_details, scheduling_month, num_days, scheduling_year,docs_info,docs_info_history,roster)
    if not roster:
        return None,None
    return roster, docs_info


if __name__ =="__main__":
    # main_test()
    # teams_first_half=[
    #     ["Dr. A", "Dr. B", "Dr. C","Dr. D"],
    #     ["Dr. E", "Dr. F", "Dr. G","Dr. H"],
    #     ["Dr. I", "Dr. J", "Dr. K"],
    #     ["Dr. M", "Dr. N", "Dr. O"],
    # ]

    # teams_second_half = [
    #     ["Dr. A", "Dr. B", "Dr. C"],
    #     ["Dr. E", "Dr. F", "Dr. G"],
    #     ["Dr. I", "Dr. J", "Dr. K","Dr. H"],
    #     ["Dr. M", "Dr. N", "Dr. O","Dr. D"],
    # ]

    # teams = [
    #     ["Dr. A", "Dr. B", "Dr. C","Dr. D"],
    #     ["Dr. E", "Dr. F", "Dr. G","Dr. H"],
    #     ["Dr. I", "Dr. J", "Dr. K", "Dr. L"],
    #     ["Dr. M", "Dr. N", "Dr. O", "Dr. P"],
    # ]

    teams_first_half = [
    ["Avinash", "Priya", "Shiva","Shivray Sharan"],
    ["Deepak", "Midhun", "Likhitha", "Ragini"],
    ["Ashique", "Anas", "Balkrishna"],
    ["Satya", "Sharan", "Akhilesh",],
    ]

    teams_second_half = [
    ["Avinash", "Priya", "Shiva"],
    ["Deepak", "Midhun", "Shivray Sharan"],
    ["Ashique", "Anas", "Balkrishna", "Ragini"],
    ["Satya", "Sharan", "Akhilesh", "Likhitha"],
    ]

    doctor_input_details = {
    'Deepak': {
        'no_of_consecutive_working_days': 0,
        'no_of_consecutive_night_shifts': 0,
        'no_of_consecutive_offs': 0,
        'worked_last_shift': False,
        'off_dates': [],
        'no_of_leaves': 0
    },
    'Ashique': {
        'no_of_consecutive_working_days': 0,
        'no_of_consecutive_night_shifts': 0,
        'no_of_consecutive_offs': 0,
        'worked_last_shift': False,
        'off_dates': [],
        'no_of_leaves': 0
    },
    'Avinash': {
        'no_of_consecutive_working_days': 0,
        'no_of_consecutive_night_shifts': 0,
        'no_of_consecutive_offs': 0,
        'worked_last_shift': False,
        'off_dates': [],
        'no_of_leaves': 0
    },
    'Midhun': {
        'no_of_consecutive_working_days': 0,
        'no_of_consecutive_night_shifts': 0,
        'no_of_consecutive_offs': 0,
        'worked_last_shift': False,
        'off_dates': [],
        'no_of_leaves': 0
    },
    'Priya': {
        'no_of_consecutive_working_days': 0,
        'no_of_consecutive_night_shifts': 0,
        'no_of_consecutive_offs': 0,
        'worked_last_shift': False,
        'off_dates': [],
        'no_of_leaves': 0
    },
    'Satya': {
        'no_of_consecutive_working_days': 0,
        'no_of_consecutive_night_shifts': 0,
        'no_of_consecutive_offs': 0,
        'worked_last_shift': False,
        'off_dates': [],
        'no_of_leaves': 0
    },
    'Shiva': {
        'no_of_consecutive_working_days': 0,
        'no_of_consecutive_night_shifts': 0,
        'no_of_consecutive_offs': 0,
        'worked_last_shift': False,
        'off_dates': [],
        'no_of_leaves': 0
    },
    'Sharan': {
        'no_of_consecutive_working_days': 0,
        'no_of_consecutive_night_shifts': 0,
        'no_of_consecutive_offs': 0,
        'worked_last_shift': False,
        'off_dates': [],
        'no_of_leaves': 0
    },
    'Ragini': {
        'no_of_consecutive_working_days': 0,
        'no_of_consecutive_night_shifts': 0,
        'no_of_consecutive_offs': 0,
        'worked_last_shift': False,
        'off_dates': [],
        'no_of_leaves': 0
    },
    'Akhilesh': {
        'no_of_consecutive_working_days': 0,
        'no_of_consecutive_night_shifts': 0,
        'no_of_consecutive_offs': 0,
        'worked_last_shift': False,
        'off_dates': [],
        'no_of_leaves': 0
    },
    'Anas': {
        'no_of_consecutive_working_days': 0,
        'no_of_consecutive_night_shifts': 0,
        'no_of_consecutive_offs': 0,
        'worked_last_shift': False,
        'off_dates': [],
        'no_of_leaves': 0
    },
    'Balkrishna': {
        'no_of_consecutive_working_days': 0,
        'no_of_consecutive_night_shifts': 0,
        'no_of_consecutive_offs': 0,
        'worked_last_shift': False,
        'off_dates': [],
        'no_of_leaves': 0
    },
    'Shivray Sharan': {
        'no_of_consecutive_working_days': 0,
        'no_of_consecutive_night_shifts': 0,
        'no_of_consecutive_offs': 0,
        'worked_last_shift': False,
        'off_dates': [1,2,3,4,5,6,7,8,9,10],
        'no_of_leaves': 10
    },
    'Likhitha': {
        'no_of_consecutive_working_days': 0,
        'no_of_consecutive_night_shifts': 0,
        'no_of_consecutive_offs': 0,
        'worked_last_shift': False,
        'off_dates': [],
        'no_of_leaves': 0
    }
}



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

    # doctor_input_details={
    #                         'Dr. A': {
    #                                 'no_of_consecutive_working_days': 0,
    #                                 'no_of_consecutive_night_shifts': 0, 
    #                                 'no_of_consecutive_offs': 0, 
    #                                 'worked_last_shift': False, 
    #                                 'off_dates': [3, 5, 12, 27], 
    #                                 'no_of_leaves': 1
    #                                 }, 
    #                         'Dr. B': {
    #                                 'no_of_consecutive_working_days': 0, 
    #                                 'no_of_consecutive_night_shifts': 0, 
    #                                 'no_of_consecutive_offs': 0, 
    #                                 'worked_last_shift': False, 
    #                                 'off_dates': [2, 15, 19, 20], 
    #                                 'no_of_leaves': 1
    #                                 }, 
    #                         'Dr. C': {
    #                             'no_of_consecutive_working_days': 0, 
    #                             'no_of_consecutive_night_shifts': 0, 
    #                             'no_of_consecutive_offs': 0, 
    #                             'worked_last_shift': False, 
    #                             'off_dates': [2, 14, 17], 
    #                             'no_of_leaves': 0
    #                             }, 
    #                         'Dr. D': {
    #                             'no_of_consecutive_working_days': 0, 
    #                             'no_of_consecutive_night_shifts': 0, 
    #                             'no_of_consecutive_offs': 0, 
    #                             'worked_last_shift': False, 
    #                             'off_dates': [7, 17], 
    #                             'no_of_leaves': 1
    #                             }, 
    #                         'Dr. E': {
    #                             'no_of_consecutive_working_days': 0, 
    #                             'no_of_consecutive_night_shifts': 0, 
    #                             'no_of_consecutive_offs': 0, 
    #                             'worked_last_shift': False, 
    #                             'off_dates': [3, 9, 14, 20], 
    #                             'no_of_leaves': 0
    #                             }, 
    #                         'Dr. F': {
    #                             'no_of_consecutive_working_days': 0, 
    #                             'no_of_consecutive_night_shifts': 0, 
    #                             'no_of_consecutive_offs': 0, 
    #                             'worked_last_shift': False, 
    #                             'off_dates': [3, 13, 18], 
    #                             'no_of_leaves': 0
    #                             }, 
    #                         'Dr. G': {
    #                             'no_of_consecutive_working_days': 0, 
    #                             'no_of_consecutive_night_shifts': 0,
    #                             'no_of_consecutive_offs': 0, 
    #                             'worked_last_shift': False, 
    #                             'off_dates': [10, 13, 28], 
    #                             'no_of_leaves': 0
    #                             }, 
    #                         'Dr. H': {
    #                             'no_of_consecutive_working_days': 0, 
    #                             'no_of_consecutive_night_shifts': 0, 
    #                             'no_of_consecutive_offs': 0, 
    #                             'worked_last_shift': False, 
    #                             'off_dates': [5, 17, 20], 
    #                             'no_of_leaves': 0
    #                             }, 
    #                         'Dr. I': {
    #                             'no_of_consecutive_working_days': 0, 
    #                             'no_of_consecutive_night_shifts': 0, 
    #                             'no_of_consecutive_offs': 0, 
    #                             'worked_last_shift': False, 
    #                             'off_dates': [10, 18], 
    #                             'no_of_leaves': 0
    #                             }, 
    #                         'Dr. J': {
    #                             'no_of_consecutive_working_days': 0, 
    #                             'no_of_consecutive_night_shifts': 0, 
    #                             'no_of_consecutive_offs': 0, 
    #                             'worked_last_shift': False, 
    #                             'off_dates': [2, 17], 
    #                             'no_of_leaves': 0}, 
    #                         'Dr. K': {
    #                             'no_of_consecutive_working_days': 0, 
    #                             'no_of_consecutive_night_shifts': 0, 
    #                             'no_of_consecutive_offs': 0, 
    #                             'worked_last_shift': False, 
    #                             'off_dates': [13, 23], 
    #                             'no_of_leaves': 0
    #                             }, 
    #                         'Dr. L': {
    #                             'no_of_consecutive_working_days': 0, 
    #                             'no_of_consecutive_night_shifts': 0, 
    #                             'no_of_consecutive_offs': 0, 
    #                             'worked_last_shift': False, 
    #                             'off_dates': [2, 27], 
    #                             'no_of_leaves': 0
    #                             },
    #                         'Dr. M': {
    #                             'no_of_consecutive_working_days': 0, 
    #                             'no_of_consecutive_night_shifts': 0, 
    #                             'no_of_consecutive_offs': 0, 
    #                             'worked_last_shift': False, 
    #                             'off_dates': [4, 12, 20], 
    #                             'no_of_leaves': 0
    #                         }, 
    #                         'Dr. N': {
    #                             'no_of_consecutive_working_days': 0, 
    #                             'no_of_consecutive_night_shifts': 0, 
    #                             'no_of_consecutive_offs': 0, 
    #                             'worked_last_shift': False, 
    #                             'off_dates': [1, 6], 
    #                             'no_of_leaves': 0
    #                             }, 
    #                         'Dr. O': {
    #                             'no_of_consecutive_working_days': 0, 
    #                             'no_of_consecutive_night_shifts': 0, 
    #                             'no_of_consecutive_offs': 0, 
    #                             'worked_last_shift': False, 
    #                             'off_dates': [2, 27], 
    #                             'no_of_leaves': 0
    #                             },
    #                         'Dr. P': {
    #                             'no_of_consecutive_working_days': 0, 
    #                             'no_of_consecutive_night_shifts': 0, 
    #                             'no_of_consecutive_offs': 0, 
    #                             'worked_last_shift': False, 
    #                             'off_dates': [2, 27], 
    #                             'no_of_leaves': 0
    #                             }
    #                     }

    scheduling_month, num_days, scheduling_year=[3,31,2025]

    roster,_=generate_full_month_roster_half_by_half(scheduling_month, num_days, scheduling_year,teams_first_half, teams_second_half, doctor_input_details)
    print(roster)
    # # roster,_=generate_full_month_roster(teams, doctor_input_details)
    # dict_to_excel(_)

    # create_shift_schedule_excel(roster,scheduling_month,scheduling_year)