"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const VerifyOTPPage = () => {
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
  
    useEffect(() => {
      const storedEmail = localStorage.getItem("email");
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        router.push("/user-signin");
      }
    }, [router]);
  
    const onVerifyOtp = async () => {
      try {
        setLoading(true);
        const response = await axios.post("/api/users/user-verify", { otp, email });
  
        console.log("Response:", response.data);
  
        if (response.data.success) {
          localStorage.removeItem("email");
          router.push("/");
        }
      } catch (error: any) {
        console.error("Error verifying OTP:", error.message);
        setLoading(false);
      }
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
        <h1 className="text-xl font-semibold text-center mb-4 text-black">Verify OTP</h1>
        
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        
        <input
          type="number"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full px-4 py-2 border rounded-md focus:outline-2 focus:ring focus:ring-blue-300 text-black"
        />
        
        <button
          onClick={onVerifyOtp}
          className="w-full bg-blue-500 text-white py-2 rounded-md mt-4 hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
