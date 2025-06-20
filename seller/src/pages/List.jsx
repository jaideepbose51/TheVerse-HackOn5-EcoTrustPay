import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [verifyingId, setVerifyingId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

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

  const fetchProductReviews = async (productId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/seller/products/${productId}/reviews`,
        {
          headers: { Authorization: token },
          params: { t: Date.now() }, // Cache busting
        }
      );

      console.log("Reviews response:", response.data);

      if (response.data?.success) {
        setReviews(response.data.reviews);
      } else {
        toast.error(response.data?.message || "Failed to load reviews");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error loading reviews");
    }
  };

  const verifyEcoClaim = async (id) => {
    try {
      setVerifyingId(id);
      const response = await axios.post(
        `${backendUrl}/api/seller/product/verify-eco/${id}`,
        {},
        { headers: { Authorization: token } }
      );

      if (response.data.success) {
        toast.success(
          <div>
            <p>
              <strong>Eco Verification Result:</strong>
            </p>
            <p>
              {response.data.isEcoFriendly
                ? "Eco-friendly"
                : "Not eco-friendly"}
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

  const handleProductClick = async (product) => {
    setSelectedProduct(product);
    await fetchProductReviews(product._id);
  };

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error("Reply text cannot be empty");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/seller/review/reply/${selectedProduct.catalogueId}/${selectedProduct._id}/${reviewId}`,
        { replyText },
        { headers: { Authorization: token } }
      );

      if (response.data.success) {
        toast.success("Reply submitted successfully");
        // Update the review in state with the new reply
        setReviews(
          reviews.map((review) =>
            review._id === reviewId
              ? { ...review, sellerReply: response.data.review.sellerReply }
              : review
          )
        );
        setReplyingTo(null);
        setReplyText("");
      } else {
        toast.error(response.data.message || "Failed to submit reply");
      }
    } catch (error) {
      console.error("Reply error:", error);
      toast.error(error.response?.data?.message || "Failed to submit reply");
    }
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
    setReviews([]);
    setReplyingTo(null);
    setReplyText("");
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="relative">
      <p className="mb-2">All Products List</p>
      <div className="flex flex-col gap-2">
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr] items-center px-2 py-1 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
        </div>

        {list.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr] items-center gap-2 py-3 px-2 border text-sm cursor-pointer hover:bg-gray-50"
            key={index}
            onClick={() => handleProductClick(item)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  verifyEcoClaim(item._id);
                }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  verifyEcoClaim(item._id);
                }}
                disabled={verifyingId === item._id || item.ecoVerified}
                className="md:hidden text-xs px-2 py-1 bg-blue-500 text-white rounded"
              >
                {item.ecoVerified ? "✓" : "Verify"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Details and Reviews Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
                <button
                  onClick={closeProductDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <img
                    src={selectedProduct.images?.[0]}
                    alt={selectedProduct.name}
                    className="w-full h-48 object-contain rounded"
                    onError={(e) => (e.target.src = "/placeholder-product.png")}
                  />
                </div>
                <div>
                  <p className="text-gray-700 mb-2">
                    {selectedProduct.description}
                  </p>
                  <p className="font-bold text-lg mb-2">
                    {currency}
                    {selectedProduct.price}
                  </p>
                  <p className="text-sm text-gray-600">
                    Category: {selectedProduct.category}
                  </p>
                  {selectedProduct.ecoVerified && (
                    <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded">
                      <p className="text-green-800 font-medium">
                        🌱 Eco Verified (
                        {(selectedProduct.ecoClaim?.confidence * 100).toFixed(
                          0
                        )}
                        %)
                      </p>
                      <p className="text-sm text-green-700">
                        {selectedProduct.ecoClaim?.label}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold mb-4">Customer Reviews</h3>

                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No reviews yet for this product.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="border-b pb-4 last:border-0"
                      >
                        <div className="flex items-center mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-2 text-sm font-medium">
                            {review.rating}/5
                          </span>
                          {review.isVerifiedPurchase && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium">{review.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {review.comment}
                        </p>

                        {review.sellerReply ? (
                          <div className="mt-3 pl-4 border-l-2 border-gray-200 bg-gray-50 p-2 rounded">
                            <p className="text-sm font-medium text-gray-700">
                              Your Response:
                            </p>
                            <p className="text-sm text-gray-600">
                              {review.sellerReply.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(
                                review.sellerReply.repliedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        ) : replyingTo === review._id ? (
                          <div className="mt-3">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows="3"
                              placeholder="Type your response here..."
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReplySubmit(review._id)}
                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReplyingTo(review._id)}
                            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                          >
                            Reply to this review
                          </button>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                          - {review.userId?.name || "Anonymous"},{" "}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
