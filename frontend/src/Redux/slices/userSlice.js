import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/auth';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5004/api',
    prepareHeaders: (headers) => {
      const token = getToken() || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Get current user profile
    getCurrentUser: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
      transformResponse: (response) => response.user,
      // Handle potential errors in the response
      transformErrorResponse: (response, meta, arg) => {
        console.error('Error fetching user profile:', response);
        return response;
      }
    }),
    
    // Get specific user by ID
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
      transformResponse: (response) => response.user || response,
    }),
    
    // Get all users (admin only)
    getAllUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
      transformResponse: (response) => Array.isArray(response) ? response : [],
    }),
    
    // Update user profile
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        'User'
      ],
      // Handle response transformation
      transformResponse: (response) => {
        if (response.user) {
          // Update user data in localStorage if it's the current user
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser._id === response.user._id) {
              localStorage.setItem('user', JSON.stringify({
                ...parsedUser,
                ...response.user
              }));
            }
          }
          return response.user;
        }
        return response;
      },
      // Enhanced error handling
      transformErrorResponse: (response) => {
        const errorMessage = response.data?.message || 'Failed to update user profile';
        console.error('Update user error:', errorMessage);
        return { message: errorMessage };
      }
    }),
    
    // Change password
    changePassword: builder.mutation({
      query: ({ id, currentPassword, newPassword }) => ({
        url: `/users/${id}/change-password`,
        method: 'PUT',
        body: { currentPassword, newPassword },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
    
    // Delete account
    deleteAccount: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useGetUserByIdQuery,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = userApi;