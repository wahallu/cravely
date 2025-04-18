// Create a new file: Redux/slices/shippingAddressSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/auth';

export const shippingAddressApi = createApi({
  reducerPath: 'shippingAddressApi',
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
  tagTypes: ['ShippingAddress'],
  endpoints: (builder) => ({
    getUserAddresses: builder.query({
      query: () => '/shipping-addresses',
      transformResponse: (response) => response.addresses,
      providesTags: ['ShippingAddress']
    }),
    
    addAddress: builder.mutation({
      query: (addressData) => ({
        url: '/shipping-addresses',
        method: 'POST',
        body: addressData,
      }),
      invalidatesTags: ['ShippingAddress']
    }),
    
    updateAddress: builder.mutation({
      query: ({ addressId, ...addressData }) => ({
        url: `/shipping-addresses/${addressId}`,
        method: 'PUT',
        body: addressData,
      }),
      invalidatesTags: ['ShippingAddress']
    }),
    
    deleteAddress: builder.mutation({
      query: (addressId) => ({
        url: `/shipping-addresses/${addressId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ShippingAddress']
    }),
    
    setDefaultAddress: builder.mutation({
      query: (addressId) => ({
        url: `/shipping-addresses/${addressId}/default`,
        method: 'PUT',
        body: {},
      }),
      invalidatesTags: ['ShippingAddress']
    }),
  }),
});

export const {
  useGetUserAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = shippingAddressApi;