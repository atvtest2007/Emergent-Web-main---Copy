import { useState, useEffect } from 'react';
import { Heart, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Content } from '@/lib/api';
import BottomNav from '../components/BottomNav';

export default function FavoritesScreen() {
    const nav = useNavigate();
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            try {
                // There isn't a direct favorites API endpoint we exposed yet if not in db.
                // Assuming it's not implemented, we just show empty for now,
                // or fetch something like recently watched if we wanted.
                // Let's just mock empty for now to remove static dependency.
                setFavorites([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="absolute inset-0 flex flex-col" style={{ background: '#030608' }}>
            <div className="flex-shrink-0 pt-14 px-5 pb-4" style={{ background: 'linear-gradient(180deg, #141414 0%, #030608 100%)' }}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>My Favorites</h1>
                        <p className="text-xs mt-1" style={{ color: '#64748b' }}>Your saved channels and VODs</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-20 px-5" style={{ scrollbarWidth: 'none' }}>
                {loading ? (
                    <div className="flex items-center justify-center pt-20">
                        <Loader2 className="w-8 h-8 text-brand animate-spin" />
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#1A1A1A' }}>
                            <Heart size={28} style={{ color: '#64748b' }} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">No favorites yet</h3>
                        <p className="text-sm text-zinc-500 px-8">Add movies, series, or channels to your favorites to quickly access them here.</p>
                    </div>
                ) : null}
            </div>
            <BottomNav active="favorites" />
        </div>
    );
}
