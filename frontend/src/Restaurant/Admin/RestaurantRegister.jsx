import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdRestaurant,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdError,
} from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { motion, useSpring, frame } from "motion/react";
import hamburger from "/store.png";
import { useRegisterRestaurantMutation } from "../../Redux/slices/restaurantSlice";
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

export default function RestaurantRegister() {
  const navigate = useNavigate();
  const [registerRestaurant, { isLoading, isSuccess, error, isError }] =
    useRegisterRestaurantMutation();

  const [formData, setFormData] = useState({
    restaurantName: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    cuisineType: "",
    description: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const hamburgerRef = useRef(null);
  const { x, y } = useFollowPointer(hamburgerRef);

  const backgroundHamburgers = useMemo(() => {
    return Array.from({ length: 12 }).map((_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${30 + Math.random() * 50}px`,
      height: `${30 + Math.random() * 50}px`,
      rotation: Math.random() * 360,
    }));
  }, []);

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  };

  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
    if (
      formData.confirmPassword &&
      formData.password === formData.confirmPassword
    ) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  }, [formData.password, formData.confirmPassword]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Restaurant registered successfully!");
      navigate("/restaurant/login");
    }
  }, [isSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.phone.replace(/[^\d]/g, "").length !== 10) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    if (
      !passwordStrength.length ||
      !passwordStrength.uppercase ||
      !passwordStrength.number ||
      !passwordStrength.special
    ) {
      newErrors.password = "Password does not meet requirements";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.restaurantName.length < 2) {
      newErrors.restaurantName =
        "Restaurant name must be at least 2 characters";
    }
    if (formData.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const restaurantData = {
          restaurantName: formData.restaurantName, // Keep the original name for the API
          name: formData.restaurantName, // Add the expected field name
          email: formData.email,
          password: formData.password,
          phone: formData.phone.replace(/[^\d]/g, ""),
          address: formData.address,
          city: formData.city, // Send city separately as expected by the API
          cuisineType: formData.cuisineType, // Match the expected field name
          description: formData.description,
        };
        await registerRestaurant(restaurantData).unwrap();
      } catch (err) {
        toast.error(
          err.data?.error || "Registration failed. Please try again."
        );
        console.error("Failed to register:", err);
      }
    } else {
      toast.error("Please fix the highlighted errors before submitting.");
      console.log("Form has errors:", errors);
    }
  };

  const apiErrorMessage = isError
    ? error.data?.message || "Registration failed. Please try again."
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-300 to-yellow-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <motion.div
        ref={hamburgerRef}
        style={{
          x,
          y,
          position: "absolute",
          zIndex: 0,
          pointerEvents: "none",
        }}
        className="opacity-70"
      >
        <img src={hamburger} alt="" className="w-28 h-28 object-contain" />
      </motion.div>

      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {backgroundHamburgers.map((burger) => (
          <div
            key={burger.id}
            className="absolute opacity-20"
            style={{
              left: burger.left,
              top: burger.top,
              width: burger.width,
              height: burger.height,
              transform: `rotate(${burger.rotation}deg)`,
              zIndex: 0,
            }}
          >
            <img
              src={hamburger}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      <div className="max-w-5xl w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden relative z-10">
        <div className="px-6 py-8 sm:px-10">
          {apiErrorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {apiErrorMessage}
            </div>
          )}

          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-800">
              Register Your Restaurant
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join Cravely to showcase your restaurant to millions of food
              lovers
            </p>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="restaurantName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Restaurant Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdRestaurant className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="restaurantName"
                      name="restaurantName"
                      type="text"
                      required
                      value={formData.restaurantName}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.restaurantName
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg`}
                      placeholder="Enter your restaurant name"
                    />
                  </div>
                  {errors.restaurantName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <MdError className="mr-1" /> {errors.restaurantName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdLocationOn className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.address
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg`}
                      placeholder="Enter your restaurant address"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <MdError className="mr-1" /> {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className={`block w-full pl-3 pr-3 py-3 border ${
                          errors.city
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-orange-400 focus:border-orange-400"
                        } rounded-lg`}
                        placeholder="Enter your city"
                      />
                    </div>
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <MdError className="mr-1" /> {errors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="cuisineType"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Cuisine Type
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        id="cuisineType"
                        name="cuisineType"
                        type="text"
                        required
                        value={formData.cuisineType}
                        onChange={handleChange}
                        className={`block w-full pl-3 pr-3 py-3 border ${
                          errors.cuisineType
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-orange-400 focus:border-orange-400"
                        } rounded-lg`}
                        placeholder="e.g., Italian, Indian, etc."
                      />
                    </div>
                    {errors.cuisineType && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <MdError className="mr-1" /> {errors.cuisineType}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.phone
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg`}
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <MdError className="mr-1" /> {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
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
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.email
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg`}
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <MdError className="mr-1" /> {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      className={`block w-full px-3 py-3 border ${
                        errors.description
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg`}
                      placeholder="Tell us about your restaurant..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
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
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-3 border ${
                        errors.password
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg`}
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
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-xs">
                      <div
                        className={`h-4 w-4 rounded-full mr-2 flex items-center justify-center ${
                          passwordStrength.length
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordStrength.length && (
                          <FaCheck className="text-white text-xs" />
                        )}
                      </div>
                      <span
                        className={
                          passwordStrength.length
                            ? "text-green-500"
                            : "text-gray-500"
                        }
                      >
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div
                        className={`h-4 w-4 rounded-full mr-2 flex items-center justify-center ${
                          passwordStrength.uppercase
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordStrength.uppercase && (
                          <FaCheck className="text-white text-xs" />
                        )}
                      </div>
                      <span
                        className={
                          passwordStrength.uppercase
                            ? "text-green-500"
                            : "text-gray-500"
                        }
                      >
                        At least 1 uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div
                        className={`h-4 w-4 rounded-full mr-2 flex items-center justify-center ${
                          passwordStrength.number
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordStrength.number && (
                          <FaCheck className="text-white text-xs" />
                        )}
                      </div>
                      <span
                        className={
                          passwordStrength.number
                            ? "text-green-500"
                            : "text-gray-500"
                        }
                      >
                        At least 1 number
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div
                        className={`h-4 w-4 rounded-full mr-2 flex items-center justify-center ${
                          passwordStrength.special
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordStrength.special && (
                          <FaCheck className="text-white text-xs" />
                        )}
                      </div>
                      <span
                        className={
                          passwordStrength.special
                            ? "text-green-500"
                            : "text-gray-500"
                        }
                      >
                        At least 1 special character
                      </span>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <MdError className="mr-1" /> {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-3 border ${
                        errors.confirmPassword
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg`}
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <MdVisibilityOff className="h-5 w-5" />
                        ) : (
                          <MdVisibility className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <MdError className="mr-1" /> {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="flex flex-col items-center">
                    <MdRestaurant className="h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Drag and drop your restaurant logo here or
                      <span className="text-orange-500 font-medium cursor-pointer">
                        {" "}
                        browse
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 text-orange-400 focus:ring-orange-400 border-gray-300 rounded mt-1"
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-orange-500 hover:text-orange-600"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-orange-500 hover:text-orange-600"
                    >
                      Privacy Policy
                    </a>{" "}
                    for restaurant partners
                  </label>
                </div>
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
                {isLoading ? "Registering..." : "Register Restaurant"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/restaurant/login"
                className="font-medium text-orange-500 hover:text-orange-400"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
