import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Helper: Check if any field is empty
  const isAnyFieldEmpty = () =>
    !username.trim() || !emailOrPhone.trim() || !password.trim() || !confirmPassword.trim();

  // Helper: Email regex validation
  const isValidEmail = (email: string) => {
    // RFC 5322 Official Standard
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Helper: Password strength
  const isStrongPassword = (pwd: string) => {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(pwd);
  };

  // Helper: Passwords match
  const doPasswordsMatch = () => password === confirmPassword;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Empty field check
    if (isAnyFieldEmpty()) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Email format validation
    if (!isValidEmail(emailOrPhone)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Password strength check
    if (!isStrongPassword(password)) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    // Passwords match check
    if (!doPasswordsMatch()) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email: emailOrPhone,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Registration failed.");
      } else {
        // Auto-login after signup
        login(data.token, data.user);
        toast.success("Welcome! You have been signed up and logged in.");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Google Auth handler
  const handleGoogleAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google/register`; // backend OAuth route
  };

  // (Later you can do the same for Facebook/GitHub if needed)
  const handleFacebookAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/facebook/register`;
  };

  const handleGithubAuth = () => {
    window.location.href =  `${import.meta.env.VITE_API_BASE_URL}/auth/github/register`;
  };

  return (
    <div className="min-h-screen bg-storiq-dark flex flex-col relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-storiq-purple/30 to-storiq-blue/30 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-storiq-purple/40 to-storiq-blue/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-10 w-80 h-80 bg-gradient-to-br from-storiq-blue/30 to-storiq-purple/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-48 left-1/3 w-72 h-72 bg-gradient-to-br from-storiq-blue/20 to-storiq-purple/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-10 w-96 h-96 bg-gradient-to-br from-storiq-purple/30 to-storiq-blue/30 rounded-full blur-3xl opacity-50"></div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-8 flex justify-start items-center z-10">
        <div className="bg-white rounded-full flex items-center p-1.5 space-x-4">
          <h1 className="font-orbitron font-semibold text-2xl text-black pl-6">
            <Link to="/">STORIQ</Link>
          </h1>
          <Button
            variant="default"
            className="bg-black text-white hover:bg-gray-800 rounded-full px-5 py-2 text-sm font-semibold"
          >
            SIGN UP
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Side */}
        <div className="flex-1 flex items-center justify-center px-8 z-10">
          <div className="max-w-xl">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Roll the Carpet.!
            </h1>

            <div className="border border-white/20 rounded-lg px-6 py-3 inline-block">
              <span className="text-white/70 italic text-lg">Skip the lag ?</span>
              <div className="border-t border-dashed border-white/30 mt-3"></div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex items-center justify-center px-8 z-10">
          {/* Signup Card */}
          <div className="bg-storiq-card-bg/80 backdrop-blur-xl border border-storiq-border rounded-3xl p-10 w-full max-w-md relative shadow-xl">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-3">Signup</h2>
              <p className="text-white/60 text-base">
                Just some details to get you in.!
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSignup}>
              <Input
                type="text"
                placeholder="Username"
                className="w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Email / Phone"
                className="w-full"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                className="w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                className="w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {/* All error/success feedback is now handled via toast notifications */}

              <Button
                variant="gradient"
                className="w-full py-3 rounded-xl text-lg font-semibold"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Signup"}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-storiq-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-storiq-card-bg px-4 text-white/60">Or</span>
                </div>
              </div>

              {/* Social Auth Buttons */}
              <div className="flex justify-center space-x-4">
                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <svg className="w-6 h-6" viewBox="0 0 48 48">
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8
                      c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,
                      7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,
                      24,4C12.955,4,4,12.955,4,24c0,
                      11.045,8.955,20,20,20c11.045,0,
                      20-8.955,20-20C44,22.659,43.862,
                      21.35,43.611,20.083z"
                    ></path>
                  </svg>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={handleFacebookAuth}
                  className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 
                      1.115-1.333h2.885v-5h-3.808c-3.596 
                      0-5.192 1.583-5.192 4.615v2.385z"></path>
                  </svg>
                </button>

                {/* GitHub */}
                <button
                  type="button"
                  onClick={handleGithubAuth}
                  className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 
                      0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234
                      c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756
                      -1.089-.745.083-.729.083-.729 1.205.084 1.839
                      1.237 1.839 1.237 1.07 1.834 2.807 
                      1.304 3.492.997.107-.775.418-1.305.762-1.604
                      -2.665-.305-5.467-1.334-5.467-5.931 
                      0-1.311.469-2.381 1.236-3.221
                      -.124-.303-.535-1.524.117-3.176 0 
                      0 1.008-.322 3.301 1.23.957-.266 
                      1.983-.399 3.003-.404 1.02.005 
                      2.047.138 3.006.404 2.291-1.552 
                      3.297-1.23 3.297-1.23.653 1.653.242 
                      2.874.118 3.176.77.84 1.235 1.911 
                      1.235 3.221 0 4.609-2.807 5.624-5.479 
                      5.921.43.372.823 1.102.823 2.222v3.293
                      c0 .319.192.694.801.576 4.765-1.589 
                      8.199-6.086 8.199-11.386 
                      0-6.627-5.373-12-12-12z"
                    />
                  </svg>
                </button>
              </div>

              {/* Footer Links */}
              <div className="text-center text-white/60 mt-6">
                Already Registered?{" "}
                <a
                  href="/login"
                  className="text-storiq-purple hover:text-storiq-purple-light ml-1"
                >
                  Login
                </a>
              </div>

              <div className="flex justify-center space-x-6 text-sm text-white/50 mt-4">
                <a href="#" className="hover:text-white">
                  Terms & Conditions
                </a>
                <a href="#" className="hover:text-white">
                  Support
                </a>
                <a href="#" className="hover:text-white">
                  Customer Care
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
