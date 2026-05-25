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
        <section className="px-6 lg:px-12 mt-10 first:mt-6" data-testid={testId}>
            <div className="flex items-end justify-between mb-4">
                <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight" data-testid={`${testId}-title`}>
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-xs text-zinc-500 mt-1 tracking-[0.2em] uppercase font-bold">{subtitle}</p>
                    )}
                </div>
                <div className="hidden md:flex gap-2">
                    <button
                        onClick={() => scroll(-1)}
                        className="w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
                        data-testid={`${testId}-scroll-left`}
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll(1)}
                        className="w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
                        data-testid={`${testId}-scroll-right`}
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div ref={ref} className="rail-scroll flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
                {children}
            </div>
        </section>
    );
}
