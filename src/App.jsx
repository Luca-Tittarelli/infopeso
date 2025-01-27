import { Route, BrowserRouter, Routes } from "react-router-dom";
import Header from "./components/Header";
import Cambios from "./pages/Cambios";
import Economia from "./pages/Economia";
import Index from "./pages/Index";
import { Footer } from "./components/Footer";
import EconomiaDetalle from "./pages/Economia[id]";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Index />}></Route>
        <Route path="/Economia" element={<Economia />}></Route>
        <Route path="/Economia/:id" element={<EconomiaDetalle />}></Route>
        <Route path="/Cambios" element={<Cambios />}></Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
