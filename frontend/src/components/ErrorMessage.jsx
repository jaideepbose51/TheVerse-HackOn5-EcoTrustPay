import { useNavigate } from "react-router-dom";

const ErrorMessage = ({ message, fullPage = false, retryable = false }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullPage ? "h-screen" : "py-8"
      }`}
    >
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
        <div className="text-red-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
          >
            Go Home
          </button>
          {retryable && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
