import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const driverApi = createApi({
  reducerPath: 'driverApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5001/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
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
        url: '/drivers',
        method: 'POST',
        body: data
      }),
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
    })
  })
});

export const {
  useGetAllDriversQuery,
  useGetDriverByIdQuery,
  useGetDriverStatsQuery,
  useAddDriverMutation,
  useUpdateDriverMutation,
  useDeleteDriverMutation
} = driverApi;