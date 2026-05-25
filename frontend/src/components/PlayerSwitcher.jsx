import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PLAYER_OPTIONS } from "@/lib/store";
import { Check, Cpu } from "lucide-react";

export default function PlayerSwitcher({ open, onOpenChange, value, onChange }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0a0a0a] border-white/10 text-zinc-100 max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl tracking-tight flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-[#E50914]" />
                        Switch Player Engine
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Choose the playback engine. Auto-fallback applies on failure.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2 mt-2">
                    {PLAYER_OPTIONS.map((opt) => {
                        const selected = value === opt.id;
                        return (
                            <button
                                key={opt.id}
                                onClick={() => {
                                    onChange(opt.id);
                                    onOpenChange(false);
                                }}
                                data-testid={`player-option-${opt.id}`}
                                className={`flex items-start gap-3 p-4 rounded-md border text-left transition ${
                                    selected
                                        ? "border-[#E50914] bg-[#E50914]/10"
                                        : "border-white/10 bg-[#121212] hover:border-white/30"
                                }`}
                            >
                                <div className="flex-1">
                                    <div className="font-semibold">{opt.label}</div>
                                    <div className="text-xs text-zinc-400 mt-0.5">{opt.desc}</div>
                                </div>
                                {selected && <Check className="w-5 h-5 text-[#E50914]" />}
                            </button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
