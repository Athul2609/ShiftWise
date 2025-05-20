import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../App";
import { API_BASE_URL } from "../config";

const itemsPerPage = 5;

const ViewOffs = () => {
  const { user } = useContext(AuthContext);
  const doctor_id = user?.doctorId;

  const [offs, setOffs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage,setItemsPerPage] = useState(5)

  useEffect(() => {
    if (!doctor_id) return;

    const fetchOffs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/off-requests/${doctor_id}/`);
        const data = await response.json();
        const sortedData = data.sort((a, b) => b.date - a.date); // descending order
        setOffs(sortedData);
      } catch (error) {
        console.error("Error fetching offs:", error);
      }
    };

    fetchOffs();
  }, [doctor_id]);

  const totalPages = Math.ceil(offs.length / itemsPerPage);
  const paginatedOffs = offs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (direction) => {
    setCurrentPage((prev) => {
      if (direction === "next" && prev < totalPages) return prev + 1;
      if (direction === "prev" && prev > 1) return prev - 1;
      return prev;
    });
  };

  const handleItemsPerPage = (event) => {
    setCurrentPage(1)
    return setItemsPerPage(Number(event.target.value))
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-[#F5EDED] mb-2">Your Off Requests</h2>
      {paginatedOffs.length > 0 ? (
        <div>
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#E2DAD6] text-[#6482AD]">
                <th className="border p-2">Date</th>
                <th className="border p-2">Type</th>
              </tr>
            </thead>
            <tbody className="max-h-96 overflow-y-auto bg-[#F5EDED] text-[#6482AD]">
              {paginatedOffs.map((off, index) => (
                <tr key={index} className="border">
                  <td className="border p-2 text-center">
                    {off.date} {new Date(2025, off.month - 1).toLocaleString('default', { month: 'long' })}, {off.year}
                  </td>
                  <td className="border p-2 text-centere">
                    {off.type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <div>
              <label htmlFor="itemsPerPage" className="mr-2 text-[#F5EDED]"></label>
              <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPage}
              className="border p-1 text-[#6482AD] bg-[#F5EDED]"
              >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              </select>
            </div>
              <span className="mr-2 text-[#F5EDED]">
                {currentPage} of {totalPages}
              </span>
            <div>
              <button
                onClick={() => handlePageChange("prev")}
                disabled={currentPage === 1}
                className="p-2 bg-[#F5EDED] text-[#6482AD] rounded mx-1"            >
                &laquo;
              </button>
              <button
                onClick={() => handlePageChange("next")}
                disabled={currentPage === totalPages}
                className="p-2 bg-[#F5EDED] text-[#6482AD] rounded"            >
                &raquo;
              </button>
            </div>
          </div>
        </div>
      ) : (
        <h2 className="text-xl font-semibold text-center mb-4 text-[#F5EDED]">Once you apply for offs, they will show up here</h2>
      )}
    </div>
  );
};

export default ViewOffs;
