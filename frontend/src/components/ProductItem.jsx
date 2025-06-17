import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const ProductItem = ({ id, name, price, images, isEcoVerified }) => {
  // Check if name contains 'eco' (case-insensitive)
  const hasEcoInName = name && name.toLowerCase().includes("eco");

  return (
    <Link to={`/product/${id}`} className="group">
      <div className="relative">
        <img
          src={images?.[0] || assets.placeholder}
          alt={name}
          className="w-full h-48 object-cover rounded-lg group-hover:opacity-90 transition"
          onError={(e) => {
            e.target.src = assets.placeholder;
          }}
        />
        {(isEcoVerified || hasEcoInName) && (
          <div className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
            <span className="mr-1">🌱</span>
            {isEcoVerified ? "Eco Verified" : "Eco-Badge"}
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-600">${price.toFixed(2)}</p>
      </div>
    </Link>
  );
};

export default ProductItem;
