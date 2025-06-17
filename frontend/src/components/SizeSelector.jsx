const SizeSelector = ({
  sizes,
  selectedSize,
  onSelectSize,
  className,
  inStock,
}) => {
  return (
    <div className={`${className}`}>
      <h3 className="text-sm font-medium mb-2">Select Size</h3>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => inStock && onSelectSize(size)}
            className={`px-4 py-2 border rounded-md text-sm ${
              selectedSize === size
                ? "border-primary bg-primary-light text-primary-dark"
                : "border-gray-300 hover:border-gray-400"
            } ${!inStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            disabled={!inStock}
          >
            {size}
            {!inStock && " (Out of stock)"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;
