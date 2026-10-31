'use client';

import { useState, useMemo } from 'react';
import { Delta } from './Delta';

/**
 * DataTable — Tabla de especies de Infopeso Pulso
 * Cumple estrictamente brand/componentes/DataTable/README.md:
 * - Contenedor surface-100 con borde line y radio radius-md, overflow-x: auto
 * - Primera columna: ticker en Bricolage Grotesque 700 15px + nombre debajo en ink-subtle 12px
 * - Columnas numéricas: Geist Mono 400 14px, tabular-nums, alineadas a la derecha
 * - Encabezados: estilo label en ink-subtle, <th scope="col">, columna activa marcada con ▲/▼
 * - Filas: padding space-3 × space-4, divisor 1px line, hover surface-200, sin filas cebra
 */
export function DataTable({
    columns = [],
    rows = [],
    initialSortKey = null,
    initialSortDir = 'desc',
    onRowClick,
    emptyMessage = 'Sin datos disponibles.',
}) {
    const [sortKey, setSortKey] = useState(initialSortKey);
    const [sortDir, setSortDir] = useState(initialSortDir);

    const handleSort = (col) => {
        if (!col.sortable) return;
        if (sortKey === col.key) {
            setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(col.key);
            setSortDir('desc');
        }
    };

    const sortedRows = useMemo(() => {
        if (!sortKey) return rows;
        const col = columns.find((c) => c.key === sortKey);
        if (!col) return rows;
        return [...rows].sort((a, b) => {
            const valA = col.sortValue ? col.sortValue(a) : a[sortKey];
            const valB = col.sortValue ? col.sortValue(b) : b[sortKey];
            if (valA === null || valA === undefined || Number.isNaN(valA)) return 1;
            if (valB === null || valB === undefined || Number.isNaN(valB)) return -1;
            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortDir === 'asc' ? valA.localeCompare(valB, 'es-AR') : valB.localeCompare(valA, 'es-AR');
            }
            return sortDir === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
        });
    }, [rows, sortKey, sortDir, columns]);

    return (
        <div
            style={{
                background: 'var(--surface-100)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                overflowX: 'auto',
            }}
        >
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '520px',
                }}
            >
                <thead>
                    <tr>
                        {columns.map((col, idx) => {
                            const isFirst = idx === 0;
                            const isActive = sortKey === col.key;
                            const align = col.align || (isFirst ? 'left' : 'right');
                            return (
                                <th
                                    key={col.key}
                                    scope="col"
                                    onClick={() => handleSort(col)}
                                    className="label"
                                    style={{
                                        color: isActive ? 'var(--ink)' : 'var(--ink-subtle)',
                                        textAlign: align,
                                        padding: 'var(--space-3) var(--space-4)',
                                        borderBottom: '1px solid var(--line)',
                                        cursor: col.sortable ? 'pointer' : 'default',
                                        userSelect: 'none',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {col.header}
                                    {isActive && (
                                        <span style={{ marginLeft: 'var(--space-1)', color: 'var(--signal-text)' }}>
                                            {sortDir === 'asc' ? '▲' : '▼'}
                                        </span>
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {sortedRows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="body-sm"
                                style={{
                                    padding: 'var(--space-6)',
                                    textAlign: 'center',
                                    color: 'var(--ink-subtle)',
                                }}
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        sortedRows.map((row, rowIdx) => {
                            const isLast = rowIdx === sortedRows.length - 1;
                            return (
                                <tr
                                    key={row.id || row.symbol || row.ticker || rowIdx}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                    style={{
                                        cursor: onRowClick ? 'pointer' : 'default',
                                        transition: 'background-color 150ms ease-out',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--surface-200)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    {columns.map((col, colIdx) => {
                                        const isFirst = colIdx === 0;
                                        const align = col.align || (isFirst ? 'left' : 'right');
                                        const cellBorder = isLast ? '0' : '1px solid var(--line)';

                                        if (isFirst && (row.ticker || row.symbol) && !col.render) {
                                            return (
                                                <td
                                                    key={col.key}
                                                    style={{
                                                        padding: 'var(--space-3) var(--space-4)',
                                                        borderBottom: cellBorder,
                                                        textAlign: 'left',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            display: 'block',
                                                            fontFamily: 'var(--font-display)',
                                                            fontWeight: 700,
                                                            fontSize: '15px',
                                                            lineHeight: 1.2,
                                                            letterSpacing: '-0.01em',
                                                            color: 'var(--ink)',
                                                        }}
                                                    >
                                                        {row.ticker || row.symbol}
                                                    </span>
                                                    {row.name && (
                                                        <span
                                                            style={{
                                                                display: 'block',
                                                                fontFamily: 'var(--font-display)',
                                                                fontWeight: 400,
                                                                fontSize: '12px',
                                                                lineHeight: 1.3,
                                                                color: 'var(--ink-subtle)',
                                                            }}
                                                        >
                                                            {row.name}
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        }

                                        if (col.type === 'delta') {
                                            const dVal = row[col.key];
                                            return (
                                                <td
                                                    key={col.key}
                                                    className="data"
                                                    style={{
                                                        padding: 'var(--space-3) var(--space-4)',
                                                        borderBottom: cellBorder,
                                                        textAlign: align,
                                                    }}
                                                >
                                                    <Delta
                                                        value={dVal}
                                                        unit={col.unit || '%'}
                                                        decimals={col.decimals ?? 2}
                                                        compact={true}
                                                        pill={false}
                                                    />
                                                </td>
                                            );
                                        }

                                        const rendered = col.render ? col.render(row) : row[col.key];
                                        const displayContent =
                                            rendered === null || rendered === undefined || rendered === '' ? '—' : rendered;

                                        return (
                                            <td
                                                key={col.key}
                                                className="data"
                                                style={{
                                                    padding: 'var(--space-3) var(--space-4)',
                                                    borderBottom: cellBorder,
                                                    textAlign: align,
                                                    color: col.muted ? 'var(--ink-muted)' : 'var(--ink)',
                                                }}
                                            >
                                                {displayContent}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
