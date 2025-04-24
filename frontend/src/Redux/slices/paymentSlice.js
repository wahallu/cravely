import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/auth';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5002',
    prepareHeaders: (headers) => {
      // Get token from localStorage directly as fallback
      const token = getToken() || localStorage.getItem('token');
      
      if (token) {
        console.log('Using token for payment API:', token.substring(0, 10) + '...');
        headers.set('authorization', `Bearer ${token}`);
        headers.set('Content-Type', 'application/json');
      } else {
        console.error('No token found for payment API - user may need to login again');
      }
      return headers;
    },
  }),
  tagTypes: ['PaymentMethod'],
  endpoints: (builder) => ({
    getSavedCards: builder.query({
      query: () => '/api/payments/saved-cards',
      transformResponse: (response) => {
        console.log('Received saved cards response:', response);
        
        // NEW: Add fallback to check localStorage for user info
        const userJson = localStorage.getItem('user');
        const userId = userJson ? JSON.parse(userJson)?._id : null;
        console.log('Current user ID:', userId);
        
        // NEW: Try direct DB fallback if API returned empty array with success
        if (response && response.success === true && Array.isArray(response.cards) && response.cards.length === 0) {
          // Make a direct call to check for card in database
          fetch('/api/payments/db-cards').then(res => res.json())
            .then(dbCards => {
              console.log('Direct DB cards check:', dbCards);
              if (dbCards && dbCards.length > 0) {
                // If we found cards directly, force a refetch of the API data
                setTimeout(() => {
                  console.log('Found cards directly in DB, forcing refetch');
                  return dbCards.map(card => ({
                    id: card.paymentMethodId || card._id,
                    cardType: card.cardType || "card",
                    cardNumber: `•••• •••• •••• ${card.last4 || '****'}`,
                    expiryDate: card.expiryDate || "xx/xx",
                    nameOnCard: card.nameOnCard || card.cardholderName || "Card Holder",
                    isDefault: card.isDefault || false
                  }));
                }, 100);
              }
            });
        }
        
        // If response is already in expected format with cards property
        if (response && response.cards) {
          return response.cards;
        }
        
        // If response is an array directly
        if (Array.isArray(response)) {
          return response.map(card => ({
            id: card.paymentMethodId || card._id,
            cardType: card.cardType || "card",
            cardNumber: `•••• •••• •••• ${card.last4 || '****'}`,
            expiryDate: card.expiryDate || "xx/xx",
            nameOnCard: card.nameOnCard || card.cardholderName || "Card Holder",
            isDefault: card.isDefault || false
          }));
        }
        
        // If it's a single object (not in an array)
        if (response && !Array.isArray(response) && (response._id || response.paymentMethodId)) {
          return [{
            id: response.paymentMethodId || response._id,
            cardType: response.cardType || "card",
            cardNumber: `•••• •••• •••• ${response.last4 || '****'}`,
            expiryDate: response.expiryDate || "xx/xx",
            nameOnCard: response.nameOnCard || response.cardholderName || "Card Holder",
            isDefault: response.isDefault || false
          }];
        }
        
        // Return empty array if no valid response
        return [];
      },
      transformErrorResponse: (response) => {
        console.error('Error fetching saved cards:', response);
        return response;
      },
      providesTags: ['PaymentMethod'],
    }),
    
    // Add a direct database cards query
    getDbCards: builder.query({
      query: () => '/api/payments/db-cards',
      transformResponse: (response) => {
        console.log('Direct DB cards response:', response);
        if (!response || !Array.isArray(response)) return [];
        
        return response.map(card => ({
          id: card.paymentMethodId || card._id,
          cardType: card.cardType || "card",
          cardNumber: `•••• •••• •••• ${card.last4 || '****'}`,
          expiryDate: card.expiryDate || "xx/xx",
          nameOnCard: card.nameOnCard || card.cardholderName || "Card Holder",
          isDefault: card.isDefault || false
        }));
      },
      providesTags: ['PaymentMethod'],
    }),
    
    createPaymentIntent: builder.mutation({
      query: (paymentData) => ({
        url: '/api/payments/create-intent',
        method: 'POST',
        body: paymentData,
      }),
    }),
    
    saveCard: builder.mutation({
      query: (cardData) => ({
        url: '/api/payments/save-card',
        method: 'POST',
        body: cardData,
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
    
    deleteCard: builder.mutation({
      query: (cardId) => ({
        url: `/api/payments/cards/${cardId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
    
    setDefaultCard: builder.mutation({
      query: (cardId) => ({
        url: `/api/payments/cards/${cardId}/default`,
        method: 'PUT',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
  useSaveCardMutation,
  useGetSavedCardsQuery,
  useGetDbCardsQuery, // Export the new query
  useDeleteCardMutation,
  useSetDefaultCardMutation,
} = paymentApi;