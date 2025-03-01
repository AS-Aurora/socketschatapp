"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const page = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const onSignin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post("/api/users/user-signin", { email });
      console.log("Response", response.data);

      if (response.data.success) {
        console.log("Email sent successfully");
        localStorage.setItem("email", email);
        router.push("/user-verify");
      } else {
        console.log("Failed to send email");
        setLoading(false);
      }
    } catch (error: any) {
      console.log("Error signing in", error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <h1>{loading ? "Processing" : "Sign In User"}</h1>

      <label>Enter your email:</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="text-white focus:outline-2 p-2 bg-gray-800 rounded"
      />

      <button onClick={onSignin} className="mt-2 p-2 bg-blue-500 text-white rounded ">
        Send Otp
      </button>
    </div>
  );
};

export default page;
