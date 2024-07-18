import { Link } from "react-router-dom";
import NotesList from "../features/notes/NotesList";
import ImageTest from "./ImageTest";

const Public = () => {
  const content = (
    <section>
      <main>
        {/* <ImageTest /> */}
        <NotesList />
      </main>
    </section>
  );
  return content;
};
export default Public;
