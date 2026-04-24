import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

/*Icons*/
const Icon = ({ d, d2 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 w-[18px] h-[18px]">
    <path d={d} />{d2 && <path d={d2} />}
  </svg>
)
const LeafIcon    = () => <Icon d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" d2="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
const HomeIcon    = () => <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" d2="M9 22V12h6v10" />
const FieldsIcon  = () => <Icon d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" />
const UsersIcon   = () => <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" d2="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
const LogoutIcon  = () => <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
const MenuIcon    = () => <Icon d="M3 6h18M3 12h18M3 18h18" />

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const [open, setOpen]  = useState(false)

  const handleLogout = async () => { await logout(); navigate('/login') }

  const navItems = [
    { to: '/app/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { to: '/app/fields',    label: 'Fields',    icon: <FieldsIcon /> },
    ...(user?.role === 'admin' ? [{ to: '/app/users', label: 'Users', icon: <UsersIcon /> }] : []),
  ]

  const Sidebar = () => (
    <div className="flex flex-col h-full select-none">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-soil-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-crop-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4.5 h-4.5 w-[18px] h-[18px]">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-white text-[17px] leading-none">SmartSeason</p>
            <p className="text-soil-400 text-[11px] mt-0.5 tracking-wide">Field Monitoring</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-soil-500 mb-2">Menu</p>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="px-3 py-4 border-t border-soil-700/60">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-crop-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate leading-none">{user?.name}</p>
            <p className="text-soil-400 text-xs mt-0.5">{user?.role_label}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="nav-item w-full text-left">
          <LogoutIcon /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-56 bg-soil-800 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative z-50 flex flex-col w-56 h-full bg-soil-800 animate-slideIn shadow-2xl">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-200 shadow-sm">
          <button onClick={() => setOpen(true)} className="p-1 text-stone-600 hover:text-soil-700">
            <MenuIcon />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-crop-500 rounded flex items-center justify-center">
              <LeafIcon />
            </div>
            <span className="font-display font-bold text-soil-800 text-lg">SmartSeason</span>
          </div>
        </div>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}