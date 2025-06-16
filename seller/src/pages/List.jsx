import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [verifyingId, setVerifyingId] = useState(null);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/seller/products`, {
        headers: { Authorization: token },
      });
      if (response.data.success) {
        const sorted = response.data.products.sort(
          (a, b) => Number(b.ecoVerified) - Number(a.ecoVerified)
        );
        setList(sorted);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products");
    }
  };

  const verifyEcoClaim = async (id) => {
    try {
      setVerifyingId(id);
      const response = await axios.post(
        `${backendUrl}/api/seller/product/verify-eco/${id}`,
        {},
        {
          headers: { Authorization: token },
        }
      );

      if (response.data.success) {
        toast.success(
          <div>
            <p>
              <strong>Eco Verification Result:</strong>
            </p>
            <p>
              {response.data.isEcoFriendly
                ? "✅ Eco-friendly"
                : "❌ Not eco-friendly"}
            </p>
            <p>Confidence: {(response.data.confidence * 100).toFixed(0)}%</p>
            <p>Reason: {response.data.reason}</p>
          </div>,
          { autoClose: 5000 }
        );
        fetchList();
      } else {
        toast.error(response.data.message || "Eco verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Eco verification failed";
      toast.error(errorMessage);
    } finally {
      setVerifyingId(null);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2">All Products List</p>
      <div className="flex flex-col gap-2">
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center px-2 py-1 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>

        {list.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-3 px-2 border text-sm"
            key={index}
          >
            <img
              className="w-12 h-12 object-cover rounded"
              src={item.images?.[0]}
              alt="Product"
              onError={(e) => (e.target.src = "/placeholder-product.png")}
            />
            <div className="flex flex-col gap-1">
              <p className="flex items-center gap-1 flex-wrap">
                {item.name}
                {item.ecoVerified && (
                  <span className="text-green-600 text-xs bg-green-100 border border-green-300 rounded px-1 py-0.5">
                    🌱 Eco Verified (
                    {(item.ecoClaim?.confidence * 100).toFixed(0)}%)
                  </span>
                )}
              </p>

              <button
                onClick={() => verifyEcoClaim(item._id)}
                disabled={verifyingId === item._id || item.ecoVerified}
                className={`text-xs mt-1 px-2 py-1 rounded w-fit ${
                  item.ecoVerified
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : verifyingId === item._id
                    ? "bg-blue-300 text-white"
                    : "bg-blue-500 text-white"
                }`}
              >
                {item.ecoVerified
                  ? "Verified"
                  : verifyingId === item._id
                  ? "Verifying..."
                  : "Verify Eco Status"}
              </button>
            </div>

            <p>{item.category}</p>
            <p>
              {currency}
              {item.price}
            </p>
            <div className="flex gap-2 justify-end md:justify-center">
              <button
                onClick={() => verifyEcoClaim(item._id)}
                disabled={verifyingId === item._id || item.ecoVerified}
                className="md:hidden text-xs px-2 py-1 bg-blue-500 text-white rounded"
              >
                {item.ecoVerified ? "✓" : "Verify"}
              </button>
              <button
                onClick={() => removeProduct(item._id)}
                className="text-lg text-red-500"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;
