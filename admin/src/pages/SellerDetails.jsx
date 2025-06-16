import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = "http://localhost:3000/api";

const SellerDetails = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/admin/sellers/${sellerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setSeller(response.data.seller);
        } else {
          toast.error("Failed to load seller data");
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Error loading seller data");
      }
    };

    fetchSeller();
  }, [sellerId]);

  const handleStatusUpdate = async (action) => {
    try {
      const endpoint =
        action === "approve"
          ? `${BASE_URL}/admin/sellers/verify/${sellerId}`
          : `${BASE_URL}/admin/sellers/block/${sellerId}`;

      const res = await axios.put(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  if (!seller) return <p className="p-4">Loading seller data...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">
        Seller Verification - {seller.shopName || seller.name}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="space-y-2">
          <p className="font-semibold">Seller Name:</p>
          <p>{seller.shopName || seller.name}</p>

          <p className="font-semibold mt-4">Seller Type:</p>
          <p>{seller.sellerType || "—"}</p>

          <p className="font-semibold mt-4">Email:</p>
          <p>{seller.email}</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="font-semibold">Profile Photo:</p>
            <img
              src={seller.profileImage}
              alt="Profile"
              className="w-32 h-32 rounded object-cover"
            />
          </div>
          <div>
            <p className="font-semibold">Shop Photo:</p>
            {seller.shopImages?.[0] ? (
              <img
                src={seller.shopImages[0]}
                alt="Shop"
                className="w-full max-w-xs rounded"
              />
            ) : (
              <p className="text-gray-500">Not uploaded</p>
            )}
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="font-semibold">Brand Association Certificate:</p>
          {seller.brandAssociations?.[0] ? (
            <img
              src={seller.brandAssociations[0]}
              alt="Brand Cert"
              className="w-full border rounded"
            />
          ) : (
            <p className="text-gray-500">Not uploaded</p>
          )}
        </div>

        {seller.purchaseBills?.length > 0 && (
          <div>
            <p className="font-semibold">Product Purchase Bill:</p>
            <img
              src={seller.purchaseBills[0]}
              alt="Bill"
              className="w-full border rounded"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="text-right mt-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded mr-2"
          onClick={() => handleStatusUpdate("approve")}
        >
          Approve Seller
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => handleStatusUpdate("block")}
        >
          Reject Seller
        </button>
      </div>
    </div>
  );
};

export default SellerDetails;
