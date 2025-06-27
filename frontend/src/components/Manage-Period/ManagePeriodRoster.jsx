import { useEffect, useState, useContext } from "react";
import { API_BASE_URL } from "../../config";

export default function ManagePeriodRoster({ rosterId, setError, setLoading, setPopUpMessage, setSuccessPopup }) {
  const [roster, setRoster] = useState([]);
  const [teams, setTeams] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editedRoster, setEditedRoster] = useState({});
  const [selectValues, setSelectValues] = useState({});
  const [startDate, setStartDate] = useState();


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
        setStartDate(rosterRes[0].date)
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

  const handleEditChange = (day, shiftType, e) => {
    const newEditedRoster = { ...editedRoster };
    const updatedShift = [...newEditedRoster[day][shiftType]];
    updatedShift.push(e.target.value);
    newEditedRoster[day][shiftType] = updatedShift;
    setEditedRoster(newEditedRoster);
  };

  const handleSubmit = async () => {
    const payload = {
      roster_id: rosterId,
      roster: {}
    };

    for (const [day, shifts] of Object.entries(editedRoster)) {
      payload.roster[startDate + parseInt(day) - 1] = {
        day: shifts.day.flatMap(val => val ? val.split(",").map(v => v.trim()).filter(Boolean) : []),
        night: shifts.night.flatMap(val => val ? val.split(",").map(v => v.trim()).filter(Boolean) : [])
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/roster/update/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to update roster");
      setPopUpMessage("Roster updated successfully!");
      setEditing(false);
      setSuccessPopup(true)
    } catch (err) {
      console.error(err);
      setError("Failed to update roster");
    }
  };

  const handleCheck = async () => {
    const payload = {
      roster_id: rosterId,
      roster: {}
    };
    for (const [day, shifts] of Object.entries(editedRoster)) {
      payload.roster[startDate + parseInt(day) - 1] = {
        day: shifts.day.flatMap(val => val ? val.split(",").map(v => v.trim()).filter(Boolean) : []),
        night: shifts.night.flatMap(val => val ? val.split(",").map(v => v.trim()).filter(Boolean) : [])
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/roster/check/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to check roster");
      const data = await response.json();
      setMessage(data.message)
    } catch (err) {
      console.error(err);
      setError(err.message)
    }
  }
  const uniqueTeamIds = [...new Set(teams.map(t => t.team_id))];

  return (
    <div className="p-4 w-[80%]">
      <h2 className="text-2xl font-bold mb-4 text-[#F5EDED]">Roster</h2>
      <div className="mb-4 flex justify-end">
          <button
            className=" bg-[#6482AD] text-white hover:bg-[#5a7296] px-4 py-2 rounded mr-1"
            onClick={handleCheck}
          >
            Check
          </button>
        {!editing ? (
          <button
            className=" bg-[#6482AD] text-white hover:bg-[#5a7296] px-4 py-2 rounded"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        ) : (
          <button
            className=" bg-[#6482AD] text-white hover:bg-[#5a7296] px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Save Changes
          </button>
        )}
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-full table-auto text-left border-collapse bg-[#F5EDED] shadow rounded">
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
                    const value = editedRoster[day]?.day
                      ?.filter(v => teamDoctors.includes(v))
                      .join(", ") || "";
                    const selectedDoctors = editedRoster[day]?.day
                      ?.filter(v => teamDoctors.includes(v)) || []


                    return (
                      <td className="border p-2" key={`edit-day-${teamId}`}>
                        {editing ? (() => {
                          const selectKey = `${day}-${"day"}-${teamId}`;
                          const selectedValue = selectValues[selectKey] || "";

                          return (
                            <div>
                              {selectedDoctors.map((doc) => (
                                <div key={doc} className="flex items-center gap-2">
                                  <span>{doc}</span>
                                  <button
                                    className="text-red-500 hover:underline text-sm"
                                    onClick={() => {
                                      const newEditedRoster = { ...editedRoster };
                                      const updatedShift = newEditedRoster[day]["day"].filter(d => d !== doc);
                                      newEditedRoster[day]["day"] = updatedShift;
                                      setEditedRoster(newEditedRoster);
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}

                              <br /><br />

                              <label>Add Doctor:</label>
                              <select
                                value={selectedValue}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleEditChange(day, "day", { target: { value } });
                                  setSelectValues(prev => ({ ...prev, [selectKey]: "" }));
                                }}
                              >
                                <option value="" disabled>Select a doctor to add</option>
                                {teamDoctors
                                  .filter(doc => !selectedDoctors.includes(doc))
                                  .map(doc => (
                                    <option key={doc} value={doc}>{doc}</option>
                                  ))}
                              </select>
                            </div>
                          );
                        })() : (
                          value
                        )}
                      </td>
                    );
                  })}
                  {uniqueTeamIds.map((teamId, tIdx) => {
                    const teamDoctors = getDoctorsInTeam(teamId);
                    const value = editedRoster[day]?.night
                      ?.filter(v => teamDoctors.includes(v))
                      .join(", ") || "";
                    const selectedDoctors = editedRoster[day]?.night
                      ?.filter(v => teamDoctors.includes(v)) || []

                    return (
                      <td className="border p-2" key={`edit-night-${teamId}`}>
                        {editing ? (() => {
                          const selectKey = `${day}-${"night"}-${teamId}`;
                          const selectedValue = selectValues[selectKey] || "";

                          return (
                            <div>
                              {selectedDoctors.map((doc) => (
                                <div key={doc} className="flex items-center gap-2">
                                  <span>{doc}</span>
                                  <button
                                    className="text-red-500 hover:underline text-sm"
                                    onClick={() => {
                                      const newEditedRoster = { ...editedRoster };
                                      const updatedShift = newEditedRoster[day]["night"].filter(d => d !== doc);
                                      newEditedRoster[day]["night"] = updatedShift;
                                      setEditedRoster(newEditedRoster);
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}

                              <br /><br />

                              <label>Add Doctor:</label>
                              <select
                                value={selectedValue}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleEditChange(day, "night", { target: { value } });
                                  setSelectValues(prev => ({ ...prev, [selectKey]: "" }));
                                }}
                              >
                                <option value="" disabled>Select a doctor to add</option>
                                {teamDoctors
                                  .filter(doc => !selectedDoctors.includes(doc))
                                  .map(doc => (
                                    <option key={doc} value={doc}>{doc}</option>
                                  ))}
                              </select>
                            </div>
                          );
                        })() : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    {message && (
      <div className="mt-4 p-4 rounded-xl border text-[#6482AD] bg-[#F5EDED] border-[#E2DAD6]">
        <h2 className="text-lg font-semibold mb-2 text-[#6482AD]">Check Result</h2>
        <p className="whitespace-pre-line m-0">{message}</p>
      </div>
    )}
    </div>
  );
}
