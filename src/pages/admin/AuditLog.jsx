import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Download,
  Eye,
  FileUp,
  History,
  Megaphone,
  PencilLine,
  Search,
  SearchX,
  Trash2,
  UserPen,
  UserPlus,
  Users,
} from 'lucide-react'
import { useApp } from '../../store/AppStore'
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  PageHeader,
  Select,
} from '../../components/ui'
import { FIELD_META, formatDateTime, initialsOf } from '../../lib/grades'
import { downloadCsv } from '../../lib/file'

const ACTION_META = {
  score_edit: { label: 'แก้ไขคะแนน', tone: 'amber', icon: PencilLine },
  import: { label: 'นำเข้าคะแนน', tone: 'sky', icon: FileUp },
  student_add: { label: 'เพิ่มนักศึกษา', tone: 'emerald', icon: UserPlus },
  student_edit: { label: 'แก้ไขข้อมูล', tone: 'indigo', icon: UserPen },
  student_delete: { label: 'ลบนักศึกษา', tone: 'rose', icon: Trash2 },
  publish: { label: 'ประกาศผล', tone: 'violet', icon: Megaphone },
  visibility: { label: 'แสดง/ซ่อน', tone: 'slate', icon: Eye },
}

const ROLE_LABELS = {
  admin: 'ผู้ดูแลระบบ',
  teacher: 'อาจารย์',
  system: 'ระบบ',
}

const PAGE_SIZE = 10

function ActionBadge({ action }) {
  const meta = ACTION_META[action] || ACTION_META.score_edit
  const Icon = meta.icon
  return (
    <Badge tone={meta.tone}>
      <Icon size={12} />
      {meta.label}
    </Badge>
  )
}

function ChangeValues({ log, stacked = false }) {
  const hasValue = log.oldValue !== undefined || log.newValue !== undefined
  if (!hasValue) return <span className="text-slate-300">—</span>
  return (
    <div className={stacked ? 'flex flex-wrap items-center gap-1.5' : 'flex flex-col items-center gap-1'}>
      {log.field && FIELD_META[log.field] && (
        <span className="text-[10px] text-slate-400">{FIELD_META[log.field].label}</span>
      )}
      <div className="flex items-center gap-1.5">
        <span className="rounded-md bg-rose-50 px-2 py-1 font-mono text-[11px] font-medium text-rose-600 ring-1 ring-inset ring-rose-100">
          {log.oldValue ?? '—'}
        </span>
        <ArrowRight size={11} className="text-slate-300" />
        <span className="rounded-md bg-emerald-50 px-2 py-1 font-mono text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100">
          {log.newValue ?? '—'}
        </span>
      </div>
    </div>
  )
}

export default function AuditLog() {
  const { data, notify } = useApp()
  const [query, setQuery] = useState('')
  const [action, setAction] = useState('all')
  const [subjectId, setSubjectId] = useState('all')
  const [page, setPage] = useState(1)

  const subjectMap = useMemo(
    () => Object.fromEntries(data.subjects.map((subject) => [subject.id, subject])),
    [data.subjects],
  )

  useEffect(() => {
    setPage(1)
  }, [query, action, subjectId])

  const logs = useMemo(
    () =>
      [...data.auditLogs].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
    [data.auditLogs],
  )

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return logs.filter((log) => {
      if (action !== 'all' && log.action !== action) return false
      if (subjectId !== 'all' && log.subjectId !== subjectId) return false
      if (!keyword) return true
      const subject = subjectMap[log.subjectId]
      const haystack = [
        log.actor,
        log.studentName,
        log.studentId,
        log.detail,
        log.oldValue,
        log.newValue,
        subject?.id,
        subject?.name,
        FIELD_META[log.field]?.label,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }, [logs, query, action, subjectId, subjectMap])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const todayKey = new Date().toDateString()
  const todayCount = logs.filter((log) => new Date(log.at).toDateString() === todayKey).length
  const editCount = logs.filter((log) => log.action === 'score_edit').length
  const actorCount = new Set(logs.map((log) => log.actor)).size

  const describe = (log) => {
    const subject = subjectMap[log.subjectId]
    const subjectLabel = subject ? `${subject.id} ${subject.name}` : log.subjectId || '—'
    const studentName = log.studentName || data.students.find((s) => s.id === log.studentId)?.name
    const studentLabel = log.studentId
      ? `${studentName || 'ไม่ทราบชื่อ'} (${log.studentId})`
      : ''

    if (log.action === 'score_edit') {
      return { primary: studentLabel, secondary: subjectLabel }
    }
    if (log.action === 'visibility') {
      return { primary: subjectLabel, secondary: `ช่อง${FIELD_META[log.field]?.label || 'คะแนน'}` }
    }
    if (log.action === 'publish') {
      return { primary: subjectLabel, secondary: 'สถานะการประกาศผลรายวิชา' }
    }
    if (log.action === 'import') {
      return {
        primary: studentLabel || subjectLabel,
        secondary: [studentLabel ? subjectLabel : '', log.detail].filter(Boolean).join(' · '),
      }
    }
    if (log.action === 'student_add' || log.action === 'student_edit' || log.action === 'student_delete') {
      return { primary: studentLabel || log.detail, secondary: log.detail !== studentLabel ? log.detail : '' }
    }
    return { primary: subjectLabel, secondary: log.detail || '' }
  }

  const handleExport = () => {
    const rows = [
      [
        'เวลา',
        'ผู้ดำเนินการ',
        'บทบาท',
        'การกระทำ',
        'รหัสนักศึกษา',
        'ชื่อนักศึกษา',
        'วิชา',
        'ช่องคะแนน',
        'ค่าเดิม',
        'ค่าใหม่',
        'รายละเอียด',
      ],
      ...filtered.map((log) => [
        formatDateTime(log.at),
        log.actor,
        ROLE_LABELS[log.role] || log.role,
        ACTION_META[log.action]?.label || log.action,
        log.studentId || '',
        log.studentName || '',
        log.subjectId || '',
        log.field ? FIELD_META[log.field]?.label || log.field : '',
        log.oldValue ?? '',
        log.newValue ?? '',
        log.detail || '',
      ]),
    ]
    downloadCsv('gradecheck-audit-log.csv', rows)
    notify(`ส่งออกประวัติ ${filtered.length} รายการแล้ว`, 'info')
  }

  const clearFilters = () => {
    setQuery('')
    setAction('all')
    setSubjectId('all')
  }

  return (
    <div>
      <PageHeader
        eyebrow="Audit Log"
        title="ประวัติการแก้ไข"
        subtitle="บันทึกทุกการเปลี่ยนแปลงคะแนน การจัดการนักศึกษา และการประกาศผล พร้อมผู้ดำเนินการและเวลา"
        actions={
          <Button variant="secondary" onClick={handleExport} disabled={!filtered.length}>
            <Download size={16} />
            ส่งออก CSV
          </Button>
        }
      />

      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:p-4">
          <p className="flex items-center gap-1.5 text-[10px] text-slate-500 sm:text-[11px]">
            <History size={13} className="text-indigo-500" /> รายการทั้งหมด
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900 sm:text-xl">
            {logs.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:p-4">
          <p className="flex items-center gap-1.5 text-[10px] text-slate-500 sm:text-[11px]">
            <PencilLine size={13} className="text-amber-500" /> รายการวันนี้
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900 sm:text-xl">
            {todayCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:p-4">
          <p className="flex items-center gap-1.5 text-[10px] text-slate-500 sm:text-[11px]">
            <Users size={13} className="text-emerald-500" /> แก้ไขคะแนน
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900 sm:text-xl">
            {editCount}
            <span className="ml-1 text-[10px] font-normal text-slate-400">จาก {actorCount} คน</span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาผู้แก้ไข นักศึกษา หรือรายละเอียด…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-xs transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Select
            value={action}
            onChange={(event) => setAction(event.target.value)}
            aria-label="กรองตามการกระทำ"
          >
            <option value="all">ทุกการกระทำ</option>
            {Object.entries(ACTION_META).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
          <Select
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            aria-label="กรองตามรายวิชา"
          >
            <option value="all">ทุกวิชา</option>
            {data.subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.id} — {subject.name}
              </option>
            ))}
          </Select>
        </div>
        {(query || action !== 'all' || subjectId !== 'all') && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-left text-[11px] font-medium text-indigo-500 transition hover:text-indigo-700 sm:ml-1 sm:whitespace-nowrap"
          >
            ล้างตัวกรอง
          </button>
        )}
      </div>

      <section className="mt-3 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<SearchX size={24} />}
            title="ไม่พบประวัติที่ตรงกับตัวกรอง"
            description="ลองเปลี่ยนคำค้นหา การกระทำ หรือรายวิชา แล้วตรวจสอบอีกครั้ง"
            action={
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                ล้างตัวกรองทั้งหมด
              </Button>
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[960px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] text-slate-500">
                    <th className="px-5 py-3 text-left font-medium">เวลา</th>
                    <th className="px-3 py-3 text-left font-medium">ผู้ดำเนินการ</th>
                    <th className="px-3 py-3 text-left font-medium">การกระทำ</th>
                    <th className="px-3 py-3 text-left font-medium">รายละเอียด</th>
                    <th className="px-5 py-3 text-center font-medium">ค่าเดิม → ค่าใหม่</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageRows.map((log) => {
                    const desc = describe(log)
                    return (
                      <tr key={log.id} className="transition hover:bg-slate-50/60">
                        <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500">
                          {formatDateTime(log.at)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={initialsOf(log.actor)} className="h-7 w-7 text-[10px]" />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-slate-700">{log.actor}</p>
                              <p className="text-[10px] text-slate-400">
                                {ROLE_LABELS[log.role] || log.role}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <ActionBadge action={log.action} />
                        </td>
                        <td className="max-w-[26rem] px-3 py-3">
                          <p className="truncate text-[13px] text-slate-800">{desc.primary || '—'}</p>
                          {desc.secondary && (
                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-400">
                              {desc.secondary}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <ChangeValues log={log} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden">
              {pageRows.map((log) => {
                const desc = describe(log)
                return (
                  <div key={log.id} className="space-y-2.5 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <ActionBadge action={log.action} />
                      <span className="whitespace-nowrap text-[10px] text-slate-400">
                        {formatDateTime(log.at)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-slate-800">{desc.primary || '—'}</p>
                      {desc.secondary && (
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                          {desc.secondary}
                        </p>
                      )}
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <ChangeValues log={log} stacked />
                    </div>
                    <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Avatar name={initialsOf(log.actor)} className="h-5 w-5 text-[9px]" />
                      โดย {log.actor} · {ROLE_LABELS[log.role] || log.role}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-[11px] text-slate-400">
                แสดง {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  ก่อนหน้า
                </Button>
                <span className="min-w-12 text-center text-[11px] text-slate-500">
                  {safePage} / {pageCount}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={safePage >= pageCount}
                  onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
        <History size={12} />
        ประวัติการแก้ไขถูกบันทึกอัตโนมัติและไม่สามารถลบออกได้ผ่านหน้าจอผู้ใช้งาน
      </p>
    </div>
  )
}
