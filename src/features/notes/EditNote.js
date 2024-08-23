import { useParams } from "react-router-dom";
import EditNoteForm from "./EditNoteForm";
import { useGetNoteByIdQuery } from "./notesApiSlice";
import { useGetUsersQuery } from "../users/usersApiSlice";
import useAuth from "../../hooks/useAuth";
import PulseLoader from "react-spinners/PulseLoader";
import useTitle from "../../hooks/useTitle";

const EditNote = () => {
  useTitle("Edit Note");

  const { id } = useParams();

  const { username, isManager, isAdmin } = useAuth();

  const { data: noteData, isLoading: isNoteLoading } = useGetNoteByIdQuery(id);

  const { users, isLoading: isUsersLoading } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data, isLoading }) => ({
      users: data?.ids.map((id) => data?.entities[id]),
      isLoading,
    }),
  });

  if (isNoteLoading || isUsersLoading) return <PulseLoader color={"#FFF"} />;

  if (!noteData?.note || !users?.length) return <p>Note or users not found!</p>;

  const content = <EditNoteForm note={noteData.note} users={users} />;

  return content;
};
export default EditNote;
