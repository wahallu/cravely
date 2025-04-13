import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/auth';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5006/api', // Gateway service URL
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['PaymentMethod'],
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation({
      query: (paymentData) => ({
        url: '/payments/create-intent', // Remove the leading 'api'
        method: 'POST',
        body: paymentData,
      }),
    }),
    
    saveCard: builder.mutation({
      query: (cardData) => ({
        url: '/payments/save-card',
        method: 'POST',
        body: cardData,
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
    
    getSavedCards: builder.query({
      query: () => '/payments/saved-cards',
      transformResponse: (response) => response.cards || [],
      providesTags: ['PaymentMethod'],
    }),
    
    deleteCard: builder.mutation({
      query: (cardId) => ({
        url: `/payments/cards/${cardId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
    
    setDefaultCard: builder.mutation({
      query: (cardId) => ({
        url: `/payments/cards/${cardId}/default`,
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
  useDeleteCardMutation,
  useSetDefaultCardMutation,
} = paymentApi;