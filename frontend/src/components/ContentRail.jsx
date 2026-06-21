import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ContentRail({ title, subtitle, children, testId }) {
    const ref = useRef(null);

    const scroll = (dir) => {
        if (!ref.current) return;
        const w = ref.current.clientWidth * 0.8;
        ref.current.scrollBy({ left: dir * w, behavior: "smooth" });
    };

    return (
        <section className="px-6 md:px-12 2xl:px-24 4xl:px-32 5xl:px-48 uw:px-64 mt-10 4xl:mt-16 first:mt-6" data-testid={testId}>
            <div className="mb-4">
                <h2 className="font-display text-2xl sm:text-3xl 4xl:text-4xl font-bold tracking-tight" data-testid={`${testId}-title`}>
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-xs 4xl:text-sm text-zinc-500 mt-1 tracking-[0.2em] uppercase font-bold">{subtitle}</p>
                )}
            </div>
            <div className="relative group/rail -mx-2 px-2">
                <div ref={ref} className="rail-scroll flex gap-4 4xl:gap-6 overflow-x-auto pb-4">
                    {children}
                </div>
                <button
                    onClick={() => scroll(-1)}
                    className="absolute left-0 top-0 bottom-4 w-12 lg:w-14 2xl:w-16 3xl:w-20 4xl:w-24 5xl:w-32 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent flex items-center justify-center opacity-100 lg:opacity-0 group-hover/rail:opacity-100 transition-opacity z-10 hover:text-brand"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 3xl:w-10 3xl:h-10 4xl:w-12 4xl:h-12 5xl:w-16 5xl:h-16" />
                </button>
                <button
                    onClick={() => scroll(1)}
                    className="absolute right-0 top-0 bottom-4 w-12 lg:w-14 2xl:w-16 3xl:w-20 4xl:w-24 5xl:w-32 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent flex items-center justify-center opacity-100 lg:opacity-0 group-hover/rail:opacity-100 transition-opacity z-10 hover:text-brand"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 3xl:w-10 3xl:h-10 4xl:w-12 4xl:h-12 5xl:w-16 5xl:h-16" />
                </button>
            </div>
        </section>
    );
}
