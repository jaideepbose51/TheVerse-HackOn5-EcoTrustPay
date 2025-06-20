import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import LoadingSpinner from "../components/LoadingSpinner";

const Cart = () => {
  const {
    products,
    productsLoading,
    currency,
    cartItems,
    updateQuantity,
    navigate,
  } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  if (productsLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (cartData.length === 0) {
    return (
      <div className="border-t pt-14 text-center py-20">
        <Title text1={"YOUR"} text2={"CART"} />
        <p className="mt-4 text-gray-600">Your cart is empty</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-black text-white px-6 py-2 rounded"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      <div>
        {cartData.map((item, index) => {
          const productData = products.find(
            (product) =>
              product._id === item._id || product.productId === item._id
          );

          if (!productData) {
            console.error("Product data not found for:", item._id);
            return null;
          }

          const productImage = productData.images?.[0] || assets.placeholder;
          const productName = productData.name || "Unknown Product";
          const productPrice = productData.price || 0;

          return (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              <div className="flex items-start gap-6">
                <img
                  className="w-16 sm:w-20 object-cover"
                  src={productImage}
                  alt={productName}
                />
                <div>
                  <p className="text-xs sm:text-lg font-medium">
                    {productName}
                  </p>
                  <div className="flex items-center gap-5 mt-2">
                    <p>
                      {currency}
                      {productPrice}
                    </p>
                  </div>
                </div>
              </div>
              <input
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!isNaN(value) && value >= 1) {
                    updateQuantity(item._id, item.size, value);
                  }
                }}
                className="border max-w-10 sm:max-w-20 px-1 py-1"
                type="number"
                min={1}
                value={item.quantity}
              />
              <img
                className="w-4 mr-4 sm:w-5 cursor-pointer"
                onClick={() => updateQuantity(item._id, item.size, 0)}
                src={assets.bin_icon}
                alt="Remove item"
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />
          <div className="w-full text-end">
            <button
              onClick={() => navigate("/placeorder")}
              className="bg-black text-white text-sm my-8 px-8 py-3"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
