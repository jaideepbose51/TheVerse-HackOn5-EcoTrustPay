import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const SellerList = () => {
  const [sellers, setSellers] = useState([]);
  const printRef = useRef();

  // ✅ Fetch seller list from backend
  const fetchSellers = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return toast.error("Admin not logged in");

    try {
      const res = await axios.get(`${BASE_URL}/api/admin/sellers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle array or object format
      const data = Array.isArray(res.data) ? res.data : res.data.sellers;

      setSellers(data || []);
      toast.success("Sellers loaded");
    } catch (err) {
      console.error("Fetch sellers error:", err);
      toast.error(err.response?.data?.message || "Failed to fetch sellers");
    }
  };

  // ✅ Toggle status locally (for UI only)
  const toggleSellerStatus = (id) => {
    setSellers((prev) =>
      prev.map((s) =>
        s._id === id
          ? {
              ...s,
              status: s.status === "approved" ? "blocked" : "approved",
            }
          : s
      )
    );
  };

  // ✅ Optional print function
  const printSellerReport = () => {
    const html = printRef.current.innerHTML;
    const win = window.open("", "", "width=900,height=600");
    win.document.write(
      `<html><head><title>Seller Report</title></head><body>${html}</body></html>`
    );
    win.document.close();
    win.print();
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-lg font-semibold">All Sellers</p>
        <button
          onClick={printSellerReport}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          Print Seller Report
        </button>
      </div>

      <div className="flex flex-col gap-2" ref={printRef}>
        {/* Header Row */}
        <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center px-2 py-1 border bg-gray-100 text-sm font-semibold">
          <span>Name</span>
          <span>Email</span>
          <span>Status</span>
          <span>Joined</span>
          <span>Action</span>
        </div>

        {/* Seller Rows */}
        {sellers.map((seller) => (
          <div
            key={seller._id}
            className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center gap-2 py-3 px-2 border text-sm"
          >
            <Link
              to={`/admin/sellers/${seller._id}`}
              className="text-blue-600 hover:underline"
            >
              {seller.shopName || seller.name}
            </Link>
            <span>{seller.email}</span>
            <span
              className={`font-semibold ${
                seller.status === "approved" ? "text-green-600" : "text-red-500"
              }`}
            >
              {seller.status}
            </span>
            <span>
              {seller.createdAt
                ? new Date(seller.createdAt).toLocaleDateString()
                : "—"}
            </span>
            <span className="text-right md:text-center">
              <button
                className={`px-3 py-1 text-xs rounded text-white ${
                  seller.status === "approved" ? "bg-red-500" : "bg-green-500"
                }`}
                onClick={() => toggleSellerStatus(seller._id)}
              >
                {seller.status === "approved" ? "Block" : "Unblock"}
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerList;
