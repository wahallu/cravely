import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/auth'; 

export const driverApi = createApi({
  reducerPath: 'driverApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5001/api',
    prepareHeaders: (headers) => {
      const token = getToken(); 
      
      if (token) {
        console.log('Using token:', token.substring(0, 20) + '...');
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    }
  }),
  tagTypes: ['Driver'],
  endpoints: (builder) => ({
    getAllDrivers: builder.query({
      query: () => '/drivers',
      providesTags: ['Driver']
    }),
    getDriverById: builder.query({
      query: (id) => `/drivers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Driver', id }]
    }),
    getDriverStats: builder.query({
      query: (id) => `/drivers/stats/${id}`,
      providesTags: (result, error, id) => [{ type: 'Driver', id }]
    }),
    addDriver: builder.mutation({
      query: (data) => ({
        url: '/drivers/register',
        method: 'POST',
        body: data
      }),
      transformResponse: (response) => {
        if (response.token) {
          return response;
        }
        throw new Error('No token received from server');
      },
      invalidatesTags: ['Driver']
    }),
    updateDriver: builder.mutation({
      query: ({ driverId, ...data }) => ({
        url: `/drivers/${driverId}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { driverId }) => [
        { type: 'Driver', id: driverId },
        'Driver'
      ]
    }),
    deleteDriver: builder.mutation({
      query: (id) => ({
        url: `/drivers/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Driver']
    }),
    loginDriver: builder.mutation({
      query: (credentials) => ({
        url: '/drivers/login',
        method: 'POST',
        body: credentials,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (response) => {
        console.log('Login response:', response);
        if (response.token) {
          // Store token and driver info
          localStorage.setItem('driverToken', response.token);
          localStorage.setItem('driverInfo', JSON.stringify({
            id: response.driver._id || response.driver.id,
            email: response.driver.email,
            role: 'driver'
          }));
        }
        return response;
      },
      transformErrorResponse: (response) => {
        console.error('Login error:', response);
        return {
          status: response.status,
          message: response.data?.message || 'Authentication failed'
        };
      },
    })
  })
});

export const {
  useGetAllDriversQuery,
  useGetDriverByIdQuery,
  useGetDriverStatsQuery,
  useAddDriverMutation,
  useUpdateDriverMutation,
  useDeleteDriverMutation,
  useLoginDriverMutation
} = driverApi;