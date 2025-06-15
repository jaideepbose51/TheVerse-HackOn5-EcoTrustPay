import React from "react";

const NewsLetter = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
    // You can later add functionality to handle email submissions here
  };

  return (
    <div className="text-center px-4">
      <p className="text-2xl font-medium text-gray-800">
        Join Our Green Movement
      </p>
      <p className="text-gray-400 mt-3">
        Subscribe to get the latest verified eco-products, tips for sustainable
        living, and updates on how EcoTrust Pay is reshaping trusted e-commerce.
      </p>
      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3 rounded overflow-hidden"
      >
        <input
          className="w-full flex-1 outline-none py-3 text-sm"
          type="email"
          name="email"
          placeholder="Enter your email"
          required
        />
        <button
          type="submit"
          className="bg-black text-white text-xs px-6 py-4 hover:bg-gray-800 transition-all duration-300"
        >
          SUBSCRIBE
        </button>
      </form>
    </div>
  );
};

export default NewsLetter;
