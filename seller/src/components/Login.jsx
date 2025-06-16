import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = ({ setToken }) => {
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [sellerType, setSellerType] = useState("branded"); // default seller type
  const [mode, setMode] = useState("login"); // "login" or "register"
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const endpoint =
        mode === "register" ? "/api/seller/register" : "/api/seller/login";

      // Prepare payload according to backend schema
      const payload =
        mode === "register"
          ? { shopName, email, password, phone, sellerType }
          : { email, password };

      const response = await axios.post(`${backendUrl}${endpoint}`, payload);

      if (response.data.success) {
        toast.success(
          response.data.message ||
            (mode === "login" ? "Logged in" : "Registered successfully")
        );

        const token = response.data.token;
        setToken(token);
        localStorage.setItem("token", token); // unified key

        navigate("/"); // redirect to dashboard
      } else {
        toast.error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Axios error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Something went wrong. Try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {mode === "login" ? "Seller Login" : "Seller Registration"}
        </h1>

        <form onSubmit={onSubmitHandler}>
          {mode === "register" && (
            <>
              <div className="mb-3 min-w-72">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Shop Name
                </p>
                <input
                  onChange={(e) => setShopName(e.target.value)}
                  value={shopName}
                  className="rounded w-full px-3 py-2 border border-gray-300 outline-none"
                  type="text"
                  placeholder="Your Shop Name"
                  required
                />
              </div>

              <div className="mb-3 min-w-72">
                <p className="text-sm font-medium text-gray-700 mb-2">Phone</p>
                <input
                  onChange={(e) => setPhone(e.target.value)}
                  value={phone}
                  className="rounded w-full px-3 py-2 border border-gray-300 outline-none"
                  type="tel"
                  placeholder="Your Phone Number"
                  required
                />
              </div>

              <div className="mb-3 min-w-72">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Seller Type
                </p>
                <select
                  value={sellerType}
                  onChange={(e) => setSellerType(e.target.value)}
                  className="rounded w-full px-3 py-2 border border-gray-300 outline-none"
                  required
                >
                  <option value="branded">Branded</option>
                  <option value="unbranded">Unbranded</option>
                </select>
              </div>
            </>
          )}

          <div className="mb-3 min-w-72">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Email Address
            </p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="rounded w-full px-3 py-2 border border-gray-300 outline-none"
              type="email"
              placeholder="Your@email.com"
              required
            />
          </div>

          <div className="mb-3 min-w-72">
            <p className="text-sm font-medium text-gray-700 mb-2">Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="rounded w-full px-3 py-2 border border-gray-300 outline-none"
              type="password"
              placeholder="Enter Your Password"
              required
            />
          </div>

          <button
            className="mt-2 w-full px-4 py-2 rounded-md text-white bg-black"
            type="submit"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <p
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="text-sm text-blue-600 text-center cursor-pointer mt-4"
        >
          {mode === "login"
            ? "New Seller? Register here"
            : "Already registered? Login here"}
        </p>
      </div>
    </div>
  );
};

export default Login;
