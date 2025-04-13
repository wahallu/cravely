import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdRestaurant,
} from "react-icons/md";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { frame, motion, useSpring } from "motion/react";
import storeImg from "/store.png";
import { useLoginRestaurantMutation } from "../../Redux/slices/restaurantSlice";
import toast from "react-hot-toast"; // Add this import

const spring = { damping: 3, stiffness: 50, restDelta: 0.001 };

function useFollowPointer(ref) {
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  useEffect(() => {
    if (!ref.current) return;

    const handlePointerMove = ({ clientX, clientY }) => {
      const element = ref.current;

      frame.read(() => {
        x.set(clientX - element.offsetLeft - element.offsetWidth / 2);
        y.set(clientY - element.offsetTop - element.offsetHeight / 2);
      });
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [x, y]);

  return { x, y };
}

export default function RestaurantLogin() {
  const navigate = useNavigate();
  const [loginRestaurant, { isLoading, isSuccess, error, isError }] =
    useLoginRestaurantMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Create refs for the follow pointer effect
  const storeRef = useRef(null);
  const { x, y } = useFollowPointer(storeRef);

  // Create static store positions with useMemo to prevent re-generation on re-renders
  const backgroundStores = useMemo(() => {
    return Array.from({ length: 12 }).map((_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${30 + Math.random() * 50}px`,
      height: `${30 + Math.random() * 50}px`,
      rotation: Math.random() * 360,
    }));
  }, []);

  // Handle successful login
  useEffect(() => {
    if (isSuccess) {
      toast.success("Login successful!");
      // Navigate to restaurant dashboard on success
      navigate("/restaurant/dashboard");
    }
  }, [isSuccess, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginRestaurant({ email, password }).unwrap();
      // The navigate effect above will handle redirect on success
    } catch (err) {
      console.error("Failed to login:", err);
      toast.error(
        err.data?.error || "Login failed. Please check your credentials."
      );
    }
  };

  // API error message
  const apiErrorMessage = isError
    ? error.data?.message || "Login failed. Please check your credentials."
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-300 to-yellow-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Mouse follower element */}
      <motion.div
        ref={storeRef}
        style={{
          x,
          y,
          position: "absolute",
          zIndex: 0,
          pointerEvents: "none",
        }}
        className="opacity-70"
      >
        <img src={storeImg} alt="" className="w-28 h-28 object-contain" />
      </motion.div>

      {/* Additional decorative stores - FIXED POSITIONS */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {backgroundStores.map((store) => (
          <div
            key={store.id}
            className="absolute opacity-20"
            style={{
              left: store.left,
              top: store.top,
              width: store.width,
              height: store.height,
              transform: `rotate(${store.rotation}deg)`,
              zIndex: 0,
            }}
          >
            <img
              src={storeImg}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      {/* Login card */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden relative z-10">
        <div className="px-6 py-8 sm:px-10">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 bg-orange-100 rounded-full flex items-center justify-center">
                <MdRestaurant className="h-12 w-12 text-orange-500" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800">
              Restaurant Login
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Access your restaurant dashboard
            </p>
          </div>

          {/* Display API errors if any */}
          {apiErrorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {apiErrorMessage}
            </div>
          )}

          {/* Social Login */}
          <div className="mt-6">
            <div className="flex gap-4">
              <button className="w-full flex justify-center items-center gap-2 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-150">
                <FaGoogle className="text-red-500" />
                <span>Google</span>
              </button>
              <button className="w-full flex justify-center items-center gap-2 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-150">
                <FaFacebook className="text-blue-600" />
                <span>Facebook</span>
              </button>
            </div>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdEmail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-orange-400 focus:border-orange-400"
                  placeholder="restaurant@email.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-orange-400 focus:border-orange-400"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <MdVisibilityOff className="h-5 w-5" />
                    ) : (
                      <MdVisibility className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-orange-400 focus:ring-orange-400 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-orange-500 hover:text-orange-400"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white ${
                  isLoading
                    ? "bg-orange-300 cursor-not-allowed"
                    : "bg-orange-400 hover:bg-orange-600"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 transition-colors duration-300 transform hover:-translate-y-1 hover:shadow-lg`}
              >
                {isLoading ? "Signing in..." : "Sign in to Dashboard"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have a restaurant account?{" "}
              <Link
                to="/restaurant/register"
                className="font-medium text-orange-500 hover:text-orange-400"
              >
                Register now
              </Link>
            </p>
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-xs text-center text-gray-500">
              For customer login,{" "}
              <Link
                to="/login"
                className="text-orange-500 hover:text-orange-400"
              >
                click here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
