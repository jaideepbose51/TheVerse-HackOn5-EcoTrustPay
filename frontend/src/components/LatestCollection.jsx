import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    // Sort by creation date and take the newest 8 products
    const sorted = [...products]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
    setLatestProducts(sorted);
  }, [products]);

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1={"NEW ARRIVALS"} text2={"JUST ADDED"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600 mt-2">
          Discover our newest eco-friendly products. Each item is verified for
          sustainability.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6">
        {latestProducts.map((item) => (
          <ProductItem
            key={item._id || item.productId}
            id={item._id || item.productId}
            name={item.name}
            price={item.price}
            images={item.images}
            isEcoVerified={item.ecoVerified}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
