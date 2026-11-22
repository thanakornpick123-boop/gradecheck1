import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { buildSeed, DATA_VERSION, SESSION_KEY, STORAGE_KEY } from '../data/seed'
import { EMPTY_SCORES, FIELD_META, SCORE_FIELDS, uid } from '../lib/grades'

const AppContext = createContext(null)

function clone(value) {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value))
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.version === DATA_VERSION) return parsed
    }
  } catch {
    // corrupted storage falls back to the seed
  }
  return buildSeed()
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AppProvider({ children }) {
  const [data, setData] = useState(loadData)
  const [session, setSession] = useState(loadSession)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else localStorage.removeItem(SESSION_KEY)
  }, [session])

  const notify = useCallback((message, type = 'success') => {
    const id = uid('toast')
    setToasts((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3600)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const actor = useMemo(() => {
    if (session?.role === 'admin') {
      return { actor: session.displayName, role: session.accountRole }
    }
    return { actor: 'ระบบ', role: 'system' }
  }, [session])

  const makeLog = useCallback(
    (entry) => ({
      id: uid('log'),
      at: new Date().toISOString(),
      actor: entry.actor || actor.actor,
      role: entry.role || actor.role,
      ...entry,
    }),
    [actor],
  )

  const loginStudent = useCallback(
    (studentId, verifyCode) => {
      const id = studentId.trim()
      const code = verifyCode.trim()
      if (!id) return { ok: false, error: 'กรุณากรอกรหัสนักศึกษา' }
      if (!code) return { ok: false, error: 'กรุณากรอกรหัสยืนยันตัวตน' }
      const student = data.students.find((s) => s.id === id)
      if (!student) return { ok: false, error: 'ไม่พบรหัสนักศึกษานี้ในระบบ' }
      if (student.verifyCode !== code) return { ok: false, error: 'รหัสยืนยันตัวตนไม่ถูกต้อง' }
      setSession({ role: 'student', studentId: student.id, loggedInAt: Date.now() })
      return { ok: true, student }
    },
    [data.students],
  )

  const loginAdmin = useCallback(
    (username, password) => {
      const account = data.accounts.find(
        (a) => a.username === username.trim() && a.password === password,
      )
      if (!account) return { ok: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
      setSession({
        role: 'admin',
        username: account.username,
        displayName: account.displayName,
        accountRole: account.role,
        title: account.title,
        loggedInAt: Date.now(),
      })
      return { ok: true }
    },
    [data.accounts],
  )

  const logout = useCallback(() => setSession(null), [])

  const saveScores = useCallback(
    (subjectId, studentId, values) => {
      const current = data.scores[subjectId]?.[studentId] || { ...EMPTY_SCORES }
      let changed = 0
      SCORE_FIELDS.forEach((field) => {
        const value = values[field]
        if (value === undefined || value === null || Number.isNaN(value)) return
        if (value !== (current[field] ?? 0)) changed += 1
      })
      if (!changed) return 0

      setData((prev) => {
        const subject = prev.subjects.find((s) => s.id === subjectId)
        const student = prev.students.find((s) => s.id === studentId)
        if (!subject || !student) return prev
        const prevScores = prev.scores[subjectId]?.[studentId] || { ...EMPTY_SCORES }
        const next = { ...prevScores }
        const logs = []
        SCORE_FIELDS.forEach((field) => {
          const value = values[field]
          if (value === undefined || value === null || Number.isNaN(value)) return
          const oldValue = prevScores[field] ?? 0
          if (value === oldValue) return
          next[field] = value
          logs.push(
            makeLog({
              action: 'score_edit',
              subjectId,
              studentId,
              studentName: student.name,
              field,
              oldValue: String(oldValue),
              newValue: String(value),
            }),
          )
        })
        if (!logs.length) return prev
        return {
          ...prev,
          scores: {
            ...prev.scores,
            [subjectId]: { ...prev.scores[subjectId], [studentId]: next },
          },
          auditLogs: [...logs, ...prev.auditLogs].slice(0, 800),
        }
      })
      return changed
    },
    [data.scores, makeLog],
  )

  const addStudent = useCallback(
    (form) => {
      const id = String(form.id || '').trim()
      const name = String(form.name || '').trim()
      const verifyCode = String(form.verifyCode || '').trim()
      if (!/^\d{5,12}$/.test(id)) return { ok: false, error: 'รหัสนักศึกษาต้องเป็นตัวเลข 5–12 หลัก' }
      if (data.students.some((s) => s.id === id)) return { ok: false, error: 'มีรหัสนักศึกษานี้อยู่แล้ว' }
      if (!name) return { ok: false, error: 'กรุณากรอกชื่อ-นามสกุล' }
      if (!/^\d{4}$/.test(verifyCode)) return { ok: false, error: 'รหัสยืนยันตัวตนต้องเป็นตัวเลข 4 หลัก' }

      const student = {
        id,
        name,
        classroom: form.classroom?.trim() || 'IT-1/1',
        verifyCode,
      }
      setData((prev) => {
        const scores = { ...prev.scores }
        prev.subjects.forEach((subject) => {
          scores[subject.id] = { ...scores[subject.id], [id]: { ...EMPTY_SCORES } }
        })
        if (form.initialSubjectId && form.initialScores) {
          scores[form.initialSubjectId] = {
            ...scores[form.initialSubjectId],
            [id]: { ...EMPTY_SCORES, ...form.initialScores },
          }
        }
        return {
          ...prev,
          students: [...prev.students, student],
          scores,
          auditLogs: [
            makeLog({
              action: 'student_add',
              studentId: id,
              studentName: name,
              detail: `เพิ่มนักศึกษา ${name} (${id}) ชั้นเรียน ${student.classroom}`,
            }),
            ...prev.auditLogs,
          ].slice(0, 800),
        }
      })
      return { ok: true }
    },
    [data.students, makeLog],
  )

  const updateStudent = useCallback(
    (studentId, form) => {
      const name = String(form.name || '').trim()
      const verifyCode = String(form.verifyCode || '').trim()
      if (!name) return { ok: false, error: 'กรุณากรอกชื่อ-นามสกุล' }
      if (!/^\d{4}$/.test(verifyCode)) return { ok: false, error: 'รหัสยืนยันตัวตนต้องเป็นตัวเลข 4 หลัก' }
      const student = data.students.find((s) => s.id === studentId)
      if (!student) return { ok: false, error: 'ไม่พบนักศึกษา' }
      const next = { name, classroom: form.classroom?.trim() || student.classroom, verifyCode }
      const changes = []
      if (student.name !== next.name) changes.push(`ชื่อ: ${student.name} → ${next.name}`)
      if (student.classroom !== next.classroom) changes.push(`ชั้นเรียน: ${student.classroom} → ${next.classroom}`)
      if (student.verifyCode !== next.verifyCode) changes.push('เปลี่ยนรหัสยืนยันตัวตน')
      if (!changes.length) return { ok: true, unchanged: true }

      setData((prev) => ({
        ...prev,
        students: prev.students.map((s) => (s.id === studentId ? { ...s, ...next } : s)),
        auditLogs: [
          makeLog({
            action: 'student_edit',
            studentId,
            studentName: next.name,
            detail: `แก้ไขข้อมูลนักศึกษา — ${changes.join(' • ')}`,
          }),
          ...prev.auditLogs,
        ].slice(0, 800),
      }))
      return { ok: true }
    },
    [data.students, makeLog],
  )

  const deleteStudent = useCallback(
    (studentId) => {
      const student = data.students.find((s) => s.id === studentId)
      if (!student) return
      setData((prev) => {
        const scores = { ...prev.scores }
        Object.keys(scores).forEach((subjectId) => {
          scores[subjectId] = { ...scores[subjectId] }
          delete scores[subjectId][studentId]
        })
        return {
          ...prev,
          students: prev.students.filter((s) => s.id !== studentId),
          scores,
          auditLogs: [
            makeLog({
              action: 'student_delete',
              studentId,
              studentName: student.name,
              detail: `ลบนักศึกษา ${student.name} (${studentId}) และคะแนนทั้งหมด`,
            }),
            ...prev.auditLogs,
          ].slice(0, 800),
        }
      })
    },
    [data.students, makeLog],
  )

  const togglePublish = useCallback(
    (subjectId) => {
      const subject = data.subjects.find((s) => s.id === subjectId)
      if (!subject) return
      const nextPublished = !subject.published
      setData((prev) => ({
        ...prev,
        subjects: prev.subjects.map((s) =>
          s.id === subjectId ? { ...s, published: nextPublished } : s,
        ),
        auditLogs: [
          makeLog({
            action: 'publish',
            subjectId,
            field: null,
            oldValue: subject.published ? 'เผยแพร่' : 'ซ่อน',
            newValue: nextPublished ? 'เผยแพร่' : 'ซ่อน',
            detail: `${nextPublished ? 'เปิด' : 'ปิด'}การประกาศผลวิชา ${subject.id} ${subject.name}`,
          }),
          ...prev.auditLogs,
        ].slice(0, 800),
      }))
      return nextPublished
    },
    [data.subjects, makeLog],
  )

  const toggleVisibility = useCallback(
    (subjectId, field) => {
      const subject = data.subjects.find((s) => s.id === subjectId)
      if (!subject || !FIELD_META[field]) return
      const nextVisible = !subject.visible[field]
      setData((prev) => ({
        ...prev,
        subjects: prev.subjects.map((s) =>
          s.id === subjectId ? { ...s, visible: { ...s.visible, [field]: nextVisible } } : s,
        ),
        auditLogs: [
          makeLog({
            action: 'visibility',
            subjectId,
            field,
            oldValue: subject.visible[field] ? 'แสดง' : 'ซ่อน',
            newValue: nextVisible ? 'แสดง' : 'ซ่อน',
            detail: `${nextVisible ? 'แสดง' : 'ซ่อน'}${FIELD_META[field].label} วิชา ${subject.id}`,
          }),
          ...prev.auditLogs,
        ].slice(0, 800),
      }))
      return nextVisible
    },
    [data.subjects, makeLog],
  )

  const importScores = useCallback(
    (subjectId, rows) => {
      const summary = { updated: 0, created: 0, fields: 0 }
      rows.forEach((row) => {
        if (row.errors?.length) return
        const existing = data.students.some((s) => s.id === row.studentId)
        if (!existing) summary.created += 1
        const current = data.scores[subjectId]?.[row.studentId]
        let rowChanges = 0
        SCORE_FIELDS.forEach((field) => {
          const value = row.scores?.[field]
          if (value === null || value === undefined) return
          if (value !== (current?.[field] ?? 0)) rowChanges += 1
        })
        summary.fields += rowChanges
        if (existing && rowChanges > 0) summary.updated += 1
      })

      setData((prev) => {
        const subject = prev.subjects.find((s) => s.id === subjectId)
        if (!subject) return prev
        let students = [...prev.students]
        const scores = { ...prev.scores, [subjectId]: { ...(prev.scores[subjectId] || {}) } }
        const logs = []

        rows.forEach((row) => {
          if (row.errors?.length) return
          let student = students.find((s) => s.id === row.studentId)
          if (!student) {
            student = {
              id: row.studentId,
              name: row.name || `นักศึกษา ${row.studentId}`,
              classroom: 'IT-1/1',
              verifyCode: row.studentId.slice(-4),
            }
            students = [...students, student]
            logs.push(
              makeLog({
                action: 'student_add',
                subjectId,
                studentId: student.id,
                studentName: student.name,
                detail: `เพิ่มนักศึกษาอัตโนมัติระหว่างนำเข้าคะแนน ${student.name} (${student.id})`,
              }),
            )
            scores[subjectId][student.id] = { ...EMPTY_SCORES }
          }

          const current = scores[subjectId][student.id] || { ...EMPTY_SCORES }
          const updated = { ...current }
          const changes = []
          SCORE_FIELDS.forEach((field) => {
            const value = row.scores?.[field]
            if (value === null || value === undefined) return
            const oldValue = current[field] ?? 0
            if (value === oldValue) return
            updated[field] = value
            changes.push(`${FIELD_META[field].label} ${oldValue} → ${value}`)
          })
          if (!changes.length) return
          scores[subjectId][student.id] = updated
          logs.push(
            makeLog({
              action: 'import',
              subjectId,
              studentId: student.id,
              studentName: student.name,
              detail: `นำเข้าคะแนน — ${changes.join(' • ')}`,
            }),
          )
        })

        if (!logs.length) return prev
        return {
          ...prev,
          students,
          scores,
          auditLogs: [...logs, ...prev.auditLogs].slice(0, 800),
        }
      })
      return summary
    },
    [data.scores, data.students, makeLog],
  )

  const resetDemo = useCallback(() => {
    setData(clone(buildSeed()))
  }, [])

  const student = useMemo(
    () =>
      session?.role === 'student'
        ? data.students.find((s) => s.id === session.studentId) || null
        : null,
    [data.students, session],
  )

  const value = {
    data,
    session,
    student,
    isAdmin: session?.role === 'admin',
    toasts,
    notify,
    dismissToast,
    loginStudent,
    loginAdmin,
    logout,
    saveScores,
    addStudent,
    updateStudent,
    deleteStudent,
    togglePublish,
    toggleVisibility,
    importScores,
    resetDemo,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
