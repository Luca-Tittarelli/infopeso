import { Route, BrowserRouter, Routes } from "react-router-dom";
import Header from "./components/Header";
import Macro from "./pages/Macro";
import Cambios from "./pages/Cambios";
function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<h1>Hola Index</h1>}></Route>
        <Route path="/Macro" element={<Macro />}></Route>
        <Route path="/Cambios" element={<Cambios />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
