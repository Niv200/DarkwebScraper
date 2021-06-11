import logo from "./logo.svg";
import "./App.css";
import React, { useRef, useState, useEffect } from "react";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyDR_6IUS5zqRSHyhEKs4GFzHmmRKaodOis",
  authDomain: "darkwebscraper.firebaseapp.com",
  projectId: "darkwebscraper",
  storageBucket: "darkwebscraper.appspot.com",
  messagingSenderId: "503028802234",
  appId: "1:503028802234:web:a1012a6cb4b48e716b1883",
  measurementId: "G-BR9QDL0XKT",
});

const firestore = firebase.firestore();
firebase.analytics();

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    getSaveData().then((res) => setMessages(res));
  }, []);

  let messagesToRender = [];

  return (
    <div className="App">
      <h1>Darkweb scraper</h1>
      {/* <Posts /> */}
      {messages.map((messageData) => (
        <DarkPost key={getNewID()} data={messageData} />
      ))}
    </div>
  );
}

function DarkPost({ data }) {
  const makeList = (string) => {
    let newArr = string.split("~");
    return newArr.map((val) => <li key={getNewID()}>{val}</li>);
  };
  console.log(data.topic);
  return (
    <div className="post">
      <h3>{data.topic}</h3>
      <ul>{makeList(data.text)}</ul>
      <h3>
        Posted by: {data.stamp} at: {data.time}
      </h3>
    </div>
  );
}

const getSaveData = async () => {
  const array = [];
  const snapshot = await firestore.collection("posts").get();
  const data = snapshot.docs.map((doc) => doc.data());
  return data;
};

const getNewID = () => {
  return Math.floor(Math.random() * 100000000000000);
};

export default App;
