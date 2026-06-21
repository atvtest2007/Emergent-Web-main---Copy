import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const generatePages = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push("...");
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-12 mb-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-1.5">
                {generatePages().map((p, idx) => (
                    p === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-zinc-500">...</span>
                    ) : (
                        <button
                            key={`page-${p}`}
                            onClick={() => onPageChange(p)}
                            className={`w-10 h-10 flex items-center justify-center rounded-md font-semibold text-sm transition ${currentPage === p ? "bg-brand text-white shadow-lg shadow-red-900/40" : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"}`}
                        >
                            {p}
                        </button>
                    )
                ))}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}
