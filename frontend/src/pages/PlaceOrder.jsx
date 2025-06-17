import React, { useContext, useState, useEffect } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
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

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
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
    // Calculate eco points and CO2 savings whenever cart changes
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

      // Add bonus for group orders if accepted
      if (acceptGroupOrder) {
        points += 50;
        savings += 0.5;
      }

      setEcoPointsEarned(points);
      setCo2Savings(parseFloat(savings.toFixed(2)));
    };

    calculateSavings();
  }, [cartItems, products, acceptGroupOrder]);

  useEffect(() => {
    const checkForGroupOrders = async () => {
      if (!token || !formData.zipCode) return;

      try {
        const response = await axios.get(
          `${backendUrl}/api/user/orders/nearby`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            params: { zipCode: formData.zipCode },
          }
        );

        if (response.data.available) {
          setGroupOrderAvailable(true);
          setGroupOrderDetails(response.data.details);
          setShowGroupOrderModal(true);
        }
      } catch (error) {
        console.log("Group order check error:", {
          status: error.response?.status,
          message: error.message,
        });

        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again");
          handleLogout(); // Assuming you have access to handleLogout from context
        }
      }
    };

    if (token && formData.zipCode) {
      checkForGroupOrders();
    }
  }, [token, formData.zipCode]);

  const onChaneHandler = (e) => {
    const { name, value } = e.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      let orderItems = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items)
            );
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        isGroupOrder: acceptGroupOrder,
        ecoPointsEarned,
        co2Savings,
      };

      switch (method) {
        case "cod":
          const response = await axios.post(
            `${backendUrl}/api/user/order`,
            orderData,
            { headers: { token } }
          );
          if (response.data.success) {
            setCartItems({});
            navigate("/orders", {
              state: {
                ecoPoints: orderData.ecoPointsEarned,
                co2Savings: orderData.co2Savings,
              },
            });
          } else {
            toast.error(response.data.message);
          }
          break;

        case "stripe":
          const responseStripe = await axios.post(
            `${backendUrl}/api/order/stripe`,
            orderData,
            { headers: { token } }
          );
          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
          } else {
            toast.error(responseStripe.data.message);
          }
          break;

        case "razorpay":
          navigate("/underconstruction");
          break;

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <>
      {/* Group Order Modal */}
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
        {/* LEFT SIDE - Delivery Information */}
        <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
          <div className="text-xl sm:text-2xl my-3">
            <Title text1={"DELIVERY"} text2={"INFORMATION"} />
          </div>

          {/* Eco Points Preview */}
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
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="State"
            />
            <input
              required
              onChange={onChaneHandler}
              name="zipCode"
              value={formData.zipCode}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="ZIP Code"
            />
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

        {/* RIGHT SIDE - Order Summary */}
        <div className="mt-8">
          <div className="mt-8 min-w-80">
            <CartTotal />

            {/* Group Order Status */}
            {acceptGroupOrder && (
              <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-blue-800 font-medium flex items-center">
                  <span className="mr-2">👥</span>
                  Joined Group Order - Delivery in 1 day
                </p>
              </div>
            )}
          </div>

          <div className="mt-12">
            <Title text1={"PAYMENT"} text2={"METHOD"} />

            {/* Payment Methods */}
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
                className="bg-black text-white px-16 py-3 text-sm"
              >
                PLACE ORDER
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default PlaceOrder;
