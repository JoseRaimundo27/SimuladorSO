import React, { useState, useEffect } from "react";
import TimelineBlock from "../../components/TimelineBlock/"; // 
import "../style.css";

function SJFSimulation({ processData }) {
  const [simulationData, setSimulationData] = useState([]);
  const [turnaroundAvg, setTurnaroundAvg] = useState(0);
  const [alreadySimulated, setAlreadySimulated] = useState(false);

  useEffect(() => {
    if (alreadySimulated) return;

    const processes = processData.map((p) => ({
      ...p,
      remainingTime: p.tempo,
      start: null,
      finish: null,
      executed: false,
    }));

    const cpuSchedule = [];
    let currentTime = 0;
    let completed = 0;
    const n = processes.length;

    while (completed < n) {
      // Filtrar processos que já chegaram e não foram concluídos
      const readyQueue = processes.filter(
        (p) => p.chegada <= currentTime && !p.executed
      );

      // Escolher o processo com menor tempo restante
      if (readyQueue.length > 0) {
        const currentProcess = readyQueue.reduce((min, p) =>
          p.remainingTime < min.remainingTime ? p : min
        );

        // Marcar o início do processo (se ainda não foi iniciado)
        if (currentProcess.start === null) {
          currentProcess.start = currentTime;
        }

        // Executar o processo até terminar
        while (currentProcess.remainingTime > 0) {
          cpuSchedule.push({ state: "execute", processId: currentProcess.id });
          currentProcess.remainingTime--;
          currentTime++;
        }

        // Processo concluído
        currentProcess.finish = currentTime;
        currentProcess.executed = true;
        completed++;
      } else {
        // CPU ociosa
        cpuSchedule.push({ state: "idle", processId: null });
        currentTime++;
      }
    }

    // Determinar tempo máximo para timelines (ajuste conforme necessário)
    const maxTime = currentTime;

    // Gerar timelines para os processos
    const simulationWithTimelines = processes.map((p) => {
      const timeline = [];
      for (let t = 0; t < maxTime; t++) {
        if (t < p.chegada) {
          timeline.push("idle");
        } else if (
          cpuSchedule[t] &&
          cpuSchedule[t].state === "execute" &&
          cpuSchedule[t].processId === p.id
        ) {
          timeline.push("execute");
        } else if (p.finish && t >= p.finish) {
          timeline.push("completed");
        } else {
          timeline.push("wait");
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

    // Atualizar o estado com os dados da simulação
    setSimulationData(simulationWithTimelines);

    // Calcular o Turnaround Médio
    const totalTurnaround = processes.reduce(
      (acc, p) => acc + (p.finish - p.chegada),
      0
    );
    const averageTurnaround = totalTurnaround / processes.length;
    setTurnaroundAvg(averageTurnaround);

    setAlreadySimulated(true);
  }, [alreadySimulated, processData]);

  return (
    <div className="simulation-container">
      <h3>Simulação SJF (Shortest Job First)</h3>

      {simulationData.map((p) => (
        <div key={p.id} className="process-row">
          <h4>
            Processo {p.id} (chegou {p.arrival}, iniciou {p.start}, terminou{" "}
            {p.finish})
          </h4>
          <div className="process-timeline">
            {p.timeline.map((state, index) => (
              <TimelineBlock
                key={index}
                state={state} 
                index={index} 
              />
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
