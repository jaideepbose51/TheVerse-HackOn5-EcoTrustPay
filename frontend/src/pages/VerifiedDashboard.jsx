import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const VerifiedDashboard = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [stats, setStats] = useState({
    totalEcoPoints: 0,
    totalCO2Saved: 0,
    groupOrderCO2: 0,
    orders: [],
    rewardTier: "New Eco User",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEcoStats = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/eco-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          setStats({
            totalEcoPoints: response.data.totalEcoPoints,
            totalCO2Saved: response.data.totalCO2Saved,
            groupOrderCO2: response.data.groupOrderCO2,
            orders: response.data.orders,
            rewardTier: response.data.rewardTier,
          });
        }
      } catch (error) {
        console.error("Error fetching eco stats:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEcoStats();
    }
  }, [token, backendUrl]);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center">
        Loading your eco dashboard...
      </div>
    );
  }

  const rewardTierMessage = () => {
    switch (stats.rewardTier) {
      case "Eco Champion":
        return "🌟 Eco Champion - Free Gift on Your Next Order!";
      case "Eco Saver":
        return "🥈 Eco Saver - ₹150 Off Your Next Purchase";
      case "Eco Starter":
        return "🥉 Eco Starter - ₹50 Off Your Next Purchase";
      default:
        return "Keep going — rewards await!";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Green Impact Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="bg-green-100 p-4 rounded border-l-4 border-green-500 text-green-800">
          🌿 <strong>{stats.totalCO2Saved.toFixed(2)} kg</strong> CO₂ saved via
          eco products
        </div>
        <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500 text-blue-800">
          🚚 <strong>{stats.groupOrderCO2.toFixed(2)} kg</strong> CO₂ saved via
          group orders
        </div>
        <div className="bg-yellow-100 p-4 rounded border-l-4 border-yellow-500 text-yellow-800">
          🪙 <strong>{stats.totalEcoPoints}</strong> EcoPoints earned
        </div>
      </div>

      <div className="mb-6 p-4 border rounded bg-gray-50 text-center text-gray-800 font-medium">
        🎁 <span className="text-lg">{rewardTierMessage()}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Order ID</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Points</th>
              <th className="p-3">CO₂ (Product)</th>
              <th className="p-3">Group Order</th>
              <th className="p-3">CO₂ (Group)</th>
            </tr>
          </thead>
          <tbody>
            {stats.orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-3">{order.id.toString().slice(-6)}</td>
                <td className="p-3">
                  {new Date(order.date).toLocaleDateString()}
                </td>
                <td
                  className={`p-3 font-semibold ${
                    order.status === "paid" || order.status === "delivered"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </td>
                <td className="p-3">{order.points}</td>
                <td className="p-3">{order.co2Product.toFixed(2)} kg</td>
                <td className="p-3">{order.isGroupOrder ? "✅" : "❌"}</td>
                <td className="p-3">
                  {order.isGroupOrder ? "0.50 kg" : "0.00 kg"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold mb-2 text-green-800">
          How to Earn More EcoPoints
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-green-700">
          <li>Purchase verified eco-products (+1 point per ₹10 spent)</li>
          <li>Join group orders (+50 bonus points)</li>
          <li>Refer friends (+100 points per referral)</li>
          <li>Complete your profile (+20 points)</li>
        </ul>
      </div>
    </div>
  );
};

export default VerifiedDashboard;
