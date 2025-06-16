import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { setToken, token, backendUrl, navigate } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const route =
        currentState === "Sign Up" ? "/api/user/register" : "/api/user/login";

      const payload =
        currentState === "Sign Up"
          ? { name, email, password, phone }
          : { email, password };

      const response = await axios.post(`${backendUrl}${route}`, payload);

      if (response.data.token || response.data.success) {
        const token = response.data.token || response.data.accessToken;
        setToken(token);
        localStorage.setItem("token", token);
        toast.success(response.data.message || "Login successful");

        setTimeout(() => navigate("/"), 100); // Force navigate after render
      } else {
        toast.error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Something went wrong. Try again."
      );
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-1">
        <p className="prata-regular text-3xl ">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === "Sign Up" && (
        <>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="w-full px-3 py-2 border border-gray-800"
            type="text"
            name="name"
            placeholder="Name"
            required
          />
          <input
            onChange={(e) => setPhone(e.target.value)}
            value={phone}
            className="w-full px-3 py-2 border border-gray-800"
            type="tel"
            name="phone"
            placeholder="Phone Number"
            required
          />
        </>
      )}

      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        className="w-full px-3 py-2 border border-gray-800"
        type="email"
        name="email"
        placeholder="Email"
        required
      />
      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        className="w-full px-3 py-2 border border-gray-800"
        type="password"
        name="password"
        placeholder="Password"
        required
      />

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer text-blue-600">Forget Password?</p>
        <p
          onClick={() =>
            setCurrentState(currentState === "Login" ? "Sign Up" : "Login")
          }
          className="cursor-pointer text-blue-600"
        >
          {currentState === "Login" ? "Create Account" : "Login Here"}
        </p>
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
