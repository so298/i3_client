import { Route, BrowserRouter, Routes } from "react-router-dom";
import ManualSignaling from "./pages/ManualSignaling";
import Main from "./pages/Main";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path={"/"} element={<Main />} />
          <Route path={"/manual"} element={<ManualSignaling />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
