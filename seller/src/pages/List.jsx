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
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

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
        setAnalysis(null); // Reset analysis when fetching new reviews
      } else {
        toast.error(response.data?.message || "Failed to load reviews");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error loading reviews");
    }
  };

  const analyzeReviews = async () => {
    if (!selectedProduct) return;

    setAnalyzing(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/seller/products/${selectedProduct._id}/analyze-reviews`,
        { headers: { Authorization: token } }
      );

      if (response.data.success) {
        setAnalysis(response.data.analysis);
      } else {
        toast.error(response.data.message || "Analysis failed");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze reviews");
    } finally {
      setAnalyzing(false);
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
    setAnalysis(null);
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

              {/* Review Analysis Section */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Review Insights</h3>
                  <button
                    onClick={analyzeReviews}
                    disabled={analyzing || reviews.length === 0}
                    className={`px-3 py-1 text-sm rounded ${
                      analyzing || reviews.length === 0
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {analyzing ? "Analyzing..." : "Generate Insights"}
                  </button>
                </div>

                {analysis ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Positive Aspects */}
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-bold text-green-800 mb-3 flex items-center">
                          <svg
                            className="w-5 h-5 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          What Customers Like
                        </h4>
                        <ul className="space-y-2">
                          {analysis.positiveAspects.map((item, i) => (
                            <li key={i} className="text-sm">
                              <span className="font-medium text-green-700">
                                {item.aspect}
                              </span>
                              <span className="text-xs text-green-600 ml-2">
                                ({item.mentions} mentions)
                              </span>
                              <p className="text-xs text-gray-600 mt-1 italic">
                                "{item.example}"
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Negative Aspects */}
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="font-bold text-red-800 mb-3 flex items-center">
                          <svg
                            className="w-5 h-5 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-2">
                          {analysis.negativeAspects.map((item, i) => (
                            <li key={i} className="text-sm">
                              <span className="font-medium text-red-700">
                                {item.aspect}
                              </span>
                              <span className="text-xs text-red-600 ml-2">
                                ({item.mentions} mentions)
                              </span>
                              <p className="text-xs text-gray-600 mt-1 italic">
                                "{item.example}"
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Sentiment Score */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-bold text-blue-800 mb-2">
                        Overall Sentiment
                      </h4>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-4 mr-3">
                          <div
                            className="bg-blue-600 h-4 rounded-full"
                            style={{ width: `${analysis.sentimentScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-blue-700">
                          {analysis.sentimentScore}/100
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {analysis.sentimentScore >= 70
                          ? "Very Positive"
                          : analysis.sentimentScore >= 40
                          ? "Mixed"
                          : "Mostly Negative"}
                      </p>
                    </div>

                    {/* Improvement Suggestions */}
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-bold text-yellow-800 mb-2 flex items-center">
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Suggested Improvements
                      </h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {analysis.improvementSuggestions.map(
                          (suggestion, i) => (
                            <li key={i} className="text-gray-700">
                              {suggestion}
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-bold text-gray-800 mb-2">Summary</h4>
                      <p className="text-sm text-gray-700">
                        {analysis.summary}
                      </p>
                    </div>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Click "Generate Insights" to analyze customer feedback
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No reviews available for analysis
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
