import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const dummySellers = [
  {
    _id: "S1",
    name: "Green Earth Co.",
    email: "green@earth.com",
    status: "approved",
    joinedAt: "2025-05-20",
  },
  {
    _id: "S2",
    name: "EcoDaily",
    email: "eco@daily.com",
    status: "blocked",
    joinedAt: "2025-04-15",
  },
  {
    _id: "S3",
    name: "NatureFlex",
    email: "support@natureflex.com",
    status: "approved",
    joinedAt: "2025-06-01",
  },
  {
    _id: "S4",
    name: "Bamboo Hive",
    email: "bamboo@hive.com",
    status: "approved",
    joinedAt: "2025-03-27",
  },
  {
    _id: "S5",
    name: "GreenCart",
    email: "hello@greencart.com",
    status: "blocked",
    joinedAt: "2025-02-10",
  },
  {
    _id: "S6",
    name: "EcoWave",
    email: "contact@ecowave.in",
    status: "approved",
    joinedAt: "2025-05-30",
  },
  {
    _id: "S7",
    name: "ZeroWaste Store",
    email: "info@zerowaste.com",
    status: "approved",
    joinedAt: "2025-04-01",
  },
  {
    _id: "S8",
    name: "Planet Essentials",
    email: "hello@planetessentials.com",
    status: "approved",
    joinedAt: "2025-01-19",
  },
  {
    _id: "S9",
    name: "EarthKind",
    email: "earth@kind.com",
    status: "blocked",
    joinedAt: "2025-03-09",
  },
  {
    _id: "S10",
    name: "SustainaShop",
    email: "support@sustainashop.in",
    status: "approved",
    joinedAt: "2025-06-11",
  },
];

const SellerList = () => {
  const [sellers, setSellers] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    setSellers(dummySellers);
  }, []);

  const toggleSellerStatus = (id) => {
    const updated = sellers.map((s) =>
      s._id === id
        ? { ...s, status: s.status === "approved" ? "blocked" : "approved" }
        : s
    );
    setSellers(updated);
  };

  const printSellerReport = () => {
    const html = printRef.current.innerHTML;
    const win = window.open("", "", "width=900,height=600");
    win.document.write(
      `<html><head><title>Seller Report</title></head><body>${html}</body></html>`
    );
    win.document.close();
    win.print();
  };

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
        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center px-2 py-1 border bg-gray-100 text-sm font-semibold">
          <span>Name</span>
          <span>Email</span>
          <span>Status</span>
          <span>Joined</span>
          <span>Action</span>
        </div>

        {/* Seller rows */}
        {sellers.map((seller, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center gap-2 py-3 px-2 border text-sm"
          >
            <Link
              to={`/admin/sellers/${seller._id}`}
              className="text-blue-600 hover:underline"
            >
              {seller.name}
            </Link>
            <span>{seller.email}</span>
            <span
              className={`font-semibold ${
                seller.status === "approved" ? "text-green-600" : "text-red-500"
              }`}
            >
              {seller.status}
            </span>
            <span>{new Date(seller.joinedAt).toLocaleDateString()}</span>
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
