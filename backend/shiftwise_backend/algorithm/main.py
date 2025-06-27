from stage_one_roster import create_stage_one_roster
from stage_two_roster import create_stage_two_roster
# from utils import create_shift_schedule_excel, dict_to_excel
from utils import get_next_month_scheduling_info
from roster_check import check

def generate_roster(scheduling_month,scheduling_year,start_date,end_date,teams,doctor_input_details):
    """
    start_date and end_date are both starting from 1, so they represent the true date not starting from 0
    """
    docs_info,docs_info_history, roster=create_stage_one_roster(teams, doctor_input_details, scheduling_month, scheduling_year, start_date, end_date)
    roster, docs_info=create_stage_two_roster(teams, doctor_input_details, scheduling_month, start_date, end_date, scheduling_year, docs_info, docs_info_history, roster)
    return roster, docs_info

def check_roster(roster, teams, doctor_input_details, scheduling_month, scheduling_year, start_date, end_date):
    message, docs_info=check(roster, teams, doctor_input_details, scheduling_month, scheduling_year, start_date, end_date)
    return message, docs_info

if __name__ =="__main__":
    team_sample = [['Dr. A', 'Dr E'], ['Dr. C'], ['Dr. B'], ['Dr. D']]
    doctor_input_details = {'Dr. C': {'total_no_of_shifts': 0, 'no_of_night_shifts': 0, 'no_of_day_shifts': 0, 'no_of_working_sundays': 0, 'no_of_working_saturday': 0, 'no_of_leaves': 0, 'period_no_of_leaves': 0, 'no_of_consecutive_working_days': 1, 'no_of_consecutive_night_shifts': 0, 'no_of_consecutive_offs': 0, 'worked_last_shift': False, 'off_requested': [], 'dependent': False, 'dep_start': 0, 'dep_end': 0}, 'Dr. D': {'total_no_of_shifts': 0, 'no_of_night_shifts': 0, 'no_of_day_shifts': 0, 'no_of_working_sundays': 0, 'no_of_working_saturday': 0, 'no_of_leaves': 0, 'period_no_of_leaves': 0, 'no_of_consecutive_working_days': 1, 'no_of_consecutive_night_shifts': 1, 'no_of_consecutive_offs': 0, 'worked_last_shift': True, 'off_requested': [], 'dependent': False, 'dep_start': 0, 'dep_end': 0}, 'Dr. A': {'total_no_of_shifts': 7, 'no_of_night_shifts': 3, 'no_of_day_shifts': 4, 'no_of_working_sundays': 1, 'no_of_working_saturday': 1, 'no_of_leaves': 0, 'period_no_of_leaves': 0, 'no_of_consecutive_working_days': 0, 'no_of_consecutive_night_shifts': 0, 'no_of_consecutive_offs': 2, 'worked_last_shift': False, 'off_requested': [], 'dependent': False, 'dep_start': 0, 'dep_end': 0}, 'Dr. B': {'total_no_of_shifts': 7, 'no_of_night_shifts': 3, 'no_of_day_shifts': 4, 'no_of_working_sundays': 0, 'no_of_working_saturday': 1, 'no_of_leaves': 0, 'period_no_of_leaves': 0, 'no_of_consecutive_working_days': 0, 'no_of_consecutive_night_shifts': 0, 'no_of_consecutive_offs': 2, 'worked_last_shift': False, 'off_requested': [], 'dependent': False, 'dep_start': 0, 'dep_end': 0}}

    # roster={1: {'day': ['A'], 'night': ['B']}, 2: {'day': ['C', 'E'], 'night': ['D', 'B']}, 3: {'day': ['E'], 'night': ['A', 'D']}, 4: {'day': ['B'], 'night': ['C']}, 5: {'day': ['D', 'A'], 'night': ['E']}, 6: {'day': ['A'], 'night': ['B', 'D']}, 7: {'day': ['C', 'A', 'E'], 'night': ['D']}, 8: {'day': ['E'], 'night': ['A']}, 9: {'day': ['B', 'C'], 'night': ['C']}, 10: {'day': ['D'], 'night': ['E', 'B', 'C']}}
    # roster,_ =generate_roster(6,2025,23,30,team_sample,doctor_input_details)
    # print(roster)
    roster={23: {'day': ['Dr. C', 'Dr. A'], 'night': ['Dr. D', 'Dr. B', 'Dr. A']}, 24: {'day': ['Dr. C', 'Dr. A'], 'night': ['Dr. B']}, 25: {'day': ['Dr. A'], 'night': ['Dr. C']}, 26: {'day': ['Dr. D', 'Dr. B'], 'night': ['Dr. C', 'Dr. A']}, 27: {'day': ['Dr. D'], 'night': ['Dr. B', 'Dr. A']}, 28: {'day': ['Dr. C'], 'night': ['Dr. D']}, 29: {'day': ['Dr. B'], 'night': ['Dr. C', 'Dr. A']}, 30: {'day': ['Dr. B'], 'night': ['Dr. D']}}
    print(check_roster(roster,team_sample,doctor_input_details,6,2025,23,3020 ))

    # print(roster)
    # roster,_ =generate_roster(3,2025,6,10,team_sample,_)

    # print(roster)
    # roster,_ =generate_roster(3,2025,11,15,team_sample,_)

    # print(roster)

    # roster,_ =generate_roster(3,2025,16,22,team_sample,_)

    # print(roster)
    # roster,_ =generate_roster(3,2025,23,31,team_sample,_)
    # print(roster)
    # print(_)
