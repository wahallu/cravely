import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-hot-toast';
import {
  FaCreditCard,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaTimes,
  FaLock,
  FaEdit,
  FaStar,
} from 'react-icons/fa';
import {
  useSaveCardMutation,
  useDeleteCardMutation,
  useSetDefaultCardMutation,
} from '../../Redux/slices/paymentSlice';

// Replace with your actual Stripe publishable key
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

// Component to add a new card
function AddCardForm({ onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [saveCard] = useSaveCardMutation();
  const [cardholderName, setCardholderName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    if (!cardholderName) {
      setError('Please enter the cardholder name');
      return;
    }

    if (!cardComplete) {
      setError('Please complete your card information');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment method with Stripe
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: cardholderName,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Save card to backend through our API
      const result = await saveCard({
        paymentMethodId: paymentMethod.id,
        cardholderName: cardholderName,
        last4: paymentMethod.card.last4,
        isDefault
      }).unwrap();

      if (result.success) {
        toast.success('Card added successfully');
        onSuccess();
      } else {
        throw new Error(result.message || 'Failed to save card');
      }
    } catch (error) {
      console.error('Error saving card:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = (e) => {
    setCardComplete(e.complete);
    if (e.error) {
      setError(e.error.message);
    } else {
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
          Cardholder Name
        </label>
        <input
          type="text"
          id="cardholderName"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Name as it appears on card"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Details
        </label>
        <div className={`border rounded-lg p-4 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
          <CardElement options={cardElementOptions} onChange={handleCardChange} />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <FaTimes className="mr-1" /> {error}
          </p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
        />
        <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
          Set as default payment method
        </label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !stripe}
          className={`w-full sm:w-auto inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <FaLock className="mr-2" /> Add Card
            </>
          )}
        </button>
      </div>
      
      <div className="text-xs text-gray-500 flex items-center mt-4">
        <FaLock className="mr-1" /> 
        Your payment information is secure and encrypted
      </div>
    </form>
  );
}

// Main Payment Methods component
export default function PaymentMethods() {
  // Replace RTK Query with direct fetch
  const [savedCards, setSavedCards] = useState([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [deleteCard] = useDeleteCardMutation();
  const [setDefaultCard] = useSetDefaultCardMutation();
  
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Function to fetch cards directly from the database
  const fetchCards = useCallback(() => {
    setIsLoadingCards(true);
    
    // Get token from localStorage for authorization
    const token = localStorage.getItem('token');
    
    // Get base URL from environment or use default
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
    
    // Prepare fetch options with proper headers
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Add authorization header if token exists
    if (token) {
      fetchOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    fetch(`${baseUrl}/api/payments/db-cards`, fetchOptions)
      .then(res => {
        // Check if response is OK
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        
        // Check content type to ensure it's JSON
        const contentType = res.headers.get('content-type');
        if (contentType && !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        
        return res.json();
      })
      .then(data => {
        // Transform the data to match the expected format
        if (!data || !Array.isArray(data)) {
          console.warn('Invalid data format received:', data);
          setSavedCards([]);
          return;
        }
        
        const formattedCards = data.map(card => ({
          id: card.paymentMethodId || card._id,
          cardType: card.cardType || "card",
          cardNumber: `•••• •••• •••• ${card.last4 || '****'}`,
          expiryDate: card.expiryDate || "xx/xx",
          nameOnCard: card.nameOnCard || card.cardholderName || "Card Holder",
          isDefault: card.isDefault || false
        }));
        setSavedCards(formattedCards);
      })
      .catch(error => {
        console.error('Error fetching cards:', error);
        toast.error('Failed to load payment methods');
        setSavedCards([]); // Set empty array on error
      })
      .finally(() => {
        setIsLoadingCards(false);
      });
  }, []);

  // Fetch cards when component mounts
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleDeleteCard = async (cardId) => {
    setOperationLoading(true);
    try {
      await deleteCard(cardId).unwrap();
      toast.success('Card deleted successfully');
      setDeleteConfirmation(false);
      setCardToDelete(null);
      // Refetch cards after deletion
      fetchCards();
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete card. Please try again.');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSetDefaultCard = async (cardId) => {
    setOperationLoading(true);
    try {
      await setDefaultCard(cardId).unwrap();
      toast.success('Default payment method updated');
      // Refetch cards after updating default
      fetchCards();
    } catch (error) {
      console.error('Error setting default card:', error);
      toast.error('Failed to set default card. Please try again.');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleAddCardSuccess = () => {
    setShowAddCardModal(false);
    // Refetch cards after adding a new one
    fetchCards();
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaCreditCard className="mr-2 text-orange-500" /> Payment Methods
            </h1>
            <button
              onClick={() => setShowAddCardModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md flex items-center transition-colors"
            >
              <FaPlus className="mr-2" /> Add New Card
            </button>
          </div>
          <p className="mt-2 text-gray-600">Manage your payment methods for faster checkout</p>
        </div>

        <div className="p-6">
          {isLoadingCards ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : savedCards.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-500 mb-4">
                <FaCreditCard className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">No payment methods found</h2>
              <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                Add your credit or debit card to make faster checkouts and save your payment information securely.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <FaPlus className="mr-2 -ml-1 h-4 w-4" />
                  Add a payment method
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {savedCards.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-4 min-w-[80px]">
                          {card.cardType === 'visa' && (
                            <div className="bg-blue-100 h-12 w-20 rounded-md flex items-center justify-center">
                              <span className="text-blue-800 font-bold italic text-lg">VISA</span>
                            </div>
                          )}
                          {card.cardType === 'mastercard' && (
                            <div className="bg-orange-100 h-12 w-20 rounded-md flex items-center justify-center">
                              <div className="flex">
                                <div className="w-6 h-6 bg-red-500 rounded-full opacity-80 -mr-2"></div>
                                <div className="w-6 h-6 bg-yellow-500 rounded-full opacity-80"></div>
                              </div>
                            </div>
                          )}
                          {card.cardType === 'amex' && (
                            <div className="bg-blue-200 h-12 w-20 rounded-md flex items-center justify-center">
                              <span className="text-blue-800 font-bold text-lg">AMEX</span>
                            </div>
                          )}
                          {!['visa', 'mastercard', 'amex'].includes(card.cardType) && (
                            <div className="bg-gray-100 h-12 w-20 rounded-md flex items-center justify-center">
                              <FaCreditCard className="text-gray-500 text-2xl" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900 capitalize">{card.cardType}</h3>
                            {card.isDefault && (
                              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-gray-500">{card.cardNumber}</div>
                          <div className="mt-1 text-sm text-gray-500">
                            <span className="font-medium">Expires:</span> {card.expiryDate} • <span className="font-medium">Name:</span> {card.nameOnCard}
                          </div>
                        </div>
                      </div>
                      <div className="flex mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end space-x-2">
                        {!card.isDefault && (
                          <button
                            onClick={() => handleSetDefaultCard(card.id)}
                            disabled={operationLoading}
                            className="inline-flex items-center px-3 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            <FaStar className="mr-1" />
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setCardToDelete(card);
                            setDeleteConfirmation(true);
                          }}
                          disabled={operationLoading}
                          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FaTrash className="mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {showAddCardModal && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddCardModal(false)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative z-10 m-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Add New Payment Method</h2>
                <button
                  onClick={() => setShowAddCardModal(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FaTimes />
                </button>
              </div>
              <Elements stripe={stripePromise}>
                <AddCardForm
                  onSuccess={handleAddCardSuccess}
                  onCancel={() => setShowAddCardModal(false)}
                />
              </Elements>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setDeleteConfirmation(false)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative z-10 m-4"
            >
              <div className="mb-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <FaTrash className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Delete Payment Method</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Are you sure you want to remove your {cardToDelete?.cardType} ending in {cardToDelete?.cardNumber?.slice(-4)}? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmation(false)}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  disabled={operationLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCard(cardToDelete?.id)}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={operationLoading}
                >
                  {operationLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}