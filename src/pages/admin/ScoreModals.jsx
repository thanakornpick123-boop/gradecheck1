import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  Loader2,
  UploadCloud,
  UserPen,
  UserPlus,
  X,
} from 'lucide-react'
import { Badge, Button, Input, Modal, Toggle, cn } from '../../components/ui'
import { useApp } from '../../store/AppStore'
import {
  FIELD_META,
  GRADE_STYLES,
  SCORE_FIELDS,
  formatNumber,
  gradeOf,
  totalOf,
} from '../../lib/grades'
import { CLASSROOM } from '../../data/seed'
import {
  downloadImportTemplate,
  isTabularFile,
  readTabularFile,
  recordsFromRows,
} from '../../lib/file'

function ScoreFieldInput({ field, value, onChange, error }) {
  const meta = FIELD_META[field]
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-1 text-xs font-medium text-slate-600">
        {meta.short}
        <span className="text-[10px] font-normal text-slate-400">/{meta.max}</span>
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={meta.max}
        step={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'w-full rounded-xl border py-2 text-center text-lg font-semibold tabular-nums text-slate-900 shadow-xs transition focus:outline-none focus:ring-4',
          error
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:ring-indigo-100',
        )}
      />
      {error ? (
        <span className="mt-1 block text-[10px] leading-tight text-rose-600">{error}</span>
      ) : (
        <span className="mt-1 block text-[10px] leading-tight text-slate-400">{meta.label}</span>
      )}
    </label>
  )
}

export function StudentFormModal({ open, onClose, mode = 'add', student, subject }) {
  const { addStudent, updateStudent, notify } = useApp()
  const isEdit = mode === 'edit'
  const [form, setForm] = useState({ id: '', name: '', classroom: CLASSROOM, verifyCode: '' })
  const [initialScores, setInitialScores] = useState({ assignment: '', midterm: '', final: '' })
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')

  useEffect(() => {
    if (!open) return
    setErrors({})
    setGeneralError('')
    if (isEdit && student) {
      setForm({
        id: student.id,
        name: student.name,
        classroom: student.classroom,
        verifyCode: student.verifyCode,
      })
      setInitialScores({ assignment: '', midterm: '', final: '' })
    } else {
      setForm({ id: '', name: '', classroom: CLASSROOM, verifyCode: '' })
      setInitialScores({ assignment: '', midterm: '', final: '' })
    }
  }, [open, isEdit, student])

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setGeneralError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!isEdit && !/^\d{5,12}$/.test(form.id)) nextErrors.id = 'ต้องเป็นตัวเลข 5–12 หลัก'
    if (!form.name.trim()) nextErrors.name = 'กรุณากรอกชื่อ-นามสกุล'
    if (!/^\d{4}$/.test(form.verifyCode)) nextErrors.verifyCode = 'ต้องเป็นตัวเลข 4 หลัก'

    if (!isEdit) {
      SCORE_FIELDS.forEach((field) => {
        const raw = initialScores[field]
        if (raw === '') return
        const value = Number(raw)
        if (!Number.isInteger(value) || value < 0 || value > FIELD_META[field].max) {
          nextErrors[`score_${field}`] = `0–${FIELD_META[field].max}`
        }
      })
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    if (isEdit) {
      const result = updateStudent(student.id, form)
      if (!result.ok) {
        setGeneralError(result.error)
        return
      }
      notify(result.unchanged ? 'ไม่มีข้อมูลที่เปลี่ยนแปลง' : 'บันทึกข้อมูลนักศึกษาแล้ว', result.unchanged ? 'info' : 'success')
      onClose()
      return
    }

    const scores = {}
    SCORE_FIELDS.forEach((field) => {
      if (initialScores[field] !== '') scores[field] = Number(initialScores[field])
    })
    const result = addStudent({
      ...form,
      initialSubjectId: subject?.id,
      initialScores: Object.keys(scores).length ? scores : undefined,
    })
    if (!result.ok) {
      setGeneralError(result.error)
      return
    }
    notify(`เพิ่มนักศึกษา ${form.name} แล้ว`)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'แก้ไขข้อมูลนักศึกษา' : 'เพิ่มนักศึกษาใหม่'}
      subtitle={isEdit ? `รหัส ${student?.id}` : 'กรอกข้อมูลพื้นฐานและคะแนนเริ่มต้น (ถ้ามี)'}
      icon={isEdit ? <UserPen size={20} /> : <UserPlus size={20} />}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit}>{isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มนักศึกษา'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {isEdit ? (
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm ring-1 ring-inset ring-slate-100">
            <span className="text-slate-500">รหัสนักศึกษา</span>
            <span className="font-mono font-medium text-slate-800">{student?.id}</span>
          </div>
        ) : (
          <Input
            label="รหัสนักศึกษา"
            placeholder="เช่น 67010025"
            value={form.id}
            onChange={(event) => setField('id', event.target.value.replace(/\D/g, '').slice(0, 12))}
            inputMode="numeric"
            error={errors.id}
          />
        )}

        <Input
          label="ชื่อ-นามสกุล"
          placeholder="เช่น สมชาย ใจดี"
          value={form.name}
          onChange={(event) => setField('name', event.target.value)}
          error={errors.name}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="ชั้นเรียน"
            value={form.classroom}
            onChange={(event) => setField('classroom', event.target.value)}
            placeholder={CLASSROOM}
          />
          <Input
            label="รหัสยืนยันตัวตน"
            placeholder="4 หลัก"
            value={form.verifyCode}
            onChange={(event) =>
              setField('verifyCode', event.target.value.replace(/\D/g, '').slice(0, 4))
            }
            inputMode="numeric"
            maxLength={4}
            hint="นักเรียนใช้รหัสนี้เข้าดูคะแนน"
            error={errors.verifyCode}
          />
        </div>

        {!isEdit && subject && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-600">
                คะแนนเริ่มต้น · {subject.id}
              </p>
              <span className="text-[10px] text-slate-400">เว้นว่างได้</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {SCORE_FIELDS.map((field) => (
                <ScoreFieldInput
                  key={field}
                  field={field}
                  value={initialScores[field]}
                  onChange={(value) =>
                    setInitialScores((prev) => ({ ...prev, [field]: value.slice(0, 2) }))
                  }
                  error={errors[`score_${field}`]}
                />
              ))}
            </div>
          </div>
        )}

        {generalError && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-[13px] text-rose-700">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {generalError}
          </div>
        )}
      </form>
    </Modal>
  )
}

export function ScoreEditModal({ open, onClose, subject, student }) {
  const { data, saveScores, notify } = useApp()
  const [values, setValues] = useState({ assignment: '', midterm: '', final: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open || !subject || !student) return
    const current = data.scores[subject.id]?.[student.id] || {}
    setValues({
      assignment: String(current.assignment ?? 0),
      midterm: String(current.midterm ?? 0),
      final: String(current.final ?? 0),
    })
    setErrors({})
  }, [open, subject?.id, student?.id, data.scores])

  const previewTotal = totalOf({
    assignment: Number(values.assignment) || 0,
    midterm: Number(values.midterm) || 0,
    final: Number(values.final) || 0,
  })
  const previewGrade = gradeOf(previewTotal)

  const handleSave = () => {
    const nextErrors = {}
    const parsed = {}
    SCORE_FIELDS.forEach((field) => {
      const raw = String(values[field]).trim()
      const value = Number(raw)
      if (raw === '' || !Number.isFinite(value) || !Number.isInteger(value)) {
        nextErrors[field] = 'กรอกเป็นจำนวนเต็ม'
      } else if (value < 0 || value > FIELD_META[field].max) {
        nextErrors[field] = `ต้องอยู่ระหว่าง 0–${FIELD_META[field].max}`
      } else {
        parsed[field] = value
      }
    })
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    const changed = saveScores(subject.id, student.id, parsed)
    notify(
      changed ? `บันทึกคะแนนแล้ว (${changed} ช่อง)` : 'ไม่มีการเปลี่ยนแปลงคะแนน',
      changed ? 'success' : 'info',
    )
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="แก้ไขคะแนน"
      subtitle={
        student && subject
          ? `${student.name} · รหัส ${student.id} · ${subject.id} ${subject.name}`
          : ''
      }
      icon={<FileSpreadsheet size={20} />}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave}>บันทึกคะแนน</Button>
        </>
      }
    >
      {student && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            {SCORE_FIELDS.map((field) => (
              <ScoreFieldInput
                key={field}
                field={field}
                value={values[field]}
                onChange={(value) => {
                  setValues((prev) => ({ ...prev, [field]: value.slice(0, 2) }))
                  setErrors((prev) => ({ ...prev, [field]: undefined }))
                }}
                error={errors[field]}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-violet-50/60 px-4 py-3.5">
            <div>
              <p className="text-[11px] text-indigo-500">คะแนนรวม (อัตโนมัติ)</p>
              <p className="mt-0.5 text-2xl font-semibold tabular-nums text-indigo-900">
                {formatNumber(previewTotal)}
                <span className="ml-1 text-xs font-normal text-indigo-400">/100</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-indigo-500">เกรดคาดการณ์</p>
              <span
                className={cn(
                  'mt-1 inline-grid h-9 min-w-11 place-items-center rounded-xl text-sm font-semibold ring-1 ring-inset',
                  GRADE_STYLES[previewGrade],
                )}
              >
                {previewGrade}
              </span>
            </div>
          </div>

          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
            <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-400" />
            ทุกครั้งที่คะแนนเปลี่ยนแปลง ระบบจะบันทึกผู้แก้ไข เวลา และค่าเดิม → ค่าใหม่ ไว้ในประวัติการแก้ไขโดยอัตโนมัติ
          </p>
        </div>
      )}
    </Modal>
  )
}

function validateRecords(records, students, allowCreate) {
  const seen = new Set()
  return records.map((record) => {
    const errors = []
    const id = String(record.studentId || '').trim()
    if (!/^\d{5,12}$/.test(id)) {
      errors.push('รหัสนักศึกษาไม่ถูกต้อง (5–12 หลัก)')
    } else if (seen.has(id)) {
      errors.push('รหัสนักศึกษาซ้ำในไฟล์')
    }
    if (id) seen.add(id)

    const existing = students.find((s) => s.id === id)
    if (!existing && !allowCreate) errors.push('ไม่พบนักศึกษาในระบบ')
    if (!existing && !String(record.name || '').trim()) errors.push('ต้องระบุชื่อนักศึกษาใหม่')

    let hasScores = false
    SCORE_FIELDS.forEach((field) => {
      const value = record.scores?.[field]
      if (value === null || value === undefined) return
      hasScores = true
      if (!Number.isFinite(value)) {
        errors.push(`${FIELD_META[field].label} ไม่ใช่ตัวเลข`)
      } else if (!Number.isInteger(value) || value < 0 || value > FIELD_META[field].max) {
        errors.push(`${FIELD_META[field].label} ต้องเป็น 0–${FIELD_META[field].max}`)
      }
    })
    if (!hasScores) errors.push('ไม่มีข้อมูลคะแนน')

    return {
      ...record,
      studentId: id,
      errors,
      isNew: !existing,
      existingStudent: existing,
    }
  })
}

export function ImportScoresModal({ open, onClose, subject }) {
  const { data, importScores, notify } = useApp()
  const [fileName, setFileName] = useState('')
  const [rawRecords, setRawRecords] = useState(null)
  const [error, setError] = useState('')
  const [allowCreate, setAllowCreate] = useState(true)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [importing, setImporting] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) return
    setFileName('')
    setRawRecords(null)
    setError('')
    setAllowCreate(true)
    setDragActive(false)
    setImporting(false)
  }, [open])

  const validated = useMemo(
    () => (rawRecords ? validateRecords(rawRecords, data.students, allowCreate) : []),
    [rawRecords, data.students, allowCreate],
  )

  const validRows = validated.filter((row) => row.errors.length === 0)
  const newCount = validRows.filter((row) => row.isNew).length
  const changedCount = validRows.filter((row) => {
    if (row.isNew) return true
    const current = data.scores[subject?.id]?.[row.studentId] || {}
    return SCORE_FIELDS.some(
      (field) => row.scores?.[field] != null && row.scores[field] !== (current[field] ?? 0),
    )
  }).length
  const errorCount = validated.length - validRows.length

  const pickFile = () => inputRef.current?.click()

  const handleFile = async (file) => {
    if (!file) return
    setError('')
    if (!isTabularFile(file)) {
      setError('รองรับเฉพาะไฟล์ .csv, .xlsx หรือ .xls')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('ไฟล์มีขนาดเกิน 5 MB กรุณาแบ่งไฟล์แล้วลองอีกครั้ง')
      return
    }
    setLoading(true)
    try {
      const rows = await readTabularFile(file)
      const parsed = recordsFromRows(rows)
      if (parsed.error) {
        setError(parsed.error)
        setRawRecords(null)
        setFileName(file.name)
        return
      }
      setRawRecords(parsed.records)
      setFileName(file.name)
    } catch {
      setError('ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์อีกครั้ง')
      setRawRecords(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    handleFile(file)
  }

  const handleImport = () => {
    if (!validRows.length || !subject) return
    setImporting(true)
    const summary = importScores(subject.id, validRows)
    const parts = []
    if (summary.updated) parts.push(`อัปเดต ${summary.updated} คน`)
    if (summary.created) parts.push(`เพิ่มใหม่ ${summary.created} คน`)
    if (summary.fields) parts.push(`${summary.fields} ช่องคะแนน`)
    notify(
      parts.length
        ? `นำเข้าคะแนนสำเร็จ · ${parts.join(' · ')}${errorCount ? ` (ข้าม ${errorCount} แถว)` : ''}`
        : `อ่านไฟล์สำเร็จ แต่ไม่มีคะแนนที่เปลี่ยนแปลง${errorCount ? ` (ข้าม ${errorCount} แถว)` : ''}`,
      parts.length ? 'success' : 'info',
    )
    setImporting(false)
    onClose()
  }

  const resetFile = () => {
    setFileName('')
    setRawRecords(null)
    setError('')
    setDragActive(false)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="นำเข้าคะแนนจากไฟล์"
      subtitle={subject ? `${subject.id} ${subject.name} · รองรับ CSV / Excel` : ''}
      icon={<FileUp size={20} />}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            ยกเลิก
          </Button>
          {rawRecords ? (
            <Button onClick={handleImport} disabled={!validRows.length || importing}>
              {importing && <Loader2 size={16} className="animate-spin" />}
              นำเข้าคะแนน ({validRows.length} รายการ)
            </Button>
          ) : (
            <Button onClick={pickFile} loading={loading}>
              <UploadCloud size={16} />
              เลือกไฟล์
            </Button>
          )}
        </>
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.txt"
        className="hidden"
        onChange={(event) => {
          handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      {!rawRecords ? (
        <div className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            onClick={pickFile}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') pickFile()
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition',
              dragActive
                ? 'border-indigo-400 bg-indigo-50/70'
                : 'border-slate-200 bg-slate-50/60 hover:border-indigo-300 hover:bg-indigo-50/40',
            )}
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-indigo-500 shadow-sm ring-1 ring-slate-100">
              {loading ? <Loader2 size={22} className="animate-spin" /> : <UploadCloud size={22} />}
            </span>
            <p className="mt-3 text-sm font-medium text-slate-700">
              {loading ? 'กำลังอ่านไฟล์…' : 'ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์'}
            </p>
            <p className="mt-1 text-xs text-slate-400">CSV, XLSX หรือ XLS · ขนาดไม่เกิน 5 MB</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-[13px] text-rose-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-2.5">
              <FileSpreadsheet size={18} className="mt-0.5 shrink-0 text-emerald-500" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-slate-700">ยังไม่มีไฟล์? ดาวน์โหลดเทมเพลต</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                  คอลัมน์ที่ต้องมี: studentId, name, assignment, midterm, final
                  <br />
                  ช่องคะแนนที่เว้นว่างจะไม่ถูกแก้ไข
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => subject && downloadImportTemplate(data.students, data.scores, subject.id, 'xlsx')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-200"
                  >
                    <Download size={12} /> เทมเพลต Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => subject && downloadImportTemplate(data.students, data.scores, subject.id, 'csv')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-200"
                  >
                    <Download size={12} /> เทมเพลต CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <FileSpreadsheet size={16} className="shrink-0 text-emerald-500" />
              <span className="truncate text-xs font-medium text-slate-700">{fileName}</span>
              <span className="shrink-0 text-[11px] text-slate-400">{validated.length} แถว</span>
            </div>
            <button
              type="button"
              onClick={resetFile}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-500 transition hover:bg-white hover:text-slate-800"
            >
              <X size={12} /> เปลี่ยนไฟล์
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-indigo-50/70 px-3 py-2.5 text-center">
              <p className="text-[10px] text-indigo-500">พร้อมนำเข้า</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-indigo-700">
                {validRows.length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50/70 px-3 py-2.5 text-center">
              <p className="text-[10px] text-emerald-600">เพิ่มใหม่</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-700">{newCount}</p>
            </div>
            <div className="rounded-xl bg-rose-50/70 px-3 py-2.5 text-center">
              <p className="text-[10px] text-rose-500">ผิดพลาด</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-rose-600">{errorCount}</p>
            </div>
          </div>

          <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-3">
            <div>
              <p className="text-xs font-medium text-slate-700">เพิ่มนักศึกษาอัตโนมัติ</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                หากไม่พบรหัสในระบบ · รหัสยืนยันเริ่มต้น = 4 ตัวท้ายของรหัส
              </p>
            </div>
            <Toggle
              checked={allowCreate}
              onChange={setAllowCreate}
              label="เพิ่มนักศึกษาอัตโนมัติหากไม่พบในระบบ"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="max-h-64 overflow-auto">
              <table className="w-full min-w-[540px] text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">แถว</th>
                    <th className="px-3 py-2 font-medium">รหัส / ชื่อ</th>
                    <th className="px-2 py-2 text-center font-medium">เก็บ</th>
                    <th className="px-2 py-2 text-center font-medium">กลาง</th>
                    <th className="px-2 py-2 text-center font-medium">ปลาย</th>
                    <th className="px-3 py-2 text-right font-medium">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validated.map((row) => (
                    <tr key={`${row.__row}-${row.studentId}`} className={row.errors.length ? 'bg-rose-50/40' : ''}>
                      <td className="px-3 py-2 tabular-nums text-slate-400">{row.__row}</td>
                      <td className="px-3 py-2">
                        <p className="font-medium text-slate-700">{row.studentId || '—'}</p>
                        <p className="text-[10px] text-slate-400">
                          {row.existingStudent?.name || row.name || (row.isNew ? 'นักศึกษาใหม่' : '—')}
                        </p>
                        {row.errors.length > 0 && (
                          <p className="mt-0.5 text-[10px] leading-tight text-rose-600">
                            {row.errors.join(' · ')}
                          </p>
                        )}
                      </td>
                      {SCORE_FIELDS.map((field) => (
                        <td key={field} className="px-2 py-2 text-center tabular-nums text-slate-600">
                          {Number.isFinite(row.scores?.[field]) ? row.scores[field] : '—'}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right">
                        {row.errors.length ? (
                          <Badge tone="rose">ผิดพลาด</Badge>
                        ) : row.isNew ? (
                          <Badge tone="emerald">ใหม่</Badge>
                        ) : (
                          <Badge tone="amber">อัปเดต</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
            <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-400" />
            แถวที่มีข้อผิดพลาดจะถูกข้าม · {changedCount} รายการมีคะแนนที่แตกต่างจากปัจจุบัน และจะถูกบันทึกในประวัติการแก้ไข
          </p>
        </div>
      )}
    </Modal>
  )
}
