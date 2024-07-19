import { apiSlice } from "../../app/api/apiSlice";

export const commentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query({
      query: (noteId) => `/notes/${noteId}/comments`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Comment", id })),
              { type: "Comment", id: "LIST" },
            ]
          : [{ type: "Comment", id: "LIST" }],
    }),
    addComment: builder.mutation({
      query: ({ noteId, ...comment }) => ({
        url: `/notes/${noteId}/comments`,
        method: "POST",
        body: comment,
      }),
      invalidatesTags: [{ type: "Comment", id: "LIST" }],
    }),
    updateComment: builder.mutation({
      query: ({ noteId, id, ...comment }) => ({
        url: `/notes/${noteId}/comments/${id}`,
        method: "PATCH",
        body: comment,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Comment", id }],
    }),
    deleteComment: builder.mutation({
      query: ({ noteId, id }) => ({
        url: `/notes/${noteId}/comments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Comment", id }],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApiSlice;
