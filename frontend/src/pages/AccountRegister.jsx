import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export default function AccountRegister() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(username, password);
            toast.success("Account created successfully");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to register");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-2xl border border-white/5">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">MaxxPlayer</h1>
                    <p className="text-muted-foreground">Create a new account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Username</label>
                        <input 
                            type="text" 
                            className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        <input 
                            type="password" 
                            className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full rounded-md bg-primary py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button onClick={() => navigate('/account/login')} className="text-primary hover:underline">
                        Sign in
                    </button>
                </div>
            </div>
        </div>
    );
}
