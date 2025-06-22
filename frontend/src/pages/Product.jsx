import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import QuantitySelector from "../components/QuantitySelector";
import SizeSelector from "../components/SizeSelector";
import ProductTabs from "../components/ProductTabs";
import RelatedProducts from "../components/RelatedProducts";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    products,
    addToCart,
    cartItems,
    updateQuantity,
    token,
    setToken,
    currency,
    checkProductAvailability,
  } = useContext(ShopContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Generate random values
  const generateRandomCO2 = () => (Math.random() * 4.9 + 0.1).toFixed(1);
  const generateConfidenceScore = () => Math.floor(Math.random() * 11) + 80; // 80-90%

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        const foundProduct = products.find(
          (p) => p._id === id || p.productId === id
        );

        if (!foundProduct) {
          throw new Error("Product not found");
        }

        setProduct(foundProduct);

        // Set default size if sizes are available
        if (foundProduct.sizes?.length > 0) {
          setSelectedSize(foundProduct.sizes[0]);
        }

        const related = products
          .filter(
            (p) =>
              p.category === foundProduct.category &&
              p._id !== foundProduct._id &&
              p.productId !== foundProduct.productId
          )
          .slice(0, 4);

        setRelatedProducts(related);
      } catch (err) {
        console.error("Product fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, products]);

  // Check if name contains 'eco' (case-insensitive)
  const hasEcoInName =
    product?.name && product.name.toLowerCase().includes("eco");
  const isEcoProduct = product?.ecoVerified || hasEcoInName;
  const co2Emissions = isEcoProduct ? generateRandomCO2() : null;
  const confidenceScore = isEcoProduct ? generateConfidenceScore() : null;

  const getCurrentCartQuantity = () => {
    if (!product || !cartItems[product._id || product.productId]) return 0;
    return Object.values(cartItems[product._id || product.productId]).reduce(
      (sum, qty) => sum + qty,
      0
    );
  };

  const handleAddToCart = async () => {
    if (!product) {
      toast.error("Product information not loaded");
      return false;
    }

    // Use selected size or 'one-size' if no sizes available
    const sizeToUse = product.sizes?.length > 0 ? selectedSize : "one-size";

    try {
      const { success, localOnly } = await addToCart(
        product._id || product.productId,
        sizeToUse
      );

      if (success) {
        toast.success(
          localOnly ? "Please sign in to add to cart." : "Added to cart"
        );
      }
      return success;
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
      return false;
    }
  };

  const handleBuyNow = async () => {
    const { success, localOnly } = await handleAddToCart();
    if (success) {
      if (localOnly) {
        toast.info("Proceeding with local cart");
      }
      navigate("/cart");
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} fullPage />;
  if (!product) return <ErrorMessage message="Product not found" fullPage />;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumbs */}
      <nav className="flex mb-6 text-sm text-gray-600">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li>
            <button
              onClick={() => navigate("/")}
              className="hover:text-gray-900"
            >
              Home
            </button>
          </li>
          <li>/</li>
          <li>
            <button
              onClick={() =>
                navigate(`/collection?category=${product.category}`)
              }
              className="hover:text-gray-900"
            >
              {product.category}
            </button>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image with badges */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.images?.[activeImage] || assets.placeholder}
              alt={product.name}
              className="w-full h-96 object-contain"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 right-2 flex justify-between">
              {/* Left badges */}
              <div className="space-x-2">
                {isEcoProduct && (
                  <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full inline-flex items-center">
                    <span className="mr-1">🌱</span>
                    {product.ecoVerified
                      ? `Eco Verified (${confidenceScore}%)`
                      : `Eco-Friendly (${confidenceScore}%)`}
                  </div>
                )}
                {product.bestseller && (
                  <div className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    Bestseller
                  </div>
                )}
              </div>

              {/* Right badges */}
              <div>
                {co2Emissions && (
                  <div className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center">
                    <span className="mr-1">☁️</span>
                    CO₂: {co2Emissions}kg
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {product.images?.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`border-2 rounded-md overflow-hidden ${
                  activeImage === index
                    ? "border-primary"
                    : "border-transparent"
                }`}
              >
                <img
                  src={img || assets.placeholder}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-20 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            {/* Additional eco info under title */}
            {isEcoProduct && (
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-green-700">
                    <span className="mr-1">🌿</span>
                    <span>
                      This product is{" "}
                      {product.ecoVerified ? "verified" : "recognized"} as
                      environmentally friendly
                    </span>
                  </div>
                </div>
                {co2Emissions && (
                  <div className="flex items-center text-sm text-blue-700 mt-2">
                    <span className="mr-1">☁️</span>
                    <span>
                      Estimated carbon footprint: {co2Emissions}kg CO₂ per unit
                    </span>
                  </div>
                )}
              </div>
            )}

            <p className="text-2xl font-semibold mb-4">
              {currency}
              {product.price.toFixed(2)}
            </p>

            {product.inStock ? (
              <p className="text-green-600 mb-4">In Stock</p>
            ) : (
              <p className="text-red-600 mb-4">Out of Stock</p>
            )}

            <p className="text-gray-700 mb-6">{product.description}</p>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center space-x-4 mb-8">
            <QuantitySelector
              quantity={quantity}
              setQuantity={setQuantity}
              maxQuantity={product.quantity || 10}
            />

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`px-6 py-3 rounded-md font-medium ${
                product.inStock
                  ? "bg-primary text-white hover:bg-primary-dark"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {getCurrentCartQuantity() > 0
                ? `Add More (${getCurrentCartQuantity()} in cart)`
                : "Add to Cart"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className={`px-6 py-3 rounded-md font-medium border ${
                product.inStock
                  ? "border-primary text-primary hover:bg-primary-light"
                  : "border-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Buy Now
            </button>
          </div>

          {/* Product Details */}
          <div className="border-t pt-6">
            <ProductTabs
              productId={product.productId}
              catalogueId={product.catalogueId}
              details={product.details}
              specifications={product.specifications}
            />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </div>
  );
};

export default ProductPage;
