const QuantitySelector = ({ quantity, setQuantity, maxQuantity }) => {
  const handleIncrement = () => {
    if (quantity < maxQuantity) setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <div className="flex items-center border rounded-md">
      <button
        onClick={handleDecrement}
        className="px-3 py-1 text-lg font-medium"
      >
        -
      </button>
      <span className="px-4 py-1 border-x">{quantity}</span>
      <button
        onClick={handleIncrement}
        className="px-3 py-1 text-lg font-medium"
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;
