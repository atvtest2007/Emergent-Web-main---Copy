import { Home, Tv, Film, Monitor, Search, Heart, Calendar, Radio, Trophy, Settings, LogOut } from 'lucide-react';
import type { Screen } from '../../types';

interface TVSideNavProps {
  active: Screen;
  onNavigate: (s: Screen) => void;
  collapsed?: boolean;
}

const navItems = [
  { id: 'home' as Screen, label: 'Home', icon: Home },
  { id: 'live-tv' as Screen, label: 'Live TV', icon: Tv },
  { id: 'movies' as Screen, label: 'Movies', icon: Film },
  { id: 'series' as Screen, label: 'Series', icon: Monitor },
  { id: 'search' as Screen, label: 'Search', icon: Search },
  { id: 'epg' as Screen, label: 'EPG', icon: Calendar },
  { id: 'catchup' as Screen, label: 'Catch Up', icon: Radio },
  { id: 'favorites' as Screen, label: 'Favorites', icon: Heart },
  { id: 'sports' as Screen, label: 'Sports', icon: Trophy },
];

const bottomItems = [
  { id: 'settings' as Screen, label: 'Settings', icon: Settings },
];

export default function TVSideNav({ active, onNavigate, collapsed = false }: TVSideNavProps) {
  return (
    <div
      className="flex flex-col h-full flex-shrink-0"
      style={{
        width: collapsed ? 64 : 200,
        background: 'rgba(8,12,20,0.98)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        transition: 'width 0.2s',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 flex-shrink-0">
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 0 14px rgba(14,165,233,0.4)' }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M12 8L38 24L12 40V8Z" fill="white" />
            <circle cx="36" cy="12" r="5" fill="rgba(255,255,255,0.7)" />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-base font-black" style={{ color: '#f8fafc' }}>
            Maxx<span style={{ color: '#0ea5e9' }}>Player</span>
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3" style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-0.5" style={{ scrollbarWidth: 'none' }}>
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex items-center gap-3 rounded-xl text-left w-full"
              style={{
                padding: collapsed ? '10px 14px' : '10px 12px',
                background: isActive ? 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(2,132,199,0.1))' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(14,165,233,0.3)' : 'transparent'}`,
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 22, height: 22 }}>
                <Icon size={18} style={{ color: isActive ? '#0ea5e9' : '#475569' }} />
              </div>
              {!collapsed && (
                <span className="text-sm font-semibold" style={{ color: isActive ? '#e2e8f0' : '#64748b' }}>
                  {label}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#0ea5e9' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-4 mt-2 mb-2" style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

      {/* Bottom items */}
      <div className="px-2 pb-4 flex flex-col gap-0.5">
        {bottomItems.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => onNavigate(id)}
              className="flex items-center gap-3 rounded-xl w-full"
              style={{
                padding: collapsed ? '10px 14px' : '10px 12px',
                background: isActive ? 'rgba(14,165,233,0.15)' : 'transparent',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <Icon size={18} style={{ color: isActive ? '#0ea5e9' : '#475569' }} />
              {!collapsed && <span className="text-sm font-semibold" style={{ color: isActive ? '#e2e8f0' : '#64748b' }}>{label}</span>}
            </button>
          );
        })}
        <button
          className="flex items-center gap-3 rounded-xl w-full"
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
  );
}
