import { ChevronLeft, ChevronRight, Play, Clock } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import type { Screen } from '@/types';

interface Props { onNavigate: (s: Screen) => void; }

const catchUpData = [
  { channel: 'ESPN HD', logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1', slots: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'], program: 'SportsCenter Archive' },
  { channel: 'CNN International', logo: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1', slots: ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00'], program: 'World News Archive' },
  { channel: 'HBO Max', logo: 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1', slots: ['20:00', '22:00'], program: 'Premium Archive' },
];
const days = ['Mon 19', 'Tue 20', 'Wed 21', 'Thu 22', 'Fri 23', 'Sat 24'];

export default function CatchUpScreen({ onNavigate }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#0a0a0f' }}>
      <div className="flex-shrink-0 pt-14 px-5 pb-3" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0a0a0f 100%)' }}>
        <h1 className="text-xl font-black mb-4" style={{ color: '#f8fafc' }}>
          Catch Up <span className="text-sm font-medium ml-1" style={{ color: '#475569' }}>Replay TV</span>
        </h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 32, height: 32, background: '#12161e', border: '1px solid #1e2838' }}>
            <ChevronLeft size={14} style={{ color: '#64748b' }} />
          </button>
          <div className="flex gap-2 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
            {days.map((d, i) => (
              <button key={d} className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{ background: i === 5 ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#12161e', color: i === 5 ? '#fff' : '#64748b', border: i === 5 ? 'none' : '1px solid #1e2838' }}>
                {d}
              </button>
            ))}
          </div>
          <button className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 32, height: 32, background: '#12161e', border: '1px solid #1e2838' }}>
            <ChevronRight size={14} style={{ color: '#64748b' }} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-2">
        <span className="text-xs font-medium" style={{ color: '#475569' }}>{catchUpData.length} channels available</span>
        <button className="text-xs font-semibold" style={{ color: '#64748b' }}>A–Z ▾</button>
      </div>
      <div className="flex-1 overflow-y-auto pb-20 px-5 flex flex-col gap-4">
        {catchUpData.map((item) => (
          <div key={item.channel} className="rounded-2xl overflow-hidden" style={{ background: '#12161e', border: '1px solid #1e2838' }}>
            <div className="flex items-center gap-3 p-3 border-b" style={{ borderColor: '#1a2030' }}>
              <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: 40, height: 40 }}>
                <img src={item.logo} alt={item.channel} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>{item.channel}</p>
                <p className="text-xs" style={{ color: '#64748b' }}>{item.program}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' }}>
                {item.slots.length} slots
              </span>
            </div>
            <div className="p-3">
              <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {item.slots.map((slot, idx) => (
                  <button key={slot} onClick={() => onNavigate('player')}
                    className="flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl"
                    style={{
                      background: idx === 2 ? 'rgba(14,165,233,0.15)' : '#0d1117',
                      border: `1px solid ${idx === 2 ? 'rgba(14,165,233,0.3)' : '#1a2030'}`,
                    }}
                  >
                    <Clock size={12} style={{ color: idx === 2 ? '#0ea5e9' : '#475569' }} />
                    <span className="text-xs font-semibold" style={{ color: idx === 2 ? '#38bdf8' : '#64748b' }}>{slot}</span>
                    <Play size={10} style={{ color: idx === 2 ? '#0ea5e9' : '#334155' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
}
