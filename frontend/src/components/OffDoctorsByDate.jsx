import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from "../config";
export default function OffDoctorsByDate({ hoverDate }) {
  const [doctors, setDoctors] = useState([]);
  // Fetch doctors data based on hoverDate
  useEffect(() => {
    if (hoverDate) {
      fetch(`${API_BASE_URL}/api/off-requests/date/${hoverDate}`)
        .then((response) => response.json())
        .then((data) => {
          // Extract doctor names from the response
          const doctorNames = data.map((item) => item.doctor_name);
          setDoctors(doctorNames);
        })
        .catch((error) => console.error('Error fetching doctors:', error));
    }
  }, [hoverDate]);

  return (
    <div className="p-4 rounded-lg bg-[#F5EDED] text-[#6482AD] font-outfit w-4/5 max-w-xs sm:max-w-sm md:max-w-lg flex justify-center items-center h-40 mb-8">
   {!hoverDate ? (
        <p>Hover over a date to see which doctors are off or on leave.</p>
      ) : (
        doctors.length > 0 ? (
          <div>
            <p>Doctors taking off/leave on {hoverDate}:</p>
            <ul>
              {doctors.map((doctorName, index) => (
                <li key={index} className="mb-2">
                  {doctorName}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No doctors are on off/leave on this date.</p>
        )
      )}
    </div>
  );
}
