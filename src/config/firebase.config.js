import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBdISRoAr6-9-n8VruLFaE3-nAVwdpE0Ik",
  authDomain: "duobot-cdd7d.firebaseapp.com",
  databaseURL:
    "https://duobot-cdd7d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "duobot-cdd7d",
  storageBucket: "duobot-cdd7d.appspot.com",
  messagingSenderId: "216847155080",
  appId: "1:216847155080:web:559ae905a15cfe0dd8043d",
  measurementId: "G-EDZCEL0R77",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const auth = getAuth();

export { db, auth };
