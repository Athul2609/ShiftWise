import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { AuthContext } from "../App"; // Import AuthContext
import { API_BASE_URL } from "../config";

// Local reusable components
const Card = ({ children, className }) => (
  <div className={`bg-[#E2DAD6] shadow rounded-lg ${className}`}>{children}</div>
);

const CardContent = ({ children }) => <div className="p-4">{children}</div>;

const Button = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={`py-2 px-4 rounded-lg font-semibold ${className}`}
  >
    {children}
  </button>
);

const Input = ({ id, type, value, onChange, placeholder, className }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`py-2 px-3 border rounded-lg ${className}`}
  />
);

const LoadingScreen = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-6 h-6 border-4 border-t-transparent border-blue-500 rounded-full animate-spin font-outfit"></div>
    <span>Sending OTP...</span>
  </div>
);

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // New loading state
  const { login } = useContext(AuthContext); // Use AuthContext
  const navigate = useNavigate();

  const sendOtp = async () => {
    try {
      setError("");
      setLoading(true); // Set loading state to true
      const response = await fetch(`${API_BASE_URL}/api/send-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setOtpSent(true);
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const verifyOtp = async () => {
    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/verify-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid OTP");
      }

      const data = await response.json();
      const token = data.token; // Get token from response

      Cookies.set("jwt", token, { expires: 1 }); // Store token in cookies
      login(token); // Pass token to login function
      navigate("/");
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    }
  };

  const handleOtpChange = (e) => {
    const input = e.target.value;
    // Only allow digits and ensure OTP length is 6 digits
    if (/^\d{0,6}$/.test(input)) {
      setOtp(input);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#7FA1C3] font-outfit">
      <Card className="w-full max-w-md p-6 rounded-2xl shadow-lg ">
        <CardContent>
          <h1 className="text-2xl font-bold text-[#6482AD] text-center mb-6 ">Login</h1>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-[#7FA1C3] mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-[#E2DAD6] focus:ring-[#6482AD] bg-[#F5EDED]"
            />
          </div>

          {otpSent && (
            <div className="mb-4">
              <label htmlFor="otp" className="block text-sm font-medium text-[#7FA1C3] mb-2">
                Enter OTP
              </label>
              <Input
                id="otp"
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={handleOtpChange} // Updated to handle OTP input change
                className="w-full border-[#E2DAD6] focus:ring-[#6482AD]"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {loading ? (  // Show loading screen if OTP is being sent
            <LoadingScreen />
          ) : !otpSent ? (
            <Button
              onClick={sendOtp}
              className="w-full bg-[#6482AD] text-white hover:bg-[#7FA1C3]"
            >
              Send OTP
            </Button>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={verifyOtp}
                className="w-full bg-[#6482AD] text-white hover:bg-[#7FA1C3]"
              >
                Verify OTP
              </Button>
              <Button
                onClick={sendOtp}
                className="w-full bg-[#E2DAD6] text-[#6482AD] hover:bg-[#7FA1C3]"
              >
                Resend OTP
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
