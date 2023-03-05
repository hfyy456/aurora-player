import React from "react";
import ReactDOM from "react-dom/client";
// import "./samples/node-api";
import "./index.scss";
import AppRoute from "./Routes";
import { HashRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ChakraProvider>
    <HashRouter>
      <AppRoute />
    </HashRouter>
  </ChakraProvider>
);

postMessage({ payload: "removeLoading" }, "*");
