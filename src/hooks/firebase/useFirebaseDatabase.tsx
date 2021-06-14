import { useMemo } from "react";
import firebase from "../../services/firebase/clientApp";

export const useFirebaseDatabase = (): firebase.database.Database | undefined => {
    return useMemo(() => {
      if(firebase) return firebase.database();
    }, []);
  };
  