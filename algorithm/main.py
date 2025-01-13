from stage_one_roster import create_stage_one_roster
from stage_two_roster import create_stage_two_roster
from utils import create_shift_schedule_excel
from utils import get_scheduling_info

def main(teams,off_requests, scheduling_month, num_days, scheduling_year):
    # scheduling_month, num_days, scheduling_year=get_scheduling_info()
    docs_info,docs_info_history,roster=create_stage_one_roster(teams, off_requests,scheduling_month, num_days, scheduling_year)
    if not roster:
        return None
    roster=create_stage_two_roster(teams, off_requests,scheduling_month, num_days, scheduling_year,docs_info,docs_info_history,roster)
    return roster

def main_test():
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
        {"Dr. A": [1, 15, 30]},  

        # # Multiple doctors off for multiple different days
        # {"Dr. A": [1, 2], "Dr. C": [15, 20]},  

        # {
        #     "Dr. A": [1, 2, 3, 4, 10, 15, 20, 25, 26, 27, 28],  # 11 off days, no more than 4 consecutive
        #     "Dr. B": [1, 5, 6, 7, 8, 12, 16, 21, 30],  # 9 off days, no more than 4 consecutive
        #     # "Dr. C": [2, 3, 4, 9, 13, 17, 22, 23, 29],  # 9 off days, no more than 4 consecutive
        #     # "Dr. D": [2, 6, 7, 8, 14, 18, 24, 28],  # 8 off days, no more than 4 consecutive
        #     # "Dr. E": [3, 7, 11, 19, 25],  # 5 off days, no more than 4 consecutive
        #     # "Dr. F": [4, 8, 12, 20, 26],  # 5 off days, no more than 4 consecutive
        #     # "Dr. G": [5, 9, 13, 21, 27],  # 5 off days, no more than 4 consecutive
        #     # "Dr. H": [6, 10, 14, 22, 28],  # 5 off days, no more than 4 consecutive
        # }
 
        # {}
    ]

    months_days_regular = [(1, 31), (2, 28), (3, 31), (4, 30), (5, 31), (6, 30), (7, 31), (8, 31), (9, 30), (10, 31), (11, 30), (12, 31)]
    months_days_leap = [(1, 31), (2, 29), (3, 31), (4, 30), (5, 31), (6, 30), (7, 31), (8, 31), (9, 30), (10, 31), (11, 30), (12, 31)]

    years = [2023, 2024]  # 2023 is a regular year, 2024 is a leap year

    failed_tests = 0

    for year in years:
        for team_config in team_configurations:
            for off_requests in off_request_cases:
                for month, num_days in (months_days_leap if year == 2024 else months_days_regular):
                    try:
                        roster = main(team_config, off_requests, month, num_days, year)
                        if roster is None:
                            print(f"Test failed for {len(team_config)} teams, off requests {off_requests}, month {month}, year {year} (Returned None)")
                            failed_tests += 1
                    except Exception as e:
                        print(f"Test failed for {len(team_config)} teams, off requests {off_requests}, month {month}, year {year} with error: {e}")
                        failed_tests += 1

    if failed_tests == 0:
        print("All test cases passed successfully.")
    else:
        print(f"{failed_tests} test cases failed.")



if __name__ =="__main__":
    # main_test()
    teams=[
        ["Dr. A", "Dr. B", "Dr. C","Dr. D"],
        ["Dr. E", "Dr. F", "Dr. G","Dr. H"],
        ["Dr. I", "Dr. J", "Dr. K","Dr. L"],
        ["Dr. M", "Dr. N", "Dr. O","Dr. P", "extra"],
    ]

    off_requests={
                #   "Dr. A": [3, 4, 5],
                #   "Dr. B": [13, 14, 15],
                #   "Dr. C": [25, 26, 27],
                #   "Dr. D": [10,11,24,25],
                #   "Dr. E": [1,2,3],
                #   "Dr. F": [25,26,27],
                #   "Dr. G": [14,19,20],
                #   "Dr. H": [29,30,31],
                #   "Dr. I": [13,14,15],
                #   "Dr. J": [10,11,12],
                #   "Dr. K": [29, 30, 31],
                #   "Dr. L": [12,13,14],
                #   "Dr. M": [5,6,7],
                #   "Dr. N": [1,15,20],
                #   "Dr. O": [2, 9, 24],
                #   "Dr. P": [6,13,27]
                "extra" : {
                            "off_dates":[1,2,3,4,5,6,7,8,9],
                            "no_of_leaves":9
                        }
                  }

    scheduling_month, num_days, scheduling_year=get_scheduling_info()

    roster=main(teams,off_requests, scheduling_month, num_days, scheduling_year)

    create_shift_schedule_excel(roster,scheduling_month,scheduling_year)