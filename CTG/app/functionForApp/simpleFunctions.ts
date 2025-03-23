import { getDatabase, ref as dbRef, get } from "firebase/database";
import { auth } from "../firebaseconfig/firebase";

export const getUserID = () => {
    const user = auth.currentUser;
    return user!.uid;
}

export const userLoggedInToEbay = async () => {
    const db = getDatabase();

    const user = auth.currentUser;
    const ref = dbRef(db, `users/${user!.uid}/token`);
    const data = await get(ref);
    if (!data.exists()) {
        return false;
    }
    return true;

}