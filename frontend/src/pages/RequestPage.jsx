import React, { useState, useEffect, useContext } from 'react';
import Calendar from '../components/Calendar';
import OffDoctorsByDate from '../components/OffDoctorsByDate';
import {AuthContext} from "../App"
import { API_BASE_URL } from "../config";

const RequestPage = () => {
  const [selectedDates, setSelectedDates] = useState([]); 
  const [hoveredDay, setHoveredDay] = useState(null); 
  const [requestType, setRequestType] = useState("off"); 
  const [error, setError] = useState(null); 
  const [successPopup, setSuccessPopup] = useState(false); 
  const [done,setDone] = useState()
  const [loading,setLoading] =  useState(false);
  const { user } = useContext(AuthContext);
  const doctor_id = user ? user.doctorId : 19;

  const handleButtonClick = (button) => {
    setRequestType(button); // Set requestType button on click
  };

  const fiveContinuousCheck = (arr) => {
    arr.sort((a, b) => a - b); // Sort the array in ascending order
    let count = 1; // Start counting consecutive numbers
  
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] === arr[i - 1] + 1) {
        count++; // Increase count if the sequence continues
        if (count === 5) return true; // Return true if we reach 5 consecutive numbers
      } else {
        count = 1; // Reset count if sequence breaks
      }
    }
  
    return false; // Return false if no sequence of 5 found
  };

  

  // API request function
  const handleApply = async () => {
    setLoading(true);
    if (selectedDates.length === 0) {
      setError('Please select at least one date');
      setLoading(false);
      return;
    }
    if (requestType.toLowerCase() === "off" && fiveContinuousCheck(selectedDates))
    {
      setError('You cannot take off for more than 4 consecutive days');
      setLoading(false);
      return;
    }

    try {
      let data;
      try {
        const request={
          doctor_id: doctor_id,
          dates: selectedDates,
          no_of_leaves: requestType.toLowerCase() == "off" ? 0 : selectedDates.length,
        }
        const response = await fetch(`${API_BASE_URL}/api/roster/check/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });
        if (!response.ok) {
          throw new Error(`Failed to apply for off request`);
        }
        data = await response.json();
      }
      catch (error)
      {
        setError(error.message);
      }
      if (data.result === "false")
      {
        throw new Error("Cannot meet this request, chose alternative days or contact admin.")
      }
      for (const date of selectedDates) {
        const request = {
          doctor: doctor_id,
          date: parseInt(date),
          type: requestType,
        };

        // Send POST request for each date
        const response = await fetch(`${API_BASE_URL}/api/off-requests/create/`, {
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
    } finally
    {
      setLoading(false);
    }
  };

  // Function to reset the page
  const handlePopupClose = () => {
    setSuccessPopup(false); // Close the popup
    setError(null);
    setSelectedDates([]); // Reset selected dates
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/algoplan/`)
    .then((response) => response.json())
    .then((data) => setDone(data))
    .catch((error) => console.error("Error fetching doctors:", error));
    setLoading(false);
  }, []);

  if (!done) 
    {
        return  <div className='bg-[#7FA1C3] h-screen flex justify-center'>
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg text-white">Loading...</p>
                  </div>
                </div>
                </div>
    }

  return (
    <div className='bg-[#7FA1C3] h-screen flex justify-center'>
      {
        (done.length !== 0)  ?
        <div className="w-[80vw] flex flex-col items-center">
          <h1 className="text-2xl font-bold font-outfit mb-4" style={{ color: '#E2DAD6' }}>Calendar</h1>
          <Calendar
            month={1}
            year={2025}
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            hoveredDay={hoveredDay}
            setHoveredDay={setHoveredDay}
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
            className="bg-[#F5EDED] text-[#6482AD] font-medium px-4 py-2 tracking-wide rounded hover:bg-[hsl(210,31%,54%)] hover:text-[hsl(0,29%,95%)] hover:shadow-lg"
            onClick={handleApply}
          >
            APPLY
          </button>

          {loading && 
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
              <p className="mt-4 text-lg text-white">Loading...</p>
            </div>
          </div>
          }
          {/* Error Message */}
          {error && 
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg text-center">
              <h2 className="text-2xl font-bold text-red-600">Error!</h2>
              <p>{error}.</p>
              <button
                className="mt-4 bg-[#6482AD] text-white px-4 py-2 rounded hover:bg-[#506a8e]"
                onClick={handlePopupClose}
              >
                Close
              </button>
            </div>
          </div>
          }

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
        <div className='flex justify-center items-center'>        
          <h2 className="text-xl font-semibold text-center mb-4 text-[#F5EDED]">Teams have not been created, please wait for teams to be created before you apply for leaves or offs.</h2>
        </div>
      }
    </div>

  );
};

export default RequestPage;
