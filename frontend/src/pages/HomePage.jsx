// src/pages/Home.jsx
import React,{useEffect,useState} from 'react';
import RosterTable from '../components/RosterTable';
import { API_BASE_URL } from "../config";

const HomePage = () => {
  const [done,setDone] = useState();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

    useEffect(() => {
      fetch(`${API_BASE_URL}/api/algoplan/archives/`)
      .then((response) => response.json())
      .then((data) => setDone(data))
      .catch((error) => console.error("Error fetching algoplan:", error));
    }, []);

  return (
    <div className="bg-[#7FA1C3] min-h-screen h-full flex flex-col items-center">
      {
        done && done.length!=0 &&
        <>        
          <h2 className="text-xl font-bold mb-4 text-[#F5EDED]">Doctor Shift Roster for {months[done[0].month-1]}, {done[0].year}</h2>
          <RosterTable />
        </>
      }
    </div>
  );
};

export default HomePage;
