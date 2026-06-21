import React, { useState } from "react";
import { Auth } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountAuth() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error("Please enter username and password");
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await Auth.login(username, password);
                toast.success("Successfully logged in");
            } else {
                await Auth.register(username, password);
                toast.success("Account created successfully");
            }
            window.location.href = "/";
        } catch (err) {
            toast.error(err.response?.data?.detail || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full min-h-[80vh] bg-[#030608] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#121212] border border-white/5 p-8 rounded-xl shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-white mb-2">MaxxPlayer</h1>
                    <p className="text-zinc-400">
                        {isLogin ? "Sign in to your account" : "Create a new account"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1.5">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                            placeholder="Enter username"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                            placeholder="••••••••"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-brand hover:bg-[#F40612] text-white font-bold rounded-md mt-4 transition"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isLogin ? "Sign In" : "Register")}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-zinc-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-brand hover:underline font-semibold"
                    >
                        {isLogin ? "Register" : "Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
}
