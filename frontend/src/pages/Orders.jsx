import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { toast } from "react-toastify";
import axios from "axios";

const Orders = () => {
  const { backendUrl, token, currency, getAuthHeaders, products } =
    useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get product details from your products list
  const getProductDetails = (productId) => {
    return (
      products.find(
        (p) => p._id === productId || p.productId === productId
      ) || {
        name: "Product not available",
        images: ["/placeholder-image.jpg"],
        price: 0,
      }
    );
  };

  const loadOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("Please login to view orders");
        return;
      }

      const response = await axios.get(
        `${backendUrl}/api/user/orders`,
        getAuthHeaders()
      );

      if (!response.data?.orders) {
        setError("No orders data received");
        return;
      }

      // Transform orders data with proper product information
      const transformedOrders = response.data.orders.flatMap((order) => {
        if (!order.products || !Array.isArray(order.products)) return [];

        return order.products.map((item) => {
          const productDetails = getProductDetails(item.productId);
          return {
            ...item,
            name: productDetails.name,
            images: productDetails.images,
            price: productDetails.price,
            status: order.status || "unknown",
            payment: order.totalAmount || 0,
            paymentMethod: order.isGroupOrder ? "Group Order" : "Individual",
            date: order.createdAt || new Date().toISOString(),
          };
        });
      });

      setOrderData(transformedOrders.reverse());
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.response?.data?.message || "Failed to load orders");
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token, products]); // Added products to dependency array

  // Loading state
  if (loading) {
    return (
      <div className="border-t pt-16">
        <div className="text-2xl">
          <Title text1={"MY"} text2={"ORDERS"} />
        </div>
        <div className="py-8 text-center">Loading your orders...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="border-t pt-16">
        <div className="text-2xl">
          <Title text1={"MY"} text2={"ORDERS"} />
        </div>
        <div className="py-8 text-center text-red-500">{error}</div>
        <div className="text-center">
          <button
            onClick={loadOrderData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!orderData || orderData.length === 0) {
    return (
      <div className="border-t pt-16">
        <div className="text-2xl">
          <Title text1={"MY"} text2={"ORDERS"} />
        </div>
        <div className="py-8 text-center">
          {token
            ? "You haven't placed any orders yet"
            : "Please login to view orders"}
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div className="space-y-4">
        {orderData.map((item, index) => {
          // Ensure we have valid image URLs
          const validImages =
            Array.isArray(item.images) && item.images.length > 0
              ? item.images
              : ["/placeholder-image.jpg"];

          return (
            <div
              key={`${index}-${item.date}-${item.productId}`}
              className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-start gap-6 text-sm">
                <img
                  className="w-16 sm:w-20 object-cover rounded"
                  src={validImages[0]}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg";
                    e.target.className =
                      "w-16 sm:w-20 object-cover rounded bg-gray-100";
                  }}
                />
                <div>
                  <p className="sm:text-base font-medium">{item.name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-base text-gray-700">
                    <p>
                      {currency}
                      {item.price.toFixed(2)}
                    </p>
                    <p>Quantity: {item.quantity}</p>
                    {item.size && <p>Size: {item.size}</p>}
                  </div>
                  <p className="mt-1">
                    Date:{" "}
                    <span className="text-gray-400">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="mt-1">
                    Payment:{" "}
                    <span className="text-gray-400">{item.paymentMethod}</span>
                  </p>
                </div>
              </div>
              <div className="md:w-1/2 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`min-w-2 h-2 rounded-full ${
                      item.status === "delivered"
                        ? "bg-green-500"
                        : item.status === "shipped"
                        ? "bg-blue-500"
                        : item.status === "cancelled"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <p className="text-sm md:text-base capitalize">
                    {item.status}
                  </p>
                </div>
                <button
                  onClick={loadOrderData}
                  className="border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-100 transition-colors"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
