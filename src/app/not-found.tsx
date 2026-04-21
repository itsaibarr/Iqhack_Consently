"use client";

import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center">
      <div className="mb-6 p-4 bg-primary-50 text-primary-500 rounded-lg animate-badge-pop">
        <Search size={32} strokeWidth={1.5} />
      </div>
      
      <h1 className="text-display-lg text-neutral-900 mb-3">
        This page is off the map
      </h1>
      
      <p className="text-body-md text-neutral-600 max-w-md mb-8">
        We couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist in your current consent footprint.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/"
          className="btn-primary flex items-center gap-2 px-8"
        >
          Back to Dashboard
        </Link>
        <button 
          onClick={() => window.history.back()}
          className="btn-ghost flex items-center gap-2 px-8"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
      
      <div className="mt-16 flex items-center gap-2 text-neutral-400">
        <span className="w-8 h-[1px] bg-neutral-100"></span>
        <span className="text-mono-sm uppercase tracking-widest text-[10px]">Error 404</span>
        <span className="w-8 h-[1px] bg-neutral-100"></span>
      </div>
    </div>
  );
}
