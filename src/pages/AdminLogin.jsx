import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { Badge, Button, Input } from '../components/ui'
import { useApp } from '../store/AppStore'

export default function AdminLogin() {
  const { data, session, loginAdmin, notify } = useApp()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  if (session?.role === 'admin') return <Navigate to="/admin/scores" replace />

  const fillDemo = (account) => {
    setUsername(account.username)
    setPassword(account.password)
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = loginAdmin(username, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    notify(`เข้าสู่ระบบในฐานะ ${username.trim()}`)
    navigate('/admin/scores')
  }

  return (
    <AuthLayout
      variant="admin"
      title="เข้าสู่ระบบบุคลากร"
      subtitle="สำหรับอาจารย์และผู้ดูแลระบบเท่านั้น การเข้าถึงทั้งหมดถูกบันทึกในประวัติ"
      altTo="/student/login"
      altLabel="ไปที่ระบบนักศึกษา →"
      footer={
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
          <ShieldCheck size={13} className="text-emerald-500" />
          ระบบแยกสิทธิ์ผู้ใช้งานอย่างชัดเจนระหว่างนักศึกษาและบุคลากร
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="ชื่อผู้ใช้"
          icon={UserRound}
          placeholder="username"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value)
            setError('')
          }}
          autoComplete="username"
          autoFocus
        />
        <Input
          label="รหัสผ่าน"
          icon={LockKeyhole}
          placeholder="••••••••"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            setError('')
          }}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          }
        />

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-[13px] text-rose-700">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-rose-400" />
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full">
          เข้าสู่ระบบหลังบ้าน
          <ArrowRight size={18} />
        </Button>
      </form>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Sparkles size={13} className="text-indigo-500" /> บัญชีทดลองสำหรับทดสอบ
          </p>
          <Badge tone="slate">Mock data</Badge>
        </div>
        <div className="mt-2.5 space-y-1.5">
          {data.accounts.map((account) => (
            <button
              key={account.username}
              type="button"
              onClick={() => fillDemo(account)}
              className="flex w-full items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-left ring-1 ring-inset ring-slate-200 transition hover:ring-indigo-300"
            >
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700">
                  {account.displayName}
                  <Badge tone={account.role === 'admin' ? 'violet' : 'sky'}>
                    {account.role === 'admin' ? 'ผู้ดูแลระบบ' : 'อาจารย์'}
                  </Badge>
                </span>
                <span className="block text-[11px] text-slate-400">{account.username}</span>
              </span>
              <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600">
                {account.password}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">คลิกเพื่อเติมข้อมูลอัตโนมัติ</p>
      </div>
    </AuthLayout>
  )
}
