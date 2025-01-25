import React, { useState, useEffect } from "react";
import "../style.css";

function RoundRobinSimulation({ processData, quantum, overhead }) {
  const [simulationData, setSimulationData] = useState([]);
  const [turnaroundAvg, setTurnaroundAvg] = useState(0);
  const [alreadySimulated, setAlreadySimulated] = useState(false); // Controle para evitar múltiplas execuções

  useEffect(() => {
    if (alreadySimulated) return; // Se já simulou, não executa novamente

    // Clonar e inicializar os processos
    const processes = processData.map((p) => ({
      ...p,
      remainingTime: p.tempo,
      start: null,
      finish: null,
      executed: false,
    }));

    const cpuSchedule = []; // Registro da CPU em cada instante de tempo, { state, processId }
    const readyQueue = []; // Fila de processos prontos para executar
    let currentTime = 0; // Relógio da simulação
    let completed = 0; // Contador de processos finalizados
    const n = processes.length;
    const validOverhead = overhead || 1; // Definir overhead padrão

    console.log("Início da simulação");
    console.log(`Overhead definido: ${validOverhead}`);

    // Adicionar processos que já chegaram no início
    processes.forEach((p) => {
      if (p.chegada <= currentTime) {
        readyQueue.push(p);
        console.log(`Processo ${p.id} entrou na fila de espera`);
      }
    });

    while (completed < n) {
      // Adicionar novos processos que chegaram até o currentTime
      processes.forEach((p) => {
        if (
          p.chegada <= currentTime &&
          !p.executed &&
          !readyQueue.includes(p)
        ) {
          readyQueue.push(p);
          console.log(`Processo ${p.id} entrou na fila de espera`);
        }
      });

      // Log da fila de espera
      console.log(
        "Fila de espera:",
        readyQueue.map((p) => `P${p.id}(restante: ${p.remainingTime})`)
      );

      if (readyQueue.length > 0) {
        // Pegar o primeiro processo da fila
        const currentProcess = readyQueue.shift();
        console.log(`Executando processo ${currentProcess.id}`);

        // Marcar o início do processo (se ainda não foi iniciado)
        if (currentProcess.start === null) {
          currentProcess.start = currentTime;
          console.log(
            `Processo ${currentProcess.id} iniciou no tempo ${currentTime}`
          );
        }

        // Determinar o tempo de execução (quantum ou tempo restante)
        const executionTime = Math.min(quantum, currentProcess.remainingTime);
        console.log(
          `Processo ${currentProcess.id} será executado por ${executionTime} unidades de tempo`
        );

        // Executar o processo
        for (let t = 0; t < executionTime; t++) {
          // Atribuir o estado "execute" para o processo atual
          cpuSchedule.push({ state: "execute", processId: currentProcess.id });

          // Incrementar o tempo
          currentTime++;
        }

        // Reduzir o tempo restante
        currentProcess.remainingTime -= executionTime;

        if (currentProcess.remainingTime === 0) {
          // Processo concluído
          currentProcess.finish = currentTime;
          currentProcess.executed = true;
          completed++;
          console.log(`Processo ${currentProcess.id} concluído no tempo ${currentTime}`);
        } else {
          // Processo será preemptado e reinserido na fila
          // Adicionar overhead, se houver
          if (validOverhead > 0) {
            for (let o = 0; o < validOverhead; o++) {
              cpuSchedule.push({ state: "overhead", processId: currentProcess.id });
              console.log(`Overhead de 1 unidade adicionado no tempo ${currentTime}`);
              currentTime++;
            }
          }

          // Reinsere o processo no final da fila
          readyQueue.push(currentProcess);
          console.log(
            `Processo ${currentProcess.id} foi reinserido na fila com ${currentProcess.remainingTime} restantes`
          );
        }
      } else {
        // Se nenhum processo está disponível, a CPU está ociosa
        cpuSchedule.push({ state: "idle", processId: null });
        console.log(`CPU ociosa no tempo ${currentTime}`);
        currentTime++;
      }
    }

    console.log("Fim da simulação");

    // Definir um tempo máximo para as timelines (ajuste conforme necessário)
    const desiredMaxTime = 12;
    const maxTime = desiredMaxTime;

    // Pad cpuSchedule com 'idle' até maxTime
    while (cpuSchedule.length < maxTime) {
      cpuSchedule.push({ state: "idle", processId: null });
    }

    // Gerar as timelines para cada processo
    const simulationWithTimelines = processes.map((p) => {
      const timeline = [];
      for (let t = 0; t < maxTime; t++) {
        if (t < p.chegada) {
          timeline.push("not-arrived"); // Processo ainda não chegou
        } else if (
          cpuSchedule[t] &&
          cpuSchedule[t].state === "execute" &&
          cpuSchedule[t].processId === p.id
        ) {
          timeline.push("execute"); // Processo está executando
        } else if (
          cpuSchedule[t] &&
          cpuSchedule[t].state === "overhead" &&
          cpuSchedule[t].processId === p.id
        ) {
          timeline.push("overhead"); // Tempo de troca de contexto
        } else if (
          p.chegada <= t &&
          !p.executed &&
          p.remainingTime > 0 &&
          (!cpuSchedule[t] || (cpuSchedule[t].state !== "execute" && cpuSchedule[t].state !== "overhead"))
        ) {
          timeline.push("waiting"); // Processo está esperando
        } else if (p.finish && t >= p.finish) {
          timeline.push("finished"); // Processo já finalizado
        } else {
          timeline.push("idle"); // Estado geral de espera ou CPU ociosa
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

    // Logar a timeline de todos os processos no console
    simulationWithTimelines.forEach((process) => {
      console.log(
        `Processo ${process.id}: Timeline completa`,
        process.timeline.map((state, index) => `t=${index}:${state}`).join(", ")
      );
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

    // Marca a simulação como concluída
    setAlreadySimulated(true);
  }, [alreadySimulated, processData, quantum, overhead]);

  return (
    <div className="simulation-container">
      <h3>Simulação Round Robin</h3>

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
                  state === "execute"
                    ? "green"
                    : state === "idle"
                    ? "yellow"
                    : state === "not-arrived"
                    ? "gray"
                    : state === "overhead"
                    ? "red"
                    : state === "finished"
                    ? "lightgray"
                    : "idle"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                title={`t=${index}`}
              >
                {/* Opcional: Exibir o tempo */}
                {/* {index} */}
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

export default RoundRobinSimulation;
