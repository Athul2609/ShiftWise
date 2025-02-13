from stage_one_roster import *
import math

def verify_min_shift_criteria(doc_info, scheduling_half):
    no_of_leaves = doc_info["no_of_leaves"]
    min_criteria=17 if scheduling_half != 1 else 9
    if no_of_leaves>2:
        reduction=math.ceil(no_of_leaves/2)-1
        min_criteria-=reduction
    if(doc_info["total_no_of_shifts"]<min_criteria):
        return False
    return True

def generate_working_options(doctor,doc_info_history,doc_info,roster,scheduling_month,scheduling_year,num_days):
    # an array of possible shifts in format [day,shift]
    working_options=[]
    for day in doc_info_history:
        for shift in doc_info_history[day]:
            if doctor not in roster[day][shift]:
                modified_doc_info={
                    "total_no_of_shifts":doc_info["total_no_of_shifts"],
                    "no_of_consecutive_working_days":doc_info_history[day][shift]["no_of_consecutive_working_days"],
                    "no_of_consecutive_night_shifts":doc_info_history[day][shift]["no_of_consecutive_night_shifts"],
                    "no_of_night_shifts":doc_info["no_of_night_shifts"],
                    "no_of_day_shifts":doc_info["no_of_day_shifts"],
                    "no_of_working_sundays":doc_info["no_of_working_sundays"],
                    "no_of_working_saturday":doc_info["no_of_working_saturday"],
                    "no_of_consecutive_offs":doc_info_history[day][shift]["no_of_consecutive_offs"],
                    "worked_last_shift":doc_info_history[day][shift]["worked_last_shift"],
                    "off_requested":doc_info["off_requested"],
                    "no_of_leaves":doc_info["no_of_leaves"]
                }
                if check_eligible(modified_doc_info,day,shift,scheduling_month,scheduling_year) and check_eligible_future(modified_doc_info,doc_info_history,day,shift,num_days):
                    working_options.append([day,shift])
    return working_options

def second_stage_update_doc_info(doctor,docs_info,docs_info_history,day,shift,scheduling_month, scheduling_year, num_days):
    doc_info=docs_info[doctor]

    next_shift_day,next_shift_shift=get_next_shift(day,shift,num_days)
    if(next_shift_day!=-1):
        doc_info_histroy=docs_info_history[doctor][next_shift_day][next_shift_shift] 
        doc_info_histroy["worked_last_shift"]=True

        doc_info_histroy["no_of_consecutive_working_days"]+=1
        temp_day,temp_shift=get_next_shift(next_shift_day,next_shift_shift,num_days)
        while temp_day!=-1 and docs_info_history[doctor][temp_day][temp_shift]["no_of_consecutive_working_days"]!=0:
            docs_info_history[doctor][temp_day][temp_shift]["no_of_consecutive_working_days"]+=1
            temp_day,temp_shift=get_next_shift(next_shift_day,next_shift_shift,num_days)
        doc_info_histroy["no_of_consecutive_offs"]=0 # not really used so don't bother
    doc_info["total_no_of_shifts"]+=1



    if shift == "day":
        doc_info["no_of_day_shifts"]+=1
    else:
        doc_info["no_of_night_shifts"]+=1
        if(next_shift_day!=-1):
            doc_info_histroy["no_of_consecutive_night_shifts"]+=1
            temp_day,temp_shift=get_next_shift(next_shift_day,next_shift_shift,num_days)
            while temp_day!=-1 and docs_info_history[doctor][temp_day][temp_shift]["no_of_consecutive_night_shifts"]!=0:
                docs_info_history[doctor][temp_day][temp_shift]["no_of_consecutive_night_shifts"]+=1
                temp_day,temp_shift=get_next_shift(next_shift_day,next_shift_shift,num_days)
    if is_sunday(day,scheduling_month,scheduling_year):
        doc_info["no_of_working_sundays"]+=1

    if is_saturday(day,scheduling_month,scheduling_year):
        doc_info["no_of_working_saturday"]+=1
    docs_info[doctor]=doc_info
    return docs_info,docs_info_history

def check_eligible_future(doc_info,doc_info_history ,day, shift, num_days):
    next_to_next_shift_day,next_to_next_shift_shift=get_next_shift(day,shift,num_days,step=2)
    if next_to_next_shift_day != -1 and doc_info_history[next_to_next_shift_day][next_to_next_shift_shift]["worked_last_shift"] == True:
        return False

    # Check consecutive working days
    five_days_ahead_day,five_days_ahead_shift=get_next_shift(day+1,"day",num_days,step=10)
    if five_days_ahead_day!=-1 and doc_info_history[five_days_ahead_day][five_days_ahead_shift]==5:
        return False
    # if night shift check consecutive night shift
    if shift=="night":
        if day+3<num_days and doc_info_history[day+3]["night"]==2:
            return False
    return True

def create_stage_two_roster(teams, off_requests,scheduling_month, num_days, scheduling_year,docs_info,docs_info_history,roster, scheduling_half=0):
    # backtracking to meet minimum work requirements
    dates_with_extra_doctor={}
    while True:
        doc_working_options={}
        for team in teams:
            for doctor in team:
                if not verify_min_shift_criteria(docs_info[doctor], scheduling_half):
                    doc_working_options[doctor]=generate_working_options(doctor,docs_info_history[doctor],docs_info[doctor],roster,scheduling_month,scheduling_year,num_days)
        doc_working_options = dict(sorted(doc_working_options.items(), key=lambda item: len(item[1])))
        for doctor in doc_working_options:
            number_of_rep=0
            while True:
                number_of_rep+=1
                dates_with_extra_doctor[number_of_rep]=[]
                option_set=[]
                for i in doc_working_options[doctor]:
                    if i not in dates_with_extra_doctor[number_of_rep]:
                        option_set.append(i)
                if option_set:
                    chosen_shift=random.choice(option_set)
                    roster[chosen_shift[0]][chosen_shift[1]].append(doctor)
                    dates_with_extra_doctor[number_of_rep].append(chosen_shift)
                    docs_info,docs_info_history=second_stage_update_doc_info(doctor,docs_info,docs_info_history,chosen_shift[0],chosen_shift[1],scheduling_month, scheduling_year, num_days)
                    break
        if not doc_working_options:
            break
    return roster, docs_info
