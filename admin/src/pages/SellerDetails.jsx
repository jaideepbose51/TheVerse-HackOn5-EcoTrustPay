import React, { useEffect, useState } from "react";

const dummySeller = {
  id: "SELL1",
  name: "Greenify",
  email: "green@eco.com",
  type: "Distributor",
  profileImage: "https://via.placeholder.com/100x100.png?text=Profile",
  shopImage: "https://via.placeholder.com/200x150.png?text=Shop",
  brandCertificate: "https://via.placeholder.com/300x200.png?text=Brand+Cert",
  productBill: "https://via.placeholder.com/300x200.png?text=Bill+Image",
};

const SellerDetails = () => {
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    // Simulate fetching seller from backend
    setTimeout(() => {
      setSeller(dummySeller);
    }, 500);
  }, []);

  if (!seller) return <p className="p-4">Loading seller data...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">
        Seller Verification - {seller.name}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile & Shop */}
        <div className="space-y-2">
          <p className="font-semibold">Seller Name:</p>
          <p>{seller.name}</p>

          <p className="font-semibold mt-4">Seller Type:</p>
          <p>{seller.type}</p>

          <p className="font-semibold mt-4">Email:</p>
          <p>{seller.email}</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="font-semibold">Profile Photo:</p>
            <img
              src={seller.profileImage}
              alt="Profile"
              className="w-32 rounded"
            />
          </div>
          <div>
            <p className="font-semibold">Shop Photo:</p>
            <img
              src={seller.shopImage}
              alt="Shop"
              className="w-full max-w-xs rounded"
            />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="font-semibold">Brand Association Certificate:</p>
          <img
            src={seller.brandCertificate}
            alt="Brand Certificate"
            className="w-full border rounded"
          />
        </div>

        {seller.productBill && (
          <div>
            <p className="font-semibold">Product Purchase Bill:</p>
            <img
              src={seller.productBill}
              alt="Bill"
              className="w-full border rounded"
            />
          </div>
        )}
      </div>

      <div className="text-right mt-6">
        <button className="bg-green-600 text-white px-4 py-2 rounded mr-2">
          Approve Seller
        </button>
        <button className="bg-red-600 text-white px-4 py-2 rounded">
          Reject Seller
        </button>
      </div>
    </div>
  );
};

export default SellerDetails;
