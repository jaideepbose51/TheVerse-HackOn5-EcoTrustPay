import React, { useContext, useState, useEffect } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const [showGroupOrderModal, setShowGroupOrderModal] = useState(false);
  const [groupOrderAvailable, setGroupOrderAvailable] = useState(false);
  const [groupOrderDetails, setGroupOrderDetails] = useState(null);
  const [acceptGroupOrder, setAcceptGroupOrder] = useState(false);
  const [ecoPointsEarned, setEcoPointsEarned] = useState(0);
  const [co2Savings, setCo2Savings] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingGroupOrder, setIsCheckingGroupOrder] = useState(false);

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
    handleLogout,
    getAuthHeaders,
    getCatalogueIdForProduct,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    const calculateSavings = () => {
      let points = 0;
      let savings = 0;

      Object.keys(cartItems).forEach((productId) => {
        const product = products.find((p) => p._id === productId);
        if (product?.ecoVerified) {
          const quantities = Object.values(cartItems[productId]).reduce(
            (sum, qty) => sum + qty,
            0
          );
          points += Math.round(product.price * 0.1 * quantities);
          savings += (product.co2Savings || 0) * quantities;
        }
      });

      if (acceptGroupOrder) {
        points += 50;
        savings += 0.5;
      }

      setEcoPointsEarned(points);
      setCo2Savings(parseFloat(savings.toFixed(2)));
    };

    calculateSavings();
  }, [cartItems, products, acceptGroupOrder]);

  const checkForGroupOrders = async () => {
    if (!token) {
      toast.error("Please login to check group delivery options");
      return;
    }

    if (!formData.zipCode || formData.zipCode.length < 5) {
      toast.error("Please enter a valid 5-digit ZIP code");
      return;
    }

    try {
      setIsCheckingGroupOrder(true);
      const response = await axios.get(`${backendUrl}/api/user/orders/nearby`, {
        ...getAuthHeaders(),
        params: { zipCode: formData.zipCode },
      });

      if (response.data.available) {
        setGroupOrderAvailable(true);
        setGroupOrderDetails(response.data.details);
        setShowGroupOrderModal(true);
      } else {
        toast.info("No group delivery options available in your area");
        setGroupOrderAvailable(false);
        setAcceptGroupOrder(false);
      }
    } catch (error) {
      console.error("Group order check error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        handleLogout();
      } else {
        toast.error("Failed to check group delivery options");
      }
    } finally {
      setIsCheckingGroupOrder(false);
    }
  };

  const onChaneHandler = (e) => {
    const { name, value } = e.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!token) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }

    try {
      const products = [];
      for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
          const quantity = cartItems[productId][size];
          if (quantity > 0) {
            const catalogueId = getCatalogueIdForProduct(productId);
            if (!catalogueId) {
              throw new Error(
                `Could not find catalogue for product ${productId}`
              );
            }

            products.push({
              productId,
              catalogueId,
              quantity,
              size,
            });
          }
        }
      }

      const address = {
        line1: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      };

      const orderData = {
        address,
        products,
        isGroupOrder: acceptGroupOrder,
      };

      console.log("Order payload:", orderData);

      const response = await axios.post(
        `${backendUrl}/api/user/order`,
        orderData,
        getAuthHeaders()
      );

      if (response.data.message === "Order placed successfully") {
        setCartItems({});
        navigate("/orders", {
          state: {
            ecoPoints: response.data.ecoPoints,
            co2Savings: response.data.co2Saved,
          },
        });
        toast.success("Order placed successfully!");
      } else {
        throw new Error(response.data.message || "Order failed");
      }
    } catch (error) {
      console.error("Order error:", {
        error: error.message,
        response: error.response?.data,
      });

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        handleLogout();
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to place order. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showGroupOrderModal && groupOrderAvailable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              🚚 Group Order Available!
            </h3>
            <p className="mb-4">
              Someone in your area (PIN: {groupOrderDetails?.zipCode}) is
              ordering similar eco-friendly products. By joining this order,
              you'll:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Save {co2Savings + 0.5}kg of CO₂ emissions</li>
              <li>Earn {ecoPointsEarned + 50} EcoPoints</li>
              <li>Get your delivery 1 day earlier</li>
            </ul>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setAcceptGroupOrder(true);
                  setShowGroupOrderModal(false);
                  toast.success(
                    "Group order joined! You'll earn extra EcoPoints"
                  );
                }}
                className="bg-green-600 text-white px-4 py-2 rounded flex-1"
              >
                Join Group Order
              </button>
              <button
                onClick={() => {
                  setAcceptGroupOrder(false);
                  setShowGroupOrderModal(false);
                }}
                className="border border-gray-300 px-4 py-2 rounded flex-1"
              >
                Continue Alone
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
      >
        <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
          <div className="text-xl sm:text-2xl my-3">
            <Title text1={"DELIVERY"} text2={"INFORMATION"} />
          </div>

          {ecoPointsEarned > 0 && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
              <p className="font-medium text-green-800">
                🌱 This order will earn you:{" "}
                <strong>{ecoPointsEarned} EcoPoints</strong> and save{" "}
                <strong>{co2Savings}kg CO₂</strong>
              </p>
              {acceptGroupOrder && (
                <p className="text-sm mt-1 text-green-700">
                  (Includes 50 bonus points and 0.5kg CO₂ savings for group
                  order)
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <input
              required
              onChange={onChaneHandler}
              name="firstName"
              value={formData.firstName}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="First Name"
            />
            <input
              required
              onChange={onChaneHandler}
              name="lastName"
              value={formData.lastName}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="Last Name"
            />
          </div>

          <input
            required
            onChange={onChaneHandler}
            name="email"
            value={formData.email}
            className="border border-gray-300 rounded py-1.5 px-3.5"
            type="email"
            placeholder="Email"
          />

          <input
            required
            onChange={onChaneHandler}
            name="street"
            value={formData.street}
            className="border border-gray-300 rounded py-1.5 px-3.5"
            type="text"
            placeholder="Street Address"
          />

          <input
            required
            onChange={onChaneHandler}
            name="city"
            value={formData.city}
            className="border border-gray-300 rounded py-1.5 px-3.5"
            type="text"
            placeholder="City"
          />

          <div className="flex gap-3">
            <input
              required
              onChange={onChaneHandler}
              name="state"
              value={formData.state}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-1/4"
              type="text"
              placeholder="State"
            />
            <div className="flex gap-2 w-3/4">
              <input
                required
                onChange={onChaneHandler}
                name="zipCode"
                value={formData.zipCode}
                className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                type="text"
                placeholder="PIN Code"
                minLength="6"
                maxLength="6"
              />
              <button
                type="button"
                onClick={checkForGroupOrders}
                className="bg-blue-500 text-white px-4 py-1.5 rounded whitespace-nowrap disabled:opacity-50"
                disabled={
                  !formData.zipCode ||
                  formData.zipCode.length < 5 ||
                  isCheckingGroupOrder
                }
              >
                {isCheckingGroupOrder ? "Checking..." : "Check Group Delivery"}
              </button>
            </div>
          </div>

          <input
            required
            onChange={onChaneHandler}
            name="country"
            value={formData.country}
            className="border border-gray-300 rounded py-1.5 px-3.5"
            type="text"
            placeholder="Country"
          />

          <input
            required
            onChange={onChaneHandler}
            name="phone"
            value={formData.phone}
            className="border border-gray-300 rounded py-1.5 px-3.5"
            type="tel"
            placeholder="Phone Number"
          />
        </div>

        <div className="mt-8">
          <div className="mt-8 min-w-80">
            <CartTotal />

            <div className="mt-4">
              {!acceptGroupOrder && (
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="font-medium">Want to save more?</p>
                  <button
                    type="button"
                    onClick={checkForGroupOrders}
                    className="text-blue-600 underline mt-1"
                    disabled={!formData.zipCode || formData.zipCode.length < 5}
                  >
                    Check for group delivery options
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    Join with neighbors to reduce emissions and earn extra
                    EcoPoints
                  </p>
                </div>
              )}
              {acceptGroupOrder && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-blue-800 font-medium flex items-center">
                    <span className="mr-2">👥</span>
                    Joined Group Order - Delivery in 1 day
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAcceptGroupOrder(false);
                      toast.info("You've left the group order");
                    }}
                    className="text-blue-600 underline text-sm mt-1"
                  >
                    Leave group order
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12">
            <Title text1={"PAYMENT"} text2={"METHOD"} />

            <div className="flex gap-3 flex-col lg:flex-row">
              <div
                onClick={() => setMethod("cod")}
                className={`flex gap-3 p-3 border rounded items-center cursor-pointer ${
                  method === "cod" ? "border-black" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={method === "cod"}
                  onChange={() => {}}
                />
                <label>Cash on Delivery</label>
              </div>
              <div
                onClick={() => setMethod("stripe")}
                className={`flex gap-3 p-3 border rounded items-center cursor-pointer ${
                  method === "stripe" ? "border-black" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={method === "stripe"}
                  onChange={() => {}}
                />
                <label>Stripe</label>
              </div>
              <div
                onClick={() => setMethod("razorpay")}
                className={`flex gap-3 p-3 border rounded items-center cursor-pointer ${
                  method === "razorpay" ? "border-black" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={method === "razorpay"}
                  onChange={() => {}}
                />
                <label>Razorpay</label>
              </div>
            </div>

            <div className="w-full text-end mt-8">
              <button
                type="submit"
                className="bg-black text-white px-16 py-3 text-sm disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "PLACE ORDER"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default PlaceOrder;
