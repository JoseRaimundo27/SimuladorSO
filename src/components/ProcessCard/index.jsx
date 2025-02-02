// ProcessCard.js
import React from "react";
import "./style.css";
import { MEMORY_CAPACITY } from "../../memory/memory";

function ProcessCard({ process, index, onChange, algorithm, disabled }) {
  return (
    <div className="process-config-card">
      <h4>Processo {process.id}:</h4>
      <div className="card-labels">
        <label>
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
        <label>
          Páginas:
          <input
            type="number"
            min="1"
            max={MEMORY_CAPACITY}
            value={process.paginas}
            onChange={(e) => onChange(index, "paginas", e.target.value)}
            disabled={disabled}
          />
        </label>
        <label>
          Deadline:
          <input
            type="number"
            min="0"
            value={process.deadline}
            onChange={(e) => onChange(index, "deadline", e.target.value)}
            disabled={disabled || (algorithm != "edf") }
          />
        </label>
        <label>
          Chegada:
          <input
            type="number"
            min="0"
            value={process.chegada}
            onChange={(e) => onChange(index, "chegada", e.target.value)}
            disabled={disabled }
          />
        </label>
      </div>
    </div>
  );
}

export default ProcessCard;
