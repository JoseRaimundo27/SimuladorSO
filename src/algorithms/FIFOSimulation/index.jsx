import React, { useState, useEffect } from "react";
import "../style.css";

function FIFOSimulation({ processData, overhead, isSimulationRunning }) {
  const [simulationData, setSimulationData] = useState([]);

  useEffect(() => {
    if (!isSimulationRunning) return; // Apenas simula se a simulação estiver ativa

    const totalTime = processData.reduce((acc, process) => acc + process.tempo, 0);
    const timeline = Array(totalTime).fill("wait");
    const simulation = processData.map((process) => ({
      id: process.id,
      timeline: [...timeline],
    }));

    let currentTime = 0;
    for (let i = 0; i < processData.length; i++) {
      const process = simulation[i];
      const processTime = processData[i].tempo;

      for (let j = 0; j < processTime; j++) {
        process.timeline[currentTime++] = "execute";
      }

      // Adiciona overhead, se aplicável
      for (let k = 0; k < overhead; k++) {
        if (currentTime < totalTime) {
          simulation.forEach((p) => {
            p.timeline[currentTime] = "overhead";
          });
          currentTime++;
        }
      }
    }

    setSimulationData(simulation);
  }, [isSimulationRunning, processData, overhead]); // Dependências atualizadas

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
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FIFOSimulation;
