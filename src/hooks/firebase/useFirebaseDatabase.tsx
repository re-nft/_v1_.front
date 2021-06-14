import { useMemo } from "react";
import firebase from "../../services/firebase/clientApp";

export const useFirebaseDatabase = (): firebase.database.Database => {
    return useMemo(() => {
      return firebase.database();
    }, []);
  };
  