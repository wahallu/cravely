import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { jwtDecode } from 'jwt-decode';

export const deliveryApi = createApi({
  reducerPath: 'deliveryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5001/api',
    prepareHeaders: (headers) => {
      // You can switch this to localStorage if needed
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkQwMDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDUxMjMxODUsImV4cCI6MTc0NTE0NDc4NX0.3Zwc5UEhH0eLFeqQ_cCxZprljmUBjGG1y9btVcectTU";
      if (token) {
        const decoded = jwtDecode(token);
        console.log(decoded, "decoded");
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Delivery'],
  endpoints: (builder) => ({
    // Fetch all deliveries
    getAllDeliveries: builder.query({
      query: () => '/deliveries',
      providesTags: ['Delivery']
    }),

    // Create a delivery
    createDelivery: builder.mutation({
      query: (newDelivery) => ({
        url: '/deliveries',
        method: 'POST',
        body: newDelivery
      }),
      invalidatesTags: ['Delivery']
    }),

    // Update delivery status
    updateDeliveryStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/deliveries/${id}`,
        method: 'PUT',
        body: { driverStatus: status }
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Delivery', id },
        'Delivery'
      ]
    }),

    signupDriver: builder.mutation({
      query: (data) => ({
        url: '/drivers/signup',
        method: 'POST',
        body: data
      })
    }),
    loginDriver: builder.mutation({
      query: (credentials) => ({
        url: '/drivers/login',
        method: 'POST',
        body: credentials
      })
    })


  }),
});

export const {
  useGetAllDeliveriesQuery,
  useCreateDeliveryMutation,
  useUpdateDeliveryStatusMutation,
  useSignupDriverMutation,
  useLoginDriverMutation
} = deliveryApi;
