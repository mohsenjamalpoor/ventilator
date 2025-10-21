

import { BrowserRouter, Route, Routes } from "react-router-dom";
import VentilatorHome from "./pages/VentilatorHome";
// import VentilatorModeSelector from "./components/VentilatorModeSelector";
// import VentilatorHome from "./pages/VentilatorHome";




function App() {
  return (
<BrowserRouter>
<Routes>
  <Route path="/" element={<VentilatorHome/>}/>
</Routes>
</BrowserRouter>
  );
}

export default App;
