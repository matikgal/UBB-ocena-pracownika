// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyARUQCN8r_NsjvMf7PutYOi91l5C-K5uIo',
	authDomain: 'ubb-ocena-pracownika.firebaseapp.com',
	projectId: 'ubb-ocena-pracownika',
	storageBucket: 'ubb-ocena-pracownika.firebasestorage.app',
	messagingSenderId: '142867445938',
	appId: '1:142867445938:web:dd37fe5aaf98f00e4d71ab',
	measurementId: 'G-JC8HLL6C59',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
