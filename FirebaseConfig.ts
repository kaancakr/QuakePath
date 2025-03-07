// firebaseConfig.js
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9INnSoXARBAMxcsmloUjg5FbB1aQp7kk",
  authDomain: "onyx-code.firebaseapp.com",
  projectId: "onyx-code",
  storageBucket: "onyx-code.appspot.com",
  messagingSenderId: "935977160264",
  appId: "1:935977160264:web:1658c01ea245b7e627d27d"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default firebase;

//IOS = 842220729560-r4tmdeu7ulu52g910qtse7phb4chq4l7.apps.googleusercontent.com
// ANDROID = 842220729560-9s5ct694d3d1rfm7p8n2625i3r8cri0k.apps.googleusercontent.com