import { Fragment } from 'react';

// Renderizador mínimo de texto de guías: párrafos, listas (- / 1.), tablas con | y **negritas**.
function inline(text) {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
            ? <strong key={i} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>
            : <Fragment key={i}>{part}</Fragment>
    );
}

const isTableLine = (l) => l.trim().startsWith('|');
const isBullet = (l) => /^\s*[-*]\s+/.test(l);
const isNumbered = (l) => /^\s*\d+\.\s+/.test(l);
const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

export default function RichText({ text }) {
    const lines = String(text || '').split('\n');
    const blocks = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim()) { i++; continue; }
        if (isTableLine(line)) {
            const rows = [];
            while (i < lines.length && isTableLine(lines[i])) { rows.push(lines[i]); i++; }
            blocks.push({ type: 'table', rows: rows.filter((r) => !/^\s*\|[\s:|-]+\|\s*$/.test(r)).map(cells) });
        } else if (isBullet(line) || isNumbered(line)) {
            const ordered = isNumbered(line);
            const items = [];
            while (i < lines.length && (isBullet(lines[i]) || isNumbered(lines[i]))) {
                items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ''));
                i++;
            }
            blocks.push({ type: ordered ? 'ol' : 'ul', items });
        } else {
            const para = [];
            while (i < lines.length && lines[i].trim() && !isTableLine(lines[i]) && !isBullet(lines[i]) && !isNumbered(lines[i])) {
                para.push(lines[i].trim());
                i++;
            }
            blocks.push({ type: 'p', text: para.join(' ') });
        }
    }

    return (
        <div className="space-y-4">
            {blocks.map((b, idx) => {
                if (b.type === 'p') return <p key={idx}>{inline(b.text)}</p>;
                if (b.type === 'ul' || b.type === 'ol') {
                    const Tag = b.type;
                    return (
                        <Tag key={idx} className={`${b.type === 'ul' ? 'list-disc' : 'list-decimal'} pl-6 space-y-1.5`}>
                            {b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}
                        </Tag>
                    );
                }
                const [head, ...body] = b.rows;
                return (
                    <div key={idx} className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-subtle)' }}>
                        <table className="w-full text-xs sm:text-sm text-left">
                            <thead style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                                <tr>{head.map((c, j) => <th key={j} className="p-3 font-semibold">{inline(c)}</th>)}</tr>
                            </thead>
                            <tbody>
                                {body.map((r, j) => (
                                    <tr key={j} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                        {r.map((c, k) => <td key={k} className="p-3">{inline(c)}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </div>
    );
}
