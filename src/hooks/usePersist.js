import { useState, useEffect } from "react";

const usePersist = () => {
<<<<<<< HEAD
  const [persist, setPersist] = useState(true);
=======
  const [persist, setPersist] = useState(
    JSON.parse(localStorage.getItem("persist")) || false
  );
>>>>>>> c5a6b7df98f694191c674c3f2879425a51b3af48

  useEffect(() => {
    localStorage.setItem("persist", JSON.stringify(persist));
  }, [persist]);

  return [persist, setPersist];
};

export default usePersist;
