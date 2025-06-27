import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';

export default function ManagePeriodDependents({
  rosterId,
  setError,
  setLoading,
  setPopUpMessage,
  setSuccessPopup,
}) {
  const [dependents, setDependents] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [depRes, docRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dependents/${rosterId}/`),
          fetch(`${API_BASE_URL}/api/doctors/`),
        ]);

        if (!depRes.ok || !docRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const depData = await depRes.json();
        const docData = await docRes.json();

        setDependents(depData);
        setDoctors(docData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rosterId, setError, setLoading]);

  const handleInputChange = (index, field, value) => {
    const updated = [...dependents];
    updated[index][field] = value;
    setDependents(updated);
  };

  const handleAddRow = () => {
    setDependents([
      ...dependents,
      { doctor: '', roster_id: rosterId, dep_start: '', dep_end: '' },
    ]);
  };

  const handleRemoveRow = (index) => {
    const updated = [...dependents];
    updated.splice(index, 1);
    setDependents(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const deleteRes = await fetch(`${API_BASE_URL}/api/dependents/${rosterId}/delete-all/`, {
        method: 'DELETE',
      });
      if (!deleteRes.ok) throw new Error('Failed to delete existing dependents');

      const createRes = await fetch(`${API_BASE_URL}/api/dependents/bulk-create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dependents),
      });
      if (!createRes.ok) throw new Error('Failed to save dependents');

      setSuccessPopup(true);
      setPopUpMessage('Dependents successfully updated!');
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDoctorNameById = (id) => {
    const doc = doctors.find((d) => String(d.doctor_id) === String(id));
    return doc ? doc.name : '';
  };

  const getAvailableDoctors = (currentIndex) => {
    const selectedDoctorIds = dependents
      .map((d, i) => (i !== currentIndex ? String(d.doctor) : null))
      .filter(Boolean);

    return doctors.filter((doc) => !selectedDoctorIds.includes(String(doc.doctor_id)));
  };

  return (
    <div className="p-4 m-2 w-[80%]">
      <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold mb-4 text-[#F5EDED]">Dependents</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#6482AD] text-white px-4 py-2 rounded hover:opacity-90"
          >
            Edit
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-[#6482AD] rounded">
          <thead className="bg-[#E2DAD6] text-[#6482AD]">
            <tr>
              <th className="py-2 px-4 border border-[#6482AD]">Doctor</th>
              <th className="py-2 px-4 border border-[#6482AD]">Start</th>
              <th className="py-2 px-4 border border-[#6482AD]">End</th>
              {isEditing && <th className="py-2 px-4 border border-[#6482AD]"></th>}
            </tr>
          </thead>
          <tbody>
            {dependents.map((dep, index) => {
              const availableDoctors = getAvailableDoctors(index);

              return (
                <tr key={index} className="bg-white text-[#6482AD]">
                  <td className="py-2 px-4 border border-[#6482AD]">
                    {isEditing ? (
                      <select
                        value={dep.doctor}
                        onChange={(e) => handleInputChange(index, 'doctor', e.target.value)}
                        className="w-full p-1 border border-[#6482AD] rounded"
                      >
                        <option value="">Select Doctor</option>
                        {availableDoctors.map((doc) => (
                          <option key={doc.doctor_id} value={doc.doctor_id}>
                            {doc.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      getDoctorNameById(dep.doctor)
                    )}
                  </td>
                  <td className="py-2 px-4 border border-[#6482AD]">
                    {isEditing ? (
                      <input
                        type="number"
                        value={dep.dep_start}
                        onChange={(e) => handleInputChange(index, 'dep_start', e.target.value)}
                        className="w-full p-1 border border-[#6482AD] rounded"
                      />
                    ) : (
                      dep.dep_start
                    )}
                  </td>
                  <td className="py-2 px-4 border border-[#6482AD]">
                    {isEditing ? (
                      <input
                        type="number"
                        value={dep.dep_end}
                        onChange={(e) => handleInputChange(index, 'dep_end', e.target.value)}
                        className="w-full p-1 border border-[#6482AD] rounded"
                      />
                    ) : (
                      dep.dep_end
                    )}
                  </td>
                  {isEditing && (
                    <td className="py-2 px-4 border border-[#6482AD] text-center">
                      <button
                        onClick={() => handleRemoveRow(index)}
                        className="px-2 py-1 rounded hover:opacity-90"
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}

            {isEditing && getAvailableDoctors(-1).length > 0 && (
              <tr>
                <td colSpan={4} className="py-2 px-4 text-center">
                  <button
                    onClick={handleAddRow}
                    className="bg-[#7FA1C3] text-white px-4 py-2 rounded hover:opacity-90"
                  >
                    + Add
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSubmit}
            className="bg-[#6482AD] text-white px-6 py-2 rounded font-semibold hover:opacity-90"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="bg-[#6482AD] text-white px-6 py-2 rounded font-semibold hover:opacity-90"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
