import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from "../Home/components/header";
import Footer from "../Home/components/footer";
import { toast } from 'react-hot-toast';
// Import icons for enhanced visual appeal
import { FaUser, FaEnvelope, FaPhone, FaHome, FaCity, FaMapMarkerAlt, FaMapPin, FaPlus, FaEdit } from 'react-icons/fa';
import { FaCreditCard, FaPaypal, FaMoneyBillWave, FaCheck, FaShoppingCart, FaAddressCard, FaLock } from 'react-icons/fa';
// Import Stripe dependencies
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartTotalAmount,
  clearCart
} from "../Redux/slices/cartSlice";
import {
  useGetUserAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation
} from "../Redux/slices/shippingAddressSlice";
import { useCreateOrderMutation } from "../Redux/slices/orderSlice";
import {
  useCreatePaymentIntentMutation,
  useSaveCardMutation,
  useGetSavedCardsQuery,
  useGetDbCardsQuery
} from "../Redux/slices/paymentSlice";
import {
  useClearCartMutation
} from "../Redux/slices/cartApiSlice";

// Initialize Stripe with your publishable key
// Replace with your actual publishable key
const stripePromise = loadStripe('pk_test_51R7t0oG8piHs7v556meTuJcbOp532bALYa8SnZtwekL7XGVktZGSfxw3WbCLU7DPGqcz0nCNJoyDiAwqrF2YyWEO007q7lpsAa');

// Card element options for styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
  hidePostalCode: true,
};

// Add this function to your Checkout.jsx file near other utility functions
const calculateEstimatedDelivery = (restaurantId, customerLocation) => {
  // Get current time
  const now = new Date();

  // Base preparation time (minutes) - can vary by restaurant type
  const basePreparationTime = 15;

  // Get distance-based delivery time
  // In a real system, you would get this from a mapping/distance API
  // For now, let's simulate with restaurant-specific values
  const getDeliveryTime = (restaurantId) => {
    // This could come from a restaurant database with average delivery times
    const restaurantDeliveryTimes = {
      // Sample restaurant IDs with their avg delivery times in minutes
      "r123": 10,
      "r456": 15,
      "r789": 20,
      // Add a default for any other restaurant
      "default": 18
    };

    return restaurantDeliveryTimes[restaurantId] || restaurantDeliveryTimes.default;
  };

  // Current traffic conditions factor (1.0 = normal, 1.2 = moderate traffic, 1.5 = heavy)
  const getTrafficFactor = () => {
    const hour = now.getHours();
    // Rush hour periods (breakfast, lunch, dinner times)
    if ((hour >= 7 && hour <= 9) || (hour >= 12 && hour <= 14) || (hour >= 17 && hour <= 19)) {
      return 1.3;
    }
    return 1.0;
  };

  // Weather factor (1.0 = clear, 1.2 = rain, 1.5 = severe)
  // In a real app, you'd get this from a weather API
  const weatherFactor = 1.0;

  // Calculate delivery window
  const deliveryTime = getDeliveryTime(restaurantId);
  const trafficFactor = getTrafficFactor();

  // Total minutes to delivery = preparation + (delivery * traffic * weather)
  const totalMinutes = basePreparationTime + (deliveryTime * trafficFactor * weatherFactor);

  // Round to nearest 5 minutes for better user experience
  const roundedMinutes = Math.ceil(totalMinutes / 5) * 5;

  // Create a delivery window (e.g., "25-35 minutes")
  const minDeliveryTime = roundedMinutes - 5;
  const maxDeliveryTime = roundedMinutes + 5;

  // Calculate the estimated delivery time
  const estimatedDelivery = new Date(now.getTime() + roundedMinutes * 60000);

  return {
    estimatedMinutes: roundedMinutes,
    deliveryWindow: `${minDeliveryTime}-${maxDeliveryTime} minutes`,
    estimatedTime: estimatedDelivery,
    estimatedTimeString: estimatedDelivery.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

// CheckoutForm component with Stripe
function CheckoutForm({
  formData,
  setFormData,
  cartSummary,
  isSubmitting,
  setIsSubmitting,
  onNonCardPayment,
  savedAddresses,
  setSavedAddresses,
  onPaymentSuccess,
  savedCards,
  isLoadingCards,
  createPaymentIntent,
  saveCard,
  refetchCards,
  clearBackendCart  // Add this prop to receive the clearBackendCart function
}) {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch(); // Add this line to get the dispatch function
  const [cardError, setCardError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const formRef = useRef(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(!savedAddresses.length);
  const [saveAddress, setSaveAddress] = useState(false);
  const [cardFocus, setCardFocus] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [saveCardDetails, setSaveCardDetails] = useState(false);
  // Add state for card details to display on card UI
  const [cardDetails, setCardDetails] = useState({
    number: '•••• •••• •••• ••••',
    expiry: '12/26',
    cvc: '123'
  });

  const [selectedCardId, setSelectedCardId] = useState(savedCards.length > 0 ? savedCards[0].id : null);
  const [addAddress] = useAddAddressMutation();
  const [createOrder] = useCreateOrderMutation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle selection of a saved address
  const handleAddressSelect = (addressId) => {
    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setFormData({
        ...formData,
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zipCode
      });
      setSelectedAddressId(addressId);
      setIsAddingNewAddress(false);
    }
  };

  // Switch to adding a new address
  const handleAddNewAddress = () => {
    setIsAddingNewAddress(true);
    setSelectedAddressId(null);
    // Clear address fields but keep other form data
    setFormData({
      ...formData,
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    });
  };

  const handlePaymentSubmission = async (ev) => {
    ev.preventDefault();
    setIsSubmitting(true);
    setCardError(null);

    // Validate form data (for both payment methods)
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city ||
      !formData.state || !formData.zipCode) {
      setCardError("Please fill in all required address fields");
      setIsSubmitting(false);
      return;
    }

    // Save the new address if checkbox is checked
    if (isAddingNewAddress && saveAddress && formData.address) {
      try {
        const addressData = {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          isDefault: savedAddresses.length === 0
        };

        const result = await addAddress(addressData).unwrap();
        if (result.success) {
          console.log("Address saved successfully:", result.address);
        }
      } catch (error) {
        console.error("Failed to save address:", error);
        // Continue with payment even if address saving fails
      }
    }

    // Handle cash payment separately
    if (formData.paymentMethod !== 'creditCard') {
      try {
        // Format items for API submission
        const formattedItems = cartSummary.items.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity),
          image: item.imageUrl || null
        }));

        const orderData = {
          items: formattedItems,
          customer: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          },
          payment: {
            method: 'cash',
            status: 'pending',
          },
          restaurantId: cartSummary.items[0]?.restaurantId,
          subtotal: parseFloat(cartSummary.subtotal.toFixed(2)),
          tax: parseFloat(cartSummary.tax.toFixed(2)),
          deliveryFee: parseFloat(cartSummary.delivery.toFixed(2)),
          total: parseFloat(cartSummary.total.toFixed(2))
        };

        console.log("Creating cash order:", orderData);

        const result = await createOrder(orderData).unwrap();

        if (result.success) {
          console.log("Cash order creation succeeded:", result);

          // Get the real order ID from the API response
          const realOrderId = result.order.orderId || result.order._id;

          // Clear both Redux store cart and backend cart
          dispatch(clearCart());

          try {
            // Clear cart in the backend
            await clearBackendCart().unwrap();
            console.log("Backend cart cleared successfully");
          } catch (clearCartError) {
            console.error("Error clearing backend cart:", clearCartError);
            // Continue with success flow even if backend cart clearing fails
          }

          onPaymentSuccess(realOrderId);
        } else {
          setCardError("Failed to create order: " + (result.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Cash order creation failed:", error);
        setCardError("Failed to create order: " + (error.data?.message || error.message || "Unknown error"));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!stripe || !elements) {
      setCardError("Stripe has not loaded. Please refresh the page and try again.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.nameOnCard?.trim()) {
      setCardError("Please enter the name on your card.");
      return;
    }

    if (!cardComplete && !selectedCardId) {
      setCardError("Please complete your card information.");
      return;
    }

    setProcessing(true);
    setIsSubmitting(true);

    try {
      let paymentMethodId;
      
      // If using a saved card - don't try to create a new payment method
      if (selectedCardId) {
        paymentMethodId = selectedCardId;
        console.log("Using saved card with ID:", paymentMethodId);
      } else {
        // Only create a payment method if we're not using a saved card
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.nameOnCard,
            email: formData.email,
            phone: formData.phone,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: 'US',
            }
          },
        });
        
        if (error) {
          setCardError(error.message);
          setProcessing(false);
          setIsSubmitting(false);
          return;
        }
        
        paymentMethodId = paymentMethod.id;
        console.log('New payment method created:', paymentMethodId);
      }
      
      // 1. Create payment intent through your Gateway service
      const paymentIntentData = {
        amount: Math.round(cartSummary.total * 100),
        currency: 'usd',
        paymentMethodId: paymentMethodId,
        description: `Order from Cravely - ${formData.fullName}`,
        metadata: {
          customerName: formData.fullName,
          customerEmail: formData.email,
          items: JSON.stringify(cartSummary.items.map(item => `${item.name} x${item.quantity}`))
        },
        saveCard: saveCardDetails,
        // Flag to indicate we're using an existing saved card
        useExistingPaymentMethod: selectedCardId ? true : false
      };
      
      console.log("Creating payment intent with data:", paymentIntentData);
      
      try {
        // Use createPaymentIntent mutation
        const intentResponse = await createPaymentIntent(paymentIntentData).unwrap();
        
        if (!intentResponse || !intentResponse.success) {
          throw new Error(intentResponse?.message || 'Failed to create payment intent');
        }
        
        const { clientSecret, intentId } = intentResponse;
        
        // 2. Confirm the payment with Stripe
        let confirmOptions = {
          return_url: window.location.origin + '/payment-return'
        };
        
        // Add payment_method only if we have it
        if (paymentMethodId) {
          confirmOptions.payment_method = paymentMethodId;
        }
        
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, confirmOptions);
        
        if (confirmError) {
          setCardError(confirmError.message);
          setProcessing(false);
          setIsSubmitting(false);
          return;
        }
        
        if (paymentIntent.status === 'succeeded') {
          console.log('Payment succeeded:', paymentIntent);

          // If the user requested to save the card
          if (saveCardDetails && !selectedCardId) {
            try {
              console.log("Payment intent details:", paymentIntent);

              // Get card details from the payment method that was created earlier
              // or from the payment intent's payment method details
              let cardData;

              if (paymentIntent && paymentIntent.payment_method_details &&
                paymentIntent.payment_method_details.card) {
                // Get from payment intent if available
                cardData = paymentIntent.payment_method_details.card;
              } else if (paymentIntent && paymentIntent.charges &&
                paymentIntent.charges.data &&
                paymentIntent.charges.data[0] &&
                paymentIntent.charges.data[0].payment_method_details &&
                paymentIntent.charges.data[0].payment_method_details.card) {
                // Sometimes card data is in the charges array
                cardData = paymentIntent.charges.data[0].payment_method_details.card;
              } else {
                // Fallback to minimal data if we can't find detailed card info
                cardData = {
                  last4: "****", // Will be updated by backend from the payment method
                  brand: "card",
                  exp_month: null,
                  exp_year: null
                };
                console.warn("Card details not found in payment intent, using minimal data");
              }

              // Adjust the parameter names to match what the backend expects
              await saveCard({
                paymentMethodId: paymentMethodId, // This should be available from earlier in the function
                cardholderName: formData.nameOnCard || formData.fullName,
                last4: cardData.last4,
                isDefault: formData.makeDefaultCard || false,
                cardType: cardData.brand,
                expMonth: cardData.exp_month,
                expYear: cardData.exp_year
              });

              console.log("Card saved successfully");
              toast.success("Your card has been saved for future orders");
            } catch (saveCardError) {
              console.error("Error saving card:", saveCardError);
              toast.error("Could not save your card: " + (saveCardError.data?.message || saveCardError.message || "Unknown error"));
            }
          }

          // 3. Create the order with payment details
          try {
            const orderData = {
              items: cartSummary.items.map(item => ({
                id: item.id,
                name: item.name,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity),
                image: item.imageUrl || null
              })),
              customer: {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode
              },
              payment: {
                method: 'creditCard',
                paymentIntentId: paymentIntent.id, // Use direct paymentIntent.id
                status: 'completed',
                amount: cartSummary.total
              },
              restaurantId: cartSummary.items[0]?.restaurantId,
              subtotal: parseFloat(cartSummary.subtotal.toFixed(2)),
              tax: parseFloat(cartSummary.tax.toFixed(2)),
              deliveryFee: parseFloat(cartSummary.delivery.toFixed(2)),
              total: parseFloat(cartSummary.total.toFixed(2))
            };

            console.log("Creating order with payment data:", orderData);

            try {
              const result = await createOrder(orderData).unwrap();

              const realOrderId = result.order.orderId || result.order._id;

              if (result.success) {
                console.log("Order creation succeeded:", result);

                // Clear Redux cart state
                dispatch(clearCart());

                // Clear cart in the backend
                try {
                  await clearBackendCart().unwrap();
                  console.log("Backend cart cleared successfully after credit card payment");
                } catch (clearCartError) {
                  console.error("Error clearing backend cart:", clearCartError);
                  // Continue with success flow even if backend cart clearing fails
                }

                onPaymentSuccess(realOrderId);
              } else {
                console.error("Order API returned success: false", result);
                // Even if the order recording failed, payment was successful
                // We should still clear the cart and let the user proceed
                dispatch(clearCart());
                try {
                  await clearBackendCart().unwrap();
                } catch (clearCartError) {
                  console.error("Error clearing backend cart:", clearCartError);
                }

                onPaymentSuccess(realOrderId);
              }
            } catch (orderApiError) {
              console.error("Order API error:", orderApiError);
              // If the payment was successful but order recording failed,
              // still proceed with the success flow from the user's perspective
              dispatch(clearCart());
              try {
                await clearBackendCart().unwrap();
              } catch (clearCartError) {
                console.error("Error clearing backend cart:", clearCartError);
              }

              onPaymentSuccess();
            }
          } catch (orderError) {
            console.error("Order creation failed:", orderError);
            // Still complete the payment flow since payment succeeded
            dispatch(clearCart());
            try {
              await clearBackendCart().unwrap();
            } catch (clearCartError) {
              console.error("Error clearing backend cart:", clearCartError);
            }

            onPaymentSuccess();
          }
        } else {
          setCardError(`Payment status: ${paymentIntent.status}. Please try again.`);
        }
      } catch (intentError) {
        console.error('Payment intent creation error:', intentError);
        setCardError(intentError.message || 'Failed to process payment. Please try again.');
      }
    } catch (paymentError) {
      console.error("Payment processing error:", paymentError);
      setCardError(paymentError.message || "Payment failed. Please try again.");
      setIsSubmitting(false);
    } finally {
      setProcessing(false);
      setIsSubmitting(false);
    }
  };

  // Expose the form submission method to parent
  useEffect(() => {
    onNonCardPayment.current = () => {
      if (formRef.current) {
        formRef.current.dispatchEvent(
          new Event('submit', { cancelable: true, bubbles: true })
        );
      }
    };
  }, [onNonCardPayment]);

  // Add handler for card element change
  const handleCardElementChange = (e) => {
    setCardComplete(e.complete);

    if (e.error) {
      setCardError(e.error.message);
    } else {
      setCardError(null);
    }

    // Update card number display if available
    if (e.value) {
      const updatedDetails = { ...cardDetails };

      if (e.value.cardNumber) {
        // Format the last 4 digits visible, rest as dots
        const last4 = e.value.cardNumber.split(' ').pop();
        if (last4) {
          updatedDetails.number = `•••• •••• •••• ${last4}`;
        }
      }

      if (e.value.expiryDate) {
        updatedDetails.expiry = e.value.expiryDate;
      }

      setCardDetails(updatedDetails);
    }
  };

  const handleCardSelect = (cardId) => {
    setSelectedCardId(cardId);
    const selectedCard = savedCards.find(card => card.id === cardId);
    if (selectedCard) {
      setFormData({
        ...formData,
        nameOnCard: selectedCard.nameOnCard,
      });

      // Set card as complete when selecting a saved card
      setCardComplete(true);

      // Remove any previous card errors
      setCardError(null);

      console.log(`Selected card: ${selectedCard.cardType} ending in ${selectedCard.cardNumber.slice(-4)}`);
    }
  };

  return (
    <form ref={formRef} onSubmit={handlePaymentSubmission}>
      {/* Shipping Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 transform transition-all hover:shadow-lg border-l-4 border-orange-500">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
          <FaHome className="mr-2 text-orange-500" />
          <span>Shipping Information</span>
        </h2>

        {/* Saved Addresses Section */}
        {savedAddresses.length > 0 && (
          <div className="mb-6">
            <div className="mb-3">
              <h3 className="text-md font-medium text-gray-700">Saved Addresses</h3>
            </div>

            <div className="space-y-3">
              {savedAddresses.map(address => (
                <div
                  key={address.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedAddressId === address.id
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-orange-300'
                    }`}
                  onClick={() => handleAddressSelect(address.id)}
                >
                  {address.isDefault && (
                    <div className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded inline-block mb-2">
                      Default
                    </div>
                  )}
                  <div className="flex justify-between">
                    <p className="font-medium">{address.fullName}</p>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-orange-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddressSelect(address.id);
                        setIsAddingNewAddress(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm">{address.address}</p>
                  <p className="text-gray-600 text-sm">{address.city}, {address.state} {address.zipCode}</p>
                  <p className="text-gray-600 text-sm">{address.phone}</p>
                </div>
              ))}

              {/* Single Add New Address button below addresses */}
              <button
                type="button"
                onClick={handleAddNewAddress}
                className="w-full border border-dashed border-orange-300 rounded-lg p-4 text-orange-500 hover:text-orange-700 hover:bg-orange-50 text-center transition-all flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Add New Address
              </button>
            </div>
          </div>
        )}

        {/* New Address Form or Selected Address Details */}
        {isAddingNewAddress ? (
          <div>
            {savedAddresses.length > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-md font-medium text-gray-700 mb-2">New Address</h3>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="transform transition-all hover:-translate-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaUser className="mr-2 text-orange-400" /> Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div className="transform transition-all hover:-translate-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaEnvelope className="mr-2 text-orange-400" /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="john@example.com"
                />
              </div>

              {/* Phone */}
              <div className="transform transition-all hover:-translate-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaPhone className="mr-2 text-orange-400" /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="(123) 456-7890"
                />
              </div>

              {/* Address */}
              <div className="transform transition-all hover:-translate-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-orange-400" /> Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="123 Main St"
                />
              </div>

              {/* City */}
              <div className="transform transition-all hover:-translate-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaCity className="mr-2 text-orange-400" /> City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="New York"
                />
              </div>

              {/* State */}
              <div className="transform transition-all hover:-translate-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-orange-400" /> State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="NY"
                />
              </div>

              {/* ZIP Code */}
              <div className="transform transition-all hover:-translate-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaMapPin className="mr-2 text-orange-400" /> ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="10001"
                />
              </div>
            </div>

            {/* Save Address Checkbox */}
            <div className="mt-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-orange-500 rounded focus:ring-orange-500"
                  checked={saveAddress}
                  onChange={() => setSaveAddress(!saveAddress)}
                />
                <span className="ml-2 text-gray-700">Save this address for future orders</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            {/* This button is now redundant since we have one above */}
            {/* Removing this button since we now have a single "Add New Address" button above */}
          </div>
        )}
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 transform transition-all hover:shadow-lg border-l-4 border-orange-500">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
          <FaCreditCard className="mr-2 text-orange-500" />
          <span>Payment Method</span>
        </h2>
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div
              className={`border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${formData.paymentMethod === 'creditCard' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-orange-300'}`}
              onClick={() => setFormData({ ...formData, paymentMethod: 'creditCard' })}
            >
              <FaCreditCard className={`text-3xl mb-2 ${formData.paymentMethod === 'creditCard' ? 'text-orange-500' : 'text-gray-500'}`} />
              <label htmlFor="creditCard" className={`text-sm font-medium ${formData.paymentMethod === 'creditCard' ? 'text-orange-700' : 'text-gray-700'}`}>
                Credit Card
              </label>
              <input
                type="radio"
                id="creditCard"
                name="paymentMethod"
                value="creditCard"
                checked={formData.paymentMethod === 'creditCard'}
                onChange={handleInputChange}
                className="sr-only"
              />
            </div>

            <div
              className={`border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${formData.paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-orange-300'}`}
              onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
            >
              <FaMoneyBillWave className={`text-3xl mb-2 ${formData.paymentMethod === 'cash' ? 'text-orange-500' : 'text-gray-500'}`} />
              <label htmlFor="cash" className={`text-sm font-medium ${formData.paymentMethod === 'cash' ? 'text-orange-700' : 'text-gray-700'}`}>
                Cash on Delivery
              </label>
              <input
                type="radio"
                id="cash"
                name="paymentMethod"
                value="cash"
                checked={formData.paymentMethod === 'cash'}
                onChange={handleInputChange}
                className="sr-only"
              />
            </div>
          </div>

          {formData.paymentMethod === 'creditCard' && (
            <div className="animate-fadeIn">
              {/* Saved Cards Section */}
              {savedCards.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-md font-medium text-gray-700 mb-4">
                    Saved Cards
                    {isLoadingCards && (
                      <span className="ml-2 inline-block">
                        <svg className="animate-spin h-4 w-4 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    )}
                  </h3>
                  <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                    {savedCards.map(card => (
                      <div
                        key={card.id}
                        className={`cursor-pointer flex-shrink-0 transition-all duration-300 transform ${selectedCardId === card.id ? 'scale-105 ring-2 ring-orange-500' : 'scale-100 opacity-80 hover:opacity-100'}`}
                        onClick={() => handleCardSelect(card.id)}
                      >
                        <div className="w-80 h-48">
                          <div className="bg-gradient-to-r from-orange-600 to-orange-400 rounded-xl shadow-md p-6 h-full w-full relative overflow-hidden">
                            {/* Indicate default card if applicable */}
                            {card.isDefault && (
                              <div className="absolute top-2 right-2 bg-white text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
                                DEFAULT
                              </div>
                            )}

                            {/* Card shine effect */}
                            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 rounded-full transform -translate-y-1/2 -translate-x-1/3 scale-150"></div>

                            {/* Card chip */}
                            <div className="flex items-center mb-8">
                              <div className="h-8 w-12 bg-yellow-300 bg-opacity-80 rounded-md mr-4 flex items-center justify-center">
                                <div className="h-5 w-8 bg-yellow-200 bg-opacity-40 rounded-sm grid grid-cols-2 grid-rows-3 gap-px">
                                  {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-yellow-400 rounded-sm"></div>
                                  ))}
                                </div>
                              </div>

                              {/* Card type logo */}
                              <div className="ml-auto">
                                {card.cardType === 'visa' && <div className="text-white text-xl font-bold italic">VISA</div>}
                                {card.cardType === 'mastercard' && <div className="flex"><div className="w-8 h-8 bg-red-500 rounded-full opacity-80 -mr-3"></div><div className="w-8 h-8 bg-yellow-500 rounded-full opacity-80"></div></div>}
                                {card.cardType === 'amex' && <div className="text-white text-xl font-bold">AMEX</div>}
                              </div>
                            </div>

                            {/* Card number */}
                            <div className="text-white text-lg font-mono tracking-widest mb-4">
                              {card.cardNumber}
                            </div>

                            {/* Card holder name and expiry */}
                            <div className="flex items-end justify-between">
                              <div>
                                <p className="text-white text-opacity-50 text-xs uppercase mb-1">Card Holder</p>
                                <p className="text-white font-medium tracking-wide overflow-ellipsis overflow-hidden max-w-[180px]">
                                  {card.nameOnCard}
                                </p>
                              </div>
                              <div>
                                <p className="text-white text-opacity-50 text-xs uppercase mb-1">Expires</p>
                                <p className="text-white font-medium">{card.expiryDate}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add new card option */}
                    <div
                      className="w-80 h-48 flex-shrink-0 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-orange-300 transition-colors"
                      onClick={() => setSelectedCardId(null)}
                    >
                      <div className="text-center">
                        <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <FaPlus className="text-orange-500" />
                        </div>
                        <p className="text-gray-600 font-medium">Add new card</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Card Details Section - Only shown when a card is selected */}
              {selectedCardId !== null && (
                <div className="mb-10">
                  <div className="bg-white border border-orange-100 rounded-lg p-6 shadow-md">
                    <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                      <FaCreditCard className="mr-2 text-orange-500" />
                      Selected Card Details
                    </h3>

                    {/* Get the selected card info */}
                    {(() => {
                      const selectedCard = savedCards.find(card => card.id === selectedCardId);
                      return (
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          {/* Mini card visual */}
                          <div className="w-72 h-36 flex-shrink-0">
                            <div className="bg-gradient-to-r from-orange-600 to-orange-400 rounded-xl shadow-md p-4 h-full w-full relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 rounded-full transform -translate-y-1/2 -translate-x-1/3 scale-150"></div>

                              <div className="flex items-center mb-3">
                                <div className="h-6 w-9 bg-yellow-300 bg-opacity-80 rounded-md mr-2 flex items-center justify-center">
                                  <div className="h-4 w-6 bg-yellow-200 bg-opacity-40 rounded-sm grid grid-cols-2 grid-rows-3 gap-px">
                                    {[...Array(6)].map((_, i) => (
                                      <div key={i} className="bg-yellow-400 rounded-sm"></div>
                                    ))}
                                  </div>
                                </div>
                                <div className="ml-auto">
                                  {selectedCard.cardType === 'visa' && <div className="text-white text-lg font-bold italic">VISA</div>}
                                  {selectedCard.cardType === 'mastercard' && <div className="flex"><div className="w-6 h-6 bg-red-500 rounded-full opacity-80 -mr-2"></div><div className="w-6 h-6 bg-yellow-500 rounded-full opacity-80"></div></div>}
                                  {selectedCard.cardType === 'amex' && <div className="text-white text-lg font-bold">AMEX</div>}
                                </div>
                              </div>

                              <div className="text-white text-sm font-mono tracking-widest mb-2">
                                {selectedCard.cardNumber}
                              </div>

                              <div className="flex items-end justify-between">
                                <div>
                                  <p className="text-white text-opacity-50 text-xs uppercase mb-1">Card Holder</p>
                                  <p className="text-white font-medium text-sm tracking-wide overflow-ellipsis overflow-hidden max-w-[120px]">
                                    {selectedCard.nameOnCard}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-white text-opacity-50 text-xs uppercase mb-1">Expires</p>
                                  <p className="text-white font-medium text-sm">{selectedCard.expiryDate}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Details */}
                          <div className="flex-grow space-y-3">
                            <div>
                              <p className="text-sm text-gray-500">Card Number</p>
                              <p className="font-medium">{selectedCard.cardNumber}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Expiry Date</p>
                                <p className="font-medium">{selectedCard.expiryDate}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Card Type</p>
                                <p className="font-medium capitalize">{selectedCard.cardType}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Name on Card</p>
                              <p className="font-medium">{selectedCard.nameOnCard}</p>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-col gap-2 mt-4 sm:mt-0">
                            <button
                              type="button"
                              onClick={() => setSelectedCardId(null)}
                              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center transition-colors"
                            >
                              <FaEdit className="mr-1" /> Change Card
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="mt-6 pt-5 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={isSubmitting || !stripe}
                        className={`w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaLock className="mr-2" />
                            Pay ${cartSummary.total.toFixed(2)} with This Card
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Only show the card input form if no saved card is selected */}
              {selectedCardId === null && (
                <div className="relative mb-10 mt-4">
                  {/* Credit card floating visual - existing code */}
                  <div className={`mx-auto max-w-md transition-all duration-500 transform ${cardFocus ? 'scale-105' : 'scale-100'}`}>
                    {/* Keep your existing card visual design */}
                    <div className="bg-gradient-to-r from-orange-600 to-orange-400 rounded-xl shadow-2xl p-6 h-56 w-full relative overflow-hidden">
                      {/* Card shine effect */}
                      <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 rounded-full transform -translate-y-1/2 -translate-x-1/3 scale-150"></div>

                      {/* Card chip */}
                      <div className="flex items-center mb-8">
                        <div className="h-10 w-14 bg-yellow-300 bg-opacity-80 rounded-md mr-4 flex items-center justify-center">
                          <div className="h-6 w-10 bg-yellow-200 bg-opacity-40 rounded-sm grid grid-cols-2 grid-rows-3 gap-px">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="bg-yellow-400 rounded-sm"></div>
                            ))}
                          </div>
                        </div>
                        {/* Secure payment logo */}
                        <div className="flex items-center ml-auto">
                          <FaLock className="text-white text-opacity-80 mr-1 text-xs" />
                          <span className="text-white text-opacity-80 text-xs font-medium">Secure Payment</span>
                        </div>
                      </div>

                      {/* Card number placeholder - Now displays dynamically based on input */}
                      <div className="text-white text-xl font-mono tracking-widest mb-4 flex items-center">
                        {cardDetails.number.split(' ').map((group, index) => (
                          <span key={index} className={index % 2 === 0 ? "opacity-80" : "opacity-50 mx-2"}>
                            {group}
                          </span>
                        ))}
                      </div>

                      {/* Card holder name */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-white text-opacity-50 text-xs uppercase mb-1">Card Holder</p>
                          <p className="text-white font-medium tracking-wide overflow-ellipsis overflow-hidden max-w-[180px]">
                            {formData.nameOnCard || "Your Name"}
                          </p>
                        </div>

                        {/* Card brand logos */}
                        <div className="flex space-x-2">
                          <div className="text-2xl text-white opacity-90">
                            <FaCreditCard />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form inputs */}
                  <div className="mt-8 bg-white p-6 rounded-lg shadow-lg border-t border-orange-50">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaUser className="mr-2 text-orange-500" /> Name on Card
                      </label>
                      <input
                        type="text"
                        name="nameOnCard"
                        value={formData.nameOnCard || ''}
                        onChange={handleInputChange}
                        onFocus={() => setCardFocus(true)}
                        onBlur={() => setCardFocus(false)}
                        required={formData.paymentMethod === 'creditCard'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-300"
                        placeholder="Name as it appears on card"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaCreditCard className="mr-2 text-orange-500" /> Card Details
                      </label>
                      <div className="relative">
                        <div
                          className={`border border-gray-300 rounded-lg p-4 transition-all duration-300 focus-within:ring-4 focus-within:ring-orange-300 focus-within:border-orange-500 hover:border-gray-400 ${cardError ? 'border-red-500 bg-red-50' : ''}`}
                        >
                          <CardElement
                            options={{
                              ...cardElementOptions,
                              style: {
                                ...cardElementOptions.style,
                                base: {
                                  ...cardElementOptions.style.base,
                                  fontSize: '16px',
                                  color: '#424770',
                                  '::placeholder': {
                                    color: '#aab7c4',
                                  },
                                },
                              },
                            }}
                            onChange={handleCardElementChange}
                            onFocus={() => setCardFocus(true)}
                            onBlur={() => setCardFocus(false)}
                          />
                        </div>
                      </div>

                      {/* Save Card Details Option */}
                      <div className="mt-3">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-orange-500 rounded focus:ring-orange-500"
                            checked={saveCardDetails}
                            onChange={() => setSaveCardDetails(!saveCardDetails)}
                          />
                          <span className="ml-2 text-gray-700 flex items-center">
                            <FaCreditCard className="mr-2 text-orange-400 text-sm" />
                            Save card for future orders
                          </span>
                        </label>
                        {saveCardDetails && (
                          <p className="text-xs text-gray-500 ml-7 mt-1">
                            Your card information will be securely stored for faster checkout.
                          </p>
                        )}
                      </div>

                      {cardError && (
                        <div className="text-red-500 text-sm mt-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {cardError}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !stripe}
                      className={`w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaLock className="mr-2" />
                          Pay ${cartSummary.total.toFixed(2)} Securely
                        </>
                      )}
                    </button>

                    <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaLock className="mr-1" />
                        <span>Your payment info is secure</span>
                      </div>
                      <div className="flex space-x-2">
                        <span className="w-8 opacity-75">
                          <svg viewBox="0 0 40 24" width="40" height="24" role="img" aria-label="Visa"><title>Visa</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><path d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.1 0 .2 0 .2.2l1.4 6.5c.1.4.2.7.2 1.1.1.1.1.1.1.2zm-13.4-.3l.4-1.8c.1 0 .2.1.2.1.7.3 1.4.5 2.1.4.2 0 .5-.1.7-.2.5-.2.5-.7.1-1.1-.2-.2-.5-.3-.8-.5-.4-.2-.8-.4-1.1-.7-1.2-1-.8-2.4-.1-3.1.6-.4.9-.8 1.7-.8 1.2 0 2.5 0 3.1.2h.1c-.1.6-.2 1.1-.4 1.7-.5-.2-1-.4-1.5-.4-.3 0-.6 0-.9.1-.2 0-.3.1-.4.2-.2.2-.2.5 0 .7l.5.4c.4.2.8.4 1.1.6.5.3 1 .8 1.1 1.4.2.9-.1 1.7-.9 2.3-.5.4-.7.6-1.4.6-1.4 0-2.5.1-3.4-.2-.1.2-.1.2-.2.1zm-3.5.3c.1-.7.1-.7.2-1 .5-2.2 1-4.5 1.4-6.7.1-.2.1-.3.3-.3H18c-.2 1.2-.4 2.1-.7 3.2-.3 1.5-.6 3-1 4.5 0 .2-.1.2-.3.2M5 8.2c0-.1.2-.2.3-.2h3.4c.5 0 .9.3 1 .8l.9 4.4c0 .1 0 .1.1.2 0-.1.1-.1.1-.1l2.1-5.1c-.1-.1 0-.2.1-.2h2.1c0 .1 0 .1-.1.2l-3.1 7.3c-.1.2-.1.3-.2.4-.1.1-.3 0-.5 0H9.7c-.1 0-.2 0-.2-.2L7.9 9.5c-.2-.2-.5-.5-.9-.6-.6-.3-1.7-.5-1.9-.5L5 8.2z" fill="#142688"></path></svg>
                        </span>
                        <span className="w-8 opacity-75">
                          <svg viewBox="0 0 40 24" width="40" height="24" role="img" aria-label="Mastercard"><title>Mastercard</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><circle fill="#EB001B" cx="15" cy="12" r="7"></circle><circle fill="#F79E1B" cx="23" cy="12" r="7"></circle><path fill="#FF5F00" d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.3 3-3.4 3-5.7z"></path></svg>
                        </span>
                        <span className="w-8 opacity-75">
                          <svg viewBox="0 0 40 24" width="40" height="24" role="img" aria-label="Amex"><title>American Express</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><path d="M27.07 24h3.86V4.21h-3.86V24zm-6.3-3.94h.01c.44-1.16.89-2.32 1.3-3.44h5.13c.46.94.82 1.79 1.25 3.44h3.98c-.93-2.22-1.66-3.95-2.45-5.76h.02c-.83-1.96-1.54-3.62-2.29-5.58-1.13-2.96-1.93-5.05-2.54-6.75H19.7c-.44 1.2-.9 2.42-1.36 3.67h2.5c.5 1.31 1.03 2.73 1.66 4.47.78 2.12 1.31 3.77 1.74 5h-4.96L17.51 13h-3.64l-2.05 5.79H7.9c.92-2.35 1.84-4.73 2.97-7.79 1.25-3.38 1.96-5.23 2.15-5.79h5.8A773.8 773.8 0 0 1 21 10.79h.02c.57 1.5 1.15 3.06 1.92 5.21-.63 1.81-1.35 3.8-2.17 6.06zM8.81 24h3.56c.8-2.3 1.79-5 2.98-8.35H8.76L5.17 24h3.64zm12.2-16.95c-.34.89-.67 1.77-1.02 2.68h3.14c-.38-1.11-.67-1.91-.88-2.69h-1.24zm5.21 2.09c-.36-.99-.69-1.99-1.02-3h-1.68c.39 1.09.68 1.98.88 3h1.82z" fill="#006FCF"></path></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Remove the Complete Purchase button at the end of the form */}
      </div>
    </form>
  );
}

export default function Checkout() {
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotalAmount);
  const dispatch = useDispatch();

  // Update your cartSummary with Redux data
  const cartSummary = {
    subtotal: cartTotal,
    tax: cartTotal * 0.1, // 10% tax as an example
    delivery: 1.99,
    total: cartTotal + (cartTotal * 0.1) + 1.99,
    items: cartItems
  };

  // Replace your existing address fetching with:
  const { data: addresses, isLoading: isLoadingAddresses } = useGetUserAddressesQuery();
  // Add refetchOnMountOrArgChange to ensure cards are fresh each time
  const { data: savedCards = [], isLoading: isLoadingCards, refetch: refetchCards } = useGetSavedCardsQuery(undefined, {
    refetchOnMountOrArgChange: true
  });
  const { data: dbCards = [], isLoading: isLoadingDbCards } = useGetDbCardsQuery();

  // Combine both sources of cards
  // Around line 1296, replace or modify the allCards useMemo

  const allCards = useMemo(() => {
    // Start with saved cards (if any)
    const cards = [...(savedCards || [])];

    // Format and add DB cards
    if (dbCards && dbCards.length > 0) {
      const formattedDbCards = dbCards.map(card => ({
        id: card.paymentMethodId || card._id,
        cardType: card.cardType || "card",
        cardNumber: `•••• •••• •••• ${card.last4 || '****'}`,
        expiryDate: card.expiryDate || "xx/xx",
        nameOnCard: card.nameOnCard || card.cardholderName || "Card Holder",
        isDefault: card.isDefault || false
      }));

      // Add formatted DB cards to the array
      formattedDbCards.forEach(dbCard => {
        if (!cards.some(card => card.id === dbCard.id)) {
          cards.push(dbCard);
        }
      });
    }

    console.log('Cards to display in checkout:', cards);
    return cards;
  }, [savedCards, dbCards]);

  useEffect(() => {
    console.log('DB Cards available:', dbCards?.length || 0);
    console.log('All cards combined:', allCards);
  }, [dbCards, allCards]);

  const [addAddress] = useAddAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [setAddressAsDefault] = useSetDefaultAddressMutation();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const [saveCard] = useSaveCardMutation();
  const [clearBackendCart] = useClearCartMutation(); // Add this line to use the clearCart mutation

  // Add function to refetch cards after saving one
  const handleSaveCardAndRefresh = async (cardData) => {
    try {
      await saveCard(cardData).unwrap();
      toast.success("Your card has been saved for future orders");
      // Refetch cards to update the list
      refetchCards();
    } catch (error) {
      console.error("Error saving card:", error);
      toast.error("Could not save your card: " + (error.data?.message || error.message || "Unknown error"));
    }
  };

  // For navigation
  const navigate = useNavigate();

  // Payment success state
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);

  // Payment success animation state
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // State for form fields
  const [formData, setFormData] = useState({
    fullName: addresses?.[0]?.fullName || '',
    email: '',
    phone: addresses?.[0]?.phone || '',
    address: addresses?.[0]?.address || '',
    city: addresses?.[0]?.city || '',
    state: addresses?.[0]?.state || '',
    zipCode: addresses?.[0]?.zipCode || '',
    paymentMethod: 'creditCard',
    nameOnCard: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });

  // State for animation
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reference to trigger form submission from outside the form
  const formSubmitRef = useRef(null);

  // Handle payment success and redirect
  const handlePaymentSuccess = (orderId) => {
    setShowSuccessAnimation(true);

    const deliveryInfo = calculateEstimatedDelivery(cartSummary.items[0]?.restaurantId, formData);

    // Clear the cart in Redux (backend cart is cleared in the checkout form component)
    dispatch(clearCart());

    setTimeout(() => {
      setPaymentSuccessful(true);
      setTimeout(() => {
        navigate(`/confirmation/${orderId}`, {
          state: {
            orderDetails: {
              orderId: orderId,
              items: cartSummary.items,
              total: cartSummary.total,
              customer: formData,
              status: 'pending',
              createdAt: new Date().toISOString(),
              estimatedDelivery: deliveryInfo.estimatedTime,
              deliveryWindow: deliveryInfo.deliveryWindow,
              estimatedDeliveryTime: deliveryInfo.estimatedTimeString
            }
          }
        });
      }, 1000);
    }, 2000);
  };

  // Handle non-credit card payment methods
  const processNonCardPayment = async () => {
    setIsSubmitting(true);
    try {
      // Format items for API submission
      const formattedItems = cartSummary.items.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity),
        // Include image and other properties if needed by backend
        image: item.image || null
      }));

      // Prepare order data with properly formatted values
      const orderData = {
        items: formattedItems,
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        payment: {
          method: formData.paymentMethod,
          // No payment method ID for cash payments
        },
        restaurantId: cartSummary.items[0]?.restaurantId,
        subtotal: parseFloat(cartSummary.subtotal.toFixed(2)),
        tax: parseFloat(cartSummary.tax.toFixed(2)),
        deliveryFee: parseFloat(cartSummary.delivery.toFixed(2)),
        total: parseFloat(cartSummary.total.toFixed(2))
      };

      console.log("Submitting cash order to API:", JSON.stringify(orderData));

      try {
        // Call the createOrder mutation and unwrap the result
        const result = await createOrder(orderData).unwrap();

        if (result.success) {
          console.log("Order creation succeeded:", result);

          // Get the real order ID from the API response
          const realOrderId = result.order.orderId || result.order._id;

          // Clear cart in Redux
          dispatch(clearCart());

          // Clear cart in backend
          try {
            await clearBackendCart().unwrap();
            console.log("Backend cart cleared successfully on non-card payment");
          } catch (clearCartError) {
            console.error("Error clearing backend cart:", clearCartError);
            // Continue with success flow even if cart clearing fails
          }

          handlePaymentSuccess(realOrderId);
        } else {
          console.error("Order API returned success: false", result);
          toast.error("Failed to create order: " + (result.message || "Unknown error"));
        }
      } catch (apiError) {
        console.error("Order API call failed:", apiError);
        toast.error("Failed to create order: " + (apiError.data?.message || apiError.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      toast.error("Failed to create order: " + (error.data?.message || error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Transform raw card data to the expected format
  const formattedCards = useMemo(() => {
    if (!savedCards || savedCards.length === 0) return [];

    return savedCards.map(card => {
      // Check if card already has the expected format
      if (card.id && card.cardNumber && card.nameOnCard) {
        return card;
      }

      // Transform to expected format
      return {
        id: card.paymentMethodId || card._id,
        cardType: card.cardType || "card",
        cardNumber: card.cardNumber || `•••• •••• •••• ${card.last4 || '****'}`,
        expiryDate: card.expiryDate || "xx/xx",
        nameOnCard: card.nameOnCard || card.cardholderName || "Card Holder",
        isDefault: card.isDefault || false
      };
    });
  }, [savedCards]);

  return (
    <>
      <Header />

      {/* Full-screen success animation overlay */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.2
              }}
            >
              <motion.div
                className="mb-6 bg-green-500 rounded-full p-5 inline-block"
                initial={{ rotate: 0 }}
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 1,
                  ease: "easeInOut"
                }}
              >
                <FaCheck className="text-white text-5xl" />
              </motion.div>
              <motion.h2
                className="text-3xl font-bold text-gray-800 mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Payment Successful!
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Redirecting you to confirmation...
              </motion.p>

              {/* Animated progress bar */}
              <motion.div
                className="h-1 bg-gray-200 rounded-full max-w-md mx-auto mt-6 overflow-hidden"
                initial={{ width: "50%" }}
                animate={{ width: "100%" }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-green-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page transition for redirect */}
      <AnimatePresence>
        {!paymentSuccessful && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.5 }
            }}
          >
            <div className="container mx-auto px-4 py-8 relative">
              {/* Decorative background elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-orange-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-orange-100 rounded-full translate-x-1/3 translate-y-1/3 opacity-30"></div>
              {/* Checkout progress indicator */}
              <div className="max-w-3xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                      <FaShoppingCart />
                    </div>
                    <span className="text-sm mt-1 font-medium text-gray-600">Cart</span>
                  </div>
                  <div className="flex-1 h-1 bg-orange-500 mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                      <FaHome />
                    </div>
                    <span className="text-sm mt-1 font-medium text-gray-800">Checkout</span>
                  </div>
                  <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white shadow-lg">
                      <FaCheck />
                    </div>
                    <span className="text-sm mt-1 font-medium text-gray-600">Confirmation</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left column: Form */}
                <div className="lg:w-2/3">
                  <h1 className="text-3xl font-bold mb-8 text-gray-800 relative inline-block">
                    Checkout
                    <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-orange-500"></span>
                  </h1>
                  <Elements stripe={stripePromise}>
                    <CheckoutForm
                      formData={formData}
                      setFormData={setFormData}
                      cartSummary={cartSummary}
                      isSubmitting={isSubmitting}
                      setIsSubmitting={setIsSubmitting}
                      onNonCardPayment={formSubmitRef}
                      savedAddresses={addresses || []}
                      setSavedAddresses={() => { }}
                      onPaymentSuccess={handlePaymentSuccess}
                      savedCards={allCards}
                      isLoadingCards={isLoadingCards}
                      createPaymentIntent={createPaymentIntent}
                      saveCard={handleSaveCardAndRefresh}
                      refetchCards={refetchCards}
                      clearBackendCart={clearBackendCart}  // Pass the clearBackendCart function to CheckoutForm
                    />
                  </Elements>
                </div>
                {/* Right column: Order Summary */}
                <div className="lg:w-1/3">
                  <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6 border-t-4 border-orange-500">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                      <FaShoppingCart className="mr-2 text-orange-500" /> Order Summary
                    </h2>

                    <div className="mb-6 max-h-64 overflow-y-auto">
                      {cartSummary.items.map(item => (
                        <div key={item.id} className="flex justify-between py-3 border-b border-gray-100 hover:bg-orange-50 transition-colors rounded px-2">
                          <div className="flex items-start">
                            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mr-3">
                              {item.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{item.name}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-gray-700 font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-800">${cartSummary.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-800">${cartSummary.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery</span>
                        <span className="text-gray-800">${cartSummary.delivery.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-3 mt-2 border-gray-200">
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-800">Total</span>
                          <span className="text-2xl text-orange-600">${cartSummary.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (formSubmitRef.current) {
                          formSubmitRef.current();
                        }
                      }}
                      disabled={isSubmitting}
                      className={`w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          {formData.paymentMethod === 'creditCard' ? (
                            <>
                              <FaLock className="mr-2" />
                              Pay ${cartSummary.total.toFixed(2)} Securely
                            </>
                          ) : (
                            <>
                              <FaMoneyBillWave className="mr-2" />
                              Place Order (Cash on Delivery)
                            </>
                          )}
                        </>
                      )}
                    </button>

                    <div className="mt-4 text-center">
                      <Link to="/cart" className="text-orange-500 hover:text-orange-700 text-sm font-medium flex items-center justify-center">
                        <FaShoppingCart className="mr-1" /> Return to Cart
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      {/* Add global CSS */}
      <style jsx global>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari, Opera */
        }
      `}</style>
    </>
  );
}
