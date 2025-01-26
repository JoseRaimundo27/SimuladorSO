import React, { useState, useEffect } from "react";
import TimelineBlock from "../../components/TimelineBlock"; 
import "../style.css";

function EDFSimulation({ processData, quantum, overhead }) {
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
    const readyQueue = [];
    const n = processes.length;
    const validOverhead = overhead || 1;

    // Adiciona processos prontos na fila, ordenando pelo deadline
    const updateReadyQueue = () => {
      processes.forEach((p) => {
        if (
          p.chegada <= currentTime &&
          !p.executed &&
          !readyQueue.includes(p)
        ) {
          readyQueue.push(p);
        }
      });
      // Ordena pelo deadline
      readyQueue.sort((a, b) => a.deadline - b.deadline);
    };

    // Inicializa a fila de prontos
    updateReadyQueue();

    while (completed < n) {
      updateReadyQueue();

      if (readyQueue.length > 0) {
        const currentProcess = readyQueue.shift();

        if (currentProcess.start === null) {
          currentProcess.start = currentTime;
        }

        const executionTime = Math.min(quantum, currentProcess.remainingTime);

        for (let t = 0; t < executionTime; t++) {
          cpuSchedule.push({ state: "execute", processId: currentProcess.id });
          currentTime++;
        }

        currentProcess.remainingTime -= executionTime;

        if (currentProcess.remainingTime === 0) {
          currentProcess.finish = currentTime;
          currentProcess.executed = true;
          completed++;
        } else {
          if (validOverhead > 0) {
            for (let o = 0; o < validOverhead; o++) {
              cpuSchedule.push({
                state: "overhead",
                processId: currentProcess.id,
              });
              currentTime++;
            }
          }
          readyQueue.push(currentProcess);
        }
      } else {
        cpuSchedule.push({ state: "idle", processId: null });
        currentTime++;
      }
    }

    const maxTime = cpuSchedule.length;

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
        } else if (
          cpuSchedule[t] &&
          cpuSchedule[t].state === "overhead" &&
          cpuSchedule[t].processId === p.id
        ) {
          timeline.push("overhead");
        } else if (
          p.chegada <= t &&
          !p.executed &&
          p.remainingTime > 0 &&
          (!cpuSchedule[t] || (cpuSchedule[t].state !== "execute" && cpuSchedule[t].state !== "overhead"))
        ) {
          timeline.push("wait");
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

    setSimulationData(simulationWithTimelines);

    const totalTurnaround = processes.reduce(
      (acc, p) => acc + (p.finish - p.chegada),
      0
    );
    setTurnaroundAvg(totalTurnaround / processes.length);
    setAlreadySimulated(true);
  }, [alreadySimulated, processData, quantum, overhead]);

  return (
    <div className="simulation-container">
      <h3>Simulação EDF (Earliest Deadline First)</h3>

      {simulationData.map((p) => (
        <div key={p.id} className="process-row">
          <h4>
            Processo {p.id} (chegou {p.arrival}, iniciou {p.start}, terminou{" "}
            {p.finish})
          </h4>
          <div className="process-timeline">
            {p.timeline.map((state, index) => (
              <TimelineBlock key={index} state={state} index={index} />
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

export default EDFSimulation;
