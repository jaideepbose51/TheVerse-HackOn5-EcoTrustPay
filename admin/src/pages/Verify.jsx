import React, { useEffect, useState } from "react";

const AdminSellerPanel = () => {
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const dummySellers = [
      {
        id: "SELL1",
        name: "Greenify",
        email: "green@eco.com",
        status: "pending",
        joined: "2025-06-01",
      },
      {
        id: "SELL2",
        name: "BioBags Co",
        email: "bio@bags.com",
        status: "approved",
        joined: "2025-05-22",
      },
    ];

    const dummyProducts = [
      {
        id: "P1",
        name: "Reusable Straw",
        sellerId: "SELL1",
        ecoVerified: true,
        price: 99,
      },
      {
        id: "P2",
        name: "Plastic-Free Cups",
        sellerId: "SELL1",
        ecoVerified: false,
        price: 149,
      },
      {
        id: "P3",
        name: "Compostable Bag",
        sellerId: "SELL2",
        ecoVerified: true,
        price: 199,
      },
    ];

    setSellers(dummySellers);
    setProducts(dummyProducts);
  }, []);

  const updateSellerStatus = (sellerId, newStatus) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, status: newStatus } : s))
    );
  };

  const getStatusColor = (status) => {
    if (status === "approved") return "text-green-600";
    if (status === "blocked") return "text-red-500";
    return "text-gray-500";
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <p className="text-lg font-semibold mb-4">Pending Seller Verifications</p>

      <div className="flex flex-col gap-2 mb-8">
        {/* Header Row */}
        <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_2fr] items-center px-2 py-1 border bg-gray-100 text-sm font-semibold">
          <span>Name</span>
          <span>Email</span>
          <span>Status</span>
          <span>Joined</span>
          <span>Actions</span>
        </div>

        {/* Pending Sellers */}
        {sellers
          .filter((s) => s.status === "pending")
          .map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_2fr] items-center gap-2 py-3 px-2 border text-sm"
            >
              <span>{s.name}</span>
              <span>{s.email}</span>
              <span className={getStatusColor(s.status)}>{s.status}</span>
              <span>{s.joined}</span>
              <span className="space-x-2 text-right md:text-center">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                  onClick={() => updateSellerStatus(s.id, "approved")}
                >
                  Approve
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                  onClick={() => updateSellerStatus(s.id, "blocked")}
                >
                  Block
                </button>
              </span>
            </div>
          ))}
      </div>

      <p className="text-lg font-semibold mb-4">All Sellers</p>
      <div className="flex flex-col gap-2 mb-8">
        {/* Header Row */}
        <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center px-2 py-1 border bg-gray-100 text-sm font-semibold">
          <span>Name</span>
          <span>Email</span>
          <span>Status</span>
          <span>Joined</span>
          <span>Action</span>
        </div>

        {/* Seller List */}
        {sellers.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center gap-2 py-3 px-2 border text-sm"
          >
            <span>{s.name}</span>
            <span>{s.email}</span>
            <span className={getStatusColor(s.status)}>{s.status}</span>
            <span>{s.joined}</span>
            <span className="text-right md:text-center">
              {s.status === "blocked" ? (
                <button
                  className="bg-yellow-500 text-white text-xs px-3 py-1 rounded"
                  onClick={() => updateSellerStatus(s.id, "approved")}
                >
                  Unblock
                </button>
              ) : (
                <span className="text-gray-400 text-xs">—</span>
              )}
            </span>
          </div>
        ))}
      </div>

      <p className="text-lg font-semibold mb-4">Product Listings by Seller</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sellers.map((s) => {
          const sellerProducts = products.filter((p) => p.sellerId === s.id);
          const ecoCount = sellerProducts.filter((p) => p.ecoVerified).length;

          return (
            <div key={s.id} className="border p-4 bg-white rounded shadow-sm">
              <h3 className="font-medium mb-2">{s.name}</h3>
              <p className="text-sm text-gray-500 mb-2">
                Total Products: {sellerProducts.length} | Eco-Verified:{" "}
                {ecoCount}
              </p>
              <ul className="text-sm list-disc list-inside text-gray-700">
                {sellerProducts.map((p) => (
                  <li key={p.id}>
                    {p.name}{" "}
                    {p.ecoVerified && (
                      <span className="text-green-600">🌱</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSellerPanel;
