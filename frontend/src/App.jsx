import React from "react";
import Camera from "./components/Camera";
import RequestTester from "./components/RequestTester";
import { isChrome } from "react-device-detect";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {isChrome ? (
          <Camera />
        ) : (
          <p>Only chrome is supported for now ...</p>
        )}
        <RequestTester />
      </header>
    </div>
  );
}

export default App;
