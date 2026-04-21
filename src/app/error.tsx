"use client";

import { useEffect } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center">
      <div className="mb-6 p-4 bg-risk-amber-50 text-risk-amber-500 rounded-lg animate-badge-pop">
        <ShieldAlert size={32} strokeWidth={1.5} />
      </div>
      
      <h1 className="text-display-lg text-neutral-900 mb-3">
        Something caught us off guard
      </h1>
      
      <p className="text-body-md text-neutral-600 max-w-md mb-8">
        We encountered an unexpected error while managing your sovereignty map. This is on us, not you.
      </p>

      {error.digest && (
        <div className="mb-8 p-4 bg-neutral-50 rounded-lg border border-neutral-100 max-w-md w-full">
          <p className="text-mono-sm text-neutral-400 text-left overflow-hidden text-ellipsis whitespace-nowrap">
            Digest ID: <span className="text-neutral-600">{error.digest}</span>
          </p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="btn-primary flex items-center gap-2 px-8"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
        <Link 
          href="/"
          className="btn-ghost flex items-center gap-2 px-8"
        >
          Go to Dashboard
        </Link>
      </div>
      
      <div className="mt-16 flex items-center gap-2 text-neutral-400">
        <span className="w-8 h-[1px] bg-neutral-100"></span>
        <span className="text-mono-sm uppercase tracking-widest text-[10px]">Error Segment</span>
        <span className="w-8 h-[1px] bg-neutral-100"></span>
      </div>
    </div>
  );
}
