import { useState } from 'react';

export function BinaryToggleButton({ onToggle, options = ['Mensual', 'Semanal'] }) {
    const [selected, setSelected] = useState(options[1]);

    const handleToggle = (option) => {
        setSelected(option);
        onToggle(option);
    };

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {options.map((opt) => (
                <button
                    key={opt}
                    type="button"
                    onClick={() => handleToggle(opt)}
                    className={selected === opt ? 'pill-active' : 'pill-inactive'}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}
