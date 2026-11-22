import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  History,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Logo, buttonStyles } from '../components/ui'
import { DEPARTMENT, SCHOOL_NAME, SEMESTER } from '../data/seed'

export default function Landing() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute left-[-12%] top-1/2 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />

      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6">
        <Link to="/" aria-label="GradeCheck หน้าหลัก">
          <span className="sm:hidden">
            <Logo compact />
          </span>
          <span className="hidden sm:block">
            <Logo />
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <span className="mr-2 hidden text-sm text-slate-500 md:inline">{SEMESTER}</span>
          <Link to="/student/login" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
            <GraduationCap size={16} />
            นักศึกษา
          </Link>
          <Link to="/admin/login" className={buttonStyles({ variant: 'dark', size: 'sm' })}>
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">สำหรับอาจารย์</span>
            <span className="sm:hidden">อาจารย์</span>
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <section className="mx-auto max-w-3xl pb-14 pt-6 text-center lg:pb-20 lg:pt-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-indigo-700 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
              เปิดให้ตรวจผลการเรียนแล้ว · {SEMESTER}
            </span>

            <h1 className="mt-5 text-[2.1rem] font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
              ตรวจคะแนนได้ทุกที่
              <span className="mt-1 block bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
                มั่นใจทุกผลการเรียน
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
              ระบบตรวจคะแนนส่วนบุคคลสำหรับนักศึกษา พร้อมเครื่องมือจัดการคะแนนสำหรับอาจารย์
              ตรวจสอบได้ทุกอุปกรณ์ ปลอดภัยด้วยรหัสยืนยันตัวตน และโปร่งใสด้วยประวัติการแก้ไขทุกครั้ง
            </p>

            <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
              <Link
                to="/student/login"
                className={buttonStyles({ variant: 'primary', size: 'lg', className: 'w-full sm:w-auto' })}
              >
                ตรวจผลการเรียนของฉัน
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/admin/login"
                className={buttonStyles({ variant: 'secondary', size: 'lg', className: 'w-full sm:w-auto' })}
              >
                เข้าสู่ระบบอาจารย์
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-emerald-500" />
                ป้องกันการเข้าถึงด้วยรหัสส่วนตัว
              </span>
              <span className="inline-flex items-center gap-1.5">
                <History size={15} className="text-indigo-500" />
                ตรวจสอบย้อนหลังได้ทุกครั้ง
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/student/login"
            className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/5 sm:p-7"
          >
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-indigo-50 transition-transform duration-500 group-hover:scale-125" />
            <div className="relative">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                <GraduationCap size={24} />
              </span>
              <h2 className="mt-5 text-lg font-semibold text-slate-900">สำหรับนักศึกษา</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                เข้าดูคะแนนรายวิชา เกรด และค่าเฉลี่ยของห้องเรียนได้ด้วยรหัสนักศึกษาและรหัสยืนยันตัวตน
              </p>
              <ul className="mt-4 space-y-2 text-[13px] text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" /> เห็นเฉพาะผลที่อาจารย์ประกาศแล้ว
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" /> ใช้งานง่ายบนมือถือ
                </li>
              </ul>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600">
                เข้าสู่ระบบนักศึกษา
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>

          <Link
            to="/admin/login"
            className="group relative overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-lg shadow-slate-950/15 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-950/25 sm:p-7"
          >
            <div className="absolute inset-0 bg-grid opacity-40" />
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl transition-transform duration-500 group-hover:scale-125" />
            <div className="relative">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-indigo-300 ring-1 ring-inset ring-white/10">
                <LayoutDashboard size={24} />
              </span>
              <h2 className="mt-5 text-lg font-semibold">สำหรับอาจารย์ / ผู้ดูแลระบบ</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                จัดการคะแนน นำเข้าไฟล์ CSV/Excel ควบคุมการประกาศผล และตรวจสอบประวัติการแก้ไข
              </p>
              <ul className="mt-4 space-y-2 text-[13px] text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" /> จัดการคะแนนได้ทุกวิชาในที่เดียว
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" /> บันทึก Audit Log อัตโนมัติ
                </li>
              </ul>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-300">
                เข้าสู่ระบบหลังบ้าน
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: 'ข้อมูลส่วนบุคคล',
              text: 'ต้องยืนยันรหัส 4 หลักก่อนเข้าดูคะแนน',
            },
            {
              icon: BookOpenCheck,
              title: 'ประกาศผลโดยอาจารย์',
              text: 'อาจารย์ควบคุมได้ว่าวิชาและช่องคะแนนใดพร้อมให้เห็น',
            },
            {
              icon: Users,
              title: 'เปรียบเทียบกับห้องเรียน',
              text: 'ดูค่าเฉลี่ยของห้อง (Mean) ประกอบการประเมินตนเอง',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <Icon size={16} className="text-indigo-500" />
                {title}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200/80 bg-white/60 py-6 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear() + 543} {SCHOOL_NAME} · {DEPARTMENT}
          </p>
          <p>GradeCheck — ระบบตรวจคะแนนเพื่อการศึกษา</p>
        </div>
      </footer>
    </div>
  )
}
