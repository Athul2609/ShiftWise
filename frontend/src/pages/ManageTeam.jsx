import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import TeamsHalf from "../components/TeamsHalf";

export default function TeamManagement() {
  const [done,setDone] = useState();
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("")
  const [successPopup,setSuccessPopup] = useState(false)

  const [algo,setAlgo] = useState();
  const [doctors, setDoctors] = useState([]);

  const currentDate = new Date();
  const [month,setMonth] = useState(currentDate.getMonth() + 1);
  const [year,setYear] = useState(currentDate.getFullYear());

  const [teams, setTeams] = useState({ "Team 1": [] });
  const [teamsFH, setTeamsFH] = useState({ "Team 1": [] });
  const [teamsSH, setTeamsSH] = useState({ "Team 1": [] });

  const [selectedTeam, setSelectedTeam] = useState("Team 1");
  const [selectedTeamFH, setSelectedTeamFH] = useState("Team 1");
  const [selectedTeamSH, setSelectedTeamSH] = useState("Team 1");

  const [assignedDoctors, setAssignedDoctors] = useState(new Set());
  const [assignedDoctorsFH, setAssignedDoctorsFH] = useState(new Set());
  const [assignedDoctorsSH, setAssignedDoctorsSH] = useState(new Set());

  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [showDoctorDropdownFH, setShowDoctorDropdownFH] = useState(false);
  const [showDoctorDropdownSH, setShowDoctorDropdownSH] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE_URL}/api/algoplan/`)
    .then((response) => response.json())
    .then((data) => setDone(data))
    .catch((error) => console.error("Error fetching doctors:", error));

    fetch(`${API_BASE_URL}/api/doctors/`)
      .then((response) => response.json())
      .then((data) => setDoctors(data))
      .then(setLoading(false))
      .catch((error) => console.error("Error fetching doctors:", error));
  }, []);

  const addTeam = () => {
    const teamId = `Team ${Object.keys(teams).length + 1}`;
    setTeams({ ...teams, [teamId]: [] });
  };
  const addTeamFH = () => {
    const teamId = `Team ${Object.keys(teamsFH).length + 1}`;
    setTeamsFH({ ...teamsFH, [teamId]: [] });
  };
  const addTeamSH = () => {
    const teamId = `Team ${Object.keys(teamsSH).length + 1}`;
    setTeamsSH({ ...teamsSH, [teamId]: [] });
  };

  const assignDoctor = (doctor) => {
    if (!selectedTeam || assignedDoctors.has(doctor.doctor_id)) return;
    setTeams({
      ...teams,
      [selectedTeam]: [...teams[selectedTeam], doctor],
    });
    setAssignedDoctors(new Set([...assignedDoctors, doctor.doctor_id]));
    setShowDoctorDropdown(false);
  };
  const assignDoctorFH = (doctor) => {
    if (!selectedTeamFH || assignedDoctorsFH.has(doctor.doctor_id)) return;
    setTeamsFH({
      ...teamsFH,
      [selectedTeamFH]: [...teamsFH[selectedTeamFH], doctor],
    });
    setAssignedDoctorsFH(new Set([...assignedDoctorsFH, doctor.doctor_id]));
    setShowDoctorDropdownFH(false);
  };
  const assignDoctorSH = (doctor) => {
    if (!selectedTeamSH || assignedDoctorsSH.has(doctor.doctor_id)) return;
    setTeamsSH({
      ...teamsSH,
      [selectedTeamSH]: [...teamsSH[selectedTeamSH], doctor],
    });
    setAssignedDoctorsSH(new Set([...assignedDoctorsSH, doctor.doctor_id]));
    setShowDoctorDropdownSH(false);
  };

  const removeDoctor = (doctorId) => {
    setTeams({
      ...teams,
      [selectedTeam]: teams[selectedTeam].filter((doc) => doc.doctor_id !== doctorId),
    });
    setAssignedDoctors(new Set([...assignedDoctors].filter((id) => id !== doctorId)));
  };
  const removeDoctorFH = (doctorId) => {
    setTeamsFH({
      ...teamsFH,
      [selectedTeamFH]: teamsFH[selectedTeamFH].filter((doc) => doc.doctor_id !== doctorId),
    });
    setAssignedDoctorsFH(new Set([...assignedDoctorsFH].filter((id) => id !== doctorId)));
  };
  const removeDoctorSH = (doctorId) => {
    setTeamsSH({
      ...teamsSH,
      [selectedTeamSH]: teamsSH[selectedTeamSH].filter((doc) => doc.doctor_id !== doctorId),
    });
    setAssignedDoctorsSH(new Set([...assignedDoctorsSH].filter((id) => id !== doctorId)));
  };

  const submitTeams = () => {
    setLoading(true)
      const formatTeams = (teams, schedulingHalf) => 
        Object.entries(teams).flatMap(([teamId, doctors]) => 
          doctors.map(({ doctor_id }) => ({ team_id: teamId, doctor: doctor_id, scheduling_half: schedulingHalf }))
        );
        
      const submitAlgoPlan = async () =>
      {
        try {
          await fetch(`${API_BASE_URL}/api/algoplan/create/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({month: month, year: year, algorithm:algo}),
          });
        } catch (error) {
          console.error("Error submitting algoPlan:", error);
        }
      }
      const submitTeams = async (teamsData) => {
        try {
          await fetch(`${API_BASE_URL}/api/teams/create/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(teamsData),
          });
        } catch (error) {
          console.error("Error submitting teams:", error);
        }
      };

      Promise.all([submitAlgoPlan(),submitTeams(formatTeams(teams, 0))])
      .then(() => {
        setLoading(false)
        setSuccessPopup(true)
      })
      .catch(() => setError("Error submitting teams"));
  };

  const submitTeamsHalf = () => {
    setLoading(true);
    const formatTeams = (teams, schedulingHalf) => 
      Object.entries(teams).flatMap(([teamId, doctors]) => 
        doctors.map(({ doctor_id }) => ({ team_id: teamId, doctor: doctor_id, scheduling_half: schedulingHalf }))
      );
      
    const submitAlgoPlan = async () =>
    {
      try {
        await fetch(`${API_BASE_URL}/api/algoplan/create/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({month: month-1, year: year, algorithm:algo}),
        });
      } catch (error) {
        console.error("Error submitting algoPlan:", error);
      }
    }
    const submitTeams = async (teamsData) => {
      try {
        await fetch(`${API_BASE_URL}/api/teams/create/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teamsData),
        });
      } catch (error) {
        console.error("Error submitting teams:", error);
      }
    };

    const areSetsEqual = (setA, setB) => setA.size === setB.size && [...setA].every(el => setB.has(el));

    if(areSetsEqual(assignedDoctorsFH,assignedDoctorsSH))
    {    
      Promise.all([submitAlgoPlan(),submitTeams(formatTeams(teamsFH, 1)), submitTeams(formatTeams(teamsSH, 2))])
      .then(() => {
        setLoading(false)
        setSuccessPopup(true)
      })
      .catch(() => setError("Error submitting teams"));
    }
    else{
      setError("A doctor cannot only be present in one half")
    }
  };

  const handleRosterGenerate = async () =>{
    setLoading(true)
    try {
      await fetch(`${API_BASE_URL}/api/roster/generate/`, {
        method: "GET"
      });
      setSuccessPopup(true)
    } catch (error) {
      setError("An error occured while generating roseter")
    }
    finally{
      setLoading(false)
    }
  }

  const handlePopupClose = () => {
    setSuccessPopup(false); // Close the popup
    setError(null);
    window.location.reload();
  };
  
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

  return (done.length !== 0) ?
  <div className="flex flex-col items-center justify-center min-h-screen h-full bg-[#7FA1C3]">
          <h1 className="text-2xl font-bold font-outfit mb-4" style={{ color: '#E2DAD6' }}>Teams for {months[done[0].month-1]}, {done[0].year}</h1>
          <TeamsHalf />
      <button onClick={handleRosterGenerate} className="text-xl font-semibold text-center mb-4 text-[#6482AD] bg-[#F5EDED] px-3 py-1 rounded hover:text-[#F5EDED] hover:bg-[#6482AD]">GENERATE ROSTER</button>
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
            <p>Roster Succesfully generated.</p>
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
  (algo === "full" ?
  (
    <div className="flex flex-col items-center min-h-screen h-full bg-[#7FA1C3]">
      <div className=" p-4 rounded-xl border-none">
      <h2 className="text-xl font-semibold text-center mb-4 text-[#F5EDED]">ALGORITHM</h2>
      <div className="flex rounded-xl overflow-hidden border-none">
        <button
          className={`px-6 py-2 ${algo ==="full"? "bg-[#6482AD] text-[#F5EDED]" : "bg-[#F5EDED] text-[#6482AD]"} hover:bg-[#6482AD] hover:text-[#F5EDED]`}
          onClick={() => setAlgo("full")}
        >
          FULL
        </button>
        <button
          className={`px-6 py-2 ${algo ==="half"? "bg-[#6482AD] text-[#F5EDED]" : "bg-[#F5EDED] text-[#6482AD]"} hover:bg-[#6482AD] hover:text-[#F5EDED]`}
          onClick={() => setAlgo("half")}
        >
          HALF
        </button>
      </div>
      <div className="flex flex-col space-y-4 p-4 max-w-sm mx-auto">
        <div>
          <label className="block text-[#F5EDED] font-medium">MONTH</label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="mt-1 p-2 w-full border rounded-lg focus:ring-2 focus:ring-black-500 focus:outline-none"
          >
            {months.map((_, index) => (
              <option key={index + 1} value={index + 1}>
                {_}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[#F5EDED] font-medium">YEAR</label>
          <input
            type="number"
            min="1900"
            max="2100"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value) || currentDate.getFullYear())}
            className="mt-1 p-2 w-full border rounded-lg focus:ring-2 focus:ring-black-500 focus:outline-none"
          />
        </div>
      </div>
      {/* <p className="text-center mt-4">Selected: <span className="font-bold">{algo}</span></p> */}
      </div>
      <div className=" p-6 space-y-4 bg-[#7FA1C3] font-outfit">
        <div className="flex space-x-4">
          {Object.keys(teams).map((teamId) => (
            <div
              key={teamId}
              onClick={() => setSelectedTeam(teamId)}
              className={`p-4 cursor-pointer bg-[#F5EDED] rounded border ${
                selectedTeam === teamId ? "border-[#6482AD]" : "border-gray-300"
              }`}
            >
              <h2 className="text-lg font-bold text-[#6482AD]">{teamId}</h2>
              {teams[teamId].map((doc) => (
                <div
                  key={doc.doctor_id}
                  className="flex justify-between items-center text-[#7FA1C3]"
                >
                  <p>{doc.name}</p>
                  <button
                    onClick={() => removeDoctor(doc.doctor_id)}
                    className="text-gray-500 font-bold text-xs p-0 border-none bg-none cursor-pointer ml-1"
                    aria-label={`Remove ${doc.doctor_name || "doctor"}`}
                  >
                    &#10060;
                  </button>
                </div>
              ))}
            </div>
          ))}
          <button onClick={addTeam} className="px-4 py-2  text-[#F5EDED] rounded">
            + Team
          </button>
        </div>

        {showDoctorDropdown && (
          <select
            onChange={(e) =>
              assignDoctor(doctors.find((d) => d.doctor_id == e.target.value))
            }
            className="mt-4 p-2 border rounded bg-white"
          >
            <option value="">Select Doctor</option>
            {doctors
              .filter((d) => !assignedDoctors.has(d.doctor_id))
              .filter((d) => d.role !== 2)
              .map((doc) => (
                <option key={doc.doctor_id} value={doc.doctor_id}>
                  {doc.name}
                </option>
              ))}
          </select>
        )}

        <div className="flex space-x-4 mt-4"> {/* Container for buttons with spacing */}
          <button
            onClick={() => setShowDoctorDropdown(!showDoctorDropdown)}
            className="px-4 py-2  text-[#F5EDED] rounded"
          >
            + Doctor
          </button>
        </div>
      </div>
      <div className="mt-4"> {/* Container for submit button on a new line */}
          <button onClick={submitTeams} className="px-4 py-2 mb-4 bg-[#6482AD] text-white rounded">
            SUBMIT
          </button>
      </div>
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
            <p>Teams Succesfully created.</p>
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
  )
  :
  (
    <div className="flex flex-col items-center min-h-screen h-full bg-[#7FA1C3]">
      <div className=" p-4 rounded-xl border-none">
      <h2 className="text-xl font-semibold text-center mb-4 text-[#F5EDED]">ALGORITHM</h2>
      <div className="flex rounded-xl overflow-hidden border-none">
        <button
          className={`px-6 py-2 ${algo ==="full"? "bg-[#6482AD] text-[#F5EDED]" : "bg-[#F5EDED] text-[#6482AD]"} hover:bg-[#6482AD] hover:text-[#F5EDED]`}
          onClick={() => setAlgo("full")}
        >
          FULL
        </button>
        <button
          className={`px-6 py-2 ${algo ==="half"? "bg-[#6482AD] text-[#F5EDED]" : "bg-[#F5EDED] text-[#6482AD]"} hover:bg-[#6482AD] hover:text-[#F5EDED]`}
          onClick={() => setAlgo("half")}
        >
          HALF
        </button>
      </div>
      <div className="flex flex-col space-y-4 p-4 max-w-sm mx-auto">
        <div>
          <label className="block text-[#F5EDED] font-medium">MONTH</label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="mt-1 p-2 w-full border rounded-lg focus:ring-2 focus:ring-black-500 focus:outline-none"
          >
            {months.map((_, index) => (
              <option key={index + 1} value={index + 1}>
                {_}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[#F5EDED] font-medium">YEAR</label>
          <input
            type="number"
            min="1900"
            max="2100"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value) || currentDate.getFullYear())}
            className="mt-1 p-2 w-full border rounded-lg focus:ring-2 focus:ring-black-500 focus:outline-none"
          />
        </div>
      </div>
      {/* <p className="text-center mt-4">Selected: <span className="font-bold">{algo}</span></p> */}
      </div>
      { 
        algo &&    
        <>
          <p>FIRST HALF</p>
          <div className=" p-6 space-y-4 bg-[#7FA1C3] font-outfit">
            <div className="flex space-x-4">
              {Object.keys(teamsFH).map((teamId) => (
                <div
                  key={teamId}
                  onClick={() => setSelectedTeamFH(teamId)}
                  className={`p-4 cursor-pointer bg-[#F5EDED] rounded border ${
                    selectedTeamFH === teamId ? "border-[#6482AD]" : "border-gray-300"
                  }`}
                >
                  <h2 className="text-lg font-bold text-[#6482AD]">{teamId}</h2>
                  {teamsFH[teamId].map((doc) => (
                    <div
                      key={doc.doctor_id}
                      className="flex justify-between items-center text-[#7FA1C3]"
                    >
                      <p>{doc.name}</p>
                      <button
                        onClick={() => removeDoctorFH(doc.doctor_id)}
                        className="text-gray-500 font-bold text-xs p-0 border-none bg-none cursor-pointer ml-1"
                        aria-label={`Remove ${doc.doctor_name || "doctor"}`}
                      >
                        &#10060;
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              <button onClick={addTeamFH} className="px-4 py-2  text-[#F5EDED] rounded">
                + Team
              </button>
            </div>

            {showDoctorDropdownFH && (
              <select
                onChange={(e) =>
                  assignDoctorFH(doctors.find((d) => d.doctor_id == e.target.value))
                }
                className="mt-4 p-2 border rounded bg-white"
              >
                <option value="">Select Doctor</option>
                {doctors
                  .filter((d) => !assignedDoctorsFH.has(d.doctor_id))
                  .map((doc) => (
                    <option key={doc.doctor_id} value={doc.doctor_id}>
                      {doc.name}
                    </option>
                  ))}
              </select>
            )}

            <div className="flex space-x-4 mt-4"> {/* Container for buttons with spacing */}
              <button
                onClick={() => setShowDoctorDropdownFH(!showDoctorDropdownFH)}
                className="px-4 py-2  text-[#F5EDED] rounded"
              >
                + Doctor
              </button>
            </div>
          </div>
          <p>SECOND HALF</p>
          <div className=" p-6 space-y-4 bg-[#7FA1C3] font-outfit">
            <div className="flex space-x-4">
              {Object.keys(teamsSH).map((teamId) => (
                <div
                  key={teamId}
                  onClick={() => setSelectedTeamSH(teamId)}
                  className={`p-4 cursor-pointer bg-[#F5EDED] rounded border ${
                    selectedTeamSH === teamId ? "border-[#6482AD]" : "border-gray-300"
                  }`}
                >
                  <h2 className="text-lg font-bold text-[#6482AD]">{teamId}</h2>
                  {teamsSH[teamId].map((doc) => (
                    <div
                      key={doc.doctor_id}
                      className="flex justify-between items-center text-[#7FA1C3]"
                    >
                      <p>{doc.name}</p>
                      <button
                        onClick={() => removeDoctorSH(doc.doctor_id)}
                        className="text-gray-500 font-bold text-xs p-0 border-none bg-none cursor-pointer ml-1"
                        aria-label={`Remove ${doc.doctor_name || "doctor"}`}
                      >
                        &#10060;
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              <button onClick={addTeamSH} className="px-4 py-2  text-[#F5EDED] rounded">
                + Team
              </button>
            </div>

            {showDoctorDropdownSH && (
              <select
                onChange={(e) =>
                  assignDoctorSH(doctors.find((d) => d.doctor_id == e.target.value))
                }
                className="mt-4 p-2 border rounded bg-white"
              >
                <option value="">Select Doctor</option>
                {doctors
                  .filter((d) => !assignedDoctorsSH.has(d.doctor_id))
                  .map((doc) => (
                    <option key={doc.doctor_id} value={doc.doctor_id}>
                      {doc.name}
                    </option>
                  ))}
              </select>
            )}

            <div className="flex space-x-4 mt-4"> {/* Container for buttons with spacing */}
              <button
                onClick={() => setShowDoctorDropdownSH(!showDoctorDropdownSH)}
                className="px-4 py-2  text-[#F5EDED] rounded"
              >
                + Doctor
              </button>
            </div>
          </div>
          <div className="mt-4"> {/* Container for submit button on a new line */}
              <button onClick={submitTeamsHalf} className="px-4 py-2 bg-[#6482AD] text-white rounded">
                SUBMIT
              </button>
          </div>
        </>
      }
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
            <p>Teams succesfully created.</p>
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
  ))
  
}
