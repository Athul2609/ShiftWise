import { useEffect, useState } from "react";

export default function TeamManagement() {
  const [algo,setAlgo] = useState();
  const [doctors, setDoctors] = useState([]);

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

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/doctors/")
      .then((response) => response.json())
      .then((data) => setDoctors(data))
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
    const formattedTeams = Object.entries(teams).flatMap(([teamId, doctors]) =>
      doctors.map((doctor) => ({ team_id: teamId, doctor: doctor.doctor_id, scheduling_half: 0 }))
    );
    fetch("http://127.0.0.1:8000/api/teams/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedTeams),
    })
      .then((response) => response.json())
      .then(() => {
        alert("Teams submitted successfully!");
        window.location.reload();
      })
      .catch((error) => console.error("Error submitting teams:", error));
  };

  const submitTeamsHalf = () => {
    const formatTeams = (teams, schedulingHalf) => 
      Object.entries(teams).flatMap(([teamId, doctors]) => 
        doctors.map(({ doctor_id }) => ({ team_id: teamId, doctor: doctor_id, scheduling_half: schedulingHalf }))
      );
  
    const submitTeams = async (teamsData) => {
      try {
        await fetch("http://127.0.0.1:8000/api/teams/create/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teamsData),
        });
      } catch (error) {
        console.error("Error submitting teams:", error);
      }
    };
  
    Promise.all([submitTeams(formatTeams(teamsFH, 1)), submitTeams(formatTeams(teamsSH, 2))])
      .then(() => {
        alert("Teams submitted successfully!");
        window.location.reload();
      })
      .catch(() => console.error("Error submitting one or more team submissions"));
  };
  

  return algo === "Full" ?
  (
    <div className="flex flex-col items-center h-screen bg-[#7FA1C3]">
      <div className=" p-4 rounded-xl border-none">
      <h2 className="text-xl font-semibold text-center mb-4 text-[#F5EDED]">ALGORITHM</h2>
      <div className="flex rounded-xl overflow-hidden border-none">
        <button
          className={`px-6 py-2 ${algo ==="Full"? "bg-[#6482AD] text-[#F5EDED]" : "bg-[#F5EDED] text-[#6482AD]"} hover:bg-[#6482AD] hover:text-[#F5EDED]`}
          onClick={() => setAlgo("Full")}
        >
          FULL
        </button>
        <button
          className={`px-6 py-2 ${algo ==="Half"? "bg-[#6482AD] text-[#F5EDED]" : "bg-[#F5EDED] text-[#6482AD]"} hover:bg-[#6482AD] hover:text-[#F5EDED]`}
          onClick={() => setAlgo("Half")}
        >
          HALF
        </button>
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
          <button onClick={submitTeams} className="px-4 py-2 bg-[#6482AD] text-white rounded">
            SUBMIT
          </button>
      </div>
    </div>
  )
  :
  (
    <div className="flex flex-col items-center h-screen bg-[#7FA1C3]">
      <div className=" p-4 rounded-xl border-none">
      <h2 className="text-xl font-semibold text-center mb-4 text-[#F5EDED]">ALGORITHM</h2>
      <div className="flex rounded-xl overflow-hidden border-none">
        <button
          className={`px-6 py-2 ${algo ==="Full"? "bg-[#6482AD] text-[#F5EDED]" : "bg-[#F5EDED] text-[#6482AD]"} hover:bg-[#6482AD] hover:text-[#F5EDED]`}
          onClick={() => setAlgo("Full")}
        >
          FULL
        </button>
        <button
          className={`px-6 py-2 ${algo ==="Half"? "bg-[#6482AD] text-[#F5EDED]" : "bg-[#F5EDED] text-[#6482AD]"} hover:bg-[#6482AD] hover:text-[#F5EDED]`}
          onClick={() => setAlgo("Half")}
        >
          HALF
        </button>
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
    </div>
  );
}
