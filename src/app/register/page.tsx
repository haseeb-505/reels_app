"use client";

import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

const page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (password !== confirmPassword) {
        console.log("Password field do not match each other")
      toast.error("Password do not match");
      return;
    }

    try {
        // react query
        // loading, error, debouncing state
      const response = await axios.post("/api/auth/register", {
        email,
        password,
      });
      toast.success("User registered successfully", {
        description: response.data.message,
      });
      // navigate the user through router
      router.replace("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 && error.response?.data?.error === "email already taken") {
        toast.error("Email already registered", {
          description: "This email address is already in use. Please use a different email.",
        });
      } else {
        toast.error("Registration failed", {
          description: error.response?.data?.error || "An unexpected error occurred",
        });
      }
    } else {
      toast.error("Registration failed", {
        description: "An unexpected error occurred",
      });
    }
  } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-500 rounded-lg shadow-md p-8">
        <h1 className="text-2xl text-white font-bold text-center mb-6 text-gray-800">
          Register
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-white text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-white text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-white text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSubmitting? <Loader2 className="animate-spin"/> : "Register"}
          </button>
        </form>

        <div className="mt-4 bg-white p-3 rounded-full text-center text-sm text-gray-600">
          <p>
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
