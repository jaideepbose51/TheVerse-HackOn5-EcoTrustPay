import { useState, useEffect, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const ProductTabs = ({ productId, catalogueId, details, specifications }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const { token, getAuthHeaders } = useContext(ShopContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Debugging logs
  useEffect(() => {
    console.log("Component mounted with:", {
      productId,
      catalogueId,
      token: !!token,
    });
  }, []);

  const fetchReviews = async () => {
    if (!productId || !catalogueId) {
      console.error("Missing required IDs for fetching reviews");
      return;
    }

    setReviewsLoading(true);
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/user/reviews/product/${catalogueId}/${productId}`,
        {
          ...getAuthHeaders(),
          timeout: 8000,
        }
      );
      setReviews(response.data?.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      toast.error("Could not load reviews");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, catalogueId]);

  const validateReview = () => {
    if (!productId || !catalogueId) {
      toast.error("Product information is incomplete");
      return false;
    }

    if (!token) {
      toast.info("Please login to submit a review");
      return false;
    }

    if (!rating) {
      toast.error("Please select a rating");
      return false;
    }

    if (!reviewTitle.trim()) {
      toast.error("Please enter a review title");
      return false;
    }

    if (!reviewComment.trim()) {
      toast.error("Please enter your review");
      return false;
    }

    return true;
  };

  const handleSubmitReview = async () => {
    if (!validateReview()) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/review`,
        {
          productId,
          catalogueId,
          rating,
          title: reviewTitle,
          comment: reviewComment,
        },
        {
          ...getAuthHeaders(),
          timeout: 10000,
        }
      );

      if (response.data.success) {
        setReviews([response.data.review, ...reviews]);
        setRating(0);
        setReviewTitle("");
        setReviewComment("");
        toast.success("Review submitted successfully!");
      } else {
        throw new Error(response.data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Review submission error:", error);

      let errorMessage = "Failed to submit review. Please try again.";
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || "Invalid review data";
        } else if (error.response.status === 403) {
          errorMessage = "You must purchase this product before reviewing";
        } else if (error.response.status === 404) {
          errorMessage = "Product not found";
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of your component (tabs UI) remains the same ...
  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {[
          { id: "details", label: "Product Details" },
          { id: "specs", label: "Specifications" },
          { id: "reviews", label: `Reviews (${reviews.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {activeTab === "details" && (
          <div className="prose prose-sm max-w-none">
            {details || "No product details available."}
          </div>
        )}

        {activeTab === "specs" && (
          <div className="space-y-3">
            {specifications ? (
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(specifications).map(([key, value]) => (
                    <tr key={key}>
                      <td className="py-2 pr-4 font-medium text-gray-900">
                        {key}
                      </td>
                      <td className="py-2 text-gray-700">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No specifications available.</p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Review Form */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Write a Review</h3>
              <div className="mb-3">
                <label className="block mb-1">Rating</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl focus:outline-none ${
                        rating >= star ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="block mb-1">Title</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Summary of your experience"
                  maxLength={100}
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Review</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="4"
                  placeholder="Share your thoughts about this product"
                  maxLength={500}
                ></textarea>
              </div>
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary-dark"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
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
                  <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                  {review.sellerReply && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-200 bg-gray-50 p-2 rounded">
                      <p className="text-sm font-medium text-gray-700">
                        Seller Response:
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
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    - {review.userId?.name || "Anonymous"},{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
