import React, { useState, useEffect } from "react";
import "../style.css";

function FIFOSimulation({ processData, isSimulationRunning }) {
  const [simulationData, setSimulationData] = useState([]);

  useEffect(() => {
    if (!isSimulationRunning) return; // Apenas simula se a simulação estiver ativa

    // Calcula o tempo total baseado nos tempos de execução dos processos
    const totalTime = processData.reduce((acc, process) => acc + process.tempo, 0);

    // Cria a linha do tempo para cada processo
    const simulation = processData.map((process) => ({
      id: process.id,
      timeline: Array(totalTime).fill("wait"),
    }));

    let currentTime = 0;

    // Executa cada processo em sequência
    processData.forEach((process, index) => {
      const processTimeline = simulation[index].timeline;

      for (let i = 0; i < process.tempo; i++) {
        processTimeline[currentTime++] = "execute"; // Marca o tempo como "execute"
      }
    });

    setSimulationData(simulation);
  }, [isSimulationRunning, processData]); // Atualiza quando os dados ou o estado mudar

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
                  state === "execute" ? "green" : "yellow"
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
