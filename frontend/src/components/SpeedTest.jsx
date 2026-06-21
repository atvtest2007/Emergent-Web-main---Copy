import React, { useState, useRef } from "react";
import { Play, RotateCw, Activity, ArrowDown, ArrowUp, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function SpeedTest() {
    const [status, setStatus] = useState("idle"); // idle, ping, download, upload, complete, error
    const [ping, setPing] = useState(null);
    const [download, setDownload] = useState(null);
    const [upload, setUpload] = useState(null);
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");

    const abortControllerRef = useRef(null);

    const startTest = async () => {
        setStatus("ping");
        setPing(null);
        setDownload(null);
        setUpload(null);
        setProgress(0);
        setErrorMsg("");

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            // 1. Measure Ping
            setProgress(10);
            let totalPing = 0;
            const pingCount = 3;
            for (let i = 0; i < pingCount; i++) {
                const pStart = performance.now();
                await fetch("https://speed.cloudflare.com/__down?bytes=0", { cache: "no-store", signal });
                totalPing += (performance.now() - pStart);
            }
            setPing(Math.round(totalPing / pingCount));
            setProgress(30);

            // 2. Measure Download
            setStatus("download");
            const dlBytes = 20000000; // 20MB
            const dlStart = performance.now();
            const dlRes = await fetch(`https://speed.cloudflare.com/__down?bytes=${dlBytes}`, { cache: "no-store", signal });
            const dlBlob = await dlRes.blob();
            const dlEnd = performance.now();
            
            const dlDuration = (dlEnd - dlStart) / 1000;
            const dlBits = dlBlob.size * 8;
            setDownload((dlBits / dlDuration / 1000000).toFixed(1));
            setProgress(65);

            // 3. Measure Upload
            setStatus("upload");
            const ulBytes = 5000000; // 5MB
            const ulPayload = new Uint8Array(ulBytes);
            // fill with some random-ish data to prevent extreme compression
            for (let i = 0; i < ulBytes; i += 1024) {
                ulPayload[i] = Math.floor(Math.random() * 256);
            }

            const ulStart = performance.now();
            await fetch("https://speed.cloudflare.com/__up", {
                method: "POST",
                body: ulPayload,
                headers: { "Content-Type": "text/plain" },
                cache: "no-store",
                signal
            });
            const ulEnd = performance.now();
            
            const ulDuration = (ulEnd - ulStart) / 1000;
            const ulBits = ulPayload.length * 8;
            setUpload((ulBits / ulDuration / 1000000).toFixed(1));
            setProgress(100);

            setStatus("complete");

        } catch (err) {
            if (err.name === "AbortError") return;
            console.error("Speed test error:", err);
            setErrorMsg("Network error during test. Ensure you are connected to the internet.");
            setStatus("error");
        }
    };

    const stopTest = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setStatus("idle");
        setProgress(0);
    };

    const getQuality = () => {
        if (!download || !ping) return null;
        if (download >= 25 && ping <= 100) return { label: "Excellent (4K Ready)", color: "text-green-400" };
        if (download >= 10 && ping <= 150) return { label: "Good (1080p Ready)", color: "text-blue-400" };
        if (download >= 3) return { label: "Fair (720p/SD)", color: "text-amber-400" };
        return { label: "Poor (Buffering likely)", color: "text-brand" };
    };

    const quality = getQuality();

    return (
        <Card className="bg-[#121212] border-white/10 p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-brand" /> Network Diagnostic
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                        Measure your connection speed to diagnose streaming performance. This will consume approx. 25MB of data.
                    </p>
                </div>
                {status === "idle" || status === "complete" || status === "error" ? (
                    <button 
                        onClick={startTest}
                        className="px-6 py-2.5 rounded-md bg-brand hover:bg-[#F40612] font-semibold flex items-center gap-2 transition whitespace-nowrap"
                    >
                        {status === "complete" ? <RotateCw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                        {status === "complete" || status === "error" ? "Restart Test" : "Start Test"}
                    </button>
                ) : (
                    <button 
                        onClick={stopTest}
                        className="px-6 py-2.5 rounded-md bg-white/10 hover:bg-white/20 font-semibold transition whitespace-nowrap"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {errorMsg && (
                <div className="p-4 rounded-md bg-red-950/50 border border-red-900/50 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{errorMsg}</p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/50 border border-white/5 rounded-lg p-5 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="text-zinc-500 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Activity className="w-4 h-4" /> Ping
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-display font-black ${status === "ping" ? "animate-pulse text-zinc-300" : "text-white"}`}>
                            {ping !== null ? ping : "—"}
                        </span>
                        {ping !== null && <span className="text-sm text-zinc-500 font-bold">ms</span>}
                    </div>
                </div>

                <div className="bg-black/50 border border-white/5 rounded-lg p-5 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="text-zinc-500 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ArrowDown className="w-4 h-4" /> Download
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-display font-black ${status === "download" ? "animate-pulse text-zinc-300" : "text-white"}`}>
                            {download !== null ? download : "—"}
                        </span>
                        {download !== null && <span className="text-sm text-zinc-500 font-bold">Mbps</span>}
                    </div>
                </div>

                <div className="bg-black/50 border border-white/5 rounded-lg p-5 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="text-zinc-500 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ArrowUp className="w-4 h-4" /> Upload
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-display font-black ${status === "upload" ? "animate-pulse text-zinc-300" : "text-white"}`}>
                            {upload !== null ? upload : "—"}
                        </span>
                        {upload !== null && <span className="text-sm text-zinc-500 font-bold">Mbps</span>}
                    </div>
                </div>
            </div>

            {(status !== "idle" && status !== "error") && (
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-brand transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }} 
                    />
                </div>
            )}

            {status === "complete" && quality && (
                <div className="pt-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-zinc-300">Connection Quality:</span>
                    <span className={`text-sm font-bold ${quality.color}`}>{quality.label}</span>
                </div>
            )}
        </Card>
    );
}
