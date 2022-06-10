import { Route, BrowserRouter, Routes } from "react-router-dom";
import ManualSignaling from "./pages/ManualSignaling";
import AutoSignaling from "./pages/AutoSignaling";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path={"/"} element={<AutoSignaling />} />
          <Route path={"/manual"} element={<ManualSignaling />} />
          <Route path={"/auto"} element={<AutoSignaling />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
