import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Medication", "Schedule", "User"],
  endpoints: (builder) => ({
    // ===== Auth =====
    register: builder.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    // Backend returns a raw JWT string — responseHandler 'text'.
    login: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
        responseHandler: (res) => res.text(),
      }),
    }),

    // ===== Users =====
    getUserByEmail: builder.query({
      query: (email) => `/api/users/email/${encodeURIComponent(email)}`,
      providesTags: ["User"],
    }),
    updateUserByEmail: builder.mutation({
      query: ({ email, body }) => ({
        url: `/api/users/email/${encodeURIComponent(email)}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // ===== Medications =====
    getMedicationsByUser: builder.query({
      query: (userId) => `/medications/user/${userId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map((m) => ({ type: "Medication", id: m.id })),
              { type: "Medication", id: "LIST" },
            ]
          : [{ type: "Medication", id: "LIST" }],
    }),
    createMedication: builder.mutation({
      query: (body) => ({ url: "/medications", method: "POST", body }),
      invalidatesTags: [{ type: "Medication", id: "LIST" }],
    }),
    updateMedication: builder.mutation({
      query: ({ id, body }) => ({ url: `/medications/${id}`, method: "PUT", body }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Medication", id },
        { type: "Medication", id: "LIST" },
      ],
    }),
    deleteMedication: builder.mutation({
      query: (id) => ({ url: `/medications/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Medication", id: "LIST" }],
    }),
    analyzeMedicationImage: builder.mutation({
      query: (file) => {
        const fd = new FormData();
        fd.append("file", file);
        return { url: "/medications/analyze-image", method: "POST", body: fd };
      },
    }),

    // ===== Schedules =====
    getSchedulesByUser: builder.query({
      query: (userId) => `/medication-schedules/user/${userId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map((s) => ({ type: "Schedule", id: s.id })),
              { type: "Schedule", id: "LIST" },
            ]
          : [{ type: "Schedule", id: "LIST" }],
    }),
    createSchedule: builder.mutation({
      query: (body) => ({ url: "/medication-schedules", method: "POST", body }),
      invalidatesTags: [{ type: "Schedule", id: "LIST" }],
    }),
    createMedicationSchedule: builder.mutation({
      query: (body) => ({ url: "/medication-schedules", method: "POST", body }),
      invalidatesTags: [{ type: "Schedule", id: "LIST" }],
    }),
    updateSchedule: builder.mutation({
      query: ({ id, body }) => ({
        url: `/medication-schedules/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Schedule", id },
        { type: "Schedule", id: "LIST" },
      ],
    }),
    deleteSchedule: builder.mutation({
      query: (id) => ({ url: `/medication-schedules/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Schedule", id: "LIST" }],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetUserByEmailQuery,
  useLazyGetUserByEmailQuery,
  useUpdateUserByEmailMutation,
  useGetMedicationsByUserQuery,
  useCreateMedicationMutation,
  useUpdateMedicationMutation,
  useDeleteMedicationMutation,
  useAnalyzeMedicationImageMutation,
  useGetSchedulesByUserQuery,
  useCreateScheduleMutation,
  useCreateMedicationScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} = apiSlice;
