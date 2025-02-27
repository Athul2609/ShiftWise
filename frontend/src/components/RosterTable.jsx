import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../App";
import { API_BASE_URL } from "../config";
import * as XLSX from "xlsx";

export default function RosterTable() {
  const [roster, setRoster] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamsFH, setTeamsFH] = useState([]);
  const [teamsSH, setTeamsSH] = useState([]);
  const [algoType,setAlgoType] = useState("full");
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
            entry.date + 1,
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
        console.log(schedule)
        console.log(totalShifts)
        console.log(nightShifts)
        return { totalShifts, nightShifts };
    }

  useEffect(() => {
    // Fetch roster data
    fetch(`${API_BASE_URL}/api/roster/list/`)
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

    fetch(`${API_BASE_URL}/api/teams/previous/`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
    if(data && data[0])
    {      
      if(data[0].scheduling_half === 0)
      {
        setTeams(data);
      }
      else{
        console.log(`this is what we find ${data[0]}`)
        console.log(data[0].scheduling_half)
        setAlgoType("half")
        setTeamsFH(data.filter((entry) => entry.scheduling_half ===1))
        setTeamsSH(data.filter((entry) => entry.scheduling_half ===2))
      }
    }
      setLoading(false);
    })
    .catch((error) => {
      setError(error);
      setLoading(false);
    });

    fetch(`${API_BASE_URL}/api/algoplan/archives/`)
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

  if(!teams && !teamsFH) 
  {
    return <h2 className="text-xl font-semibold text-center mb-4 text-[#F5EDED]">Looks like it's your first time using shiftwise, once a roster is generated you will be able to see it here</h2>
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
  const currentRowsFH = roster.slice(indexOfFirstRow, indexOfLastRow>15?15:indexOfLastRow);
  const currentRowsSH = roster.slice(15>indexOfFirstRow?15:indexOfFirstRow, indexOfLastRow);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleRowsPerPageChange = (event) => {
    setCurrentPage(1)
    return setRowsPerPage(Number(event.target.value))
  }

  return algoType == "full" ?
      (
      <div className="p-4">
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
                              <td className="border p-2 text-center">{entry.date + 1}</td>
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
      )
      :
      (<div>
        <div className="p-4">
            <div className="w-full flex flex-row-reverse">
              <button className="bg-[#F5EDED] text-[#6482AD] rounded-lg mb-2 p-2" onClick={()=>{
                downloadExcel(roster.slice(0,15),teamsFH,doctorIdToName,"roster_first_half")
                downloadExcel(roster.slice(15),teamsSH,doctorIdToName,"roster_second_half")
                }}>Downlaod</button>
            </div>
            {currentRowsFH.length !==0 && <table className="w-full border-collapse rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-[#E2DAD6] text-[#6482AD]">
                    <th className="border p-2" rowSpan="2">Date</th>
                    <th className="border p-2" colSpan={[...new Set(teamsFH.map(team => team.team_id))].length}>Day Shift Doctors</th>
                    <th className="border p-2" colSpan={[...new Set(teamsFH.map(team => team.team_id))].length}>Night Shift Doctors</th>
                    </tr>
                    <tr className="bg-[#E2DAD6] text-[#6482AD]">
                      {[...new Set(teamsFH.map(team => team.team_id))].map((teamId, index) => (
                        <th className="border p-2" key={teamId}>Team {index+1}</th>
                      ))}
                      {[...new Set(teamsFH.map(team => team.team_id))].map((teamId, index) => (
                        <th className="border p-2" key={teamId}>Team {index+1}</th>
                      ))}
                    </tr>
                </thead>
                <tbody className="max-h-96 overflow-y-auto bg-[#F5EDED] text-[#6482AD]">
                {currentRowsFH.map((entry) => {
                      // Function to group doctors by team
                      const groupByTeam = (doctorIds) => {
                          const teamMap = {};
                          doctorIds.forEach((doctorId) => {
                              const team = teamsFH.find((t) => t.doctor === doctorId);
                              const teamId = team ? team.team_id : "Unassigned";
                              if (!teamMap[teamId]) teamMap[teamId] = [];
                              teamMap[teamId].push(doctorIdToName[doctorId] || doctorId);
                          });
                          return Object.values(teamMap).map((team) => team.join(", "));
                      };

                      return (
                          <tr key={entry.date} className="border">
                              <td className="border p-2 text-center">{entry.date + 1}</td>
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
            </table>}
            {currentRowsSH.length !==0 && <table className="w-full border-collapse rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-[#E2DAD6] text-[#6482AD]">
                    <th className="border p-2" rowSpan="2">Date</th>
                    <th className="border p-2" colSpan={[...new Set(teamsSH.map(team => team.team_id))].length}>Day Shift Doctors</th>
                    <th className="border p-2" colSpan={[...new Set(teamsSH.map(team => team.team_id))].length}>Night Shift Doctors</th>
                    </tr>
                    <tr className="bg-[#E2DAD6] text-[#6482AD]">
                      {[...new Set(teamsSH.map(team => team.team_id))].map((teamId, index) => (
                        <th className="border p-2" key={teamId}>Team {index+1}</th>
                      ))}
                      {[...new Set(teamsSH.map(team => team.team_id))].map((teamId, index) => (
                        <th className="border p-2" key={teamId}>Team {index+1}</th>
                      ))}
                    </tr>
                </thead>
                <tbody className="max-h-96 overflow-y-auto bg-[#F5EDED] text-[#6482AD]">
                {currentRowsSH.map((entry) => {
                      // Function to group doctors by team
                      const groupByTeam = (doctorIds) => {
                          const teamMap = {};
                          doctorIds.forEach((doctorId) => {
                              const team = teamsSH.find((t) => t.doctor === doctorId);
                              const teamId = team ? team.team_id : "Unassigned";
                              if (!teamMap[teamId]) teamMap[teamId] = [];
                              teamMap[teamId].push(doctorIdToName[doctorId] || doctorId);
                          });
                          return Object.values(teamMap).map((team) => team.join(", "));
                      };

                      return (
                          <tr key={entry.date} className="border">
                              <td className="border p-2 text-center">{entry.date + 1}</td>
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
            </table>}
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
      </div>)

}
