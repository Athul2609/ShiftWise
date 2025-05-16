// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import ViewRoster from '../components/ViewRoster';
import ViewOffs from '../components/ViewOffs';
import { API_BASE_URL } from '../config';

const HomePage = () => {
  const [rosters, setRosters] = useState(null);
  const [loading, setLoading] = useState(true);


  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchRosters = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/algoplan/filter/`);
        const data = await response.json();
        setRosters(data);
        setLoading(false)
      } catch (error) {
        console.error("Error fetching algoplan:", error);
        setLoading(false)
      }
    };
    setLoading(true)
    fetchRosters();
  }, []);

  if (loading) 
    {
        return <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg text-white">Loading...</p>
                  </div>
                </div>
    }

  return (
    <div className="bg-[#7FA1C3] min-h-screen h-full flex flex-col items-center py-8 px-4">
      {rosters?.length ? (
        rosters.map((item, index) => (
          <div key={item.roster_id} className="mb-6 text-center">
            <ViewRoster roster_id={item.roster_id} />
          </div>
        ))
      ) : (
        <p className="text-white text-lg">Loading roster data...</p>
      )}
      <ViewOffs />
    </div>
  );
};

export default HomePage;
