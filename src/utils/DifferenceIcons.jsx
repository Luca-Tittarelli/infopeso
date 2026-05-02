export default function DifferenceIcon({ dif, size = 16 }) {
    if (dif < 0) {
        return (
            <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 11L3 6h10L8 11z" fill="var(--negative)" />
            </svg>
        );
    }
    if (dif == 0) {
        return (
            <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8h8M4 10.5h8" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        );
    }
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5l5 5H3L8 5z" fill="var(--positive)" />
        </svg>
    );
}