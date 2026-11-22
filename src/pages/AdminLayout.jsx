import React, { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ClipboardList,
  Eye,
  History,
  Home,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import { Avatar, Badge, ConfirmDialog, Logo, cn, buttonStyles } from '../components/ui'
import { CLASSROOM, SEMESTER } from '../data/seed'
import { initialsOf } from '../lib/grades'

const NAV_ITEMS = [
  { to: '/admin/scores', label: 'จัดการคะแนน', icon: ClipboardList },
  { to: '/admin/publish', label: 'ควบคุมการแสดงผล', icon: Eye },
  { to: '/admin/audit', label: 'ประวัติการแก้ไข', icon: History },
]

function navLinkClass({ isActive }) {
  return cn(
    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-white/10 text-white ring-1 ring-inset ring-white/10'
      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
  )
}

export default function AdminLayout() {
  const { data, session, logout, resetDemo, notify } = useApp()
  const navigate = useNavigate()
  const [resetOpen, setResetOpen] = useState(false)

  const roleLabel = session?.accountRole === 'admin' ? 'ผู้ดูแลระบบ' : 'อาจารย์ผู้สอน'

  const handleLogout = () => {
    logout()
    notify('ออกจากระบบบุคลากรแล้ว', 'info')
    navigate('/admin/login')
  }

  const handleReset = () => {
    resetDemo()
    setResetOpen(false)
    notify('รีเซ็ตข้อมูลทดลองเป็นค่าเริ่มต้นแล้ว')
  }

  return (
    <div className="min-h-dvh bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-slate-950 lg:flex">
        <div className="px-5 pb-5 pt-6">
          <Link to="/admin/scores" aria-label="GradeCheck หลังบ้าน">
            <Logo dark />
          </Link>
          <Badge tone="glass" className="mt-3 backdrop-blur">
            <ShieldCheck size={12} className="text-emerald-300" />
            สำหรับบุคลากร
          </Badge>
        </div>

        <div className="mx-4 rounded-2xl border border-white/5 bg-white/[0.04] p-4">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500">
            <CalendarDays size={12} /> ภาคเรียนปัจจุบัน
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-200">{SEMESTER}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
            <Users size={12} /> {CLASSROOM} · {data.students.length} คน
          </p>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-indigo-300' : 'text-slate-500'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/5 p-3">
          <div className="flex items-center gap-2.5 rounded-2xl bg-white/[0.04] p-3">
            <Avatar name={initialsOf(session?.displayName)} className="h-9 w-9 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{session?.displayName}</p>
              <p className="truncate text-[10px] text-slate-400">{session?.title || roleLabel}</p>
            </div>
            <Badge tone="glass">{roleLabel === 'ผู้ดูแลระบบ' ? 'Admin' : 'Teacher'}</Badge>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <RefreshCw size={13} /> รีเซ็ตข้อมูล
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
            >
              <LogOut size={13} /> ออกจากระบบ
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-md lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Link to="/admin/scores" aria-label="GradeCheck หลังบ้าน">
              <Logo />
            </Link>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setResetOpen(true)}
                aria-label="รีเซ็ตข้อมูลทดลอง"
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100"
              >
                <RefreshCw size={17} />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="ออกจากระบบ"
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
          <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition',
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                  )
                }
              >
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <header className="hidden h-16 items-center justify-between border-b border-slate-200/70 bg-white/70 px-8 backdrop-blur lg:flex">
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={15} className="text-emerald-500" />
            ระบบจัดการสำหรับบุคลากร
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-700">{SEMESTER}</span>
          </p>
          <div className="flex items-center gap-2">
            <Badge tone={session?.accountRole === 'admin' ? 'violet' : 'sky'}>{roleLabel}</Badge>
            <Link to="/" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
              <Home size={15} />
              หน้าหลัก
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title="รีเซ็ตข้อมูลทดลอง?"
        description="ข้อมูลนักศึกษา คะแนน สถานะการประกาศผล และประวัติการแก้ไขจะกลับไปเป็นค่าเริ่มต้น"
        confirmLabel="รีเซ็ตข้อมูล"
        icon={<RefreshCw size={20} />}
      />
    </div>
  )
}
