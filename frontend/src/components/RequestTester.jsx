import React, { useEffect } from "react";
import axios from "axios";

function RequestTester() {
  const instance = axios.create({
    baseURL: "https://fencing-ai-heroku.herokuapp.com",
  });

  useEffect(() => {
    console.log("useEffect running...");
    instance
      .get("/players")
      .then((res) => {
        const data = res.data;
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [instance]);

  return <p>dpg</p>;
}

export default RequestTester;
