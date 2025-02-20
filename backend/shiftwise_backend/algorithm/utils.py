import datetime
import calendar
import random
# import pandas as pd
import os

random.seed(12)

def get_next_half_month_info():
    today = datetime.date.today()
    
    if today.month == 12 and today.date > 15:
        scheduling_month = 1
        scheduling_year = today.year + 1
        scheduling_half = 1
    else:
        scheduling_year = today.year
        if today.date < 15:
            scheduling_half=2
            scheduling_month=today.month
        else:
            scheduling_half=1
            scheduling_month = today.month + 1

    # Find the number of days in the scheduling month
    num_days = calendar.monthrange(scheduling_year, scheduling_month)[1]

    if scheduling_half==1:
        num_days=15
    else:
        num_days-=15

    return scheduling_half, scheduling_month, num_days, scheduling_year

def get_next_month_scheduling_info():
    """
    Calculate scheduling information for the next month.

    This function determines the month, year, and number of days 
    in the next calendar month relative to the current date.

    Returns:
        tuple: A tuple containing:
            - scheduling_month (int): The month number of the next month (1 = January, ..., 12 = December).
            - num_days (int): The number of days in the next month.
            - scheduling_year (int): The year of the next month.
    """
    # Get the current date
    today = datetime.date.today()

    # Calculate the next month
    if today.month == 12:
        scheduling_month = 1
        scheduling_year = today.year + 1
    else:
        scheduling_month = today.month + 1
        scheduling_year = today.year

    # Find the number of days in the scheduling month
    num_days = calendar.monthrange(scheduling_year, scheduling_month)[1]

    return scheduling_month, num_days, scheduling_year

def is_saturday(day, scheduling_month, scheduling_year):
    # Create a date object for the given day, month, and year
    date = datetime.date(scheduling_year, scheduling_month, day+1)
    
    # Check if the day is a Saturday
    return date.weekday() == 5  # 5 corresponds to Saturday in Python's weekday() method

def is_sunday(day, scheduling_month, scheduling_year):
    # Create a date object for the given day, month, and year
    date = datetime.date(scheduling_year, scheduling_month, day+1)
    
    # Check if the day is a sunday
    return date.weekday() == 6  # 5 corresponds to sunday in Python's weekday() method

def get_next_shift(day,shift, max_days,step =1):
    for i in range(step):
        if shift == "night":
            day+=1
            shift="day"
        else:
            shift="night"
    if day>=max_days:
        return -1,-1
    return day,shift

# def create_shift_schedule_excel(schedule_data, month, year, output_folder="../outputs"):
#     # Ensure the output folder exists
#     if not os.path.exists(output_folder):
#         os.makedirs(output_folder)

#     # Define the output file name with month and year
#     output_file = os.path.join(output_folder, f"shift_schedule_{month}_{year}.xlsx")
#     dates = []
#     day_shifts = []
#     night_shifts = []
    
#     # Loop through the schedule data
#     for day, shifts in schedule_data.items():
#         # Append date (which is day + 1 to match the date)
#         dates.append(day + 1)
        
#         # Append the list of doctors for day and night shifts
#         day_shifts.append(", ".join(shifts['day']))  # Convert list to string
#         night_shifts.append(", ".join(shifts['night']))  # Convert list to string

#     # Create a DataFrame from the collected data
#     df = pd.DataFrame({
#         'Date': dates,
#         'Day Shift Doctors': day_shifts,
#         'Night Shift Doctors': night_shifts
#     })
    
#     # Save the DataFrame to an Excel file
#     df.to_excel(output_file, index=False)
#     print(f"Shift schedule saved to {output_file}")


# def dict_to_excel(data, filename="shift_data.xlsx"):
    """
    Converts a nested dictionary into a formatted Excel file for user-friendly viewing.
    
    :param data: Dictionary containing shift details per person.
    :param filename: Name of the output Excel file (default: "shift_data.xlsx").
    """
    # Convert dictionary to DataFrame
    df = pd.DataFrame.from_dict(data, orient='index')
    
    # Remove unwanted columns
    print(df)
    columns_to_remove = ["no_of_consecutive_working_days", "no_of_consecutive_night_shifts", "no_of_consecutive_offs", "worked_last_shift", "off_requested", "no_of_leaves"]
    df.drop(columns=columns_to_remove, inplace=True, errors='ignore')
    print(df)
    
    # Convert boolean values to Yes/No for better readability
    df.replace({True: "Yes", False: "No"}, inplace=True)
    
    # Write to Excel with formatting
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name="Shift Data")
        
        # Adjust column width for readability
        workbook = writer.book
        worksheet = writer.sheets["Shift Data"]
        for col in worksheet.columns:
            max_length = 0
            col_letter = col[0].column_letter  # Get column letter
            for cell in col:
                try:
                    max_length = max(max_length, len(str(cell.value)))
                except:
                    pass
            worksheet.column_dimensions[col_letter].width = max_length + 2
    
    print(f"Excel file '{filename}' has been created successfully.")