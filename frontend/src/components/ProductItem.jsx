import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, name, images, price }) => {
  const { currency } = useContext(ShopContext);

  // ✅ Show first image or fallback
  const imageUrl =
    Array.isArray(images) && images.length > 0
      ? images[0]
      : "https://via.placeholder.com/200x200.png?text=No+Image";

  return (
    <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`}>
      <div className="overflow-hidden rounded-lg shadow">
        <img
          className="w-full h-48 object-cover hover:scale-110 transition duration-300 ease-in-out"
          src={imageUrl}
          alt={name || "Product"}
        />
      </div>
      <p className="pt-3 pb-1 text-sm font-medium truncate">{name}</p>
      <p className="text-sm font-semibold">
        {currency}
        {price ?? "—"}
      </p>
    </Link>
  );
};

export default ProductItem;
