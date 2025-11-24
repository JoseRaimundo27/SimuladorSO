import { useEffect, useState, useRef } from "react";
import TimelineBlock from "../../components/TimelineBlock/";
import { IoMdPlay, IoMdPause } from "react-icons/io";
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import { RiResetLeftFill } from "react-icons/ri";
import { AiFillThunderbolt } from "react-icons/ai";

import "../style.css";

export default function Simulation({ algorithm, processData, quantum = 1, periodo = 1,  overhead = 1 }) {
    const [simulationData, setSimulationData] = useState([]);
    const moment = useRef(0);
    const lastTick = useRef(Date.now());
    const [majorTime, setMajorTime] = useState(0);
    const [minorTime, setMinorTime] = useState(0);
    const [finalTime, setFinalTime] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [simulationState, setSimulationState] = useState('paused');


    useEffect(() => {
        const interval = setInterval(() => {
            if (finalTime === majorTime)
                setSimulationState('paused');
            if (simulationState != 'running')
                return;

            moment.current += (Date.now() - lastTick.current) * speed / 1000;
            lastTick.current = Date.now();

            var mj = Math.floor(moment.current);
            setMinorTime(moment.current - mj);
            if (mj != majorTime) {
                setMajorTime(mj);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [finalTime, majorTime, simulationState, speed])

useEffect(() => {
    let time = 0;

    // Inicializar processos
    processData.forEach(p => {
        p.timeline = [];
        p.nextRelease = p.chegada;
        p.nextDeadline = p.chegada + p.periodo;
        p.remain = 0; // job começa apenas na chegada
    });

    while (time < 500) {

        // 1) Liberar novos jobs
        processData.forEach(p => {
            if (time === p.nextRelease) {
                p.remain = p.tempo;                 // novo job
                p.nextRelease += p.periodo;         // próxima liberação
                p.nextDeadline += p.periodo;        // próxima deadline
            }
        });


        // 2) Verificar deadlines perdidos
        processData.forEach(p => {
            if (time === p.nextDeadline && p.remain > 0) {
                p.timeline.push("over");
                p.remain = 0; // descarta job perdido
            }
        });


        // 3) Escolher processo pelo RM (menor período > maior prioridade)
        const ready = processData.filter(p => p.remain > 0 && time >= p.chegada);

        let current = null;
        if (ready.length > 0) {
            current = ready.sort((a, b) => a.periodo - b.periodo)[0];
        }


        // 4) Preencher timeline de todos os processos
        processData.forEach(p => {
            if (p.remain === 0 && time < p.nextRelease) {
                p.timeline.push("idle");
            } 
            else if (current && p.id === current.id) {
                p.timeline.push("exe");
                p.remain--;
            }
            else if (p.remain > 0) {
                p.timeline.push("wait");
            }
            else {
                p.timeline.push("idle");
            }
        });

        time++;
    }

    setSimulationData(processData);
    setFinalTime(time);

}, []);


    function getAVGTurnaround(time) {
        var turnaround = 0;

        simulationData.map(p => {
            for (var i = 0; i < time && i < p.timeline.length; i++) {
                if (['wait', 'over', 'exe', 'loading'].includes(p.timeline[i]))
                    turnaround++;
            }
        });

        return turnaround / processData.length;
    }

    function getStatus(process, time) {
        var index = minorTime === 0 ? time - 1 : time;
        if (index < 0)
            return '';
        else if (index >= finalTime)
            return 'Finalizado';

        switch (process.timeline[index]) {
            case 'exe':
                return "Em Execução";
            case 'wait':
                return "Em Espera";
            case 'over':
                return "Sobrecarga";
            case 'idle':
                return "Não carregado";
            case 'end':
                return "Finalizado";
        }
    }

    function handleChangeSpeed(e) {
        setSpeed(e.target.value);
    }
    function handleTogglePlay() {
        if (simulationState === 'running') {
            setSimulationState('paused');
        }
        else {
            lastTick.current = Date.now();
            setSimulationState('running');
        }
    }
    function handlePrevious() {
        if (majorTime > 0) {
            moment.current = majorTime - 1;
            setMajorTime(majorTime - 1);
        } else {
            moment.current = 0;
        }
        setMinorTime(0);
    }
    function handleNext() {
        if (majorTime < finalTime) {
            moment.current = majorTime + 1;
            setMajorTime(majorTime + 1);
        } else {
            moment.current = finalTime;
        }
        setMinorTime(0);
    }
    function handleReset() {
        moment.current = 0;
        setMajorTime(0);
        setMinorTime(0);
        setSimulationState("paused");
    }
    function handleFinish() {
        moment.current = finalTime;
        setMajorTime(finalTime);
        setMinorTime(0);
        setSimulationState("paused");
    }


    return (
        <>
            <h3>Simulação {algorithm.toUpperCase()}</h3>
            <div>
                <button className="simulation-controller-button" onClick={handleReset}>
                    <RiResetLeftFill size={32} />
                </button>
                <button
                    className="simulation-controller-button"
                    disabled={simulationState !== 'paused' || majorTime === 0 && minorTime === 0}
                    onClick={handlePrevious}>
                    <MdSkipPrevious size={32} />
                </button>
                <button
                    className="simulation-controller-button"
                    onClick={handleTogglePlay}
                    disabled={majorTime === finalTime}>
                    {simulationState !== 'running' && (<IoMdPlay size={32} />)}
                    {simulationState !== 'paused' && (<IoMdPause size={32} />)}
                </button>
                <button
                    className="simulation-controller-button"
                    disabled={simulationState !== 'paused' || majorTime === finalTime}
                    onClick={handleNext}>
                    <MdSkipNext size={32} />
                </button>
                <button className="simulation-controller-button" onClick={handleFinish}>
                    <AiFillThunderbolt size={32} />
                </button>
            </div>
            <div className="simulation-speed">
                <div>
                    <input disabled={simulationState !== 'paused'} type="range" id="speed" name="speed" min="0.1" max="4" step="0.1" value={speed} onChange={handleChangeSpeed} />
                    <label htmlFor="speed">Clock Speed: {parseFloat(speed).toFixed(1)}</label>
                </div>
                <span>
                    Tempo: {majorTime}
                </span>
            </div>
            <div className="simulation-container">

                {simulationData.map((p) => (
                    <div key={p.id} className="process-row">
                        <h4>
                            <strong>Processo {p.id}</strong>
                            <br></br>
                            {getStatus(p, majorTime)}
                        </h4>
                        <div className="process-timeline">
                            {p.timeline.map((state, index) => (
                                <TimelineBlock key={index} {...{ state, index, majorTime, minorTime }} />
                            ))}
                        </div>
                    </div>
                ))}

            </div>
            <div className="turnaround-info">
                <h4>Turnaround Médio: {getAVGTurnaround(majorTime).toFixed(2)}</h4>
            </div>
           
        </>
    );
}