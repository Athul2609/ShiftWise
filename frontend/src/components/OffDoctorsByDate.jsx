import React, { useEffect, useState } from 'react';

export default function OffDoctorsByDate({ hoverDate }) {
  const [doctors, setDoctors] = useState([]);
  
  // Fetch doctors data based on hoverDate
  useEffect(() => {
    if (hoverDate) {
      fetch(`http://127.0.0.1:8000/api/off-requests/date/${hoverDate}`)
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
    <div className="p-4 rounded-lg bg-[#F5EDED] text-[#6482AD] font-outfit">
   {!hoverDate ? (
        <p>Hover over a date to see which doctors are off or on leave.</p>
      ) : (
        doctors.length > 0 ? (
          <>
            <p>Doctors taking off/leave on {hoverDate}:</p>
            <ul>
              {doctors.map((doctorName, index) => (
                <li key={index} className="mb-2">
                  {doctorName}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>No doctors are on off/leave on this date.</p>
        )
      )}
    </div>
  );
}
