import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../App";

export default function RosterTable() {
  const [roster, setRoster] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const doctor_id = user.doctorId ;
  const shifts=useRef();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Set default number of rows per page

  function calculateShifts(doctorId, schedule) {
        let totalShifts = 0;
        let nightShifts = 0;

        // Loop through each day in the schedule
        for (let day of schedule) {
            // Check if doctorId is in the day shift or night shift
            if (day.day_shift_doctors.includes(doctorId)) {
                totalShifts += 1;
            }
            if (day.night_shift_doctors.includes(doctorId)) {
                totalShifts += 1;
                nightShifts += 1;
            }
        }
        console.log(schedule)
        console.log(totalShifts)
        console.log(nightShifts)
        return { totalShifts, nightShifts };
    }

  useEffect(() => {
    // Fetch roster data
    fetch("http://127.0.0.1:8000/api/roster/list/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setRoster(data);
        shifts.current = calculateShifts(doctor_id,data)
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });

    // Fetch doctor data
    fetch("http://127.0.0.1:8000/api/doctors/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setDoctors(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
    
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Create a mapping of doctor_id to doctor name
  const doctorIdToName = doctors.reduce((acc, doctor) => {
    acc[doctor.doctor_id] = doctor.name;
    return acc;
  }, {});

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = roster.slice(indexOfFirstRow, indexOfLastRow);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleRowsPerPageChange = (event) => setRowsPerPage(Number(event.target.value));

  return (
    <div className="p-4">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead>
                <tr className="bg-[#E2DAD6] text-[#6482AD]">
                <th className="border p-2" rowSpan="2">Date</th>
                <th className="border p-2" colSpan="4">Day Shift Doctors</th>
                <th className="border p-2" colSpan="4">Night Shift Doctors</th>
                </tr>
                <tr className="bg-[#E2DAD6] text-[#6482AD]">
                <th className="border p-2">TEAM 1</th>
                <th className="border p-2">TEAM 2</th>
                <th className="border p-2">TEAM 3</th>
                <th className="border p-2">TEAM 4</th>
                <th className="border p-2">TEAM 1</th>
                <th className="border p-2">TEAM 2</th>
                <th className="border p-2">TEAM 3</th>
                <th className="border p-2">TEAM 4</th>
                </tr>
            </thead>
            <tbody className="max-h-96 overflow-y-auto bg-[#F5EDED] text-[#6482AD]">
                {currentRows.map((entry) => (
                <tr key={entry.date} className="border">
                    <td className="border p-2 text-center">{entry.date + 1}</td>
                    {entry.day_shift_doctors.map((doctorId) => (
                    <td className={`border p-2 text-center ${doctor_id==doctorId && "font-bold"}`}>{doctorIdToName[doctorId] || doctorId}</td>
                    ))}
                    {entry.night_shift_doctors.map((doctorId) => (
                    <td className={`border p-2 text-center ${doctor_id==doctorId && "font-bold"}`}>{doctorIdToName[doctorId] || doctorId}</td>
                    ))}
                </tr>
                ))}
            </tbody>
        </table>
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
        <div>
            <label htmlFor="rowsPerPage" className="mr-2 text-[#F5EDED]">Rows per page:</label>
            <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border p-1 text-[#6482AD] bg-[#F5EDED]"
            >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            </select>
        </div>

        <div>
            <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-[#F5EDED] text-[#6482AD] mr-2 rounded"
            >
            Previous
            </button>
            <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage * rowsPerPage >= roster.length}
            className="p-2 bg-[#F5EDED] text-[#6482AD] rounded"
            >
            Next
            </button>
        </div>
        </div>
        <p className="font-bold text-2xl mt-10 text-[#F5EDED] text-center w-full">Your Stats:</p>
        <div className="w-full flex justify-center">
            <div className=" bg-[#E2DAD6] my-5 rounded-md flex items-center justify-between">
                <div className="bg-[#F5EDED] rounded-md p-5 m-2 text-[#6482AD] ">
                    <p className="text-3xl font-extrabold">{shifts.current ? shifts.current.totalShifts : 0}</p>
                    <p>Working Days</p>
                </div>
                <div className="bg-[#F5EDED] rounded-md p-5 m-2 text-[#6482AD] ">
                    <p className="text-3xl font-extrabold">{shifts.current ? shifts.current.nightShifts : 0}</p>
                    <p>Night Shifts</p>
                </div>
            </div>
        </div>
    </div>
  );
}
