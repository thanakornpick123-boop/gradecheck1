import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Logo, Badge, cn } from './ui'
import { SCHOOL_NAME, SEMESTER } from '../data/seed'

const VARIANTS = {
  student: {
    portal: 'Student Portal',
    badgeTone: 'emerald',
    headline: ['ผลการเรียนของคุณ', 'เป็นเรื่องส่วนตัว'],
    description:
      'ตรวจสอบคะแนน เกรด และค่าเฉลี่ยของห้องเรียนได้อย่างปลอดภัย ด้วยการยืนยันตัวตนก่อนเข้าถึงข้อมูล',
    points: [
      'ยืนยันด้วยรหัสนักศึกษาและรหัสส่วนตัว 4 หลัก',
      'เห็นเฉพาะผลที่อาจารย์ประกาศแล้วเท่านั้น',
      'รองรับการใช้งานบนคอมพิวเตอร์และโทรศัพท์',
    ],
    gradient: 'from-slate-950 via-indigo-950 to-indigo-900',
  },
  admin: {
    portal: 'Staff Portal',
    badgeTone: 'violet',
    headline: ['จัดการคะแนน', 'อย่างมืออาชีพ'],
    description:
      'ศูนย์ควบคุมคะแนนสำหรับอาจารย์และผู้ดูแลระบบ ตั้งแต่การแก้ไขคะแนนไปจนถึงการประกาศผล',
    points: [
      'แก้ไขคะแนนพร้อมบันทึก Audit Log อัตโนมัติ',
      'นำเข้าและส่งออกข้อมูลด้วย CSV / Excel',
      'เปิด–ปิดการแสดงผลรายวิชาและรายช่องคะแนน',
    ],
    gradient: 'from-slate-950 via-slate-900 to-indigo-950',
  },
}

export default function AuthLayout({
  variant = 'student',
  title,
  subtitle,
  portalLabel,
  altTo,
  altLabel,
  children,
  footer,
}) {
  const config = VARIANTS[variant] || VARIANTS.student

  return (
    <div className="min-h-dvh bg-slate-50 lg:grid lg:grid-cols-[1.02fr_1fr]">
      <aside
        className={cn(
          'relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br p-10 text-white lg:flex xl:p-12',
          config.gradient,
        )}
      >
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

        <Link to="/" className="relative z-10 w-fit" aria-label="กลับหน้าหลัก">
          <Logo dark />
        </Link>

        <div className="relative z-10 my-12 max-w-md">
          <Badge tone="glass" className="backdrop-blur">
            {config.portal}
          </Badge>
          <h2 className="mt-5 text-3xl font-semibold leading-snug tracking-tight xl:text-[2.6rem] xl:leading-[1.2]">
            {config.headline[0]}
            <br />
            {config.headline[1]}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300/90 xl:text-[15px]">
            {config.description}
          </p>

          <ul className="mt-8 space-y-3">
            {config.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                  <CheckCircle2 size={13} />
                </span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 space-y-1 text-xs text-slate-400">
          <p className="flex items-center gap-1.5">
            <ShieldCheck size={13} /> {SEMESTER}
          </p>
          <p>{SCHOOL_NAME}</p>
        </div>
      </aside>

      <main className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
          <Link to="/" className="lg:hidden" aria-label="กลับหน้าหลัก">
            <span className="sm:hidden">
              <Logo compact />
            </span>
            <span className="hidden sm:block">
              <Logo />
            </span>
          </Link>
          <Link
            to="/"
            className="hidden items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800 lg:inline-flex"
          >
            <ArrowLeft size={16} />
            กลับหน้าหลัก
          </Link>
          <Link
            to={altTo}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
          >
            {altLabel}
          </Link>
        </header>

        <div className="flex flex-1 items-start justify-center px-4 pb-12 pt-2 sm:px-8 sm:pt-6 lg:items-center lg:pb-16">
          <div className="w-full max-w-[27rem] animate-fade-in">
            <div className="mb-6 px-1">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-indigo-600">
                {portalLabel || config.portal}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
                {title}
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{subtitle}</p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-900/[0.04] sm:p-7">
              {children}
            </div>

            {footer && <div className="mt-5 px-1">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  )
}
