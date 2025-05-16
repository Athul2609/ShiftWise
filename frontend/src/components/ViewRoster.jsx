import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../App";
import { API_BASE_URL } from "../config";
import * as XLSX from "xlsx";

export default function RosterTable({ roster_id }) {
  const [roster, setRoster] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const doctor_id = user.doctorId ;
  const shifts=useRef();

  const [done,setDone] = useState();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Set default number of rows per page

  const downloadExcel = (roster, teams, doctorIdToName, filename="roster") => {
    const uniqueTeams = [...new Set(teams.map(team => team.team_id))];
    const numTeams = uniqueTeams.length;

    // Prepare header rows
    const headerRow1 = ["Date", "Day Shift", ...Array(numTeams - 1).fill(""), "Night Shift", ...Array(numTeams - 1).fill("")];
    const headerRow2 = ["", ...uniqueTeams.map((_, i) => `Team ${i + 1}`), ...uniqueTeams.map((_, i) => `Team ${i + 1}`)];

    // Prepare data rows
    const data = roster.map(entry => {
        const groupByTeam = (doctorIds) => {
            const teamMap = {};
            doctorIds.forEach((doctorId) => {
                const team = teams.find((t) => t.doctor === doctorId);
                const teamId = team ? team.team_id : "Unassigned";
                if (!teamMap[teamId]) teamMap[teamId] = [];
                teamMap[teamId].push(doctorIdToName[doctorId] || doctorId);
            });
            return uniqueTeams.map(teamId => teamMap[teamId] ? teamMap[teamId].join(", ") : "");
        };

        return [
            entry.date,
            ...groupByTeam(entry.day_shift_doctors),
            ...groupByTeam(entry.night_shift_doctors)
        ];
    });

    // Combine headers and data
    const worksheet = XLSX.utils.aoa_to_sheet([headerRow1, headerRow2, ...data]);

    // Merge cells for Day Shift and Night Shift headers
    const mergeRanges = [
        { s: { r: 0, c: 1 }, e: { r: 0, c: numTeams } },  // Merge Day Shift
        { s: { r: 0, c: numTeams + 1 }, e: { r: 0, c: 2 * numTeams } }  // Merge Night Shift
    ];
    worksheet["!merges"] = mergeRanges;

    // Create and save workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Roster");
    XLSX.writeFile(workbook, `${filename} ${months[done[0].month-1]}, ${done[0].year}.xlsx`);
  };


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
        return { totalShifts, nightShifts };
    }

  useEffect(() => {
    // Fetch roster data
    fetch(`${API_BASE_URL}/api/roster/${roster_id}/`)
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
    fetch(`${API_BASE_URL}/api/doctors/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setDoctors(data);
      })
      .catch((error) => {
        setError(error);
      });

    fetch(`${API_BASE_URL}/api/teams/${roster_id}/`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
        if(data && data[0])
        {      
            setTeams(data);
        }
        setLoading(false);
    })
    .catch((error) => {
      setError(error);
      setLoading(false);
    });

    fetch(`${API_BASE_URL}/api/algoplan/${roster_id}/`)
    .then((response) => response.json())
    .then((data) => setDone(data))
    .catch((error) => console.error("Error fetching algoplan:", error));
    
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
  if (error) return <p>Error: {error.message}</p>;

  if(!teams) 
  {
    return <h2 className="text-xl font-semibold text-center mb-4 text-[#F5EDED]">Looks like it's your first time using shiftwise, once a roster is generated you will be able to see it here</h2>
  }

  if(!roster.length)
  {
    return <div></div>
  }

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
  const handleRowsPerPageChange = (event) => {
    setCurrentPage(1)
    return setRowsPerPage(Number(event.target.value))
  }

  const getOrdinalSuffix = (num) => {
    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };
  

  return <div className="p-4">
            {done?.[0] && (
            <h2 className="text-2xl font-bold text-[#F5EDED] mb-2">
                Doctor Shift Roster for {done[0].start_date}
                {getOrdinalSuffix(done[0].start_date)}, {months[done[0].month - 1]}, {done[0].year}
                {" to "}
                {done[0].end_date}
                {getOrdinalSuffix(done[0].end_date)}, {months[done[0].month - 1]}, {done[0].year}
            </h2>
            )}
          <div className="">
            <div className="w-full flex flex-row-reverse">
              <button className="bg-[#F5EDED] text-[#6482AD] rounded-lg mb-2 p-2" onClick={()=>downloadExcel(roster,teams,doctorIdToName)}>Download</button>
            </div>
            <table className="w-full border-collapse rounded-lg overflow-hidden" id="rosterTable">
                <thead>
                    <tr className="bg-[#E2DAD6] text-[#6482AD]">
                    <th className="border p-2" rowSpan="2">Date</th>
                    <th className="border p-2" colSpan={[...new Set(teams.map(team => team.team_id))].length}>Day Shift Doctors</th>
                    <th className="border p-2" colSpan={[...new Set(teams.map(team => team.team_id))].length}>Night Shift Doctors</th>
                    </tr>
                    <tr className="bg-[#E2DAD6] text-[#6482AD]">
                      {[...new Set(teams.map(team => team.team_id))].map((teamId, index) => (
                        <th className="border p-2" key={teamId}>Team {index+1}</th>
                      ))}
                      {[...new Set(teams.map(team => team.team_id))].map((teamId, index) => (
                        <th className="border p-2" key={teamId}>Team {index+1}</th>
                      ))}
                    </tr>
                </thead>
                <tbody className="max-h-96 overflow-y-auto bg-[#F5EDED] text-[#6482AD]">
                {currentRows.map((entry) => {
                      // Function to group doctors by team
                      const groupByTeam = (doctorIds) => {
                          const teamMap = {};
                          doctorIds.forEach((doctorId) => {
                              const team = teams.find((t) => t.doctor === doctorId);
                              const teamId = team ? team.team_id : "Unassigned";
                              if (!teamMap[teamId]) teamMap[teamId] = [];
                              teamMap[teamId].push(doctorIdToName[doctorId] || doctorId);
                          });
                          return Object.values(teamMap).map((team) => team.join(", "));
                      };

                      return (
                          <tr key={entry.date} className="border">
                              <td className="border p-2 text-center">{entry.date}</td>
                              {groupByTeam(entry.day_shift_doctors).map((teamDoctors, index) => (
                                  <td className="border p-2 text-center" key={index}>{teamDoctors}</td>
                              ))}
                              {groupByTeam(entry.night_shift_doctors).map((teamDoctors, index) => (
                                  <td className="border p-2 text-center" key={index}>{teamDoctors}</td>
                              ))}
                          </tr>
                      );
                  })}
                </tbody>
            </table>
          </div>
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
          {/* <p className="font-bold text-xl mt-10 text-[#F5EDED] text-center w-full">Stats:</p>
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
          </div> */}
      </div>

}
