import { useState } from "react";

export function BinaryToggleButton({ onToggle, options = ["Mensual", "Semanal"] }) {
    const [selected, setSelected] = useState(options[1]);

    const handleToggle = (option) => {
        setSelected(option);
        onToggle(option);
    };

    return (
        <div
            className="flex items-center gap-0.5 p-0.5 rounded-full"
            style={{
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-subtle)',
            }}
        >
            {options.map((opt) => (
                <button
                    key={opt}
                    onClick={() => handleToggle(opt)}
                    className={selected === opt ? 'pill-active' : 'pill-inactive'}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}
