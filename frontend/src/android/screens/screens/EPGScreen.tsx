import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { epgData, epgCategories } from '../data/mockData';
import BottomNav from '../components/BottomNav';
import type { Screen } from '@/types';

interface Props { onNavigate: (s: Screen) => void; }
const timeSlots = ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];

export default function EPGScreen({ onNavigate }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#0a0a0f' }}>
      <div className="flex-shrink-0 pt-14 px-5 pb-3" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0a0a0f 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>EPG Guide</h1>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: '#12161e', border: '1px solid #1e2838', color: '#94a3b8' }}>
            <Calendar size={14} /> Today
          </button>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <button className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 34, height: 34, background: '#12161e', border: '1px solid #1e2838' }}>
            <ChevronLeft size={16} style={{ color: '#64748b' }} />
          </button>
          {['Mon 19', 'Tue 20', 'Wed 21', 'Thu 22', 'Fri 23'].map((d, i) => (
            <button key={d} className="flex-1 py-2 rounded-xl text-xs font-semibold"
              style={{ background: i === 2 ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#12161e', color: i === 2 ? '#fff' : '#64748b', border: i === 2 ? 'none' : '1px solid #1e2838' }}>
              {d}
            </button>
          ))}
          <button className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 34, height: 34, background: '#12161e', border: '1px solid #1e2838' }}>
            <ChevronRight size={16} style={{ color: '#64748b' }} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {epgCategories.map((cat, i) => (
            <button key={cat} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: i === 0 ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#12161e', color: i === 0 ? '#fff' : '#64748b', border: i === 0 ? 'none' : '1px solid #1e2838' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center border-b flex-shrink-0" style={{ borderColor: '#1e2838', paddingLeft: 80 }}>
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {timeSlots.map((t) => (
              <div key={t} className="flex-shrink-0 text-xs font-semibold py-2 px-3" style={{ color: t === '20:00' ? '#0ea5e9' : '#475569', minWidth: 70 }}>
                {t}
                {t === '20:00' && <div className="h-0.5 mt-1 rounded-full" style={{ background: '#0ea5e9' }} />}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pb-20">
          {epgData.map((row, idx) => (
            <div key={idx} className="flex items-stretch border-b" style={{ borderColor: '#1e2838', minHeight: 68 }}>
              <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2" style={{ width: 80, borderRight: '1px solid #1e2838', background: '#0d1117' }}>
                <div className="flex-shrink-0 rounded-lg overflow-hidden" style={{ width: 36, height: 36 }}>
                  <img src={row.logo} alt={row.channel} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex items-center overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
                <div className="flex-shrink-0 flex flex-col justify-center px-3 py-2 m-1 rounded-xl relative"
                  style={{ minWidth: 140, background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(2,132,199,0.08))', border: '1px solid rgba(14,165,233,0.25)' }}>
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: '#0ea5e9' }} />
                  <span className="text-xs font-semibold truncate" style={{ color: '#e2e8f0' }}>{row.now}</span>
                  <span className="text-xs mt-0.5" style={{ color: '#64748b' }}>{row.nowTime}</span>
                </div>
                <div className="flex-shrink-0 flex flex-col justify-center px-3 py-2 m-1 rounded-xl"
                  style={{ minWidth: 130, background: '#12161e', border: '1px solid #1e2838' }}>
                  <span className="text-xs font-medium truncate" style={{ color: '#94a3b8' }}>{row.next}</span>
                  <span className="text-xs mt-0.5" style={{ color: '#475569' }}>{row.nextTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
}
