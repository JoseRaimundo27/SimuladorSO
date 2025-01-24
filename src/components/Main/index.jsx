import React, { useState } from "react";
import ProcessCard from "./ProcessCard";
import FIFOSimulation from "../../algorithms/FIFOSimulation"
import SJFSsimulation from "../../algorithms/SJFSimulation";
import RoundRobinSimulation from "../../algorithms/RoundRobinSimulation";
import EDFSimulation from "../../algorithms/EDFSimulation";
import "./style.css";

function Main() {
  const [numProcesses, setNumProcesses] = useState(1);
  const [algorithm, setAlgorithm] = useState("fifo");
  const [quantum, setQuantum] = useState(0);
  const [overhead, setOverhead] = useState(0);
  const [pagination, setPagination] = useState("fifo");
  const [processData, setProcessData] = useState([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  const handleNumProcessesChange = (n) => {
    const newNum = Math.max(1, Number(n));
    setNumProcesses(newNum);
    const newProcesses = Array.from({ length: newNum }, (_, index) => ({
      id: index + 1,
      tempo: 0,
      paginas: 0,
      deadline: 0,
      chegada: 0,
    }));
    setProcessData(newProcesses);
  };

  const handleProcessDataChange = (index, field, value) => {
    const updatedProcesses = [...processData];
    updatedProcesses[index][field] = Number(value);
    setProcessData(updatedProcesses);
  };

  const handleSimulationReset = () => {
    setNumProcesses(1);
    setAlgorithm("fifo");
    setQuantum(0);
    setOverhead(0);
    setPagination("fifo");
    setProcessData([]);
  };

  return (
    <section className="config-section">
      <form className="config-form">
        <div className="config-form-options">
          <label>
            Número de Processos:
            <input
              type="number"
              min="1"
              value={numProcesses}
              onChange={(e) => handleNumProcessesChange(e.target.value)}
            />
          </label>
          <label>
            Método:
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              <option value="fifo">FIFO</option>
              <option value="sjf">SJF</option>
              <option value="edf">EDF</option>
              <option value="round_robin">Round Robin</option>
            </select>
          </label>
          <label>
            Quantum:
            <input
              type="number"
              min="0"
              value={quantum}
              onChange={(e) => setQuantum(Number(e.target.value))}
              disabled={algorithm !== "round_robin"}
            />
          </label>
          <label>
            Sobrecarga:
            <input
              type="number"
              min="0"
              value={overhead}
              onChange={(e) => setOverhead(Number(e.target.value))}
              disabled={algorithm ==  "fifo"}
            />
          </label>
          <label>
            Paginação:
            <select
              value={pagination}
              onChange={(e) => setPagination(e.target.value)}
            >
              <option value="fifo">FIFO</option>
              <option value="lru">LRU</option>
            </select>
          </label>
        </div>

        <div className="process-config">
          <h3>Configuração dos Processos</h3>
          <div className="process-config-cards_container">
            {processData.map((process, index) => (
              <ProcessCard
                key={process.id}
                process={process}
                index={index}
                onChange={handleProcessDataChange}
              />
            ))}
          </div>
        </div>

        <div className="config-form-button-group">
          <button
            type="button"
            onClick={() => setIsSimulationRunning(true)}
            disabled={isSimulationRunning} // Desativa o botão enquanto a simulação está ativa
          >
            Iniciar Simulação
          </button>

          <button type="button" onClick={handleSimulationReset}>
            Resetar Simulação
          </button>
        </div>
      </form>

      {/* Renderiza o componente de simulação baseado no algoritmo selecionado */}
      {algorithm === "fifo" && (
        <FIFOSimulation processData={processData} overhead={overhead} isSimulationRunning={isSimulationRunning} />
      )}
      {algorithm === "sjf" && (
        <SJFSsimulation processData={processData} overhead={overhead} isSimulationRunning={isSimulationRunning}/>
      )}
      {algorithm === "round_robin" && (
        <RoundRobinSimulation
          processData={processData}
          quantum={quantum}
          overhead={overhead}
          isSimulationRunning={isSimulationRunning}
        />
      )}
      {algorithm === "edf" && <EDFSimulation processData={processData} isSimulationRunning={isSimulationRunning} />}
    </section>
  );
}

export default Main;
