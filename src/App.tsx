import { useEffect, useState, useRef } from "react";
import { Socket, Channel } from "phoenix";

import environment from "./types/env";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import ManualSignaling from "./pages/ManualSignaling";
import AutoSignaling from "./pages/AutoSignaling";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path={"/manual"} element={<ManualSignaling />}/>
          <Route path={"/auto"} element={<AutoSignaling />}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
