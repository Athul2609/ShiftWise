import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";

function ManagePeriodTeam({ rosterId, setError, setLoading, setPopUpMessage, setSuccessPopup }) {
  const [teams, setTeams] = useState({});
  const [originalAssignments, setOriginalAssignments] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [assignedDoctors, setAssignedDoctors] = useState(new Set());
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // 🔹 NEW

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const docRes = await fetch(`${API_BASE_URL}/api/doctors/`);
        const docData = await docRes.json();
        setDoctors(docData);
        const doctorMap = Object.fromEntries(docData.map(d => [d.doctor_id, d]));

        const teamRes = await fetch(`${API_BASE_URL}/api/teams/${rosterId}`);
        const teamData = await teamRes.json();
        setOriginalAssignments(teamData);

        const grouped = {};
        teamData.forEach(({ team_id, doctor }) => {
          if (!grouped[team_id]) grouped[team_id] = [];
          const fullDoctor = doctorMap[doctor];
          if (fullDoctor) grouped[team_id].push(fullDoctor);
        });

        setTeams(grouped);
        setSelectedTeam(Object.keys(grouped)[0] || "");
        setAssignedDoctors(new Set(teamData.map(entry => entry.doctor)));
      } catch (err) {
        setError("Failed to load team data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [rosterId, setError, setLoading]);

  const addTeam = () => {
    const teamId = `T${
      Math.max(
        0,
        ...Object.keys(teams)
          .map(key => parseInt(key.replace("T", ""), 10))
          .filter(n => !isNaN(n))
      ) + 1
    }`
    setTeams({ ...teams, [teamId]: [] });
    setSelectedTeam(teamId);
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

  const removeDoctor = (doctorId) => {
    setTeams({
      ...teams,
      [selectedTeam]: teams[selectedTeam].filter(doc => doc.doctor_id !== doctorId),
    });
    const updatedAssigned = new Set(assignedDoctors);
    updatedAssigned.delete(doctorId);
    setAssignedDoctors(updatedAssigned);
  };

  const submitUpdate = async () => {
    setLoading(true);
    try {
      const updatedAssignments = Object.entries(teams).flatMap(([team_id, doctors]) =>
        doctors.map(({ doctor_id }) => ({
          team_id,
          doctor: doctor_id,
          roster_id: rosterId,
        }))
      );

      const originalMap = new Map(originalAssignments.map(item => [`${item.doctor}`, item.team_id]));
      const updatedMap = new Map(updatedAssignments.map(item => [`${item.doctor}`, item.team_id]));

      const allDoctorIds = new Set([...originalMap.keys(), ...updatedMap.keys()]);

      for (const doctorId of allDoctorIds) {
        const originalTeam = originalMap.get(doctorId);
        const updatedTeam = updatedMap.get(doctorId);

        if (!originalTeam && updatedTeam) {
          await fetch(`${API_BASE_URL}/api/teams/create/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([
              {
                team_id: updatedTeam,
                doctor: parseInt(doctorId),
                roster_id: rosterId,
              },
            ]),
          });
        } else if (originalTeam && !updatedTeam) {
          await fetch(`${API_BASE_URL}/api/teams/delete/${rosterId}/${doctorId}/`, {
            method: "DELETE",
          });
        } else if (originalTeam !== updatedTeam) {
          await fetch(`${API_BASE_URL}/api/teams/update/${rosterId}/${doctorId}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              team_id: updatedTeam,
              doctor: parseInt(doctorId),
              roster_id: rosterId,
            }),
          });
        }
      }

      setSuccessPopup(true);
      setPopUpMessage("Teams successfully updated!");
      setIsEditing(false); // Exit edit mode
    } catch (err) {
      console.error("Error updating teams:", err);
      setError(err.message || "Error updating teams");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    // Revert to original state
    const doctorMap = Object.fromEntries(doctors.map(d => [d.doctor_id, d]));
    const grouped = {};

    originalAssignments.forEach(({ team_id, doctor }) => {
      if (!grouped[team_id]) grouped[team_id] = [];
      const fullDoctor = doctorMap[doctor];
      if (fullDoctor) grouped[team_id].push(fullDoctor);
    });

    setTeams(grouped);
    setAssignedDoctors(new Set(originalAssignments.map(entry => entry.doctor)));
    setIsEditing(false);
    setShowDoctorDropdown(false);
  };

  return (
    <div className="p-6 w-[80%] space-y-4 bg-[#7FA1C3] font-outfit rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-[#F5EDED]">Teams</h2>
      <div className="flex justify-end">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-[#6482AD] text-white rounded hover:bg-[#5a7296]"
          >
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={submitUpdate}
              className="px-4 py-2 bg-[#6482AD] text-white rounded hover:bg-[#5a7296]"
            >
              Save
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 border border-white text-white rounded hover:bg-[#5a7296]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-2">
        {Object.keys(teams).map((teamId) => (
          <div
            key={teamId}
            onClick={() => setSelectedTeam(teamId)}
            className={`min-w-[200px] p-4 cursor-pointer bg-[#F5EDED] rounded border ${
              selectedTeam === teamId ? "border-[#6482AD]" : "border-gray-300"
            }`}
          >
            <h3 className="text-lg font-bold text-[#6482AD]">{teamId.replace("T","Team ")}</h3>
            {teams[teamId].map((doc) => (
              <div key={doc.doctor_id} className="flex justify-between items-center text-[#7FA1C3]">
                <p>{doc.name}</p>
                {isEditing && (
                  <button onClick={() => removeDoctor(doc.doctor_id)} className="ml-1 text-xs">&#10060;</button>
                )}
              </div>
            ))}
          </div>
        ))}

        {isEditing && (
          <button onClick={addTeam} className="px-4 py-2 text-[#F5EDED] border border-[#F5EDED] rounded">
            + Team
          </button>
        )}
      </div>

      {showDoctorDropdown && isEditing && (
        <select
          onChange={(e) =>
            assignDoctor(doctors.find((d) => d.doctor_id === parseInt(e.target.value)))
          }
          className="mt-2 p-2 border rounded bg-white"
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

      {isEditing && (
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => setShowDoctorDropdown(!showDoctorDropdown)}
            className="px-4 py-2 text-[#F5EDED] border border-[#F5EDED] rounded"
          >
            + Doctor
          </button>
        </div>
      )}
    </div>
  );
}

export default ManagePeriodTeam;
