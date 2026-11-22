import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Info,
  Lock,
  LogOut,
  Medal,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import { Logo, Badge, Button, EmptyState, cn } from '../components/ui'
import {
  FIELD_META,
  GRADE_STYLES,
  SCORE_FIELDS,
  classAverageForStudent,
  formatNumber,
  formatShortDate,
  gpaForStudent,
  gradeOf,
  initialsOf,
  rankForStudent,
  subjectStats,
  totalOf,
} from '../lib/grades'
import { DEPARTMENT, SCHOOL_NAME, SEMESTER } from '../data/seed'

function GradePill({ grade, className = '' }) {
  return (
    <span
      className={cn(
        'inline-grid h-8 min-w-9 place-items-center rounded-lg px-2 text-xs font-semibold ring-1 ring-inset',
        GRADE_STYLES[grade],
        className,
      )}
    >
      {grade}
    </span>
  )
}

export default function StudentDashboard() {
  const { data, student, logout, notify } = useApp()
  const navigate = useNavigate()

  const publishedSubjects = data.subjects.filter((subject) => subject.published)
  const pendingCount = data.subjects.length - publishedSubjects.length

  const rows = publishedSubjects.map((subject) => {
    const scores = data.scores[subject.id]?.[student.id] || {
      assignment: 0,
      midterm: 0,
      final: 0,
    }
    const total = totalOf(scores)
    return {
      subject,
      scores,
      total,
      grade: gradeOf(total),
      stats: subjectStats(data, subject.id),
    }
  })

  const gpa = gpaForStudent(data, student.id, publishedSubjects)
  const average = classAverageForStudent(data, student.id, publishedSubjects)
  const rank = rankForStudent(data, student.id, publishedSubjects)

  const handleLogout = () => {
    logout()
    notify('ออกจากระบบแล้ว', 'info')
    navigate('/')
  }

  return (
    <div className="min-h-dvh bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" aria-label="GradeCheck หน้าหลัก">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] text-slate-500 sm:inline-flex">
              <BookOpen size={13} /> {SEMESTER}
            </span>
            <Button variant="secondary" size="sm" onClick={handleLogout} aria-label="ออกจากระบบ">
              <LogOut size={15} />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-12 pt-5 sm:px-6 sm:pt-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-5 text-white shadow-xl shadow-indigo-950/20 sm:p-8">
          <div className="absolute inset-0 bg-grid opacity-25" />
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-lg font-medium text-white ring-4 ring-white/10 backdrop-blur sm:h-16 sm:w-16">
                  {initialsOf(student.name)}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[11px] text-indigo-200/80">
                    <ShieldCheck size={12} />
                    ยืนยันตัวตนแล้ว · เข้าถึงข้อมูลส่วนตัว
                  </p>
                  <h1 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">
                    {student.name}
                  </h1>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-indigo-200/90">
                    <span>รหัส {student.id}</span>
                    <span className="text-indigo-400/60">•</span>
                    <span>
                      {DEPARTMENT} · {student.classroom}
                    </span>
                  </p>
                </div>
              </div>

              <Badge tone="glass" className="w-fit">
                <CheckCircle2 size={12} className="text-emerald-300" />
                ประกาศผลแล้ว {publishedSubjects.length} วิชา
              </Badge>
            </div>

            <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl bg-white/[0.06] py-3 ring-1 ring-inset ring-white/10 backdrop-blur">
              <div className="px-3 text-center sm:px-5">
                <p className="flex items-center justify-center gap-1 text-[10px] text-indigo-200/80 sm:text-[11px]">
                  <Award size={12} /> เกรดเฉลี่ย (GPA)
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">
                  {formatNumber(gpa, 2)}
                  <span className="ml-0.5 text-[10px] font-light text-indigo-200/70">/4.00</span>
                </p>
              </div>
              <div className="px-3 text-center sm:px-5">
                <p className="flex items-center justify-center gap-1 text-[10px] text-indigo-200/80 sm:text-[11px]">
                  <TrendingUp size={12} /> คะแนนเฉลี่ยรวม
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">
                  {formatNumber(average, 1)}
                  <span className="ml-0.5 text-[10px] font-light text-indigo-200/70">/100</span>
                </p>
              </div>
              <div className="px-3 text-center sm:px-5">
                <p className="flex items-center justify-center gap-1 text-[10px] text-indigo-200/80 sm:text-[11px]">
                  <Medal size={12} /> อันดับในห้อง
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">
                  {rank ? `#${rank.rank}` : '—'}
                  <span className="ml-0.5 text-[10px] font-light text-indigo-200/70">
                    /{rank?.total || data.students.length}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <GraduationCap size={18} className="text-indigo-500" />
                ผลการเรียนรายวิชา
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {SEMESTER} · แสดงเฉพาะรายวิชาที่อาจารย์ประกาศผลแล้ว
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-500 ring-1 ring-inset ring-slate-200/70">
              <Clock3 size={12} />
              ข้อมูล ณ {formatShortDate(new Date())}
            </span>
          </div>

          {rows.length === 0 ? (
            <EmptyState
              icon={<Lock size={24} />}
              title="ยังไม่มีผลการเรียนที่ประกาศ"
              description="อาจารย์ยังไม่เปิดเผยแพร่ผลคะแนนของรายวิชาใด ๆ กรุณากลับมาตรวจสอบอีกครั้งภายหลัง"
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] text-slate-500">
                      <th className="px-5 py-3 text-left font-medium sm:px-6">รายวิชา</th>
                      {SCORE_FIELDS.map((field) => (
                        <th key={field} className="px-3 py-3 text-center font-medium">
                          {FIELD_META[field].label}
                          <span className="block text-[10px] font-normal text-slate-400">
                            เต็ม {FIELD_META[field].max}
                          </span>
                        </th>
                      ))}
                      <th className="px-3 py-3 text-center font-medium">
                        รวม
                        <span className="block text-[10px] font-normal text-slate-400">เต็ม 100</span>
                      </th>
                      <th className="px-3 py-3 text-center font-medium">เกรด</th>
                      <th className="px-3 py-3 text-center font-medium">
                        เฉลี่ยห้อง
                        <span className="block text-[10px] font-normal text-slate-400">Mean</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map(({ subject, scores, total, grade, stats }) => (
                      <tr key={subject.id} className="transition hover:bg-slate-50/60">
                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-[10px] font-semibold text-indigo-600">
                              {subject.id.slice(0, 2)}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800">{subject.name}</p>
                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {subject.id} · {subject.credits} หน่วยกิต · {subject.teacher}
                              </p>
                            </div>
                          </div>
                        </td>
                        {SCORE_FIELDS.map((field) => (
                          <td key={field} className="px-3 py-4 text-center">
                            {subject.visible[field] ? (
                              <span className="text-sm font-medium tabular-nums text-slate-700">
                                {scores[field] ?? 0}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                <Lock size={12} /> ซ่อน
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="px-3 py-4">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-sm font-semibold tabular-nums text-slate-900">
                              {total}
                            </span>
                            <span className="h-1 w-14 overflow-hidden rounded-full bg-slate-100">
                              <span
                                className="block h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                                style={{ width: `${Math.min(100, total)}%` }}
                              />
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <GradePill grade={grade} />
                        </td>
                        <td className="px-3 py-4 text-center">
                          <span className="text-sm tabular-nums text-slate-500">
                            {formatNumber(stats.total, 1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {rows.map(({ subject, scores, total, grade, stats }) => (
                  <div key={subject.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Badge tone="indigo">{subject.id}</Badge>
                        <h3 className="mt-1.5 text-[15px] font-medium leading-snug text-slate-900">
                          {subject.name}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {subject.credits} หน่วยกิต · {subject.teacher}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <GradePill grade={grade} />
                        <span className="text-[10px] text-slate-400">เกรด</span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {SCORE_FIELDS.map((field) => (
                        <div
                          key={field}
                          className={cn(
                            'rounded-xl px-2.5 py-2',
                            subject.visible[field]
                              ? 'bg-slate-50 ring-1 ring-inset ring-slate-100'
                              : 'border border-dashed border-slate-200 bg-white',
                          )}
                        >
                          <p className="text-[10px] text-slate-400">
                            {FIELD_META[field].short} · เต็ม {FIELD_META[field].max}
                          </p>
                          {subject.visible[field] ? (
                            <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800">
                              {scores[field] ?? 0}
                            </p>
                          ) : (
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                              <Lock size={11} /> ซ่อน
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between rounded-xl bg-indigo-50/70 px-3 py-2">
                      <span className="text-xs text-indigo-800">
                        คะแนนรวม <span className="font-semibold tabular-nums">{total}</span>
                        <span className="text-indigo-400"> /100</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs text-indigo-500">
                        <TrendingUp size={12} /> เฉลี่ยห้อง {formatNumber(stats.total, 1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1 border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span className="inline-flex items-center gap-1.5">
                  <Info size={12} />
                  เกรดคำนวณจากคะแนนรวม 100 คะแนน · GPA เฉพาะวิชาที่ประกาศผลแล้ว
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Lock size={12} />
                  ช่องที่แสดง "ซ่อน" รอการเปิดเผยจากอาจารย์
                </span>
              </div>
            </>
          )}
        </section>

        {pendingCount > 0 && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 px-4 py-3.5">
            <Clock3 size={18} className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="text-[13px] font-medium text-amber-800">
                ยังมีอีก {pendingCount} วิชาที่อยู่ระหว่างการตรวจและยังไม่ประกาศผล
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-amber-700/80">
                ผลจะแสดงอัตโนมัติเมื่ออาจารย์เปิดเผยแพร่วิชาดังกล่าว กรุณาตรวจสอบอีกครั้งภายหลัง
              </p>
            </div>
          </div>
        )}

        <footer className="mt-8 flex flex-col items-center gap-1.5 text-center text-[11px] text-slate-400">
          <p className="flex items-center gap-1.5">
            <ShieldCheck size={12} />
            ข้อมูลผลการเรียนเป็นความลับส่วนบุคคล ห้ามเผยแพร่ต่อผู้อื่น
          </p>
          <p>
            {SCHOOL_NAME} · {DEPARTMENT} · {SEMESTER}
          </p>
          <p>หากพบข้อผิดพลาด กรุณาติดต่ออาจารย์ผู้สอน</p>
        </footer>
      </main>
    </div>
  )
}
