import { useParams } from "react-router-dom";
import EditNoteForm from "./EditNoteForm";
import { useGetNoteByIdQuery } from "./notesApiSlice";
import { useGetUserDataByUsernameQuery } from "../users/usersApiSlice";
import useAuth from "../../hooks/useAuth";
import PulseLoader from "react-spinners/PulseLoader";
import useTitle from "../../hooks/useTitle";

const EditNote = () => {
  useTitle("Edit Note");

  const { id } = useParams();
  const { username } = useAuth();

  const { data: noteData, isLoading: isNoteLoading } = useGetNoteByIdQuery(id);
  const { data: userData, isLoading: isUserLoading } =
    useGetUserDataByUsernameQuery(username);

  if (isNoteLoading || isUserLoading) return <PulseLoader color={"#FFF"} />;

  if (!noteData?.note || !userData) return <p>Note or user data not found!</p>;

  const content = <EditNoteForm note={noteData.note} user={userData} />;

  return content;
};

export default EditNote;
