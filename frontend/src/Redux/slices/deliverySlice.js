import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken, saveAuth } from '../../utils/auth';

export const deliveryApi = createApi({
  reducerPath: 'deliveryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5001/api',
    prepareHeaders: (headers) => {
      const token = getToken();
      
      if (token) {
        console.log('Using token:', token.substring(0, 20) + '...'); 
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('Content-Type', 'application/json');
      } else {
        console.log('No token found in auth utils');
      }
      return headers;
    },
  }),
  tagTypes: ['Delivery', 'Driver'],
  endpoints: (builder) => ({
    loginDriver: builder.mutation({
      query: (credentials) => ({
        url: '/drivers/login',
        method: 'POST',
        body: credentials
      }),
      
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.token) {
            // Store token and driver info with role
            saveAuth(data.token, {
              id: data.driver._id || data.driver.id,
              email: data.driver.email,
              name: data.driver.name,
              role: 'driver'
            });
          }
        } catch (err) {
          console.error('Login error:', err);
        }
      }
    }),

    registerDriver: builder.mutation({
      query: (driverData) => ({
        url: '/drivers/register',
        method: 'POST',
        body: driverData
      }),
      invalidatesTags: ['Driver']
    }),

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

  }),
});

export const {
  useLoginDriverMutation,
  useRegisterDriverMutation,
  useGetAllDeliveriesQuery,
  useCreateDeliveryMutation,
  useUpdateDeliveryStatusMutation,
} = deliveryApi;
