import React from 'react';
import { render } from 'react-dom';
import TodoForm from './TodoForm';

import firebase from 'firebase/firebase-browser';

// TODO insert yout setting value.
// Initialize Firebase
const config = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: ""
};
firebase.initializeApp(config);

render(
  <TodoForm/>,
  document.getElementById('app')
);