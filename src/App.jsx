import { Route, BrowserRouter, Routes } from "react-router-dom";
import Header from "./components/Header";
import Macro from "./pages/Macro";
import Cambios from "./pages/Cambios";
import LineChart from "./pages/Market";
import Index from "./pages/Index";
import { Footer } from "./components/Footer";
function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Index />}></Route>
        <Route path="/Economia" element={<Macro />}></Route>
        <Route path="/Cambios" element={<Cambios />}></Route>
        <Route path="/Mercado" element={<LineChart />}></Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
