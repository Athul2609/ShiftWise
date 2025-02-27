import { useEffect, useState } from "react";

const TeamsHalf = () => {
  const [teams, setTeams] = useState([]);
  const [doctors, setDoctors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsResponse = await fetch("http://127.0.0.1:8000/api/teams/");
        const teamsData = await teamsResponse.json();
        const doctorsResponse = await fetch("http://127.0.0.1:8000/api/doctors/");
        const doctorsData = await doctorsResponse.json();
        
        const doctorMap = doctorsData.reduce((acc, doc) => {
          acc[doc.doctor_id] = doc.name;
          return acc;
        }, {});

        setDoctors(doctorMap);
        setTeams(teamsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) return <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
  <div className="flex flex-col items-center">
    <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    <p className="mt-4 text-lg text-white">Loading...</p>
  </div>
</div>;

  const groupedTeams = teams.reduce((acc, team) => {
    const half = team.scheduling_half === 1 ? "First Half" : team.scheduling_half === 2 ? "Second Half": "No Half";
    if (!acc[half]) acc[half] = {};
    if (!acc[half][team.team_id]) acc[half][team.team_id] = [];
    acc[half][team.team_id].push(team);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* <h1 className="text-2xl font-bold text-center mb-6">Team Schedules</h1> */}
      { groupedTeams["First Half"] ?
      <>      
        <div className="mb-6">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4 text-[#F5EDED]">First Half</h2>
            <div className="flex space-x-4">
                {Object.entries(groupedTeams["First Half"]).map(([teamName, members]) => (
                    <div key={teamName} className="mb-4 p-4 bg-[#F5EDED] rounded border">
                    <h3 className="text-lg font-bold text-[#6482AD]">{teamName}</h3>
                    <ul className="list-disc pl-5">
                        {members.map((member, index) => (
                        <li key={index} className="text-[#7FA1C3]">
                            {doctors[member.doctor] || `Doctor ${member.doctor}`}
                        </li>
                        ))}
                    </ul>
                    </div>
                ))}
            </div>
            </div>
        <div className="mb-6">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4 text-[#F5EDED]">Second Half</h2>
            <div className="flex space-x-4">
                {Object.entries(groupedTeams["Second Half"]).map(([teamName, members]) => (
                    <div key={teamName} className="mb-4 p-4 bg-[#F5EDED] rounded border">
                    <h3 className="text-lg font-medium mb-2 text-[#6482AD]">{teamName}</h3>
                    <ul className="list-disc pl-5">
                        {members.map((member, index) => (
                        <li key={index} className="text-[#7FA1C3]">
                            {doctors[member.doctor] || `Doctor ${member.doctor}`}
                        </li>
                        ))}
                    </ul>
                    </div>
                ))}
            </div>
            </div>
      </>
      :
      <div className="mb-6">
      <div className="flex space-x-4">
          {Object.entries(groupedTeams["No Half"]).map(([teamName, members]) => (
              <div key={teamName} className="mb-4 p-4 bg-[#F5EDED] rounded border">
              <h3 className="text-lg font-medium mb-2 text-[#6482AD]">{teamName}</h3>
              <ul className="list-disc pl-5">
                  {members.map((member, index) => (
                  <li key={index} className="text-[#7FA1C3]">
                      {doctors[member.doctor] || `Doctor ${member.doctor}`}
                  </li>
                  ))}
              </ul>
              </div>
          ))}
      </div>
      </div>
      }
    </div>
  );
};

export default TeamsHalf;