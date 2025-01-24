import { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Main from "./components/Main";
import Simulation from "./components/Simulation";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app-container">
      <header className="header-content">
        <Header />
      </header>

     
      <main className="main-content">
        <Main/>
        <Simulation/>
      </main>

      <footer className="footer">
        <p>MATA58-SISTEMAS OPERACIONAIS</p>
      </footer>
    </div>
  );
}

export default App;
