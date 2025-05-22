import { useEffect, useState, useContext } from "react";
import { API_BASE_URL } from "../../config";

export default function ManagePeriodRoster({ rosterId, setError, setLoading }) {
  const [roster, setRoster] = useState([]);
  const [teams, setTeams] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editedRoster, setEditedRoster] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rosterRes, teamRes, doctorRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/roster/${rosterId}/`).then(res => res.json()),
          fetch(`${API_BASE_URL}/api/teams/${rosterId}/`).then(res => res.json()),
          fetch(`${API_BASE_URL}/api/doctors/`).then(res => res.json())
        ]);

        setRoster(rosterRes);
        setTeams(teamRes);
        setDoctors(doctorRes);

        // Prepare editable state
        const initialRoster = {};
        rosterRes.forEach((entry, index) => {
          initialRoster[index + 1] = {
            day: entry.day_shift_doctors.map(id => getDoctorName(id, doctorRes)),
            night: entry.night_shift_doctors.map(id => getDoctorName(id, doctorRes))
          };
        });
        setEditedRoster(initialRoster);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message)
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDoctorName = (id, doctorList = doctors) =>
    doctorList.find(doc => doc.doctor_id === id)?.name || id;

  const getDoctorId = (name) =>
    doctors.find(doc => doc.name === name)?.doctor_id;

  const getTeamForDoctor = (name) => {
    const id = getDoctorId(name);
    return teams.find(team => team.doctor === id)?.team_id;
  };

  const getDoctorsInTeam = (teamId) => {
    return teams
      .filter(team => team.team_id === teamId)
      .map(team => {
        const doc = doctors.find(doc => doc.doctor_id === team.doctor);
        return doc?.name;
      })
      .filter(Boolean);
  };

  const handleEditChange = (day, shiftType, teamIndex, value) => {
    const newEditedRoster = { ...editedRoster };
    const updatedShift = [...newEditedRoster[day][shiftType]];
    updatedShift[teamIndex] = value;
    newEditedRoster[day][shiftType] = updatedShift;
    setEditedRoster(newEditedRoster);
  };

  const handleSubmit = async () => {
    const payload = {
      roster_id: rosterId,
      roster: {}
    };

    for (const [day, shifts] of Object.entries(editedRoster)) {
      payload.roster[day] = {
        day: shifts.day.flatMap(val => val ? val.split(",").map(v => v.trim()).filter(Boolean) : []),
        night: shifts.night.flatMap(val => val ? val.split(",").map(v => v.trim()).filter(Boolean) : [])
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/roster/update/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to update roster");
      setMessage("Roster updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update roster");
    }
  };

  const uniqueTeamIds = [...new Set(teams.map(t => t.team_id))];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-[#F5EDED]">Editable Roster</h2>

      {message && <div className="mb-4 text-center text-green-500">{message}</div>}

      <div className="mb-4 flex justify-end">
        {!editing ? (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setEditing(true)}
          >
            Edit Roster
          </button>
        ) : (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Save Changes
          </button>
        )}
      </div>

      <table className="w-full text-left border-collapse bg-white shadow rounded">
        <thead>
          <tr className="bg-[#E2DAD6] text-[#6482AD]">
            <th className="border p-2">Date</th>
            {uniqueTeamIds.map((id, idx) => (
              <th className="border p-2" key={`day-${id}`}>Day - Team {idx + 1}</th>
            ))}
            {uniqueTeamIds.map((id, idx) => (
              <th className="border p-2" key={`night-${id}`}>Night - Team {idx + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roster.map((entry, index) => {
            const day = index + 1;
            return (
              <tr key={entry.date} className="border text-[#6482AD]">
                <td className="border p-2">{entry.date}</td>
                {uniqueTeamIds.map((teamId, tIdx) => {
                  const teamDoctors = getDoctorsInTeam(teamId);
                  const value = editedRoster[day]?.day?.[tIdx] || "";

                  return (
                    <td className="border p-2" key={`edit-day-${teamId}`}>
                      {editing ? (
                        <input
                          type="text"
                          className="w-full border px-2 py-1"
                          placeholder={`Comma-separated`}
                          value={value}
                          onChange={(e) =>
                            handleEditChange(day, "day", tIdx, e.target.value)
                          }
                          list={`day-team-${teamId}`}
                        />
                      ) : (
                        value
                      )}
                      <datalist id={`day-team-${teamId}`}>
                        {teamDoctors.map(name => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                    </td>
                  );
                })}
                {uniqueTeamIds.map((teamId, tIdx) => {
                  const teamDoctors = getDoctorsInTeam(teamId);
                  const value = editedRoster[day]?.night?.[tIdx] || "";

                  return (
                    <td className="border p-2" key={`edit-night-${teamId}`}>
                      {editing ? (
                        <input
                          type="text"
                          className="w-full border px-2 py-1"
                          placeholder={`Comma-separated`}
                          value={value}
                          onChange={(e) =>
                            handleEditChange(day, "night", tIdx, e.target.value)
                          }
                          list={`night-team-${teamId}`}
                        />
                      ) : (
                        value
                      )}
                      <datalist id={`night-team-${teamId}`}>
                        {teamDoctors.map(name => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
