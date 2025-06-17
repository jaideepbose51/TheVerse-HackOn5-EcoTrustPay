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
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 10000, // 10 seconds timeout
  });

  const getCatalogueIdForProduct = (productId) => {
    const product = products.find(
      (p) => p._id === productId || p.productId === productId
    );
    return product?.catalogueId || null;
  };

  const checkProductAvailability = (productId, size = "one-size") => {
    const product = products.find(
      (p) => p._id === productId || p.productId === productId
    );

    if (!product) {
      console.error("Product not found:", productId);
      return false;
    }

    // For products without sizes, only check inStock status
    if (!product.sizes || product.sizes.length === 0) {
      return product.inStock;
    }

    // For products with sizes, check both size availability and inStock status
    return product.sizes.includes(size) && product.inStock;
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    setCartItems({});
    toast.info("Logged out successfully");
  };

  const getUserCart = async () => {
    if (!token) {
      setCartItems({});
      return;
    }

    try {
      const response = await axios.get(
        `${backendUrl}/api/user/cart/get`,
        getAuthHeaders()
      );

      if (response.data?.success) {
        setCartItems(response.data.cartData || {});
      } else {
        throw new Error(response.data?.message || "Invalid cart response");
      }
    } catch (error) {
      console.error("Get cart error:", {
        status: error.response?.status,
        message: error.message,
        responseData: error.response?.data,
      });

      if (error.response?.status === 401) {
        handleLogout();
      }
      // Continue with local cart even if fetch fails
    }
  };

  const addToCart = async (productId, size = "one-size") => {
    const catalogueId = getCatalogueIdForProduct(productId);
    if (!catalogueId) {
      toast.error("Product information is incomplete");
      return { success: false, localOnly: true };
    }

    console.log("Attempting to add to cart:", {
      productId,
      catalogueId,
      size,
      token: token ? "exists" : "none",
    });

    // Create backup of current cart state
    const previousCartState = { ...cartItems };

    // Optimistic update
    const newCartItems = { ...cartItems };
    if (!newCartItems[productId]) newCartItems[productId] = {};
    newCartItems[productId][size] = (newCartItems[productId][size] || 0) + 1;
    setCartItems(newCartItems);

    if (!token) {
      toast.success("Added to cart (local)");
      return { success: true, localOnly: true };
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/cart/add`,
        {
          productId,
          catalogueId,
          quantity: 1,
          size,
        },
        getAuthHeaders()
      );

      console.log("Add to cart response:", response.data);

      if (response.data?.success) {
        // Sync with server response
        setCartItems(response.data.cartData || newCartItems);
        return { success: true, localOnly: false };
      }
      throw new Error(response.data?.message || "Invalid server response");
    } catch (error) {
      console.error("Add to cart failed:", {
        status: error.response?.status,
        message: error.message,
        responseData: error.response?.data,
        requestConfig: error.config,
      });

      // Revert to previous state on error
      setCartItems(previousCartState);

      if (error.response?.status === 401) {
        handleLogout();
        toast.error("Session expired. Please login again");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later");
        console.error("Server error details:", error.response?.data);
      } else {
        toast.error(error.response?.data?.message || "Failed to add to cart");
      }

      return { success: false, localOnly: false };
    }
  };

  const getCartCount = () => {
    return Object.values(cartItems).reduce(
      (total, sizes) =>
        total + Object.values(sizes).reduce((sum, qty) => sum + qty, 0),
      0
    );
  };

  const updateQuantity = async (productId, size, quantity) => {
    if (quantity < 0) return;

    const catalogueId = getCatalogueIdForProduct(productId);
    if (!catalogueId) {
      toast.error("Product information is incomplete");
      return;
    }

    const previousCart = { ...cartItems };
    const updatedCart = { ...cartItems };

    if (quantity === 0) {
      if (updatedCart[productId]) {
        delete updatedCart[productId][size];
        if (Object.keys(updatedCart[productId]).length === 0) {
          delete updatedCart[productId];
        }
      }
    } else {
      if (!updatedCart[productId]) updatedCart[productId] = {};
      updatedCart[productId][size] = quantity;
    }

    setCartItems(updatedCart);

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/user/cart/add`,
          {
            productId,
            catalogueId,
            quantity,
            size,
          },
          getAuthHeaders()
        );
      } catch (error) {
        console.error("Update quantity failed:", error);
        setCartItems(previousCart);
        toast.error("Failed to update quantity");
      }
    }
  };

  // Add this to your ShopContext.jsx
  const refreshToken = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/refresh-token`,
        {
          token: localStorage.getItem("refreshToken"), // Assuming you store this
        }
      );

      if (response.data.token) {
        setToken(response.data.token);
        return response.data.token;
      }
    } catch (error) {
      handleLogout();
      throw error;
    }
  };

  // Then modify your API calls to handle token refresh:
  const apiCallWithRefresh = async (apiCall) => {
    try {
      return await apiCall();
    } catch (error) {
      if (error.response?.status === 401) {
        // Try to refresh token
        const newToken = await refreshToken();
        // Retry with new token
        return await apiCall(newToken);
      }
      throw error;
    }
  };

  const getCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [productId, sizes]) => {
      const product = products.find(
        (p) => p._id === productId || p.productId === productId
      );
      if (!product) return total;

      return (
        total +
        Object.entries(sizes).reduce((sum, [size, quantity]) => {
          return sum + product.price * quantity;
        }, 0)
      );
    }, 0);
  };

  const clearCart = () => {
    setCartItems({});
  };

  const getProductData = async () => {
    setProductsLoading(true);
    setProductsError(null);

    try {
      const response = await axios.get(`${backendUrl}/api/user`, {
        timeout: 10000,
      });

      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        throw new Error("Invalid products data format");
      }
    } catch (error) {
      console.error("Failed to fetch products:", {
        status: error.response?.status,
        message: error.message,
        responseData: error.response?.data,
      });
      setProductsError(error.message);
      toast.error("Could not fetch products");
    } finally {
      setProductsLoading(false);
    }
  };

  // Initialize token and cart
  useEffect(() => {
    const initialize = async () => {
      if (token) {
        localStorage.setItem("token", token);
        await getUserCart();
      } else {
        localStorage.removeItem("token");
        setCartItems({});
      }
    };
    initialize();
  }, [token]);

  // Fetch products on mount
  useEffect(() => {
    getProductData();
  }, []);

  // In your ShopContext.jsx, ensure getAuthHeaders is included in the context value
  const contextValue = {
    products,
    productsLoading,
    productsError,
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
    clearCart,
    navigate,
    backendUrl,
    setToken,
    token,
    getCatalogueIdForProduct,
    checkProductAvailability,
    handleLogout,
    getAuthHeaders: () => ({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }),
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
