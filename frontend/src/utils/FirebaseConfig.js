// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// // const firebaseConfig = {
// //   apiKey: "AIzaSyAc2_22t4VIZ3v9-BNrS9wyvulQ0_gscDU",
// //   authDomain: "whatsup-865be.firebaseapp.com",
// //   projectId: "whatsup-865be",
// //   storageBucket: "whatsup-865be.appspot.com",
// //   messagingSenderId: "977043360053",
// //   appId: "1:977043360053:web:e606f1639b05124be5647c",
// //   measurementId: "G-RBC1WMYJBB",
// // };

// const firebaseConfig = {

  // apiKey: "AIzaSyBqU_6zTgk35lxFCPC3kRdqQsyQvziUXds",

  // authDomain: "chat-app-3defb.firebaseapp.com",

  // projectId: "chat-app-3defb",

  // storageBucket: "chat-app-3defb.appspot.com",

  // messagingSenderId: "361696975104",

  // appId: "1:361696975104:web:145f95427bd8cb13d43be5",

  // measurementId: "G-HVVRCL1H7Y"

// };


// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const firebaseAuth = getAuth(app);



import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyBqU_6zTgk35lxFCPC3kRdqQsyQvziUXds",

  authDomain: "chat-app-3defb.firebaseapp.com",

  projectId: "chat-app-3defb",

  storageBucket: "chat-app-3defb.appspot.com",

  messagingSenderId: "361696975104",

  appId: "1:361696975104:web:145f95427bd8cb13d43be5",

  measurementId: "G-HVVRCL1H7Y"
  };

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
  