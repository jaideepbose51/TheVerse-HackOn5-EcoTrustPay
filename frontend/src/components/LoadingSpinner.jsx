const LoadingSpinner = ({ fullPage = false }) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullPage ? "h-screen" : "py-8"
      }`}
    >
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
