import { Fragment } from 'react';

function inline(text) {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
            <strong key={i} style={{ color: 'var(--ink)', fontWeight: 700 }}>
                {part.slice(2, -2)}
            </strong>
        ) : (
            <Fragment key={i}>{part}</Fragment>
        )
    );
}

const isTableLine = (l) => l.trim().startsWith('|');
const isBullet = (l) => /^\s*[-*]\s+/.test(l);
const isNumbered = (l) => /^\s*\d+\.\s+/.test(l);
const cells = (l) =>
    l
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((c) => c.trim());

export default function RichText({ text }) {
    const lines = String(text || '').split('\n');
    const blocks = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim()) {
            i++;
            continue;
        }
        if (isTableLine(line)) {
            const rows = [];
            while (i < lines.length && isTableLine(lines[i])) {
                rows.push(lines[i]);
                i++;
            }
            blocks.push({
                type: 'table',
                rows: rows.filter((r) => !/^\s*\|[\s:|-]+\|\s*$/.test(r)).map(cells),
            });
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
            while (
                i < lines.length &&
                lines[i].trim() &&
                !isTableLine(lines[i]) &&
                !isBullet(lines[i]) &&
                !isNumbered(lines[i])
            ) {
                para.push(lines[i].trim());
                i++;
            }
            blocks.push({ type: 'p', text: para.join(' ') });
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {blocks.map((b, idx) => {
                if (b.type === 'p')
                    return (
                        <p key={idx} className="body" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                            {inline(b.text)}
                        </p>
                    );
                if (b.type === 'ul' || b.type === 'ol') {
                    const Tag = b.type;
                    return (
                        <Tag
                            key={idx}
                            className="body"
                            style={{
                                color: 'var(--ink-muted)',
                                margin: 0,
                                paddingLeft: 'var(--space-6)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-2)',
                            }}
                        >
                            {b.items.map((it, j) => (
                                <li key={j}>{inline(it)}</li>
                            ))}
                        </Tag>
                    );
                }
                const [head, ...body] = b.rows;
                return (
                    <div
                        key={idx}
                        style={{
                            overflowX: 'auto',
                            background: 'var(--surface-100)',
                            border: '1px solid var(--line)',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                            <thead>
                                <tr>
                                    {head.map((c, j) => (
                                        <th
                                            key={j}
                                            scope="col"
                                            className="label"
                                            style={{
                                                color: 'var(--ink-subtle)',
                                                textAlign: 'left',
                                                padding: 'var(--space-3) var(--space-4)',
                                                borderBottom: '1px solid var(--line)',
                                            }}
                                        >
                                            {inline(c)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {body.map((r, j) => (
                                    <tr key={j}>
                                        {r.map((c, k) => (
                                            <td
                                                key={k}
                                                className="body-sm"
                                                style={{
                                                    padding: 'var(--space-3) var(--space-4)',
                                                    borderBottom: j === body.length - 1 ? '0' : '1px solid var(--line)',
                                                    color: 'var(--ink)',
                                                }}
                                            >
                                                {inline(c)}
                                            </td>
                                        ))}
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
