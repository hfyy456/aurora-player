import App from "./App";
import { Route, Routes } from "react-router-dom";
import Home from "./views/Home";
export default function AppRoute() {
  return (
    <App>
      <Routes>
        <Route index path="/" element={<Home />} />
      </Routes>
    </App>
  );
}
