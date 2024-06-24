import firebaseApp from "firebaseConfig"
import { getDatabase } from "firebase/database"

const database = getDatabase(firebaseApp);

export default database;