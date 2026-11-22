import React, { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Download,
  EyeOff,
  FileSpreadsheet,
  FileUp,
  MoreVertical,
  PencilLine,
  Search,
  Trash2,
  TrendingUp,
  Trophy,
  UserPen,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useApp } from '../../store/AppStore'
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  Dropdown,
  DropdownItem,
  EmptyState,
  PageHeader,
  Toggle,
  cn,
} from '../../components/ui'
import {
  FIELD_META,
  GRADE_STYLES,
  SCORE_FIELDS,
  formatNumber,
  gradeOf,
  initialsOf,
  mean,
  totalOf,
} from '../../lib/grades'
import { downloadAllXlsx, downloadSubjectCsv } from '../../lib/file'
import { ImportScoresModal, ScoreEditModal, StudentFormModal } from './ScoreModals'

function GradePill({ grade }) {
  return (
    <span
      className={cn(
        'inline-grid h-7 min-w-8 place-items-center rounded-lg px-1.5 text-[11px] font-semibold ring-1 ring-inset',
        GRADE_STYLES[grade],
      )}
    >
      {grade}
    </span>
  )
}

export default function Scores() {
  const { data, deleteStudent, togglePublish, notify } = useApp()
  const [subjectId, setSubjectId] = useState(data.subjects[0]?.id || '')
  const [search, setSearch] = useState('')
  const [scoreStudent, setScoreStudent] = useState(null)
  const [formState, setFormState] = useState({ open: false, mode: 'add', student: null })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [importOpen, setImportOpen] = useState(false)

  useEffect(() => {
    if (!data.subjects.some((subject) => subject.id === subjectId)) {
      setSubjectId(data.subjects[0]?.id || '')
    }
  }, [data.subjects, subjectId])

  const subject = data.subjects.find((item) => item.id === subjectId) || data.subjects[0]
  const students = useMemo(
    () => [...data.students].sort((a, b) => a.id.localeCompare(b.id)),
    [data.students],
  )

  const rows = useMemo(() => {
    if (!subject) return []
    return students.map((student) => {
      const scores = data.scores[subject.id]?.[student.id] || {
        assignment: 0,
        midterm: 0,
        final: 0,
      }
      const total = totalOf(scores)
      return { student, scores, total, grade: gradeOf(total) }
    })
  }, [students, data.scores, subject])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return rows
    return rows.filter(
      ({ student }) =>
        student.name.toLowerCase().includes(keyword) || student.id.includes(keyword),
    )
  }, [rows, search])

  const classTotals = rows.map((row) => row.total)
  const classAverage = mean(classTotals)
  const passedCount = classTotals.filter((total) => total >= 50).length
  const highestTotal = classTotals.length ? Math.max(...classTotals) : 0

  const handleTogglePublish = () => {
    if (!subject) return
    const next = togglePublish(subject.id)
    notify(
      next
        ? `เปิดเผยแพร่ผลวิชา ${subject.id} ให้นักศึกษาเห็นแล้ว`
        : `ซ่อนผลวิชา ${subject.id} จากนักศึกษาแล้ว`,
      next ? 'success' : 'info',
    )
  }

  const handleExportCsv = () => {
    if (!subject) return
    downloadSubjectCsv(subject, students, data.scores[subject.id])
    notify(`ส่งออกไฟล์ ${subject.id}-scores.csv แล้ว`, 'info')
  }

  const handleExportXlsx = () => {
    downloadAllXlsx(data.subjects, students, data.scores)
    notify('ส่งออกไฟล์ gradecheck-all-scores.xlsx แล้ว', 'info')
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteStudent(deleteTarget.id)
    notify(`ลบนักศึกษา ${deleteTarget.name} แล้ว`)
    setDeleteTarget(null)
  }

  if (!subject) {
    return <EmptyState icon={<FileSpreadsheet size={24} />} title="ยังไม่มีรายวิชาในระบบ" />
  }

  return (
    <div>
      <PageHeader
        eyebrow="จัดการคะแนน"
        title="ข้อมูลนักศึกษาและคะแนน"
        subtitle="เพิ่ม แก้ไข หรือลบคะแนน พร้อมนำเข้าและส่งออกข้อมูลได้ในที่เดียว"
        actions={
          <>
            <Dropdown
              button={
                <Button variant="secondary" className="w-full sm:w-auto">
                  <FileUp size={16} />
                  นำเข้า / ส่งออก
                  <MoreVertical size={14} className="text-slate-400" />
                </Button>
              }
            >
              <DropdownItem icon={FileUp} onClick={() => setImportOpen(true)}>
                นำเข้าคะแนน (CSV / Excel)
              </DropdownItem>
              <DropdownItem icon={Download} onClick={handleExportCsv}>
                ส่งออก CSV (วิชานี้)
              </DropdownItem>
              <DropdownItem icon={FileSpreadsheet} onClick={handleExportXlsx}>
                ส่งออก Excel (ทุกวิชา)
              </DropdownItem>
            </Dropdown>
            <Button
              onClick={() => setFormState({ open: true, mode: 'add', student: null })}
              className="w-full sm:w-auto"
            >
              <UserPlus size={16} />
              เพิ่มนักศึกษา
            </Button>
          </>
        }
      />

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        {data.subjects.map((item) => {
          const active = item.id === subject.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSubjectId(item.id)}
              className={cn(
                'flex shrink-0 items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition',
                active
                  ? 'border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200',
              )}
            >
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-semibold',
                  active ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-600',
                )}
              >
                {item.id.slice(0, 2)}
              </span>
              <span className="min-w-0">
                <span className={cn('block max-w-36 truncate text-xs font-medium', active ? 'text-white' : 'text-slate-800')}>
                  {item.name}
                </span>
                <span className={cn('block text-[10px]', active ? 'text-slate-400' : 'text-slate-400')}>
                  {item.id} · {item.published ? 'เผยแพร่' : 'ซ่อน'}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <section className="mt-4 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="indigo">{subject.id}</Badge>
              {subject.published ? (
                <Badge tone="emerald">
                  <CheckCircle2 size={12} /> เผยแพร่แล้ว
                </Badge>
              ) : (
                <Badge tone="slate">
                  <EyeOff size={12} /> ซ่อนจากนักศึกษา
                </Badge>
              )}
              <Badge tone="violet">{subject.credits} หน่วยกิต</Badge>
            </div>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{subject.name}</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {subject.teacher} · {data.students.length} นักศึกษาในห้อง {data.students[0]?.classroom}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 sm:justify-start">
            <div>
              <p className="text-xs font-medium text-slate-700">ประกาศผลวิชานี้</p>
              <p className="text-[11px] text-slate-400">
                {subject.published ? 'นักศึกษาเห็นผลแล้ว' : 'นักศึกษายังไม่เห็นผล'}
              </p>
            </div>
            <Toggle
              checked={subject.published}
              onChange={handleTogglePublish}
              label={`เปิดเผยแพร่ผลวิชา ${subject.id}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/50">
          <div className="px-3 py-3 text-center sm:px-5 sm:py-4">
            <p className="flex items-center justify-center gap-1 text-[10px] text-slate-500 sm:text-[11px]">
              <TrendingUp size={12} /> คะแนนเฉลี่ยห้อง
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-800 sm:text-xl">
              {formatNumber(classAverage, 1)}
              <span className="ml-0.5 text-[10px] font-normal text-slate-400">/100</span>
            </p>
          </div>
          <div className="px-3 py-3 text-center sm:px-5 sm:py-4">
            <p className="flex items-center justify-center gap-1 text-[10px] text-slate-500 sm:text-[11px]">
              <Users size={12} /> ผ่านเกณฑ์ (≥50)
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-800 sm:text-xl">
              {passedCount}
              <span className="ml-0.5 text-[10px] font-normal text-slate-400">/ {rows.length} คน</span>
            </p>
          </div>
          <div className="px-3 py-3 text-center sm:px-5 sm:py-4">
            <p className="flex items-center justify-center gap-1 text-[10px] text-slate-500 sm:text-[11px]">
              <Trophy size={12} /> คะแนนสูงสุด
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-800 sm:text-xl">
              {highestTotal}
              <span className="ml-0.5 text-[10px] font-normal text-slate-400">/100</span>
            </p>
          </div>
        </div>
      </section>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อหรือรหัสนักศึกษา…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-900 shadow-xs transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="ล้างคำค้นหา"
              className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">
          แสดง {filtered.length} จาก {rows.length} คน
          {search && <span className="text-slate-400"> · ค้นหา “{search}”</span>}
        </p>
      </div>

      <section className="mt-3 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={24} />}
            title="ไม่พบนักศึกษาที่ค้นหา"
            description="ลองตรวจสอบคำค้นหาหรือล้างตัวกรอง แล้วลองอีกครั้ง"
            action={
              <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
                ล้างคำค้นหา
              </Button>
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] text-slate-500">
                    <th className="px-5 py-3 text-left font-medium">นักศึกษา</th>
                    {SCORE_FIELDS.map((field) => (
                      <th key={field} className="px-3 py-3 text-center font-medium">
                        {FIELD_META[field].label}
                        <span className="block text-[10px] font-normal text-slate-400">
                          เต็ม {FIELD_META[field].max}
                        </span>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center font-medium">รวม</th>
                    <th className="px-3 py-3 text-center font-medium">เกรด</th>
                    <th className="px-5 py-3 text-right font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(({ student, scores, total, grade }) => (
                    <tr key={student.id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={initialsOf(student.name)} className="h-9 w-9 text-[11px]" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">{student.name}</p>
                            <p className="text-[11px] text-slate-400">
                              {student.id} · {student.classroom}
                            </p>
                          </div>
                        </div>
                      </td>
                      {SCORE_FIELDS.map((field) => (
                        <td key={field} className="px-3 py-3 text-center">
                          <span className="text-sm tabular-nums text-slate-700">{scores[field] ?? 0}</span>
                        </td>
                      ))}
                      <td className="px-3 py-3 text-center">
                        <span className="text-sm font-semibold tabular-nums text-slate-900">{total}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <GradePill grade={grade} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="soft" size="sm" onClick={() => setScoreStudent(student)}>
                            <PencilLine size={14} />
                            กรอกคะแนน
                          </Button>
                          <Dropdown
                            button={
                              <button
                                type="button"
                                aria-label={`ตัวเลือกของ ${student.name}`}
                                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                              >
                                <MoreVertical size={16} />
                              </button>
                            }
                          >
                            <DropdownItem
                              icon={UserPen}
                              onClick={() =>
                                setFormState({ open: true, mode: 'edit', student })
                              }
                            >
                              แก้ไขข้อมูลนักศึกษา
                            </DropdownItem>
                            <DropdownItem icon={Trash2} tone="danger" onClick={() => setDeleteTarget(student)}>
                              ลบนักศึกษา
                            </DropdownItem>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {filtered.map(({ student, scores, total, grade }) => (
                <div key={student.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={initialsOf(student.name)} className="h-10 w-10 text-xs" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{student.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {student.id} · {student.classroom}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-center gap-1">
                      <GradePill grade={grade} />
                      <span className="text-[10px] text-slate-400">เกรด</span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {SCORE_FIELDS.map((field) => (
                      <div key={field} className="rounded-xl bg-slate-50 px-2.5 py-2 ring-1 ring-inset ring-slate-100">
                        <p className="text-[10px] text-slate-400">
                          {FIELD_META[field].short} / {FIELD_META[field].max}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800">
                          {scores[field] ?? 0}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="rounded-xl bg-indigo-50/70 px-3 py-2 text-xs text-indigo-800">
                      รวม <span className="font-semibold tabular-nums">{total}</span>
                      <span className="text-indigo-400"> /100</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <Button variant="soft" size="sm" onClick={() => setScoreStudent(student)}>
                        <PencilLine size={14} />
                        กรอกคะแนน
                      </Button>
                      <Dropdown
                        button={
                          <button
                            type="button"
                            aria-label={`ตัวเลือกของ ${student.name}`}
                            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100"
                          >
                            <MoreVertical size={16} />
                          </button>
                        }
                      >
                        <DropdownItem
                          icon={UserPen}
                          onClick={() => setFormState({ open: true, mode: 'edit', student })}
                        >
                          แก้ไขข้อมูลนักศึกษา
                        </DropdownItem>
                        <DropdownItem icon={Trash2} tone="danger" onClick={() => setDeleteTarget(student)}>
                          ลบนักศึกษา
                        </DropdownItem>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col gap-1 border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span>ทุกการแก้ไขจะถูกบันทึกในประวัติการแก้ไขโดยอัตโนมัติ</span>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-1 font-medium text-indigo-500 transition hover:text-indigo-700"
          >
            <FileUp size={12} /> นำเข้าคะแนนแบบหลายรายการ
          </button>
        </div>
      </section>

      <StudentFormModal
        open={formState.open}
        onClose={() => setFormState((prev) => ({ ...prev, open: false }))}
        mode={formState.mode}
        student={formState.student}
        subject={subject}
      />
      <ScoreEditModal
        open={Boolean(scoreStudent)}
        onClose={() => setScoreStudent(null)}
        subject={subject}
        student={scoreStudent}
      />
      <ImportScoresModal open={importOpen} onClose={() => setImportOpen(false)} subject={subject} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="ลบนักศึกษาคนนี้?"
        description={
          deleteTarget
            ? `${deleteTarget.name} (${deleteTarget.id}) — คะแนนทุกวิชาจะถูกลบออกจากระบบ`
            : ''
        }
        confirmLabel="ลบนักศึกษา"
        icon={<Trash2 size={20} />}
      />
    </div>
  )
}
