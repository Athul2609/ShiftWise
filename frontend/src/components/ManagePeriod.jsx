import React, { useEffect, useState } from 'react';
import ManagePeriodRoster from './Manage-Period/ManagePeriodRoster';
import ManagePeriodTeam from './Manage-Period/ManagePeriodTeam';
import ManagePeriodOffs from './Manage-Period/ManagePeriodOffs';
import ManagePeriodDependents from './Manage-Period/ManagePeriodDependents';
import { API_BASE_URL } from '../config';

function ManagePeriod({ rosterId, setError, setLoading, setPopUpMessage, setSuccessPopup }) {
  const [periodDetails, setPeriodDetails] = useState({
    month: null,
    year: null,
    start_date: null,
    end_date: null,
  });
  const [showRoster, setShowRoster] = useState(false)


  useEffect(() => {
    const fetchPeriodDetails = async () => {
      try {
        setLoading(true);

        // Fetch algoplan details
        const response = await fetch(`${API_BASE_URL}/api/algoplan/${rosterId}/`);
        if (!response.ok) throw new Error('Failed to fetch period details');
        const data = await response.json();

        if (data.length === 0) throw new Error('No period details found');

        setPeriodDetails({
          month: data[0].month,
          year: data[0].year,
          start_date: data[0].start_date,
          end_date: data[0].end_date,
        });

        // Fetch roster data
        const rosterRes = await fetch(`${API_BASE_URL}/api/roster/${rosterId}/`);
        if (!rosterRes.ok) throw new Error('Failed to fetch roster data');
        const rosterData = await rosterRes.json();
        if (Array.isArray(rosterData) && rosterData.length > 0) {
          setShowRoster(true);
        }

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (rosterId) {
      fetchPeriodDetails();
    }
  }, [rosterId, setError, setLoading]);


  const handleRosterGenerate = async () =>  {
    setLoading(true)
    const payload = {
      roster_id: rosterId,
    };
    try {
      const respone = await fetch(`${API_BASE_URL}/api/roster/generate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if(!respone.ok) throw new Error("error");
      setPopUpMessage("Roster Generated Sucessfully")
      setSuccessPopup(true)
    } catch (error) {
      setError("An error occured while generating roseter")
    }
    finally{
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center p-4 border shadow-2xl border-[#6482AD] rounded-lg w-[80%] mb-11">
      <h2 className="text-3xl font-bold mb-4 text-[#F5EDED]">
        {periodDetails.start_date && periodDetails.end_date && periodDetails.month && periodDetails.year
          ? `${new Date(periodDetails.year, periodDetails.month - 1, periodDetails.start_date).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })} - ${new Date(periodDetails.year, periodDetails.month - 1, periodDetails.end_date).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}`
          : 'Select a Date Range'}
      </h2>
      {showRoster ? <ManagePeriodRoster
        rosterId={rosterId}
        setError={setError}
        setLoading={setLoading}
        setPopUpMessage={setPopUpMessage}
        setSuccessPopup={setSuccessPopup}
      /> : 
      <div className='p-4 w-[80%]'>
        <h2 className="text-2xl font-bold mb-4 text-[#F5EDED]">Roster</h2>
        <button className='px-4 py-2 bg-[#6482AD] text-white rounded hover:bg-[#5a7296] mt-5 font-semibold' onClick={handleRosterGenerate}>
          Generate Roster
        </button>
      </div>
      }
      <ManagePeriodTeam
        rosterId={rosterId}
        setError={setError}
        setLoading={setLoading}
        setPopUpMessage={setPopUpMessage}
        setSuccessPopup={setSuccessPopup}
      />
      <ManagePeriodOffs
        rosterId={rosterId}
        month={periodDetails.month}
        year={periodDetails.year}
        startDate={periodDetails.start_date}
        endDate={periodDetails.end_date}
        setError={setError}
        setLoading={setLoading}
        setPopUpMessage={setPopUpMessage}
        setSuccessPopup={setSuccessPopup}
      />
      <ManagePeriodDependents
        rosterId={rosterId}
        setError={setError}
        setLoading={setLoading}
        setPopUpMessage={setPopUpMessage}
        setSuccessPopup={setSuccessPopup}
      />
    </div>
  );
}

export default ManagePeriod;
