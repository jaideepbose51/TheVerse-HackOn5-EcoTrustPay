import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = "http://localhost:3000/api";

const PendingSellers = () => {
  const [pendingSellers, setPendingSellers] = useState([]);

  const fetchPendingSellers = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await axios.get(`${BASE_URL}/admin/sellers/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setPendingSellers(response.data);
      } else {
        toast.error("Failed to load pending sellers");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fetch sellers");
    }
  };

  const updateSellerStatus = async (id, status) => {
    const token = localStorage.getItem("admin_token");
    const endpoint =
      status === "approved"
        ? `${BASE_URL}/admin/sellers/verify/${id}`
        : `${BASE_URL}/admin/sellers/block/${id}`;

    try {
      const response = await axios.put(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchPendingSellers(); // Refresh the list
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating seller status");
    }
  };

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        Pending Sellers for Verification
      </h2>

      {pendingSellers.length === 0 ? (
        <p className="text-gray-500">No pending sellers found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {pendingSellers.map((seller) => (
            <div
              key={seller._id}
              className="border p-4 rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <img
                  src={
                    seller.profilePhoto ||
                    "https://t3.ftcdn.net/jpg/09/64/89/18/360_F_964891898_SuTIP6H2AVZkBuUG2cIpP9nvdixORKpM.jpg"
                  }
                  alt="Profile"
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="font-semibold text-lg">{seller.shopName}</p>
                  <p className="text-sm text-gray-600">{seller.email}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    Type: {seller.sellerType || "N/A"}
                  </p>
                  <p className="text-sm text-gray-400">
                    Joined: {new Date(seller.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => updateSellerStatus(seller._id, "approved")}
                  className="bg-green-600 px-4 py-2 text-white rounded text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateSellerStatus(seller._id, "blocked")}
                  className="bg-red-600 px-4 py-2 text-white rounded text-sm"
                >
                  Block
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingSellers;
