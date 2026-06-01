import { Trophy } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import type { Screen } from '@/types';



export default function SportsScreen() {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#0a0a0f' }}>
      <div className="flex-shrink-0 pt-14 px-5 pb-4" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0a0a0f 100%)' }}>
        <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>Sports Guide</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="flex items-center justify-center rounded-3xl mb-6"
          style={{ width: 100, height: 100, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Trophy size={48} style={{ color: '#f59e0b' }} />
        </div>
        <h2 className="text-2xl font-black text-center mb-3" style={{ color: '#f8fafc' }}>Sports Guide</h2>
        <div className="px-4 py-1.5 rounded-full font-bold text-sm mb-4" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
          Coming Soon
        </div>
        <p className="text-sm text-center leading-relaxed" style={{ color: '#64748b' }}>
          Live fixtures, scores, standings, and sport channel shortcuts are on their way.
        </p>
        <div className="mt-8 flex flex-col gap-3 w-full">
          {['Live Fixtures & Scores', 'Live Score Overlay', 'Sports Categories', 'Channel Shortcuts'].map((feat) => (
            <div key={feat} className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'rgba(245,158,11,0.5)' }} />
              <span className="text-sm font-medium" style={{ color: '#64748b' }}>{feat}</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>Soon</span>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="home" />
    </div>
  );
}
