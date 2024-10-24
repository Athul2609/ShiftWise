import React, { useState } from "react";

// Utility to generate days in the month
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

const Calendar = ({ month, year }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const daysInMonth = getDaysInMonth(month, year); // Get total days for the month

  // Create an array for the number of days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleClick = (day) => {
    setSelectedDate(day);
    // onDateClick(day);
  };

  return (
    <div className="bg-[#E2DAD6] rounded-lg p-4 w-4/5 max-w-xs sm:max-w-sm mx-auto sm:max-w-md md:max-w-lg">
      <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4">
        {days.map((day) => (
          <button
            key={day}
            className={`flex items-center justify-center 
              w-8 h-8 text-xs 
              sm:w-10 sm:h-10 sm:text-sm 
              md:w-12 md:h-12 md:text-base 
              rounded-full
              ${
                selectedDate === day
                  ? "bg-[#6482AD] text-[#F5EDED]"
                  : "bg-[#F5EDED] text-[#6482AD]"
              }
              hover:bg-[#6482AD] hover:text-[#F5EDED] transition duration-200 ease-in-out font-outfit`}
            style={{ fontFamily: "Outfit" }}
            onClick={() => handleClick(day)}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
