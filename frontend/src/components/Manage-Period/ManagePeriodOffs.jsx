import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';

function ManagePeriodOffs({
  rosterId,
  month,
  year,
  startDate,
  endDate,
  setError,
  setLoading,
  setPopUpMessage,
  setSuccessPopup
}) {
  const [offRequests, setOffRequests] = useState([]);
  const [doctorMap, setDoctorMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryString = new URLSearchParams({
          start_year: year,
          start_month: month,
          start_day: startDate,
          end_year: year,
          end_month: month,
          end_day: endDate
        }).toString();

        const offRes = await fetch(`${API_BASE_URL}/api/off-requests/range/?${queryString}`);
        if (!offRes.ok) throw new Error('Failed to fetch off requests.');
        const offData = await offRes.json();

        const docRes = await fetch(`${API_BASE_URL}/api/doctors/`);
        if (!docRes.ok) throw new Error('Failed to fetch doctor data.');
        const doctors = await docRes.json();

        const doctorMap = {};
        doctors.forEach(doc => {
          doctorMap[doc.doctor_id] = doc.name;
        });

        setDoctorMap(doctorMap);
        setOffRequests(offData);
      } catch (err) {
        console.error(err);
        setError('Error loading data.');
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate && month && year) {
      fetchData();
    }
  }, [startDate, endDate, month, year]);

  const handleDelete = async (doctorId, date) => {
    // const confirm = window.confirm('Are you sure you want to delete this off request?');
    // if (!confirm) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/off-requests/${doctorId}/${date}/`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Delete request failed.');

      // Optimistically update UI
      setOffRequests(prev =>
        prev.filter(req => !(req.doctor === doctorId && req.date === date))
      );

      setSuccessPopup(true);
      setPopUpMessage('Off request deleted successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete off request.');
    }
  };

  return (
    <div className="p-4 rounded-lg w-[80%]">
      <h2 className="text-2xl font-bold mb-4 text-[#F5EDED]">Off Requests</h2>
      <table className="w-full border border-[#6482AD]">
        <thead className="bg-[#E2DAD6] text-[#6482AD]">
          <tr>
            <th className="py-2 px-4 border-[#6482AD]">Doctor</th>
            <th className="py-2 px-4 border-[#6482AD]">Date</th>
            <th className="py-2 px-4 border-[#6482AD]">Type</th>
            <th className="py-2 px-4 border-[#6482AD]"></th>
          </tr>
        </thead>
        <tbody>
          {offRequests.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-4 text-[#6482AD] bg-[#F5EDED]">
                No off requests in this period.
              </td>
            </tr>
          ) : (
            offRequests.map((req, idx) => (
              <tr key={idx} className="bg-white hover:bg-[#E2DAD6] text-[#6482AD]">
                <td className="py-2 px-4 border-[#6482AD]">
                  {doctorMap[req.doctor] || `Doctor ID ${req.doctor}`}
                </td>
                <td className="py-2 px-4 border-[#6482AD]">
                  {`${req.year}-${String(req.month).padStart(2, '0')}-${String(req.date).padStart(2, '0')}`}
                </td>
                <td className="py-2 px-4 border-[#6482AD] capitalize">
                  {req.type}
                </td>
                <td className="py-2 px-4 border-[#6482AD] text-center">
                  <button
                    className="text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(req.doctor, req.date)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ManagePeriodOffs;
