import React, { useState, useEffect, useContext } from 'react';
import Calendar from '../components/Calendar';
import OffDoctorsByDate from '../components/OffDoctorsByDate';
import {AuthContext} from "../App"

const RequestPage = () => {
  const [selectedDates, setSelectedDates] = useState([]); // Store multiple selected dates
  const [hoveredDay, setHoveredDay] = useState(null); // Store hovered day
  const [requestType, setRequestType] = useState("off"); // Track requestType button
  const [error, setError] = useState(null); // To track errors
  const [successPopup, setSuccessPopup] = useState(false); // To track success popup
  const [done,setDone] = useState()
  const { user } = useContext(AuthContext);
  const doctor_id = user ? user.doctorId : 19;

  const handleButtonClick = (button) => {
    setRequestType(button); // Set requestType button on click
  };

  // API request function
  const handleApply = async () => {
    if (selectedDates.length === 0) {
      setError('Please select at least one date');
      return;
    }

    try {
      for (const date of selectedDates) {
        const request = {
          doctor: doctor_id,
          date: parseInt(date),
          type: requestType,
        };

        // Send POST request for each date
        const response = await fetch('http://127.0.0.1:8000/api/off-requests/create/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`Failed to apply for off request for date: ${date}`);
        }

        const data = await response.json();
        console.log(`Off request created for date: ${date}`, data);
      }

      setSuccessPopup(true); // Show success popup
      setError(null); // Reset any previous errors
    } catch (error) {
      setError(error.message);
    }
  };

  // Function to reset the page
  const handlePopupClose = () => {
    setSuccessPopup(false); // Close the popup
    setSelectedDates([]); // Reset selected dates
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/algoplan/")
    .then((response) => response.json())
    .then((data) => setDone(data))
    .catch((error) => console.error("Error fetching doctors:", error));
  }, []);

  return (
    <div className='bg-[#7FA1C3] h-screen flex justify-center'>
      {
        (done && done.length !== 0)  ?
        <div className="w-[80vw] flex flex-col items-center">
          <h1 className="text-2xl font-bold font-outfit" style={{ color: '#E2DAD6' }}>Calendar</h1>
          <Calendar
            month={1}
            year={2025}
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            hoveredDay={hoveredDay}
            setHoveredDay={setHoveredDay}
          />
          <OffDoctorsByDate hoverDate={hoveredDay} />
          <div className="w-[80vw] flex justify-evenly items-center">
            <p className="text-xl font-bold font-outfit text-[#F5EDED]">Request type</p>
            <div className="flex flex-col justify-center space-y-4">
              <button
                className={`font-medium tracking-wide rounded transition-colors duration-300 ${
                  requestType === 'off' ? 'bg-[#6482AD] text-[#F5EDED]' : 'bg-[#F5EDED] text-[#6482AD]'
                } hover:bg-[hsl(210,31%,54%)] hover:text-[hsl(0,29%,95%)] hover:shadow-lg`}
                onClick={() => handleButtonClick('off')}
              >
                OFF
              </button>
              <button
                className={`font-medium tracking-wide rounded transition-colors duration-300 ${
                  requestType === 'leave' ? 'bg-[#6482AD] text-[#F5EDED]' : 'bg-[#F5EDED] text-[#6482AD]'
                } hover:bg-[hsl(210,31%,54%)] hover:text-[hsl(0,29%,95%)] hover:shadow-lg`}
                onClick={() => handleButtonClick('leave')}
              >
                LEAVE
              </button>
            </div>
          </div>
          {/* Apply Button */}
          <button
            className="bg-[#F5EDED] text-[#6482AD] font-medium tracking-wide rounded hover:bg-[hsl(210,31%,54%)] hover:text-[hsl(0,29%,95%)] hover:shadow-lg"
            onClick={handleApply}
          >
            APPLY
          </button>
          {/* Error Message */}
          {error && <p className="text-red-500">{error}</p>}

          {/* Success Popup */}
          {successPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded shadow-lg text-center">
                <h2 className="text-2xl font-bold text-green-600">Success!</h2>
                <p>All off requests have been successfully created.</p>
                <button
                  className="mt-4 bg-[#6482AD] text-white px-4 py-2 rounded hover:bg-[#506a8e]"
                  onClick={handlePopupClose}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
        :
        <h2 className="text-xl font-semibold text-center mb-4 text-[#F5EDED]">Teams have not been created, please wait for teams to be created before you apply for leaves or offs.</h2>
      }
    </div>

  );
};

export default RequestPage;
