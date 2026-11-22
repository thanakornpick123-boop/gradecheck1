export const FIELD_META = {
  assignment: { label: 'คะแนนเก็บ', short: 'เก็บ', max: 30 },
  midterm: { label: 'สอบกลางภาค', short: 'กลางภาค', max: 30 },
  final: { label: 'สอบปลายภาค', short: 'ปลายภาค', max: 40 },
}

export const SCORE_FIELDS = ['assignment', 'midterm', 'final']

export const GRADE_SCALE = [
  { min: 80, grade: 'A', point: 4.0 },
  { min: 75, grade: 'B+', point: 3.5 },
  { min: 70, grade: 'B', point: 3.0 },
  { min: 65, grade: 'C+', point: 2.5 },
  { min: 60, grade: 'C', point: 2.0 },
  { min: 55, grade: 'D+', point: 1.5 },
  { min: 50, grade: 'D', point: 1.0 },
  { min: 0, grade: 'F', point: 0 },
]

export const GRADE_STYLES = {
  A: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'B+': 'bg-teal-50 text-teal-700 ring-teal-600/20',
  B: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  'C+': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  C: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  'D+': 'bg-rose-50 text-rose-600 ring-rose-600/20',
  D: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  F: 'bg-red-100 text-red-700 ring-red-600/20',
}

export const EMPTY_SCORES = { assignment: 0, midterm: 0, final: 0 }

export function totalOf(scores) {
  if (!scores) return 0
  return (scores.assignment || 0) + (scores.midterm || 0) + (scores.final || 0)
}

export function gradeInfoOf(total) {
  return GRADE_SCALE.find((g) => total >= g.min) || GRADE_SCALE[GRADE_SCALE.length - 1]
}

export function gradeOf(total) {
  return gradeInfoOf(total).grade
}

export function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function mean(values) {
  if (!values.length) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function subjectStats(data, subjectId) {
  const classScores = Object.values(data.scores[subjectId] || {})
  const totals = classScores.map(totalOf)
  return {
    total: mean(totals),
    assignment: mean(classScores.map((s) => s.assignment || 0)),
    midterm: mean(classScores.map((s) => s.midterm || 0)),
    final: mean(classScores.map((s) => s.final || 0)),
  }
}

export function gpaForStudent(data, studentId, subjects) {
  let points = 0
  let credits = 0
  subjects.forEach((subject) => {
    const scores = data.scores[subject.id]?.[studentId]
    if (!scores) return
    points += gradeInfoOf(totalOf(scores)).point * subject.credits
    credits += subject.credits
  })
  return credits ? points / credits : 0
}

export function classAverageForStudent(data, studentId, subjects) {
  const totals = subjects
    .map((subject) => data.scores[subject.id]?.[studentId])
    .filter(Boolean)
    .map(totalOf)
  return mean(totals)
}

export function rankForStudent(data, studentId, subjects) {
  if (!subjects.length) return null
  const ranked = data.students
    .map((student) => {
      const totals = subjects.map((subject) => totalOf(data.scores[subject.id]?.[student.id]))
      return { id: student.id, average: mean(totals) }
    })
    .sort((a, b) => b.average - a.average)
  const index = ranked.findIndex((s) => s.id === studentId)
  return index === -1 ? null : { rank: index + 1, total: ranked.length }
}

const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

export function formatDateTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const time = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  return `${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${date.getFullYear() + 543} · ${time}`
}

export function formatShortDate(dateInput) {
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return '—'
  return `${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${date.getFullYear() + 543}`
}

export function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/)
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
}

export function uid(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
