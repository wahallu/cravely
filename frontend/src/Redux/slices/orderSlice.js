import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { clearCart } from './cartSlice';
import { getToken } from '../../utils/auth';

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5002/api',
    prepareHeaders: (headers) => {
      const token = getToken() || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      // Clear cart on successful order
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(clearCart());
        } catch (err) {
          console.error('Order creation failed:', err);
        }
      },
    }),
    
    // Add payment intent creation endpoint for Stripe
    createPaymentIntent: builder.mutation({
      query: (paymentData) => ({
        url: '/payments/create-intent',
        method: 'POST',
        body: paymentData,
      }),
    }),
    
    // Add endpoint to confirm payment and finalize order
    confirmPayment: builder.mutation({
      query: (confirmData) => ({
        url: '/payments/confirm',
        method: 'POST',
        body: confirmData,
      }),
      invalidatesTags: ['Order'],
    }),
    
    // Add endpoint to save payment method
    savePaymentMethod: builder.mutation({
      query: (paymentMethodData) => ({
        url: '/users/payment-methods',
        method: 'POST',
        body: paymentMethodData,
      }),
    }),
    
    // Get user's saved payment methods
    getUserPaymentMethods: builder.query({
      query: () => '/users/payment-methods',
      transformResponse: (response) => response.paymentMethods,
    }),
    
    getOrderById: builder.query({
      query: (orderId) => `/orders/${orderId}`,
      transformResponse: (response) => response.order,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    
    getUserOrders: builder.query({
      query: () => '/orders/user/me',
      transformResponse: (response) => response.orders,
      providesTags: ['Order'],
    }),
    
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'Order',
      ],
    }),
    
    cancelOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: 'Order', id: orderId },
        'Order',
      ],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderByIdQuery,
  useGetUserOrdersQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useCreatePaymentIntentMutation,
  useConfirmPaymentMutation,
  useSavePaymentMethodMutation,
  useGetUserPaymentMethodsQuery,
} = orderApi;