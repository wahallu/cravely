import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/auth';

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5002',
    prepareHeaders: (headers, { getState }) => {
      const token = getToken();
      if (token) {
        // Enhanced logging for better debugging
        console.log('Token length:', token.length);
        console.log('Token starts with:', token.substring(0, 10) + '...');
        console.log('Token ends with:', '...' + token.substring(token.length - 10));
        
        // Try without 'Bearer ' prefix - some backends handle this internally
        headers.set('Authorization', `Bearer ${token}`);
        
        // Add content-type header to ensure proper request formatting
        headers.set('Content-Type', 'application/json');
      } else {
        console.log('No token found - user may need to login again');
      }
      return headers;
    }
  }),
  tagTypes: ['Cart'],
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => ({
        url: '/api/cart',
        method: 'GET',
      }),
      providesTags: ['Cart']
    }),
    addToCart: builder.mutation({
      query: (data) => {
        console.log('Using token for add to cart request:', getToken() ? 'Token exists' : 'No token');
        
        return {
          url: '/api/cart/items',
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: ['Cart']
    }),
    updateCartItem: builder.mutation({
      query: ({ itemId, quantity }) => ({
        url: `/api/cart/items/${itemId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart']
    }),
    removeFromCart: builder.mutation({
      query: (itemId) => ({
        url: `/api/cart/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart']
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: '/api/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart']
    })
  })
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation
} = cartApi;