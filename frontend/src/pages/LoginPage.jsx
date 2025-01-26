import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const sendOtp = async () => {
    try {
      setError("");
      const response = await axios.post("http://127.0.0.1:8000/api/send-otp/", { email });
      if (response.status === 200) {
        setOtpSent(true);
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    }
  };

  const verifyOtp = async () => {
    try {
      setError("");
      const response = await axios.post("http://127.0.0.1:8000/api/verify-otp/", { email, otp });
      if (response.status === 200) {
        router.push("/");
      }
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5EDED]">
      <Card className="w-full max-w-md p-6 rounded-2xl shadow-lg">
        <CardContent>
          <h1 className="text-2xl font-bold text-[#6482AD] text-center mb-6">Login</h1>

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
              className="w-full border-[#E2DAD6] focus:ring-[#6482AD]"
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
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border-[#E2DAD6] focus:ring-[#6482AD]"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {!otpSent ? (
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
