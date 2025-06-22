import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FiAward, FiTruck, FiDollarSign, FiUserPlus } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa"; // From Font Awesome

const VerifiedDashboard = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [stats, setStats] = useState({
    totalEcoPoints: 0,
    totalCO2Saved: 0,
    groupOrderCO2: 0,
    orders: [],
    rewardTier: "New Eco User",
    pointsBreakdown: {
      ecoProducts: 0,
      groupOrders: 0,
      referrals: 0,
      other: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

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
            pointsBreakdown: response.data.pointsBreakdown || {
              ecoProducts:
                response.data.totalEcoPoints -
                response.data.groupOrderCount * 50,
              groupOrders: response.data.groupOrderCount * 50,
              referrals: 0,
              other: 0,
            },
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
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid gap-4 sm:grid-cols-3 w-full mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded-lg w-full"></div>
        </div>
      </div>
    );
  }

  const rewardTierData = {
    "Eco Champion": {
      icon: <FiAward className="text-yellow-500 text-2xl" />,
      title: "Eco Champion",
      benefit: "Free Gift on Your Next Order!",
      color: "bg-gradient-to-r from-yellow-100 to-yellow-50",
      border: "border-yellow-300",
      nextTier: null,
      progress: 100,
    },
    "Eco Saver": {
      icon: <FaLeaf className="text-green-500 text-2xl" />,
      title: "Eco Saver",
      benefit: "₹150 Off Your Next Purchase",
      color: "bg-gradient-to-r from-green-100 to-green-50",
      border: "border-green-300",
      nextTier: "Eco Champion",
      progress: Math.min(100, (stats.totalEcoPoints / 2000) * 100),
    },
    "Eco Starter": {
      icon: <FaLeaf className="text-blue-500 text-2xl" />,
      title: "Eco Starter",
      benefit: "₹50 Off Your Next Purchase",
      color: "bg-gradient-to-r from-blue-100 to-blue-50",
      border: "border-blue-300",
      nextTier: "Eco Saver",
      progress: Math.min(100, (stats.totalEcoPoints / 500) * 100),
    },
    "New Eco User": {
      icon: <FaLeaf className="text-gray-500 text-2xl" />,
      title: "New Eco User",
      benefit: "Start earning rewards!",
      color: "bg-gradient-to-r from-gray-100 to-gray-50",
      border: "border-gray-300",
      nextTier: "Eco Starter",
      progress: Math.min(100, (stats.totalEcoPoints / 100) * 100),
    },
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        Your Sustainability Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-full bg-green-100 mr-3">
              <FaLeaf className="text-green-600" />
            </div>
            <h3 className="font-medium text-gray-700">EcoPoints</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalEcoPoints}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total earned</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-full bg-blue-100 mr-3">
              <FiTruck className="text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-700">Group Orders</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.orders.filter((o) => o.isGroupOrder).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Saved {stats.groupOrderCO2.toFixed(2)} kg CO₂
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-full bg-emerald-100 mr-3">
              <FaLeaf className="text-emerald-600" />
            </div>
            <h3 className="font-medium text-gray-700">CO₂ Saved</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalCO2Saved.toFixed(2)} kg
          </p>
          <p className="text-xs text-gray-500 mt-1">From eco products</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-full bg-purple-100 mr-3">
              <FiDollarSign className="text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-700">Reward Tier</h3>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {rewardTierData[stats.rewardTier].title}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {rewardTierData[stats.rewardTier].benefit}
          </p>
        </div>
      </div>

      {/* Points Breakdown */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg text-gray-800">
            EcoPoints Breakdown
          </h2>
          <p className="text-sm text-gray-500">
            See how you've earned your points
          </p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">
              Points by Category
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-600">Eco Products</span>
                  <span>{stats.totalEcoPoints / 2} pts</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.totalEcoPoints / 2 / stats.totalEcoPoints) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-600">Group Orders</span>
                  <span>{stats.totalEcoPoints / 2} pts</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.totalEcoPoints / 2 / stats.totalEcoPoints) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-600">Referrals</span>
                  <span>{stats.pointsBreakdown.referrals} pts</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.pointsBreakdown.referrals /
                          stats.totalEcoPoints) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Reward Progress</h3>
            <div
              className={`p-4 rounded-lg ${
                rewardTierData[stats.rewardTier].color
              } border ${rewardTierData[stats.rewardTier].border}`}
            >
              <div className="flex items-center mb-3">
                {rewardTierData[stats.rewardTier].icon}
                <div className="ml-3">
                  <h4 className="font-bold">
                    {rewardTierData[stats.rewardTier].title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {rewardTierData[stats.rewardTier].benefit}
                  </p>
                </div>
              </div>
              {rewardTierData[stats.rewardTier].nextTier && (
                <>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>
                        Progress to {rewardTierData[stats.rewardTier].nextTier}
                      </span>
                      <span>
                        {Math.round(rewardTierData[stats.rewardTier].progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${
                            rewardTierData[stats.rewardTier].progress
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {stats.totalEcoPoints} /{" "}
                    {stats.rewardTier === "New Eco User"
                      ? 100
                      : stats.rewardTier === "Eco Starter"
                      ? 500
                      : stats.rewardTier === "Eco Saver"
                      ? 2000
                      : 0}{" "}
                    points
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg text-gray-800">Order History</h2>
          <p className="text-sm text-gray-500">
            Your sustainable purchases and their impact
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CO₂ Saved
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleOrderDetails(order.id)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id.toString().slice(-6)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {order.points}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {order.co2Product.toFixed(2)} kg
                      {order.isGroupOrder && (
                        <span className="text-blue-500 ml-1">+0.50 kg</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-800">
                        {expandedOrder === order.id ? "Hide" : "Show"} details
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order.id && (
                    <tr className="bg-gray-50">
                      <td colSpan="5" className="px-4 py-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">
                              Points Breakdown
                            </h4>
                            <ul className="space-y-1">
                              <li className="flex justify-between">
                                <span>Eco Products:</span>
                                <span className="font-medium">
                                  {order.points - (order.isGroupOrder ? 50 : 0)}{" "}
                                  pts
                                </span>
                              </li>
                              {order.isGroupOrder && (
                                <li className="flex justify-between">
                                  <span>Group Order Bonus:</span>
                                  <span className="font-medium text-blue-600">
                                    50 pts
                                  </span>
                                </li>
                              )}
                              <li className="flex justify-between pt-1 border-t border-gray-200">
                                <span className="font-medium">Total:</span>
                                <span className="font-medium">
                                  {order.points} pts
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">
                              Environmental Impact
                            </h4>
                            <ul className="space-y-1">
                              <li className="flex justify-between">
                                <span>From Products:</span>
                                <span>{order.co2Product.toFixed(2)} kg</span>
                              </li>
                              {order.isGroupOrder && (
                                <li className="flex justify-between">
                                  <span>From Group Delivery:</span>
                                  <span className="text-blue-600">0.50 kg</span>
                                </li>
                              )}
                              <li className="flex justify-between pt-1 border-t border-gray-200">
                                <span className="font-medium">
                                  Total Saved:
                                </span>
                                <span className="font-medium">
                                  {(
                                    order.co2Product +
                                    (order.isGroupOrder ? 0.5 : 0)
                                  ).toFixed(2)}{" "}
                                  kg
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">
                              Order Details
                            </h4>
                            <ul className="space-y-1">
                              <li className="flex justify-between">
                                <span>Status:</span>
                                <span
                                  className={`font-medium ${
                                    order.status === "delivered"
                                      ? "text-green-600"
                                      : order.status === "shipped"
                                      ? "text-blue-600"
                                      : "text-yellow-600"
                                  }`}
                                >
                                  {order.status.charAt(0).toUpperCase() +
                                    order.status.slice(1)}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span>Delivery Type:</span>
                                <span>
                                  {order.isGroupOrder
                                    ? "Group Delivery"
                                    : "Standard"}
                                </span>
                              </li>
                              {order.isGroupOrder && (
                                <li className="flex justify-between">
                                  <span>Group Members:</span>
                                  <span>{order.groupSize || 2} households</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to Earn More */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg text-gray-800">
            Boost Your EcoPoints
          </h2>
          <p className="text-sm text-gray-500">
            Ways to earn more points and rewards
          </p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 border border-green-100 rounded-lg bg-green-50">
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-full bg-green-200 mr-3">
                <FaLeaf className="text-green-600" />
              </div>
              <h3 className="font-medium">Eco Products</h3>
            </div>
            <p className="text-sm text-gray-600">
              Earn <strong>50 points</strong>by ordering eco-friendly products
            </p>
          </div>
          <div className="p-3 border border-blue-100 rounded-lg bg-blue-50">
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-full bg-blue-200 mr-3">
                <FiTruck className="text-blue-600" />
              </div>
              <h3 className="font-medium">Group Orders</h3>
            </div>
            <p className="text-sm text-gray-600">
              Get <strong>50 bonus points</strong> for joining a group delivery
            </p>
          </div>
          <div className="p-3 border border-purple-100 rounded-lg bg-purple-50">
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-full bg-purple-200 mr-3">
                <FiUserPlus className="text-purple-600" />
              </div>
              <h3 className="font-medium">Refer Friends</h3>
            </div>
            <p className="text-sm text-gray-600">
              Earn <strong>100 points</strong> for each successful referral
            </p>
          </div>
          <div className="p-3 border border-yellow-100 rounded-lg bg-yellow-50">
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-full bg-yellow-200 mr-3">
                <FiAward className="text-yellow-600" />
              </div>
              <h3 className="font-medium">Complete Profile</h3>
            </div>
            <p className="text-sm text-gray-600">
              Get <strong>20 points</strong> for completing your profile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifiedDashboard;
