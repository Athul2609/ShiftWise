import React, { useState } from "react";

// Utility to generate days in the month
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

const Calendar = ({ month, year, selectedDates, setSelectedDates, hoveredDay, setHoveredDay }) => {
  const daysInMonth = getDaysInMonth(month, year); // Get total days for the month

  // Create an array for the number of days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleClick = (day) => {
    console.log('Selected day:', day); // Debugging log
    // Toggle the selection of the day
    setSelectedDates((prevSelectedDates) => {
      if (prevSelectedDates.includes(day)) {
        // If already selected, remove it from the array
        return prevSelectedDates.filter((selectedDay) => selectedDay !== day);
      } else {
        // Otherwise, add it to the array
        return [...prevSelectedDates, day];
      }
    });
  };

  const handleMouseEnter = (day) => {
    console.log('Hovered day:', day);
    setHoveredDay(day); // Set the hovered day
  };

  const handleMouseLeave = () => {
    console.log('Mouse left');
    setHoveredDay(null); // Reset the hovered day
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
              ${selectedDates.includes(day)
                ? "bg-[#6482AD] text-[#F5EDED]"
                : hoveredDay === day
                ? "bg-[#A0B9D8] text-[#F5EDED]" // Highlight hovered day
                : "bg-[#F5EDED] text-[#6482AD]"
              }
              hover:bg-[#6482AD] hover:text-[#F5EDED] transition duration-200 ease-in-out font-outfit`}
            style={{ fontFamily: "Outfit" }}
            onClick={() => handleClick(day)}
            onMouseEnter={() => handleMouseEnter(day)}
            onMouseLeave={handleMouseLeave}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
