from stage_one_roster import create_stage_one_roster
from stage_two_roster import create_stage_two_roster
# from utils import create_shift_schedule_excel, dict_to_excel
from utils import get_next_month_scheduling_info

def generate_roster(scheduling_month,scheduling_year,start_date,end_date,teams,doctor_input_details):
    """
    start_date and end_date are both starting from 1, so they represent the true date not starting from 0
    """
    docs_info,docs_info_history, roster=create_stage_one_roster(teams, doctor_input_details, scheduling_month, scheduling_year, start_date, end_date)
    roster, docs_info=create_stage_two_roster(teams, doctor_input_details, scheduling_month, start_date, end_date, scheduling_year, docs_info, docs_info_history, roster)
    print(roster)
    return roster, docs_info

if __name__ =="__main__":

    team_sample = [["A","B","C","D","E"]]
    doctor_input_details = {
        'A': {
                "total_no_of_shifts":0,
                "no_of_night_shifts":0,
                "no_of_day_shifts":0,
                "no_of_working_sundays":0,
                "no_of_working_saturday":0,
                "no_of_leaves":0,
                "no_of_consecutive_working_days":0,
                "no_of_consecutive_night_shifts":0, 
                "no_of_consecutive_offs":0, 
                "worked_last_shift":False, 
                "period_no_of_shifts":0,
                "period_no_of_day_shifts":0,
                "period_no_of_night_shifts":0,
                "off_requested":[],
                "period_no_of_leaves":0,
                "dependent":False,
                "dep_start":0,
                "dep_end":0,
        },
        'B': {
            "total_no_of_shifts":0,
                "period_no_of_shifts":0,
                "no_of_consecutive_working_days":0,
                "no_of_consecutive_night_shifts":0, 
                "no_of_night_shifts":0,
                "period_no_of_night_shifts":0,
                "no_of_day_shifts":0,
                "period_no_of_day_shifts":0,
                "no_of_working_sundays":0,
                "no_of_working_saturday":0,
                "no_of_consecutive_offs":0, 
                "worked_last_shift":False, 
                "off_requested":[],
                "no_of_leaves":0,
                "period_no_of_leaves":0,
                "dependent":False,
                "dep_start":0,
                "dep_end":0,
        },
        'C': {
                "total_no_of_shifts":0,
                "period_no_of_shifts":0,
                "no_of_consecutive_working_days":0,
                "no_of_consecutive_night_shifts":0, 
                "no_of_night_shifts":0,
                "period_no_of_night_shifts":0,
                "no_of_day_shifts":0,
                "period_no_of_day_shifts":0,
                "no_of_working_sundays":0,
                "no_of_working_saturday":0,
                "no_of_consecutive_offs":0, 
                "worked_last_shift":False, 
                "off_requested":[],
                "no_of_leaves":0,
                "period_no_of_leaves":0,
                "dependent":False,
                "dep_start":0,
                "dep_end":0,
        },
        'D': {
            "total_no_of_shifts":0,
                "period_no_of_shifts":0,
                "no_of_consecutive_working_days":0,
                "no_of_consecutive_night_shifts":0, 
                "no_of_night_shifts":0,
                "period_no_of_night_shifts":0,
                "no_of_day_shifts":0,
                "period_no_of_day_shifts":0,
                "no_of_working_sundays":0,
                "no_of_working_saturday":0,
                "no_of_consecutive_offs":0, 
                "worked_last_shift":False, 
                "off_requested":[],
                "no_of_leaves":0,
                "period_no_of_leaves":0,
                "dependent":False,
                "dep_start":0,
                "dep_end":0,
        },
        'E': {
            "total_no_of_shifts":0,
                "period_no_of_shifts":0,
                "no_of_consecutive_working_days":0,
                "no_of_consecutive_night_shifts":0, 
                "no_of_night_shifts":0,
                "period_no_of_night_shifts":0,
                "no_of_day_shifts":0,
                "period_no_of_day_shifts":0,
                "no_of_working_sundays":0,
                "no_of_working_saturday":0,
                "no_of_consecutive_offs":0, 
                "worked_last_shift":False, 
                "off_requested":[],
                "no_of_leaves":0,
                "period_no_of_leaves":0,
                "dependent":False,
                "dep_start":0,
                "dep_end":0,
        },
    }

    roster,_ =generate_roster(4,2025,20,30,team_sample,doctor_input_details)

    print(roster)
    # roster,_ =generate_roster(3,2025,6,10,team_sample,_)

    # print(roster)
    # roster,_ =generate_roster(3,2025,11,15,team_sample,_)

    # print(roster)

    # roster,_ =generate_roster(3,2025,16,22,team_sample,_)

    # print(roster)
    # roster,_ =generate_roster(3,2025,23,31,team_sample,_)
    # print(roster)
    # print(_)
