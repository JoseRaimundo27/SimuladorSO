import React, { useState, useEffect } from "react";
import "../style.css";

function SJFSimulation({ processData }) {
  const [simulationData, setSimulationData] = useState([]);
  const [turnaroundAvg, setTurnaroundAvg] = useState(0);

  useEffect(() => {
    // Clonar os dados para evitar modificar o array original
    const processes = [...processData];
    const simulation = processes.map(() => []); // Criar as timelines para os processos

    let currentTime = 0; // Relógio da simulação
    let completed = 0; // Contador de processos finalizados
    const n = processes.length;

    const waitingQueue = []; // Fila de espera para processos disponíveis

    // Marcar os processos como "não executados"
    processes.forEach((p) => {
      p.start = null;
      p.finish = null;
      p.executed = false;
    });

    while (completed < n) {
      // Adicionar processos que chegaram ao sistema na fila de espera
      processes.forEach((p) => {
        if (p.chegada <= currentTime && !p.executed && !waitingQueue.includes(p)) {
          waitingQueue.push(p);
        }
      });

      // Ordenar a fila de espera pelo menor tempo de execução (SJF)
      waitingQueue.sort((a, b) => a.tempo - b.tempo);

      if (waitingQueue.length > 0) {
        // Pegar o primeiro processo da fila (menor tempo)
        const shortestProcess = waitingQueue.shift();

        // Atualizar os tempos de início e término
        shortestProcess.start = currentTime;
        shortestProcess.finish = currentTime + shortestProcess.tempo;

        // Atualizar a timeline do processo
        const processTimeline = Array(shortestProcess.finish).fill("wait");
        for (let t = shortestProcess.start; t < shortestProcess.finish; t++) {
          processTimeline[t] = "execute";
        }
        simulation[shortestProcess.id - 1] = processTimeline;

        // Atualizar o tempo atual e marcar como executado
        currentTime = shortestProcess.finish;
        shortestProcess.executed = true;

        // Incrementar o contador de processos finalizados
        completed++;
      } else {
        // Se nenhum processo está disponível, avançar o tempo
        currentTime++;
      }
    }

    // Atualizar os dados de simulação
    const simulationWithTimelines = processes.map((p, index) => ({
      id: p.id,
      timeline: simulation[index],
      arrival: p.chegada,
      start: p.start,
      finish: p.finish,
    }));

    setSimulationData(simulationWithTimelines);

    // Calcular o Turnaround Médio
    const totalTurnaround = processes.reduce(
      (acc, p) => acc + (p.finish - p.chegada),
      0
    );
    const averageTurnaround = totalTurnaround / processes.length;
    setTurnaroundAvg(averageTurnaround);
  }, [processData]);

  return (
    <div className="simulation-container">
      <h3>Simulação SJF</h3>

      {simulationData.map((p) => (
        <div key={p.id} className="process-row">
          <h4>
            Processo {p.id} (chegou {p.arrival}, iniciou {p.start}, terminou{" "}
            {p.finish})
          </h4>
          <div className="process-timeline">
            {p.timeline.map((state, index) => (
              <div
                key={index}
                className={`timeline-block ${
                  state === "execute" ? "green" : "wait"
                }`}
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

export default SJFSimulation;
