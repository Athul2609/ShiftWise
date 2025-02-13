// src/pages/Home.jsx
import React from 'react';
import RosterTable from '../components/RosterTable';

const HomePage = () => {
  return (
    <div className="bg-[#7FA1C3] min-h-screen h-full flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4 text-[#F5EDED]">Doctor Shift Roster</h2>
      <RosterTable />
    </div>
  );
};

export default HomePage;
