import { useEffect, useState } from "react";
import OffRequestList from "../components/OffRequestList";
import { API_BASE_URL } from "../config";

const Admin = () => {
  const [doctors, setDoctors] = useState([]);
  const [done,setDone] = useState();
  const [editedDoctors, setEditedDoctors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: "", email: "", no_of_consecutive_working_days: 0, no_of_consecutive_night_shifts: 0, no_of_consecutive_offs: 0, worked_last_shift: false });


  const handleEdit = () => setEditMode(true);


  useEffect(() => {
    fetch(`${API_BASE_URL}/api/algoplan/`)
    .then((response) => response.json())
    .then((data) => setDone(data))
    .catch((error) => console.error("Error fetching doctors:", error));

    fetch(`${API_BASE_URL}/api/doctors/`)
      .then((response) => response.json())
      .then((data) => setDoctors(data))
      .catch((error) => console.error("Error fetching doctors:", error));
  }, []);

  const handleInputChange = (doctorId, field, value) => {
    setEditedDoctors((prev) => ({
      ...prev,
      [doctorId]: { ...prev[doctorId], [field]: value },
    }));
  };

  const saveChangesForID = (doctorId) => {
    fetch(`${API_BASE_URL}/api/doctors/${doctorId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editedDoctors[doctorId]),
    }).then(() => {
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.doctor_id === doctorId
            ? { ...doc, ...editedDoctors[doctorId] }
            : doc
        )
      );
      setEditedDoctors((prev) => {
        const newState = { ...prev };
        delete newState[doctorId];
        return newState;
      });
    });
  };

  const saveAllChanges = () => {
    Object.keys(editedDoctors).forEach(doctorId => {
      saveChangesForID(doctorId);
    });
    setEditMode(false);
  };
  

  const makeTeamManager = (doctorId, role) => {
    fetch(`${API_BASE_URL}/api/doctors/${doctorId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: role }),
    }).then(() => {
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.doctor_id === doctorId ? { ...doc, role: role } : doc
        )
      );
    });
  };

  const addDoctor = () => {
    fetch(`${API_BASE_URL}/api/doctors/create/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDoctor),
    })
      .then((res) => res.json())
      .then((data) => {
        setDoctors((prev) => [...prev, data]);
        setNewDoctor({ name: "", email: "", no_of_consecutive_working_days: 0, no_of_consecutive_night_shifts: 0, no_of_consecutive_offs: 0, worked_last_shift: false });
      });
  };

  const deleteDoctor = (doctorId) => {
    fetch(`${API_BASE_URL}/api/doctors/delete/${doctorId}/`, {
      method: "DELETE",
    }).then(() => {
      setDoctors((prev) => prev.filter((doc) => doc.doctor_id !== doctorId));
    });
  };

  return (
    <div className="p-4 font-outfit bg-[#7FA1C3] flex flex-col min-h-screen h-full justify-center items-center">
      <h1 className="text-2xl font-semibold text-center mb-4 text-[#F5EDED]">DOCTOR MANAGEMENT</h1>
      <div className="mt-4 flex flex-row-reverse w-4/5 py-2">
        {editMode ? (
          <button
            onClick={saveAllChanges}
            className="px-4 py-2 bg-green-500 text-[#F5EDED] font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300"
          >
            SAVE
          </button>
        ) : (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-[#6482AD] text-[#F5EDED]  font-semibold rounded-lg shadow-md hover:bg-[#a6b9cd] transition duration-300"
          >
            EDIT
          </button>
        )}
      </div>
      <table className="w-4/5 border-collapse rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-[#E2DAD6] text-[#6482AD]">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Consecutive Working Days</th>
            <th className="border p-2">Consecutive Night Shifts</th>
            <th className="border p-2">Consecutive Off Days</th>
            <th className="border p-2">Last Shift</th>
            <th className="border p-2"></th>
          </tr>
        </thead>
        <tbody className="bg-[#F5EDED] text-[#6482AD]">
          {doctors.map((doc) => (
            <tr key={doc.doctor_id} className="border">
              <td className="border p-2">
                 {doc.name} {doc.role === 2 && "(Admin)"}
              </td>
              <td className="border p-2">
              {editMode ? (
                <input
                  type="email"
                  value={editedDoctors[doc.doctor_id]?.email || doc.email}
                  onChange={(e) =>
                    handleInputChange(doc.doctor_id, "email", e.target.value)
                  }
                  className="w-full p-1 border"
                />) : (
                  doc.email
                )}
              </td>
              <td className="border p-2">
              {editMode ? (
                <input
                  type="number"
                  value={
                    editedDoctors[doc.doctor_id]?.no_of_consecutive_working_days ||
                    doc.no_of_consecutive_working_days
                  }
                  onChange={(e) =>
                    handleInputChange(
                      doc.doctor_id,
                      "no_of_consecutive_working_days",
                      e.target.value
                    )
                  }
                  className="w-full p-1 border"
                />) : (
                  doc.no_of_consecutive_working_days
                )}
              </td>
              <td className="border p-2">
              {editMode ? (
                <input
                  type="number"
                  value={
                    editedDoctors[doc.doctor_id]?.no_of_consecutive_night_shifts ||
                    doc.no_of_consecutive_night_shifts
                  }
                  onChange={(e) =>
                    handleInputChange(
                      doc.doctor_id,
                      "no_of_consecutive_night_shifts",
                      e.target.value
                    )
                  }
                  className="w-full p-1 border"
                />) : (
                  doc.no_of_consecutive_night_shifts
                )}
              </td>
              <td className="border p-2">
              {editMode ? (
                <input
                  type="number"
                  value={
                    editedDoctors[doc.doctor_id]?.no_of_consecutive_offs ||
                    doc.no_of_consecutive_offs
                  }
                  onChange={(e) =>
                    handleInputChange(
                      doc.doctor_id,
                      "no_of_consecutive_offs",
                      e.target.value
                    )
                  }
                  className="w-full p-1 border"
                />) : (
                  doc.no_of_consecutive_offs
                )}
              </td>
              <td className="border p-2 text-center">
              {editMode ? (
                <input
                  type="checkbox"
                  checked={
                    editedDoctors[doc.doctor_id]?.worked_last_shift ??
                    doc.worked_last_shift
                  }
                  onChange={(e) =>
                    handleInputChange(
                      doc.doctor_id,
                      "worked_last_shift",
                      e.target.checked
                    )
                  }
                />) : (
                  doc.worked_last_shift ? <p>Yes</p> : <p>No</p> 
                )}
              </td>
              <td className="border p-2 text-center">
                {/* <button
                  onClick={() => saveChangesForID(doc.doctor_id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                >
                  Save
                </button> */}
                {doc.role !== 1 && (
                  <button
                    onClick={() => makeTeamManager(doc.doctor_id,1)}
                    className="bg-[#F5EDED] text-[#6482AD] px-3 py-1 rounded hover:bg-[#7FA1C3] hover:text-[#F5EDED]"
                  >
                    TM
                  </button>
                )}
                {doc.role === 1 && (
                  <button
                    onClick={() => makeTeamManager(doc.doctor_id,0)}
                    className="bg-[#6482AD] text-[#F5EDED] px-3 py-1 rounded"
                  >
                    TM
                  </button>
                )}
                <button onClick={() => deleteDoctor(doc.doctor_id)} className=" text-white px-3 py-1 rounded">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="w-4/5 mb-4 flex flex-row py-4 justify-start">
        <input type="text" placeholder="Enter Doctor Name" value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} className="p-2 mx-2 rounded-lg bg-[#F5EDED]" />
        <input type="email" placeholder="Enter Doctor Email" value={newDoctor.email} onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })} className="p-2 mr-2 rounded-lg bg-[#F5EDED]" />
        <button onClick={addDoctor} className="bg-[#6482AD] text-[#F5EDED] px-3 py-1 rounded">ADD</button>
      </div>
      {(done && done.length !== 0) &&
          <>
            <h1 className="text-2xl font-semibold text-center mb-4 text-[#F5EDED]">LEAVE MANAGEMENT</h1>
            <OffRequestList />
          </>
      }
    </div>
  );
};

export default Admin;
