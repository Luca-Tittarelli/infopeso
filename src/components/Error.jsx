import React from 'react';

export function ErrorComponent({ message }){
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex flex-col justify-center items-center w-[400px] m-auto" role="alert">
      <svg className="fill-current w-6 h-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <title>Error</title>
        <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm1 15a1 1 0 11-2 0V9a1 1 0 112 0v6zm-1-8a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
      </svg>
      <strong className="font-bold">Error</strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};
