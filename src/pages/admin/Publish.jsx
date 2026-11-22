import React from 'react'
import { CheckCircle2, Eye, EyeOff, Info, Lock, Megaphone, ShieldCheck } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { Badge, PageHeader, Toggle, cn } from '../../components/ui'
import { FIELD_META, SCORE_FIELDS } from '../../lib/grades'

export default function Publish() {
  const { data, togglePublish, toggleVisibility, notify } = useApp()

  const publishedCount = data.subjects.filter((subject) => subject.published).length

  const handlePublish = (subject) => {
    const next = togglePublish(subject.id)
    notify(
      next ? `เปิดเผยแพร่ผลวิชา ${subject.id} ให้นักศึกษาเห็นแล้ว` : `ซ่อนผลวิชา ${subject.id} จากนักศึกษาแล้ว`,
      next ? 'success' : 'info',
    )
  }

  const handleVisibility = (subject, field) => {
    const next = toggleVisibility(subject.id, field)
    notify(
      `${next ? 'แสดง' : 'ซ่อน'}${FIELD_META[field].label} วิชา ${subject.id} แล้ว · บันทึกประวัติอัตโนมัติ`,
      'info',
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="ควบคุมการแสดงผล"
        title="ควบคุมการประกาศผล"
        subtitle="เลือกวิชาและช่องคะแนนที่นักศึกษาสามารถเห็นได้ พร้อมบันทึกทุกการเปลี่ยนแปลง"
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge tone="emerald">
              <CheckCircle2 size={12} /> เผยแพร่ {publishedCount} วิชา
            </Badge>
            <Badge tone="slate">
              <EyeOff size={12} /> ซ่อน {data.subjects.length - publishedCount} วิชา
            </Badge>
          </div>
        }
      />

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3.5">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-indigo-500" />
        <p className="text-xs leading-relaxed text-indigo-900/80">
          นักศึกษาจะเห็นเฉพาะรายวิชาที่ <span className="font-semibold">เผยแพร่แล้ว</span> และเฉพาะช่องคะแนนที่{' '}
          <span className="font-semibold">เปิดแสดง</span> เท่านั้น
          ค่าเฉลี่ยของห้องจะแสดงเฉพาะวิชาที่ประกาศผลแล้ว การตั้งค่าช่องคะแนนสามารถเตรียมไว้ล่วงหน้าได้
          และทุกการเปลี่ยนแปลงจะถูกบันทึกในประวัติการแก้ไขทันที
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {data.subjects.map((subject) => {
          const visibleCount = SCORE_FIELDS.filter((field) => subject.visible[field]).length
          return (
            <section
              key={subject.id}
              className={cn(
                'overflow-hidden rounded-3xl border bg-white shadow-sm transition',
                subject.published ? 'border-slate-200/80' : 'border-slate-200/60 bg-slate-50/30',
              )}
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-4 sm:p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="indigo">{subject.id}</Badge>
                    {subject.published ? (
                      <Badge tone="emerald">
                        <CheckCircle2 size={12} /> เผยแพร่แล้ว
                      </Badge>
                    ) : (
                      <Badge tone="slate">
                        <EyeOff size={12} /> ซ่อนอยู่
                      </Badge>
                    )}
                  </div>
                  <h2 className="mt-2 text-[15px] font-semibold leading-snug text-slate-900">
                    {subject.name}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {subject.teacher} · {subject.credits} หน่วยกิต
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Toggle
                    checked={subject.published}
                    onChange={() => handlePublish(subject)}
                    label={`ประกาศผลวิชา ${subject.id}`}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-medium',
                      subject.published ? 'text-emerald-600' : 'text-slate-400',
                    )}
                  >
                    {subject.published ? 'เผยแพร่' : 'ซ่อน'}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <p className="text-[11px] font-medium text-slate-500">
                  ช่องคะแนนที่นักศึกษาเห็น
                  {!subject.published && (
                    <span className="ml-1 font-normal text-slate-400">(มีผลเมื่อเปิดเผยแพร่)</span>
                  )}
                </p>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                  {SCORE_FIELDS.map((field) => {
                    const visible = subject.visible[field]
                    const active = visible && subject.published
                    return (
                      <div
                        key={field}
                        className={cn(
                          'flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 transition',
                          active
                            ? 'border-emerald-100 bg-emerald-50/40'
                            : 'border-slate-100 bg-slate-50/60',
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              'grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white',
                              active ? 'text-emerald-600' : 'text-slate-400',
                            )}
                          >
                            {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-medium text-slate-700">
                              {FIELD_META[field].label}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              เต็ม {FIELD_META[field].max} · {visible ? 'แสดง' : 'ซ่อน'}
                            </span>
                          </span>
                        </div>
                        <Toggle
                          checked={visible}
                          onChange={() => handleVisibility(subject, field)}
                          label={`${visible ? 'ซ่อน' : 'แสดง'}${FIELD_META[field].label} วิชา ${subject.id}`}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-start gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 text-[11px] leading-relaxed text-slate-500 sm:px-5">
                {subject.published ? (
                  <>
                    <Info size={13} className="mt-0.5 shrink-0 text-indigo-400" />
                    <span>
                      นักศึกษาเห็น {visibleCount}/{SCORE_FIELDS.length} ช่องคะแนน · คะแนนรวมและเกรดจะแสดงเสมอเมื่อวิชาถูกเผยแพร่
                    </span>
                  </>
                ) : (
                  <>
                    <Lock size={13} className="mt-0.5 shrink-0 text-slate-400" />
                    <span>วิชานี้ถูกซ่อนจากนักศึกษา — เปิดสวิตช์ด้านบนเพื่อให้นักศึกษาเห็นผล</span>
                  </>
                )}
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
        <Megaphone size={17} className="mt-0.5 shrink-0 text-violet-500" />
        <p className="text-xs leading-relaxed text-slate-500">
          แนะนำ: ตรวจสอบคะแนนให้ครบถ้วนก่อนกดเผยแพร่ · การซ่อนวิชาจะไม่ลบข้อมูลคะแนน
          และสามารถเปิดเผยแพร่ซ้ำได้ทุกเมื่อ
        </p>
      </div>
    </div>
  )
}
