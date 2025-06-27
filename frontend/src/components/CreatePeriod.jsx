import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../config";
import { months, getLastDayOfMonth } from "../utils/utils";

function CreatePeriod({ setLoading, setError, setSuccessPopup, setPopUpMessage}) {
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log("Render count:", renderCount.current);

  const currentDate = new Date();
  const [startDate, setStartDate] = useState(currentDate.getDate());
  const [schedulingMonth, setSchedulingMonth] = useState(currentDate.getMonth() + 1);
  const [schedulingYear, setSchedulingYear] = useState(currentDate.getFullYear());
  const [endDate, setEndDate] = useState(currentDate.getDate()+1);

  const [teams, setTeams] = useState({ "Team 1": [] });
  const [selectedTeam, setSelectedTeam] = useState("Team 1");
  const [assignedDoctors, setAssignedDoctors] = useState(new Set());
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [dependents, setDependents] = useState([]);

  const [manualInput, setManualInput] = useState(false);


  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const planRes = await fetch(`${API_BASE_URL}/api/algoplan/`);
        const plans = await planRes.json();

        if (!Array.isArray(plans) || plans.length === 0) {
          setManualInput(true);
        } else {
          let max = plans.reduce((a, b) => a.roster_id > b.roster_id ? a : b);
          const nextDate = new Date(max.year, max.month - 1, max.end_date);
          nextDate.setDate(nextDate.getDate() + 1);
          setStartDate(nextDate.getDate());
          setSchedulingMonth(nextDate.getMonth() + 1);
          setSchedulingYear(nextDate.getFullYear());
          setEndDate(nextDate.getDate() + 1)
        }

        const doctorRes = await fetch(`${API_BASE_URL}/api/doctors/`);
        const doctorsData = await doctorRes.json();
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [setLoading]);

  const validateDependents = () => {
    for (let i = 0; i < dependents.length; i++) {
      const dep = dependents[i];
      const label = `Dependent #${i + 1}`;

      if (!dep.doctorId) {
        setError(`${label}: Doctor is not selected.`);
        return false;
      }

      if (dep.dep_start === '' || dep.dep_start === undefined || isNaN(dep.dep_start)) {
        setError(`${label}: Start day is missing or invalid.`);
        return false;
      }

      if (dep.dep_end === '' || dep.dep_end === undefined || isNaN(dep.dep_end)) {
        setError(`${label}: End day is missing or invalid.`);
        return false;
      }

      if (Number(dep.dep_start) >= Number(dep.dep_end)) {
        setError(`${label}: Start day must be less than end day.`);
        return false;
      }
    }

    setError("");
    return true;
  }

  const addTeam = () => {
    const teamId = `T${Object.keys(teams).length + 1}`;
    setTeams({ ...teams, [teamId]: [] });
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
      [selectedTeam]: teams[selectedTeam].filter((doc) => doc.doctor_id !== doctorId),
    });
    setAssignedDoctors(new Set([...assignedDoctors].filter((id) => id !== doctorId)));
  };

  const submitTeamsFunc = async () => {
    setLoading(true);

    try {
      if(validateDependents()){
        // First create algoplan
        const planRes = await fetch(`${API_BASE_URL}/api/algoplan/create/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            month: schedulingMonth,
            year: schedulingYear,
            start_date: startDate,
            end_date: endDate,
          }),
        });

        const newPlan = await planRes.json();
        const newRosterId = newPlan.roster_id;

        const formattedTeams = Object.entries(teams).flatMap(([teamId, doctors]) =>
          doctors.map(({ doctor_id }) => ({
            team_id: teamId,
            doctor: doctor_id,
            roster_id: newRosterId,
          }))
        );

        await fetch(`${API_BASE_URL}/api/teams/create/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedTeams),
        });

        const validDependents = dependents
          .map((d) => ({
          doctor: d.doctorId,
          roster_id: newRosterId,
          dep_start: d.dep_start,
          dep_end: d.dep_end,
          }));
  
        await fetch(`${API_BASE_URL}/api/dependents/bulk-create/`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(validDependents),
        });
        setSuccessPopup(true);
        setPopUpMessage("Teams sucessfully created!")
      }

    } catch (err) {
      console.error("Error submitting:", err);
      setError("Error submitting teams");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center p-4 border shadow-2xl border-[#6482AD] rounded-lg w-[80%] mt-10 mb-5">
      <h2 className="text-3xl font-bold mb-4 text-[#F5EDED]">
        Create Period
      </h2>
      <div className="p-4 rounded-xl border-none">
        <div className="flex flex-col space-y-4 p-4 max-w-sm mx-auto">
            {manualInput ? (
            <>
                <div>
                  <label className="block text-[#F5EDED] font-medium">Month</label>
                  <select
                      value={schedulingMonth || ""}
                      onChange={(e) => setSchedulingMonth(parseInt(e.target.value))}
                      className="mt-1 p-2 w-full border rounded-lg"
                  >
                      {months.map((name, index) => (
                      <option key={index + 1} value={index + 1}>{name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#F5EDED] font-medium">Year</label>
                  <input
                      type="number"
                      min={currentDate.getFullYear()}
                      max="2100"
                      value={schedulingYear || ""}
                      onChange={(e) => setSchedulingYear(parseInt(e.target.value))}
                      className="mt-1 p-2 w-full border rounded-lg"
                  />
                </div>
                { schedulingMonth && schedulingYear &&
                  <div>
                    <label className="block text-[#F5EDED] font-medium">Start date</label>
                    <select
                        value={startDate || ""}
                        onChange={(e) => setStartDate(parseInt(e.target.value))}
                        className="mt-1 p-2 w-full border rounded-lg"
                    >
                      {/* <option value="">Select Start Date</option> */}
                      {
                        Array.from({ length: getLastDayOfMonth(schedulingMonth, schedulingYear) - 1 }, (_, i) => i + 1)
                            .map((date) => (
                            <option key={date} value={date}>{date}</option>
                            ))
                      }
                    </select>
                  </div>
                }
            </>
            ) : (
            <>
                <div>
                  <label className="block text-[#F5EDED] font-medium">Month</label>
                  <p className="text-black bg-white border border-white rounded-lg mt-1 p-2 w-full">{months[schedulingMonth - 1]}</p>
                </div>
                <div>
                  <label className="block text-[#F5EDED] font-medium">Year</label>
                  <p className="text-black bg-white border border-white rounded-lg mt-1 p-2 w-full">{schedulingYear}</p>
                </div>
                <div>
                  <label className="block text-[#F5EDED] font-medium">Start Date</label>
                  <p className="text-black bg-white border border-white rounded-lg mt-1 p-2 w-full">{startDate}</p>
                </div>
            </>
            )}
            { startDate && schedulingMonth && schedulingYear &&
              <div>
                <label className="block text-[#F5EDED] font-medium">End date</label>
                <select
                    value={endDate || ""}
                    onChange={(e) => setEndDate(parseInt(e.target.value))}
                    className="mt-1 p-2 w-full border rounded-lg"
                >
                    {/* <option value="">Select End Date</option> */}
                    {startDate &&
                    Array.from({ length: getLastDayOfMonth(schedulingMonth, schedulingYear) - startDate }, (_, i) => startDate + 1 + i)
                        .map((date) => (
                        <option key={date} value={date}>{date}</option>
                        ))
                    }
                </select>
              </div>
            }
        </div>
      </div>

      {/* Teams */}
      <div className="p-6 space-y-4 bg-[#7FA1C3] font-outfit">
        <div className="flex space-x-4">
          {Object.keys(teams).map((teamId) => (
            <div
              key={teamId}
              onClick={() => setSelectedTeam(teamId)}
              className={`p-4 cursor-pointer bg-[#F5EDED] rounded border ${selectedTeam === teamId ? "border-[#6482AD]" : "border-gray-300"}`}
            >
              <h2 className="text-lg font-bold text-[#6482AD]">{teamId}</h2>
              {teams[teamId].map((doc) => (
                <div key={doc.doctor_id} className="flex justify-between items-center text-[#7FA1C3]">
                  <p>{doc.name}</p>
                  <button onClick={() => removeDoctor(doc.doctor_id)} className="ml-1 text-xs">&#10060;</button>
                </div>
              ))}
            </div>
          ))}
          <button onClick={addTeam} className="px-4 py-2 text-[#F5EDED] rounded">
            + Team
          </button>
        </div>

        {showDoctorDropdown && (
          <select
            onChange={(e) => {
              console.log(doctors)
              assignDoctor(doctors.find((d) => d.doctor_id === parseInt(e.target.value)))
            }}
            className="mt-4 p-2 border rounded bg-white"
          >
            <option value="">Select Doctor</option>
            {doctors
              .filter((d) => !assignedDoctors.has(d.doctor_id))
              .filter((d) => d.role !== 2)
              .map((doc) => (
                <option key={doc.doctor_id} value={doc.doctor_id}>{doc.name}</option>
              ))}
          </select>
        )}

        <div className="flex space-x-4 mt-4">
          <button onClick={() => setShowDoctorDropdown(!showDoctorDropdown)} className="px-4 py-2 text-[#F5EDED] rounded">
            + Doctor
          </button>
        </div>
      </div>

      <h3 className="text-xl font-semibold mt-2 text-[#F5EDED]">Dependents</h3>
      {dependents.map((dep, index) => (
        <div key={index} className="flex gap-4 items-center my-2">
          {/* Doctor Select */}
          <select
            value={dep.doctorId || ""}
            onChange={(e) => {
              const updated = [...dependents];
              updated[index].doctorId = e.target.value;
              setDependents(updated);
            }}
            className="p-2 border rounded bg-white"
          >
            <option value="">Select Doctor</option>
            {doctors
              .filter((d) => assignedDoctors.has(d.doctor_id))
              // .filter((d) => !dependents.filter((dep) => dep.doctorId == d.doctor_id).length)
              .filter((d) => d.role !== 2)
              .map((doc) => (
                <option key={doc.doctor_id} value={doc.doctor_id}>
                  {doc.name}
                </option>
              ))}
          </select>

          {/* Start Date Select */}
          <select
            value={dep.dep_start || ""}
            onChange={(e) => {
              const updated = [...dependents];
              updated[index].dep_start = parseInt(e.target.value);
              setDependents(updated);
            }}
            className="p-2 border rounded bg-white"
          >
            <option value="">Start Day</option>
            {Array.from({ length: endDate - startDate + 1 }, (_, i) => startDate + i).map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>

          {/* End Date Select */}
          <select
            value={dep.dep_end || ""}
            onChange={(e) => {
              const updated = [...dependents];
              updated[index].dep_end = parseInt(e.target.value);
              setDependents(updated);
            }}
            className="p-2 border rounded bg-white"
          >
            <option value="">End Day</option>
            {Array.from({ length: endDate - startDate + 1 }, (_, i) => startDate + i).map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setDependents(dependents.filter((_, i) => i !== index));
            }}
            className="text-red-500 hover:text-red-700 font-bold text-lg bg-"
            title="Delete"
          >
            ✕
          </button>
        </div>
      ))
      }

      {/* + Dependent Button */}
      <button
        onClick={() =>
          setDependents((prev) => [...prev, { doctorId: "", dep_start: "", dep_end: "" }])
        }
        className="px-4 py-2 text-[#F5EDED] rounded"
      >
        + Dependent
      </button>

      {/* <div className="space-y-4">
        {Array.from(assignedDoctors).map((doc) => {
            const existing = dependents.find((d) => d.doctorId === doc.id);
            const isChecked = !!existing;

            return (
            <div key={doc.id} className="p-2 border border-white rounded-lg text-white">
                <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                    if (e.target.checked) {
                        setDependents((prev) => [
                        ...prev,
                        { doctorId: doc.id, dep_start: null, dep_end: null },
                        ]);
                    } else {
                        setDependents((prev) => prev.filter((d) => d.doctorId !== doc.id));
                    }
                    }}
                />
                <span>{doctors.filter((d) => d.doctor_id === doc)[0].name}</span>
                </label>

                {isChecked && (
                <div className="ml-6 mt-2 flex gap-4">
                    <div>
                    <label className="block text-sm">Dependency Start</label>
                    <select
                        value={existing?.dep_start || ""}
                        onChange={(e) =>
                        setDependents((prev) =>
                            prev.map((d) =>
                            d.doctorId === doc.id
                                ? { ...d, dep_start: parseInt(e.target.value) }
                                : d
                            )
                        )
                        }
                        className="p-1 rounded text-black"
                    >
                        <option value="">Select</option>
                        {Array.from(
                        { length: (endDate || 0) - (startDate || 0) + 1 },
                        (_, i) => (startDate || 0) + i
                        ).map((day) => (
                        <option key={day} value={day}>
                            {day}
                        </option>
                        ))}
                    </select>
                    </div>

                    <div>
                    <label className="block text-sm">Dependency End</label>
                    <select
                        value={existing?.dep_end || ""}
                        onChange={(e) =>
                        setDependents((prev) =>
                            prev.map((d) =>
                            d.doctorId === doc.id
                                ? { ...d, dep_end: parseInt(e.target.value) }
                                : d
                            )
                        )
                        }
                        className="p-1 rounded text-black"
                    >
                        <option value="">Select</option>
                        {Array.from(
                        { length: (endDate || 0) - (startDate || 0) + 1 },
                        (_, i) => (startDate || 0) + i
                        ).map((day) => (
                        <option key={day} value={day}>
                            {day}
                        </option>
                        ))}
                    </select>
                    </div>
                </div>
                )}
            </div>
            );
        })}
      </div> */}

      <div className="mt-4">
        <button onClick={submitTeamsFunc} className="px-4 py-2 mb-4 bg-[#6482AD] text-white rounded">
          SUBMIT
        </button>
      </div>
    </div>
  );
}

export default CreatePeriod;
