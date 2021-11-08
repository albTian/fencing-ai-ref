import React, { useEffect } from "react";
import axios from "axios";

function RequestTester() {
  // const instance = axios.create({
  //   baseURL: "https://fencing-ai-heroku.herokuapp.com",
  //   withCredentials: false,
  //   headers: {
  //     "Access-Control-Allow-Origin": "*",
  //     "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
  //   },
  // });

  useEffect(() => {
    console.log("useEffect running...");
    axios
      .get("https://fencing-ai-heroku.herokuapp.com/players")
      .then((res) => {
        const data = res.data;
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return <p>dpg</p>;
}

export default RequestTester;
