import React, { useState, useEffect } from "react";
import "../style.css";

function FIFOSimulation({ processData }) {
  const [simulationData, setSimulationData] = useState([]);
  const [orderedProcesses, setOrderedProcesses] = useState([]);
  const [turnaroundAvg, setTurnaroundAvg] = useState(0);

  useEffect(() => {
    // Ordenar os processos pela chegada
    const sortedProcesses = [...processData].sort((a, b) => a.chegada - b.chegada);
    setOrderedProcesses(sortedProcesses);

    // Criar a linha do tempo para cada processo
    const totalTime = sortedProcesses.reduce((acc, process) => acc + process.tempo, 0);
    const timeline = Array(totalTime).fill("wait");
    const simulation = sortedProcesses.map((process) => ({
      id: process.id,
      timeline: [...timeline],
    }));

    let currentTime = 0;

    // Executar os processos na ordem
    for (let i = 0; i < sortedProcesses.length; i++) {
      const process = simulation[i];
      const processTime = sortedProcesses[i].tempo;

      // Avança o tempo até que o processo atual possa começar
      if (currentTime < sortedProcesses[i].chegada) {
        currentTime = sortedProcesses[i].chegada;
      }

      // Executa o processo
      for (let j = 0; j < processTime; j++) {
        process.timeline[currentTime++] = "execute";
      }
    }

    setSimulationData(simulation);

    // Calcular o Turnaround Time médio
    let totalTurnaroundTime = 0;
    sortedProcesses.forEach((process, index) => {
      const completionTime = simulation[index].timeline.lastIndexOf("execute") + 1;
      const turnaroundTime = completionTime - process.chegada;
      totalTurnaroundTime += turnaroundTime;
    });

    const averageTurnaroundTime = totalTurnaroundTime / sortedProcesses.length;
    setTurnaroundAvg(averageTurnaroundTime);
  }, [processData]);

  return (
    <div className="simulation-container">
      {/* <h3>Lista de Processos Ordenada</h3>
      <div className="process-list">
        {orderedProcesses.map((process) => (
          <div key={process.id} className="process-item">
            <p>Processo {process.id}</p>
            <p>Chegada: {process.chegada}</p>
            <p>Tempo: {process.tempo}</p>
          </div>
        ))}
      </div>
      <h3>Simulação</h3> */}
      {simulationData.map((process) => (
        <div key={process.id} className="process-row">
          <h4>Processo {process.id}</h4>
          <div className="process-timeline">
            {process.timeline.map((state, index) => (
              <div
                key={index}
                className={`timeline-block ${
                  state === "execute"
                    ? "green"
                    : state === "wait"
                    ? "yellow"
                    : "red"
                }`}
                style={{ animationDelay: `${index * 0.7}s` }}
              ></div>
            ))}
          </div>
        </div>
      ))}
      <div className="turnaround-info">
        <h4>Turnaround Médio: {turnaroundAvg.toFixed(2)}</h4>
      </div>
    </div>
  );
}

export default FIFOSimulation;
