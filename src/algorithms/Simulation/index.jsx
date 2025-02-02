import { useEffect, useState, useRef } from "react";
import "../style.css";
import TimelineBlock from "../../components/TimelineBlock/";
import { IoMdPlay, IoMdPause } from "react-icons/io";
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import { RiResetLeftFill } from "react-icons/ri";

export default function Simulation({ algorithm, processData, quantum = 1, overhead = 1 }) {
    const [simulationData, setSimulationData] = useState([]);
    const moment = useRef(0);
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

            moment.current = moment.current + 0.05 * speed;
            var mj = Math.floor(moment.current);
            setMinorTime(moment.current - mj);
            if (mj != majorTime) {
                setMajorTime(mj);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [finalTime, majorTime, simulationState, speed])
    useEffect(() => {
        var time = 0;
        processData.forEach(p => {
            p.remainTime = p.tempo;
            p.timeline = [];
            p.marked = false;
        });
        var remainQuantum = quantum;
        var currentProcess = null;
        var remainOverhead = 0;
        while (true) {
            var activeProcesses = processData.filter(p => p.remainTime > 0);
            if (activeProcesses.length === 0) break;


            if (remainQuantum === quantum && remainOverhead === 0 || currentProcess?.remainTime === 0) {
                activeProcesses = activeProcesses.filter(p => p.chegada <= time);

                if (algorithm === "round_robin") {
                    if (activeProcesses.filter(p => !p.marked).length === 0) {
                        activeProcesses.map(p => p.marked = false);
                    }
                    activeProcesses = activeProcesses.filter(p => !p.marked)
                }

                if (algorithm === "fifo" || algorithm === "round_robin")
                    currentProcess = activeProcesses.sort((p, q) => p.chegada - q.chegada)[0];
                else if (algorithm === "sjf")
                    currentProcess = activeProcesses.sort((p, q) => p.tempo - q.tempo)[0];
                else if (algorithm === "edf") {
                    currentProcess = activeProcesses.sort((p, q) => p.deadline - q.deadline)[0];
                }
            }

            processData.forEach(p => {
                if (p.remainTime == 0) {
                    p.timeline.push('end');
                } else if (p.chegada > time) {
                    p.timeline.push('idle');
                } else if (p.id === currentProcess?.id) {
                    if (remainQuantum > 0) {
                        p.timeline.push('exe');
                        p.remainTime--;
                        remainOverhead = overhead;
                    } else {
                        p.timeline.push('over');
                        p.marked = true;
                        remainOverhead--;
                    }
                } else {
                    p.timeline.push('wait');
                }
            });
            time++;
            if (algorithm === "edf" || algorithm === "round_robin") remainQuantum--;
            if (remainQuantum < 0 && remainOverhead === 0 || currentProcess?.remainTime === 0) remainQuantum = quantum;
        }
        setSimulationData(processData);
        setFinalTime(time);
    }, [])

    function getAVGTurnaround(time) {
        var turnaround = 0;

        simulationData.map(p => {
            for (var i = 0; i < time && i < p.timeline.length; i++) {
                if (['wait', 'over', 'exe'].includes(p.timeline[i]))
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
        if (simulationState === 'running')
            setSimulationState('paused');
        else
            setSimulationState('running');
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

    return (
        <>
            <h3>Simulação {algorithm}</h3>
            <div>
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
                <button className="simulation-controller-button" onClick={handleReset}>
                    <RiResetLeftFill size={32} />
                </button>
            </div>
            <div className="simulation-speed">
                <input disabled={simulationState !== 'paused'} type="range" id="speed" name="speed" min="0.1" max="2" step="0.1" onChange={handleChangeSpeed} />
                <label htmlFor="speed">Clock Speed: {parseFloat(speed).toFixed(1)} Tempo: {majorTime}</label>
            </div>
            <div className="simulation-container">

                {simulationData.map((p) => (
                    <div key={p.id} className="process-row">
                        <h4>
                            Processo {p.id}
                            <br></br>
                            {getStatus(p, majorTime)}
                        </h4>
                        <div className="process-timeline">
                            {p.timeline.map((state, index) => (
                                <TimelineBlock key={index} state={state} index={index} majorTime={majorTime} minorTime={minorTime} />
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