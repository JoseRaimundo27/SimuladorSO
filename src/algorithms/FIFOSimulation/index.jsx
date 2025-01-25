import React, { useState, useEffect } from "react";
import "../style.css";

function FIFOSimulation({ processData }) {
  const [simulationData, setSimulationData] = useState([]);
  const [turnaroundAvg, setTurnaroundAvg] = useState(0);

  useEffect(() => {
    // 1) Ordenar os processos pela hora de chegada
    const sorted = [...processData].sort((a, b) => a.chegada - b.chegada);

    // 2) Calcular start e finish de cada processo em ordem FIFO
    let currentFinish = 0;
    sorted.forEach((p) => {
      const start = Math.max(p.chegada, currentFinish);
      const finish = start + p.tempo;
      p.start = start;
      p.finish = finish;
      currentFinish = finish;
    });

    // 3) Montar o timeline de cada processo
    const simulation = sorted.map((p) => {
      // Se você quer mostrar até o tempo finish do processo
      const timeline = Array(p.finish).fill("wait");

      // Preencher de 'start' até 'finish - 1' como "execute"
      for (let t = p.start; t < p.finish; t++) {
        timeline[t] = "execute";
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

    // 4) Calcular Turnaround Médio
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
            Processo {p.id} (chegou {p.arrival}, 
            iniciou {p.start}, terminou {p.finish})
          </h4>
          <div className="process-timeline">
            {p.timeline.map((state, index) => (
              <div
                key={index}
                className={`timeline-block ${
                  state === "execute"
                    ? "green"
                    : "wait"
                }`}
                // Exemplo de delay para animação:
                style={{ animationDelay: `${index * 0.5}s` }}
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
