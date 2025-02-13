import React, { useState, useEffect } from 'react';

const OffRequestList = () => {
  const [offRequests, setOffRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch off requests from the API
  const fetchOffRequests = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/off-requests/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setOffRequests(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching off requests:", error);
      setLoading(false);
    }
  };

  // Delete off request
  const deleteOffRequest = async (doctorId, date) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/off-requests/${doctorId}/${date}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setOffRequests(offRequests.filter(request => !(request.doctor === doctorId && request.date === date)));
      } else {
        throw new Error('Failed to delete off request');
      }
    } catch (error) {
      console.error("Error deleting off request:", error);
    }
  };

  useEffect(() => {
    fetchOffRequests();
  }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

  return (
    <div className="w-4/5 p-4">
      <table className="w-full border-collapse rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-[#E2DAD6] text-[#6482AD]">
            <th className="border-b border-gray-300 p-2">Doctor</th>
            <th className="border-b border-gray-300 p-2">Date</th>
            <th className="border-b border-gray-300 p-2">Type</th>
            <th className="border-b border-gray-300 p-2"></th>
          </tr>
        </thead>
        <tbody className='bg-[#F5EDED] text-[#6482AD]'>
          {offRequests.map((request) => (
            <tr key={`${request.doctor}-${request.date}`} className="hover:bg-gray-50">
              <td className="border-b border-gray-300 p-2">{request.doctor_name}</td>
              <td className="border-b border-gray-300 p-2">{request.date}</td>
              <td className="border-b border-gray-300 p-2">{request.type}</td>
              <td className="border-b border-gray-300 p-2">
                <button 
                  className="text-red-600" 
                  onClick={() => deleteOffRequest(request.doctor, request.date)}>
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OffRequestList;
