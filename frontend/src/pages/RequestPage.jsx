import React, { useState, useEffect, useContext } from 'react';
import Calendar from '../components/Calendar';
import OffDoctorsByDate from '../components/OffDoctorsByDate';
import { AuthContext } from "../App";
import { API_BASE_URL } from "../config";

const RequestPage = () => {
  const [selectedDates, setSelectedDates] = useState([]); 
  const [hoveredDay, setHoveredDay] = useState(null); 
  const [requestType, setRequestType] = useState("off"); 
  const [error, setError] = useState(null); 
  const [successPopup, setSuccessPopup] = useState(false); 
  const [loading, setLoading] =  useState(false);
  const { user } = useContext(AuthContext);
  const doctor_id = user && user.doctorId;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // New states for selected month/year, default to current month/year
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-based month
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Handler for month change
  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
    setSelectedDates([]); // Reset dates when month/year changes
  };

  // Handler for year change
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
    setSelectedDates([]); // Reset dates when month/year changes
  };

  const handleButtonClick = (button) => {
    setRequestType(button);
    setSelectedDates([]); // Reset selected dates when switching type
  };

  // API request function
  const handleApply = async () => {
    setError(null);
    setSuccessPopup(false);

    if (selectedDates.length === 0) {
      setError('Please select at least one date');
      return;
    }

    // // For "off", allow only one date at a time
    // if (requestType === "off" && selectedDates.length > 1) {
    //   setError("You can apply for off only one date at a time");
    //   return;
    // }

    setLoading(true);

    try {
      // Loop through selectedDates, send one POST request each with month/year
      for (const date of selectedDates) {
        const requestBody = {
          doctor: doctor_id,
          date: parseInt(date),
          month: selectedMonth + 1, // convert 0-based to 1-based
          year: selectedYear,
          type: requestType
        };

        const response = await fetch(`${API_BASE_URL}/api/off-requests/create/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Failed to apply for ${requestType} request for date: ${date}`);
        }
      }

      setSuccessPopup(true);
      setSelectedDates([]); // Reset on success
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // UI for month and year selectors
  const renderMonthYearSelectors = () => {
    // For year selector, we can do a range of years from e.g. current year - 2 to current year + 2
    const yearRange = [];
    for (let y = today.getFullYear() - 2; y <= today.getFullYear() + 2; y++) {
      yearRange.push(y);
    }

    return (
      <div className="flex space-x-4 mb-4 items-center">
        <label className="text-[#F5EDED] font-semibold">Select Month:</label>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="rounded px-2 py-1 text-[#6482AD]"
        >
          {months.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>

        <label className="text-[#F5EDED] font-semibold">Select Year:</label>
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="rounded px-2 py-1 text-[#6482AD]"
        >
          {yearRange.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className='bg-[#7FA1C3] min-h-screen h-full flex justify-center'>
      <div className="w-[80vw] flex flex-col items-center">
        <h1 className="text-2xl font-bold font-outfit mb-4" style={{ color: '#E2DAD6' }}>
          Apply for {requestType.toUpperCase()} - {months[selectedMonth]} {selectedYear}
        </h1>

        {renderMonthYearSelectors()}

        <Calendar
          month={selectedMonth}
          year={selectedYear}
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
          hoveredDay={hoveredDay}
          setHoveredDay={setHoveredDay}
          // Optional: add a prop to restrict selection for off to single date if you want
        />

        <OffDoctorsByDate hoverDate={hoveredDay} />

        <div className="w-[80vw] flex justify-evenly items-center mb-4">
          <p className="text-xl font-bold font-outfit text-[#F5EDED]">Request type</p>
          <div className="flex flex-col justify-center space-y-4">
            <button
              className={`font-medium tracking-wide rounded transition-colors duration-300 ${
                requestType === 'off' ? 'bg-[#6482AD] text-[#F5EDED]' : 'bg-[#F5EDED] text-[#6482AD]'
              } hover:bg-[hsl(210,31%,54%)] hover:text-[hsl(0,29%,95%)] hover:shadow-lg w-20 py-1`}
              onClick={() => handleButtonClick('off')}
            >
              OFF
            </button>
            <button
              className={`font-medium tracking-wide rounded transition-colors duration-300 ${
                requestType === 'leave' ? 'bg-[#6482AD] text-[#F5EDED]' : 'bg-[#F5EDED] text-[#6482AD]'
              } hover:bg-[hsl(210,31%,54%)] hover:text-[hsl(0,29%,95%)] hover:shadow-lg py-1`}
              onClick={() => handleButtonClick('leave')}
            >
              LEAVE
            </button>
          </div>
        </div>

        {/* Apply Button */}
        <button
          className="bg-[#F5EDED] text-[#6482AD] font-medium px-4 py-2 my-4 tracking-wide rounded hover:bg-[hsl(210,31%,54%)] hover:text-[hsl(0,29%,95%)] hover:shadow-lg"
          onClick={handleApply}
        >
          APPLY
        </button>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
              <p className="mt-4 text-lg text-white">Loading...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg text-center">
              <h2 className="text-2xl font-bold text-red-600">Error!</h2>
              <p>{error}</p>
              <button
                className="mt-4 bg-[#6482AD] text-white px-4 py-2 rounded hover:bg-[#506a8e]"
                onClick={() => { setError(null); }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {successPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg text-center">
              <h2 className="text-2xl font-bold text-green-600">Success!</h2>
              <p>All requests have been successfully created.</p>
              <button
                className="mt-4 bg-[#6482AD] text-white px-4 py-2 rounded hover:bg-[#506a8e]"
                onClick={() => setSuccessPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestPage;
