import React, { useState } from "react";

interface LoginPageProps {
  cartCount?: number; 
}

const LoginPage: React.FC<LoginPageProps> = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:9393/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Incorrect email or password");
      }

      const data = await response.json();

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.userDto));

      alert("Login successful!");
      window.location.href = "/";
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-block bg-orange-500 p-4 rounded-2xl mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Foodie</h1>
          <p className="text-gray-600 text-sm">Homemade Food Marketplace</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-sm mb-8">
            Sign in to your account to continue
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div>
            <div className="mb-4 text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="mb-4 text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* <div className="flex justify-between items-center mb-6 text-sm">
              <label className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                Remember me
              </label>
              <a href="#" className="text-orange-500 no-underline">
                Forgot password?
              </a>
            </div> */}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white py-3 rounded-lg text-base font-semibold mb-6 transition-colors"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/register" className="text-orange-500 no-underline font-medium">
                Sign up here
              </a>
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          By signing in, you agree to our{" "}
          <a href="#" className="text-orange-500 no-underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-orange-500 no-underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;