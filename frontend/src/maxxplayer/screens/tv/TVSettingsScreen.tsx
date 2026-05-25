import { User, Wifi, Play, Globe, Bell, Shield, Info, ChevronRight, Check } from 'lucide-react';
import TVSideNav from './TVSideNav';
import type { Screen } from '../../types';

interface Props { onNavigate: (s: Screen) => void; }

const sections = [
  {
    title: 'Account',
    icon: User,
    color: '#0ea5e9',
    items: [
      { label: 'Profile', value: 'admin@maxxplayer.com', action: true },
      { label: 'Subscription', value: 'Premium · Active', badge: 'ACTIVE', badgeColor: '#22c55e' },
      { label: 'Devices', value: '3 of 5 used', action: true },
    ],
  },
  {
    title: 'Playback',
    icon: Play,
    color: '#22c55e',
    items: [
      { label: 'Player Engine', value: 'ExoPlayer', toggle: false, isSegment: true, options: ['ExoPlayer', 'VLC'], selected: 0 },
      { label: 'Default Quality', value: '4K Auto', action: true },
      { label: 'Hardware Decoding', value: 'Enabled', isSwitch: true, switchOn: true },
      { label: 'Buffer Size', value: '30 seconds', action: true },
    ],
  },
  {
    title: 'Network',
    icon: Wifi,
    color: '#f59e0b',
    items: [
      { label: 'Connection', value: 'WiFi · 150 Mbps', badge: 'GOOD', badgeColor: '#22c55e' },
      { label: 'Auto Reconnect', value: 'On', isSwitch: true, switchOn: true },
      { label: 'Proxy Settings', value: 'Not configured', action: true },
    ],
  },
  {
    title: 'Language & Region',
    icon: Globe,
    color: '#8b5cf6',
    items: [
      { label: 'App Language', value: 'English', action: true },
      { label: 'Audio Language', value: 'English', action: true },
      { label: 'Subtitle Language', value: 'Auto', action: true },
    ],
  },
];

function Toggle({ on }: { on: boolean }) {
  return (
    <div className="relative rounded-full flex-shrink-0" style={{ width: 36, height: 20, background: on ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#1e2838', transition: 'background 0.2s' }}>
      <div className="absolute top-0.5 rounded-full" style={{ width: 16, height: 16, background: '#fff', left: on ? 18 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
    </div>
  );
}

export default function TVSettingsScreen({ onNavigate }: Props) {
  return (
    <div className="absolute inset-0 flex" style={{ background: '#080c14' }}>
      <TVSideNav active="settings" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>Settings</h1>
          <p className="text-xs" style={{ color: '#475569' }}>App preferences and configuration</p>
        </div>

        {/* Two-column settings layout */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'none' }}>
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="rounded-2xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid #1a2030' }}>
                  {/* Section header */}
                  <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: '1px solid #1a2030' }}>
                    <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                      style={{ width: 28, height: 28, background: `${section.color}18`, border: `1px solid ${section.color}30` }}>
                      <Icon size={14} style={{ color: section.color }} />
                    </div>
                    <span className="text-sm font-black" style={{ color: '#e2e8f0' }}>{section.title}</span>
                  </div>

                  {/* Items */}
                  <div className="divide-y" style={{ borderColor: '#1a2030' }}>
                    {section.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>{item.label}</span>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                              style={{ background: `${item.badgeColor}20`, color: item.badgeColor, fontSize: 8 }}>
                              {item.badge}
                            </span>
                          )}
                          {item.isSwitch ? (
                            <Toggle on={item.switchOn ?? false} />
                          ) : item.isSegment ? (
                            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #1e2838' }}>
                              {item.options?.map((opt, oi) => (
                                <div key={opt} className="px-2.5 py-1 text-xs font-bold"
                                  style={{
                                    background: oi === item.selected ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#12161e',
                                    color: oi === item.selected ? '#fff' : '#475569',
                                    fontSize: 9,
                                  }}>
                                  {opt}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs" style={{ color: '#475569', fontSize: 10 }}>{item.value}</span>
                              {item.action && <ChevronRight size={12} style={{ color: '#334155' }} />}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* App Info card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid #1a2030' }}>
              <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: '1px solid #1a2030' }}>
                <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 28, height: 28, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
                  <Info size={14} style={{ color: '#0ea5e9' }} />
                </div>
                <span className="text-sm font-black" style={{ color: '#e2e8f0' }}>About</span>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <div className="flex items-center justify-center rounded-2xl" style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 0 20px rgba(14,165,233,0.4)' }}>
                  <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
                    <path d="M12 8L38 24L12 40V8Z" fill="white" />
                    <circle cx="36" cy="12" r="5" fill="rgba(255,255,255,0.7)" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-black" style={{ color: '#f8fafc' }}>Maxx<span style={{ color: '#0ea5e9' }}>Player</span></p>
                  <p className="text-xs" style={{ color: '#475569' }}>Version 1.0.0 · Build 2024.12</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <Check size={10} style={{ color: '#22c55e' }} />
                  <span className="text-xs font-bold" style={{ color: '#22c55e', fontSize: 10 }}>Up to date</span>
                </div>
              </div>
            </div>

            {/* Notifications card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid #1a2030' }}>
              <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: '1px solid #1a2030' }}>
                <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 28, height: 28, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Bell size={14} style={{ color: '#ef4444' }} />
                </div>
                <span className="text-sm font-black" style={{ color: '#e2e8f0' }}>Notifications</span>
              </div>
              {[
                { label: 'New Content Alerts', on: true },
                { label: 'Live Event Reminders', on: true },
                { label: 'Playlist Sync Alerts', on: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid #1a2030' }}>
                  <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>{item.label}</span>
                  <Toggle on={item.on} />
                </div>
              ))}
            </div>

            {/* Security */}
            <div className="rounded-2xl overflow-hidden col-span-2" style={{ background: '#0d1117', border: '1px solid #1a2030' }}>
              <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: '1px solid #1a2030' }}>
                <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 28, height: 28, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <Shield size={14} style={{ color: '#f59e0b' }} />
                </div>
                <span className="text-sm font-black" style={{ color: '#e2e8f0' }}>Security & Privacy</span>
              </div>
              <div className="grid px-4 py-3 gap-3" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                {[
                  { label: 'PIN Lock', value: 'Disabled', action: true },
                  { label: 'Parental Controls', value: '18+', action: true },
                  { label: 'Data Collection', value: 'Minimal', isSwitch: true, on: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#12161e' }}>
                    <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>{item.label}</span>
                    {item.isSwitch ? <Toggle on={item.on ?? false} /> : (
                      <div className="flex items-center gap-1">
                        <span className="text-xs" style={{ color: '#475569', fontSize: 10 }}>{item.value}</span>
                        {item.action && <ChevronRight size={11} style={{ color: '#334155' }} />}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
