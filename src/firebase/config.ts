import { initializeApp } from "firebase/app";

const firebaseConfig = {
apiKey: "AIzaSyBbDKAQ3zOgY1skXL9fcQJi3-0vSUaqrvA",
authDomain: "my-outlet-guide.firebaseapp.com",
projectId: "my-outlet-guide",
storageBucket: "my-outlet-guide.firebasestorage.app",
messagingSenderId: "763605869867",
appId: "1:763605869867:web:08f8901dfe06de84ea916e",
measurementId: "G-E5LLLD6ZM8"
};

export const app = initializeApp(firebaseConfig);