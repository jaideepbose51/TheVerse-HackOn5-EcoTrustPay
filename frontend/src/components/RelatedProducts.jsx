import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const RelatedProducts = ({ products }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <Link
          to={`/product/${product._id || product.productId}`}
          key={product._id || product.productId}
          className="group"
        >
          <div className="relative">
            <img
              src={product.images?.[0] || assets.placeholder}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg group-hover:opacity-90 transition"
              onError={(e) => {
                e.target.src = assets.placeholder;
              }}
            />
            {product.ecoVerified && (
              <div className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                <span className="mr-1">🌱</span> Eco Verified
              </div>
            )}
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RelatedProducts;
