import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PinModal({ open, onOpenChange, correctPin, onSuccess }) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);

    const check = () => {
        if (pin === correctPin) {
            setPin("");
            setError(false);
            onSuccess();
        } else {
            setError(true);
            setPin("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) { setPin(""); setError(false); }
            onOpenChange(val);
        }}>
            <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Parental Controls</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Enter PIN to access restricted content.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <Input 
                        type="password" 
                        maxLength={4} 
                        value={pin} 
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="••••"
                        className={`text-center text-2xl tracking-widest bg-[#0a0a0a] border-white/10 ${error ? 'border-red-500' : ''}`}
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && check()}
                    />
                    {error && <p className="text-xs text-red-500 text-center">Incorrect PIN. Try again.</p>}
                    <Button onClick={check} className="bg-[#E50914] hover:bg-[#F40612]">Unlock</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
