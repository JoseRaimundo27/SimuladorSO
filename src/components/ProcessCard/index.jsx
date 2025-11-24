// ProcessCard.js
import React, { useEffect } from "react";


import "./style.css";

function ProcessCard({ process, index, onChange, algorithm, disabled }) {
  const disableTime = disabled;
  const disablePages = disabled;
  const disableDeadline = disabled || (algorithm != "edf")  ;
  const disableArrival = disabled || index === 0;

  useEffect(() => {
    if (process.periodo < process.tempo) {
      onChange(index, "periodo", process.tempo);
    }

    if (process.deadline < process.tempo) {
      onChange(index, "deadline", process.tempo);
    }

  }, [process.tempo, process.periodo, process.deadline, algorithm]);

  return (
    <div className="process-config-card">
      <h4>Processo {process.id}:</h4>
      <div className="card-labels">
        <label className={`process-config-label ${disableTime ? "disabled" : ""}`}>
          Tempo:
          <input
            type="number"
            min="1"
            max="20"
            value={process.tempo}
            onChange={(e) => onChange(index, "tempo", e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className={`process-config-label ${disablePages ? "disabled" : ""}`}>
          Periodo:
          <input
            type="number"
            min={process.tempo}
            max="10"
            value={process.periodo}
            onChange={(e) => onChange(index, "periodo", Math.max(process.tempo, Number(e.target.value)))}
            disabled={disabled}
          />
        </label>
        <label  className={`process-config-label ${disableDeadline ? "disabled" : ""}`}>
          Deadline:
          <input
            type="number"
            min="1"
            value={process.deadline}
            onChange={(e) => onChange(index, "deadline", Number(e.target.value))}
            disabled={disabled || (algorithm != "edf")}
          />
        </label>
        <label className={`process-config-label ${disableArrival ? "disabled" : ""}`}>
          Chegada:
          <input
            type="number"
            min="0"
            value={process.chegada}
            onChange={(e) => onChange(index, "chegada", e.target.value)}
            disabled={disabled || index === 0}
          />
        </label>
      </div>
    </div>
  );
}

export default ProcessCard;
