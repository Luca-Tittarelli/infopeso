export function Loading() {
    return (
      <div className="flex items-center justify-center m-auto">
        <svg
          className="animate-spin h-10 w-10 mr-3 dark:stroke-white" // Aumenté el tamaño del SVG
          xmlns="http://www.w3.org/2000/svg"
          width="80"  // Aumentado a 80
          height="80" // Aumentado a 80
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 3a9 9 0 1 0 9 9"/>
        </svg>
      </div>
    );
  }
  