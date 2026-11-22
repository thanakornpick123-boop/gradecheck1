import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, KeyRound, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { Badge, Button, Input } from '../components/ui'
import { useApp } from '../store/AppStore'

export default function StudentLogin() {
  const { data, session, student, loginStudent, notify } = useApp()
  const navigate = useNavigate()
  const [studentId, setStudentId] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [error, setError] = useState('')

  if (session?.role === 'student' && student) return <Navigate to="/student" replace />

  const fillDemo = (demoStudent) => {
    setStudentId(demoStudent.id)
    setVerifyCode(demoStudent.verifyCode)
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = loginStudent(studentId, verifyCode)
    if (!result.ok) {
      setError(result.error)
      return
    }
    notify(`ยินดีต้อนรับ ${result.student.name}`)
    navigate('/student')
  }

  return (
    <AuthLayout
      variant="student"
      title="เข้าสู่ระบบนักศึกษา"
      subtitle="กรอกรหัสนักศึกษาและรหัสยืนยันตัวตนเพื่อดูผลการเรียนของคุณ"
      altTo="/admin/login"
      altLabel="สำหรับอาจารย์ →"
      footer={
        <p className="text-center text-xs leading-relaxed text-slate-500">
          หากไม่สามารถเข้าสู่ระบบได้ กรุณาติดต่ออาจารย์ผู้สอนหรือฝ่ายวิชาการ
          <br />
          ข้อมูลทดลองถูกจัดเก็บไว้ในเบราว์เซอร์ของคุณเท่านั้น
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="รหัสนักศึกษา"
          icon={UserRound}
          placeholder="เช่น 67010001"
          value={studentId}
          onChange={(event) => {
            setStudentId(event.target.value.replace(/\D/g, '').slice(0, 12))
            setError('')
          }}
          inputMode="numeric"
          autoComplete="username"
          autoFocus
        />

        <Input
          label="รหัสยืนยันตัวตน"
          icon={KeyRound}
          placeholder="ตัวเลข 4 หลัก"
          value={verifyCode}
          onChange={(event) => {
            setVerifyCode(event.target.value.replace(/\D/g, '').slice(0, 4))
            setError('')
          }}
          type={showCode ? 'text' : 'password'}
          inputMode="numeric"
          autoComplete="current-password"
          maxLength={4}
          hint="ใช้ 4 ตัวท้ายของบัตรประชาชน หรือรหัสที่อาจารย์กำหนด"
          rightElement={
            <button
              type="button"
              onClick={() => setShowCode((value) => !value)}
              aria-label={showCode ? 'ซ่อนรหัส' : 'แสดงรหัส'}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              {showCode ? <EyeOff size={17} /> : <Eye size={17} />}
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
          เข้าสู่ระบบ
          <ArrowRight size={18} />
        </Button>
      </form>

      <div className="mt-6 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-indigo-700">
            <Sparkles size={13} /> บัญชีทดลองสำหรับทดสอบ
          </p>
          <Badge tone="indigo">Mock data</Badge>
        </div>
        <div className="mt-2.5 space-y-1.5">
          {data.students.slice(0, 3).map((demoStudent) => (
            <button
              key={demoStudent.id}
              type="button"
              onClick={() => fillDemo(demoStudent)}
              className="flex w-full items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2 text-left ring-1 ring-inset ring-indigo-100 transition hover:bg-white hover:ring-indigo-300"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-slate-700">
                  {demoStudent.name}
                </span>
                <span className="block text-[11px] text-slate-400">รหัส {demoStudent.id}</span>
              </span>
              <span className="shrink-0 rounded-lg bg-indigo-50 px-2 py-1 font-mono text-xs font-semibold tracking-wider text-indigo-700">
                {demoStudent.verifyCode}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">คลิกเพื่อเติมข้อมูลอัตโนมัติ</p>
      </div>
    </AuthLayout>
  )
}
