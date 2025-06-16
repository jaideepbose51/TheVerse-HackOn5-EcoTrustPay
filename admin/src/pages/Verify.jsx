import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = "http://localhost:3000/api";

const AdminSellerPanel = () => {
  const [sellers, setSellers] = useState([]);
  const [catalogues, setCatalogues] = useState([]);

  const fetchData = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return toast.error("Admin not logged in");

    try {
      const sellerRes = await axios.get(`${BASE_URL}/admin/sellers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const catRes = await axios.get(`${BASE_URL}/admin/catalogues`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSellers(sellerRes.data || []);
      setCatalogues(catRes.data.catalogues || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load seller data");
    }
  };

  const updateSellerStatus = async (sellerId, newStatus) => {
    const token = localStorage.getItem("admin_token");
    const endpoint =
      newStatus === "blocked"
        ? `${BASE_URL}/admin/sellers/block/${sellerId}`
        : `${BASE_URL}/admin/sellers/unblock/${sellerId}`;

    try {
      await axios.put(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Seller ${newStatus}`);
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error("Status update failed");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <p className="text-lg font-semibold mb-4">All Sellers</p>

      <div className="flex flex-col gap-2 mb-8">
        <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center px-2 py-1 border bg-gray-100 text-sm font-semibold">
          <span>Name</span>
          <span>Email</span>
          <span>Status</span>
          <span>Joined</span>
          <span>Action</span>
        </div>

        {sellers.map((s) => (
          <div
            key={s._id}
            className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center gap-2 py-3 px-2 border text-sm"
          >
            <Link
              to={`/admin/sellers/${s._id}`}
              className="text-blue-600 hover:underline"
            >
              {s.shopName || s.name}
            </Link>
            <span>{s.email}</span>
            <span
              className={`font-semibold ${
                s.status === "verified"
                  ? "text-green-600"
                  : s.status === "blocked"
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {s.status}
            </span>
            <span>{new Date(s.createdAt).toLocaleDateString()}</span>
            <span className="text-right md:text-center">
              {s.status === "blocked" ? (
                <button
                  className="bg-yellow-500 text-white text-xs px-3 py-1 rounded"
                  onClick={() => updateSellerStatus(s._id, "verified")}
                >
                  Unblock
                </button>
              ) : (
                <button
                  className="bg-red-600 text-white text-xs px-3 py-1 rounded"
                  onClick={() => updateSellerStatus(s._id, "blocked")}
                >
                  Block
                </button>
              )}
            </span>
          </div>
        ))}
      </div>

      <p className="text-lg font-semibold mb-4">Product Listings by Seller</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sellers.map((s) => {
          const sellerCatalogues = catalogues.filter(
            (c) => c.seller && c.seller._id === s._id
          );
          const ecoCount = sellerCatalogues.filter((c) =>
            c.products.some((p) => p.ecoVerified)
          ).length;

          return (
            <div key={s._id} className="border p-4 bg-white rounded shadow-sm">
              <h3 className="font-medium mb-2">{s.shopName || s.name}</h3>
              <p className="text-sm text-gray-500 mb-2">
                Total Catalogues: {sellerCatalogues.length} | Eco-Verified:{" "}
                {ecoCount}
              </p>
              <ul className="text-sm list-disc list-inside text-gray-700">
                {sellerCatalogues.map((c) =>
                  c.products.map((p) => (
                    <li key={p._id}>
                      {p.name}{" "}
                      {p.ecoVerified && (
                        <span className="text-green-600">🌱</span>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSellerPanel;
