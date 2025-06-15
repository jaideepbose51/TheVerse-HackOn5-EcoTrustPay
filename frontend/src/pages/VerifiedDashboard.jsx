import React, { useEffect, useState } from "react";

const VerifiedDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [productCO2, setProductCO2] = useState(0);
  const [groupCO2, setGroupCO2] = useState(0);
  const [ecoPoints, setEcoPoints] = useState(0);

  useEffect(() => {
    // Simulated backend response
    const fetchedOrders = [
      {
        id: "ORD123",
        product: "Eco Bamboo Toothbrush",
        status: "verified",
        date: "2025-06-10",
        co2Saved: 0.4,
        grouped: true,
        groupCO2Saved: 0.6,
      },
      {
        id: "ORD124",
        product: "Reusable Grocery Bag",
        status: "verified",
        date: "2025-06-12",
        co2Saved: 0.6,
        grouped: false,
        groupCO2Saved: 0,
      },
      {
        id: "ORD125",
        product: "Green Cleaner Spray",
        status: "flagged",
        date: "2025-06-14",
        co2Saved: 0,
        grouped: false,
        groupCO2Saved: 0,
      },
    ];

    setOrders(fetchedOrders);

    // Calculate total savings
    const co2FromProducts = fetchedOrders
      .filter((o) => o.status === "verified")
      .reduce((sum, o) => sum + o.co2Saved, 0);

    const co2FromGroup = fetchedOrders
      .filter((o) => o.status === "verified" && o.grouped)
      .reduce((sum, o) => sum + o.groupCO2Saved, 0);

    const totalPoints = Math.floor((co2FromProducts + co2FromGroup) * 10);

    setProductCO2(co2FromProducts.toFixed(2));
    setGroupCO2(co2FromGroup.toFixed(2));
    setEcoPoints(totalPoints);
  }, []);

  const rewardTier =
    ecoPoints >= 200
      ? "🌟 Eco Champion - Free Gift!"
      : ecoPoints >= 100
      ? "🥈 Eco Saver - ₹150 off"
      : ecoPoints >= 50
      ? "🥉 Eco Starter - ₹50 off"
      : "Keep going — rewards await!";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Green Impact Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="bg-green-100 p-4 rounded border-l-4 border-green-500 text-green-800">
          🌿 <strong>{productCO2} kg</strong> CO₂ saved via eco products
        </div>
        <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500 text-blue-800">
          🚚 <strong>{groupCO2} kg</strong> CO₂ saved via group orders
        </div>
        <div className="bg-yellow-100 p-4 rounded border-l-4 border-yellow-500 text-yellow-800">
          🪙 <strong>{ecoPoints}</strong> EcoPoints earned
        </div>
      </div>

      <div className="mb-6 p-4 border rounded bg-gray-50 text-center text-gray-800 font-medium">
        🎁 <span className="text-lg">{rewardTier}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Order ID</th>
              <th className="p-3">Product</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">CO₂ (Product)</th>
              <th className="p-3">Group Order</th>
              <th className="p-3">CO₂ (Group)</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="p-3">{o.id}</td>
                <td className="p-3">{o.product}</td>
                <td className="p-3">{o.date}</td>
                <td
                  className={`p-3 font-semibold ${
                    o.status === "verified" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {o.status === "verified" ? "Verified" : "Flagged"}
                </td>
                <td className="p-3">{o.co2Saved}</td>
                <td className="p-3">{o.grouped ? "Yes" : "No"}</td>
                <td className="p-3">{o.groupCO2Saved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerifiedDashboard;
