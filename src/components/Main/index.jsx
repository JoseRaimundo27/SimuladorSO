// Main.js
import React, { useState } from "react";
import ProcessCard from "./ProcessCard";
import "./style.css";

function Main() {
  const [numProcesses, setNumProcesses] = useState(1);
  const [algorithm, setAlgorithm] = useState("fifo");
  const [quantum, setQuantum] = useState(0);
  const [overhead, setOverhead] = useState(0);
  const [pagination, setPagination] = useState("fifo");
  const [processData, setProcessData] = useState([]);

  // Atualiza o número de processos e inicializa os dados padrão
  const handleNumProcessesChange = (n) => {
    const newNum = Math.max(1, Number(n)); // Garantir pelo menos 1 processo
    setNumProcesses(newNum);

    // Cria um array de objetos padrão para os processos
    const newProcesses = Array.from({ length: newNum }, (_, index) => ({
      id: index + 1,
      tempo: 0,
      paginas: 0,
      deadline: 0,
      chegada: 0,
    }));

    setProcessData(newProcesses);
  };

  // Atualiza os valores de um processo específico
  const handleProcessDataChange = (index, field, value) => {
    const updatedProcesses = [...processData];
    updatedProcesses[index][field] = Number(value);
    setProcessData(updatedProcesses);
  };

  const handleSimulationStart = () => {
    console.log("Iniciar Simulação com:", {
      numProcesses,
      algorithm,
      quantum,
      overhead,
      pagination,
      processData,
    });
    // Adicione aqui a lógica para iniciar a simulação
  };

  const handleSimulationReset = () => {
    console.log("Simulação resetada");
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
            Quantum (SÓ Round Robin?):
            <input
              type="number"
              min="0"
              placeholder="Ex: 2"
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
              placeholder="Ex: 1"
              value={overhead}
              onChange={(e) => setOverhead(Number(e.target.value))}
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
          <button type="button" onClick={handleSimulationStart}>
            Iniciar Simulação
          </button>
          <button type="button" onClick={handleSimulationReset}>
            Resetar Simulação
          </button>
        </div>
      </form>
    </section>
  );
}

export default Main;
