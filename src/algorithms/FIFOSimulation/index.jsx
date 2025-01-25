import React, { useState, useEffect } from "react";
import "../style.css";

function FIFOSimulation({ processData }) {
  const [simulationData, setSimulationData] = useState([]);
  const [turnaroundAvg, setTurnaroundAvg] = useState(0); // Variável para armazenar o TAT médio

  useEffect(() => {
    const totalTime = processData.reduce((acc, process) => acc + process.tempo, 0);
    const timeline = Array(totalTime).fill("wait");
    const simulation = processData.map((process) => ({
      id: process.id,
      timeline: [...timeline],
    }));

    let currentTime = 0;
    // A execução dos processos no FIFO
    for (let i = 0; i < processData.length; i++) {
      const process = simulation[i];
      const processTime = processData[i].tempo;

      for (let j = 0; j < processTime; j++) {
        process.timeline[currentTime++] = "execute";
      }
    }

    setSimulationData(simulation);

    // Calcular o Turnaround Time e o Turnaround Time médio
    let totalTurnaroundTime = 0;
    processData.forEach((process, index) => {
      const completionTime = processData
        .slice(0, index + 1)
        .reduce((acc, p) => acc + p.tempo, 0);

      const turnaroundTime = completionTime - process.chegada;
      totalTurnaroundTime += turnaroundTime;
    });

    const averageTurnaroundTime = totalTurnaroundTime / processData.length;
    setTurnaroundAvg(averageTurnaroundTime);
  }, [processData]);

  return (
    <div className="simulation-container">
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
                style={{ animationDelay: `${index * 0.7}s` }} // Adiciona delay gradual
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
