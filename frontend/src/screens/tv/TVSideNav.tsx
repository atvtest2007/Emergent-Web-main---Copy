import { Home, Tv, Film, Monitor, Search, Heart, Calendar, Radio, Trophy, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useState } from 'react';

interface TVSideNavProps {
  active: string;
}

const navItems = [
  { id: 'home', path: '/home', label: 'Home', icon: Home },
  { id: 'live-tv', path: '/live', label: 'Live TV', icon: Tv },
  { id: 'movies', path: '/movies', label: 'Movies', icon: Film },
  { id: 'series', path: '/series', label: 'Series', icon: Monitor },
  { id: 'search', path: '/search', label: 'Search', icon: Search },
  { id: 'epg', path: '/epg', label: 'EPG', icon: Calendar },
  { id: 'catchup', path: '/catchup', label: 'Catch Up', icon: Radio },
  { id: 'favorites', path: '/favorites', label: 'Favorites', icon: Heart },
  { id: 'sports', path: '/sports', label: 'Sports', icon: Trophy },
];

const bottomItems = [
  { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
];

export default function TVSideNav({ active }: TVSideNavProps) {
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const width = isFocused ? 200 : 64;
  const collapsed = !isFocused;

  return (
    <div className="flex-shrink-0 relative z-40" style={{ width: 64 }}>
      <div
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsFocused(false);
          }
        }}
        className="flex flex-col h-full absolute left-0 top-0 bottom-0"
        style={{
          width,
          background: 'rgba(8,12,20,0.98)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 flex-shrink-0">
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #E50914, #B80710)', boxShadow: '0 0 14px rgba(229,9,20,0.4)' }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M12 8L38 24L12 40V8Z" fill="white" />
            <circle cx="36" cy="12" r="5" fill="rgba(255,255,255,0.7)" />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-base font-black" style={{ color: '#f8fafc' }}>
            Maxx<span style={{ color: '#E50914' }}>Player</span>
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3" style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-0.5" style={{ scrollbarWidth: 'none' }}>
        {navItems.map(({ id, path, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button tabIndex={0} key={id}
              onClick={() => navigate(path)}
              className="flex items-center gap-3 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-[#E50914] text-left w-full"
              style={{
                padding: collapsed ? '10px 14px' : '10px 12px',
                background: isActive ? 'linear-gradient(135deg, rgba(229,9,20,0.2), rgba(2,132,199,0.1))' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(229,9,20,0.3)' : 'transparent'}`,
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 22, height: 22 }}>
                <Icon size={18} style={{ color: isActive ? '#E50914' : '#475569' }} />
              </div>
              {!collapsed && (
                <span className="text-sm font-semibold" style={{ color: isActive ? '#e2e8f0' : '#64748b' }}>
                  {label}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#E50914' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-4 mt-2 mb-2" style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

      {/* Bottom items */}
      <div className="px-2 pb-4 flex flex-col gap-0.5">
        {bottomItems.map(({ id, path, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button tabIndex={0} key={id} onClick={() => navigate(path)}
              className="flex items-center gap-3 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-[#E50914] w-full"
              style={{
                padding: collapsed ? '10px 14px' : '10px 12px',
                background: isActive ? 'rgba(229,9,20,0.15)' : 'transparent',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <Icon size={18} style={{ color: isActive ? '#E50914' : '#475569' }} />
              {!collapsed && <span className="text-sm font-semibold" style={{ color: isActive ? '#e2e8f0' : '#64748b' }}>{label}</span>}
            </button>
          );
        })}
        <button tabIndex={0} className="flex items-center gap-3 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-[#E50914] w-full group focus:outline-none"
          style={{
            padding: collapsed ? '10px 14px' : '10px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <LogOut size={18} style={{ color: '#ef4444' }} />
          {!collapsed && <span className="text-sm font-semibold" style={{ color: '#ef4444' }}>Logout</span>}
        </button>
      </div>
      </div>
    </div>
  );
}
