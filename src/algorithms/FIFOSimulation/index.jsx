import React, { useState, useEffect } from "react";
import "../style.css";

function FIFOSimulation({ processData }) {
  const [simulationData, setSimulationData] = useState([]);
  const [turnaroundAvg, setTurnaroundAvg] = useState(0);

  useEffect(() => {
    // Ordenar os processos pela hora de chegada
    const sorted = [...processData].sort((a, b) => a.chegada - b.chegada);

    // Determinar o tempo total necessário para a simulação
    let currentFinish = 0;
    const totalTime = sorted.reduce((acc, process) => {
      const start = Math.max(process.chegada, currentFinish);
      const finish = start + process.tempo;
      currentFinish = finish;
      return Math.max(acc, finish);
    }, 0);

    // Calcular start e finish de cada processo
    currentFinish = 0;
    sorted.forEach((p) => {
      const start = Math.max(p.chegada, currentFinish);
      const finish = start + p.tempo;
      p.start = start;
      p.finish = finish;
      currentFinish = finish;
    });

    // Criar o timeline de cada processo
    const simulation = sorted.map((p) => {
      const timeline = Array(totalTime).fill("idle"); // Inicialmente tudo cinza claro

      // Preencher o timeline com base nos estados
      for (let t = 0; t < totalTime; t++) {
        if (t < p.chegada) {
          timeline[t] = "idle"; // Cinza claro antes da chegada
        } else if (t >= p.start && t < p.finish) {
          timeline[t] = "execute"; // Verde durante a execução
        } else if (t >= p.finish) {
          timeline[t] = "completed"; // Cinza escuro após o término
        } else {
          timeline[t] = "wait"; // Amarelo enquanto espera
        }
      }

      return {
        id: p.id,
        timeline,
        arrival: p.chegada,
        start: p.start,
        finish: p.finish,
      };
    });

    setSimulationData(simulation);

    // Calcular o Turnaround Médio
    const totalTurnaround = sorted.reduce((acc, p) => {
      const tat = p.finish - p.chegada;
      return acc + tat;
    }, 0);

    const averageTurnaround = totalTurnaround / sorted.length;
    setTurnaroundAvg(averageTurnaround);
  }, [processData]);

  return (
    <div className="simulation-container">
      <h3>Simulação FIFO</h3>

      {simulationData.map((p) => (
        <div key={p.id} className="process-row">
          <h4>
            Processo {p.id} (Chegou: {p.arrival}, Início: {p.start}, Término: {p.finish })
          </h4>
          <div className="process-timeline">
            {p.timeline.map((state, index) => (
              <div
                key={index}
                className={`timeline-block ${
                  state === "execute"
                    ? "green"
                    : state === "wait"
                    ? "yellow"
                    : state === "idle"
                    ? "light-gray"
                    : state === "completed"
                    ? "dark-gray"
                    : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {index}
              </div>
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
