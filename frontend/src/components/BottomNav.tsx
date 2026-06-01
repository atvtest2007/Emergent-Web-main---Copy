import { Home, Tv, Film, Monitor, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BottomNavProps {
  active: string;
}

const navItems = [
  { id: 'home', path: '/home', label: 'Home', icon: Home },
  { id: 'live-tv', path: '/live', label: 'Live TV', icon: Tv },
  { id: 'movies', path: '/movies', label: 'Movies', icon: Film },
  { id: 'series', path: '/series', label: 'Series', icon: Monitor },
  { id: 'settings', path: '/settings', label: 'More', icon: MoreHorizontal },
];

export default function BottomNav({ active }: BottomNavProps) {
  const navigate = useNavigate();
  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-center justify-around px-2"
      style={{
        height: 72,
        background: 'rgba(10,10,15,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingBottom: 10,
      }}
    >
      {navItems.map(({ id, path, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-1 flex-1 py-2"
          >
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 40,
                height: 30,
                background: isActive ? 'rgba(14,165,233,0.15)' : 'transparent',
              }}
            >
              <Icon size={20} style={{ color: isActive ? '#0ea5e9' : '#475569' }} />
            </div>
            <span className="text-xs font-medium" style={{ color: isActive ? '#0ea5e9' : '#475569' }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
