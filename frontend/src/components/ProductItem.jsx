import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import PropTypes from "prop-types";

const ProductItem = ({ id, name, price, images, isEcoVerified }) => {
  // Check if name contains 'eco' (case-insensitive)
  const hasEcoInName = name && name.toLowerCase().includes("eco");

  // Generate random values
  const generateRandomCO2 = () => (Math.random() * 4.9 + 0.1).toFixed(1);
  const generateConfidenceScore = () => Math.floor(Math.random() * 11) + 80; // 80-90%

  const co2Emissions =
    isEcoVerified || hasEcoInName ? generateRandomCO2() : null;
  const confidenceScore =
    isEcoVerified || hasEcoInName ? generateConfidenceScore() : null;

  return (
    <Link to={`/product/${id}`} className="group block">
      <div className="relative">
        <img
          src={images?.[0] || assets.placeholder}
          alt={name}
          className="w-full h-48 object-cover rounded-lg group-hover:opacity-90 transition"
          onError={(e) => {
            e.target.src = assets.placeholder;
          }}
        />

        {/* Eco badge with confidence score */}
        {(isEcoVerified || hasEcoInName) && (
          <div className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center shadow-sm">
            <span className="mr-1">🌱</span>
            {isEcoVerified
              ? `Eco Verified (${confidenceScore}%)`
              : `(${confidenceScore}%)`}
          </div>
        )}

        {/* CO2 badge on the right */}
        {co2Emissions && (
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center shadow-sm">
            <span className="mr-1">☁️</span>
            CO₂: {co2Emissions}kg
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
        <p className="text-sm font-semibold text-gray-800">
          ₹{price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

ProductItem.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  images: PropTypes.arrayOf(PropTypes.string),
  isEcoVerified: PropTypes.bool,
};

ProductItem.defaultProps = {
  images: [],
  isEcoVerified: false,
};

export default ProductItem;
