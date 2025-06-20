import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const SellerDetail = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await axios.get(`${BASE_URL}/api/seller/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSeller(res.data.seller);
      } catch (error) {
        toast.error("Failed to fetch seller details");
        console.error(error);
      }
    };

    fetchSeller();
  }, [id]);

  if (!seller) {
    return <div className="p-6 text-gray-600">Loading seller details...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{seller.shopName}</h2>
      <p className="mb-2 text-gray-600">Email: {seller.email}</p>
      <p className="mb-2 text-gray-600">Phone: {seller.phone || "N/A"}</p>
      <p className="mb-2 text-gray-600 capitalize">
        Seller Type: {seller.sellerType}
      </p>
      <p className="mb-2 text-gray-600">Status: {seller.status}</p>
      <p className="mb-4 text-gray-600">
        Categories: {seller.categories.join(", ")}
      </p>

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Business Description</h3>
        <p>{seller.businessDescription || "No description provided."}</p>
      </div>

      {seller.brandDocuments?.shopImages?.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-2">Shop Images</h3>
          <div className="flex gap-4 flex-wrap">
            {seller.brandDocuments.shopImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`shop-${idx}`}
                className="w-32 h-32 object-cover rounded"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDetail;
