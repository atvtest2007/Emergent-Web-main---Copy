import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Play, Clock, Info } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import type { Screen } from '@/types';

const epgCategories = ['All', 'Sports', 'News', 'Movies', 'Entertainment', 'Documentary', 'Kids'];
const epgData = [
  { channel: 'ESPN HD', logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1', now: 'SportsCenter Live', nowTime: '20:00 - 21:00', next: 'NFL Countdown', nextTime: '21:00 - 22:00' },
  { channel: 'CNN International', logo: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1', now: 'World News Tonight', nowTime: '20:00 - 20:30', next: 'The Situation Room', nextTime: '20:30 - 21:30' },
  { channel: 'HBO Max', logo: 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1', now: 'Succession S4 Finale', nowTime: '20:00 - 22:00', next: 'The Wire S1E1', nextTime: '22:00 - 23:00' },
];

const timeSlots = ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];

export default function EPGScreen() {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#030608' }}>
      <div className="flex-shrink-0 pt-14 px-5 pb-3" style={{ background: 'linear-gradient(180deg, #141414 0%, #030608 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>EPG Guide</h1>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#94a3b8' }}>
            <CalendarIcon size={14} /> Today
          </button>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <button className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 34, height: 34, background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
            <ChevronLeft size={16} style={{ color: '#64748b' }} />
          </button>
          {['Mon 19', 'Tue 20', 'Wed 21', 'Thu 22', 'Fri 23'].map((d, i) => (
            <button key={d} className="flex-1 py-2 rounded-xl text-xs font-semibold"
              style={{ background: i === 2 ? 'linear-gradient(135deg, var(--brand-primary), #B80710)' : '#1A1A1A', color: i === 2 ? '#fff' : '#64748b', border: i === 2 ? 'none' : '1px solid #2A2A2A' }}>
              {d}
            </button>
          ))}
          <button className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 34, height: 34, background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
            <ChevronRight size={16} style={{ color: '#64748b' }} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {epgCategories.map((cat, i) => (
            <button key={cat} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: i === 0 ? 'linear-gradient(135deg, var(--brand-primary), #B80710)' : '#1A1A1A', color: i === 0 ? '#fff' : '#64748b', border: i === 0 ? 'none' : '1px solid #2A2A2A' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center border-b flex-shrink-0" style={{ borderColor: '#2A2A2A', paddingLeft: 80 }}>
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {timeSlots.map((t) => (
              <div key={t} className="flex-shrink-0 text-xs font-semibold py-2 px-3" style={{ color: t === '20:00' ? 'var(--brand-primary)' : '#475569', minWidth: 70 }}>
                {t}
                {t === '20:00' && <div className="h-0.5 mt-1 rounded-full" style={{ background: 'var(--brand-primary)' }} />}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pb-20">
          {epgData.map((row, idx) => (
            <div key={idx} className="flex items-stretch border-b" style={{ borderColor: '#2A2A2A', minHeight: 68 }}>
              <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2" style={{ width: 80, borderRight: '1px solid #2A2A2A', background: '#0d1117' }}>
                <div className="flex-shrink-0 rounded-lg overflow-hidden" style={{ width: 36, height: 36 }}>
                  <img src={row.logo} alt={row.channel} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex items-center overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
                <div className="flex-shrink-0 flex flex-col justify-center px-3 py-2 m-1 rounded-xl relative"
                  style={{ minWidth: 140, background: 'linear-gradient(135deg, rgba(229,9,20,0.15), rgba(2,132,199,0.08))', border: '1px solid rgba(229,9,20,0.25)' }}>
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: 'var(--brand-primary)' }} />
                  <span className="text-xs font-semibold truncate" style={{ color: '#e2e8f0' }}>{row.now}</span>
                  <span className="text-xs mt-0.5" style={{ color: '#64748b' }}>{row.nowTime}</span>
                </div>
                <div className="flex-shrink-0 flex flex-col justify-center px-3 py-2 m-1 rounded-xl"
                  style={{ minWidth: 130, background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                  <span className="text-xs font-medium truncate" style={{ color: '#94a3b8' }}>{row.next}</span>
                  <span className="text-xs mt-0.5" style={{ color: '#475569' }}>{row.nextTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="home" />
    </div>
  );
}
