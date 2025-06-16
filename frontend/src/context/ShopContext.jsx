import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const authHeader = token ? { Authorization: token } : {};

  const addToCart = async (productId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (!cartData[productId]) cartData[productId] = {};
    cartData[productId][size] = (cartData[productId][size] || 0) + 1;

    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/user/cart/add",
          { productId, catalogueId: "dummy", quantity: 1 }, // ✅ update with real catalogueId
          { headers: authHeader }
        );
      } catch (error) {
        console.log(error);
        toast.error("Failed to sync cart");
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const size in cartItems[items]) {
        try {
          totalCount += cartItems[items][size] || 0;
        } catch (err) {
          console.log(err);
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (productId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[productId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/user/cart/add",
          { productId, catalogueId: "dummy", quantity }, // ✅ update with real catalogueId
          { headers: authHeader }
        );
      } catch (error) {
        console.log(error);
        toast.error("Failed to update cart");
      }
    }
  };

  const getCartAmount = () => {
    let total = 0;
    for (const pid in cartItems) {
      const prod = products.find((p) => p.productId === pid);
      for (const size in cartItems[pid]) {
        try {
          if (prod) total += prod.price * cartItems[pid][size];
        } catch (err) {
          console.log(err);
        }
      }
    }
    return total;
  };

  const getProductData = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user`);
      if (Array.isArray(res.data)) {
        setProducts(res.data);
        console.log(res.data);
      } else {
        toast.error("Failed to load products");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch products");
    }
  };

  const getUserCart = async (authToken) => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/cart/get`, {
        headers: {
          Authorization: authToken,
        },
      });
      if (res.data.success) {
        setCartItems(res.data.cartData || {});
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to load cart");
    }
  };

  useEffect(() => {
    getProductData();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken && !token) {
      setToken(storedToken);
      getUserCart(storedToken);
    }
  }, [token]);

  return (
    <ShopContext.Provider
      value={{
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        addToCart,
        setCartItems,
        getCartCount,
        updateQuantity,
        getCartAmount,
        navigate,
        backendUrl,
        setToken,
        token,
      }}
    >
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
