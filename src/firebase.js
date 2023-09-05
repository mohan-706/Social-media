
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDc44-wrAX9-Y3_WsX7SvJITDC54bBD5aA",
    authDomain: "social-media-7684e.firebaseapp.com",
    projectId: "social-media-7684e",
    storageBucket: "social-media-7684e.appspot.com",
    messagingSenderId: "10286332009",
    appId: "1:10286332009:web:772a027831dd55be7a0af8"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();

export default firebase;
