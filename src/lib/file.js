import * as XLSX from 'xlsx'
import { FIELD_META, SCORE_FIELDS, gradeOf, totalOf } from './grades'

const HEADER_ALIASES = {
  studentid: 'studentId',
  student_id: 'studentId',
  id: 'studentId',
  รหัส: 'studentId',
  รหัสนักศึกษา: 'studentId',
  name: 'name',
  fullname: 'name',
  ชื่อ: 'name',
  ชื่อสกุล: 'name',
  ชื่อนามสกุล: 'name',
  assignment: 'assignment',
  assignments: 'assignment',
  คะแนนเก็บ: 'assignment',
  งาน: 'assignment',
  เก็บ: 'assignment',
  midterm: 'midterm',
  mid: 'midterm',
  กลางภาค: 'midterm',
  สอบกลางภาค: 'midterm',
  final: 'final',
  fin: 'final',
  ปลายภาค: 'final',
  สอบปลายภาค: 'final',
}

function normalizeKey(raw) {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
}

export function parseDelimited(text) {
  const clean = String(text).replace(/^\uFEFF/, '')
  const firstLine = clean.split(/\r?\n/)[0] || ''
  const delimiter = firstLine.includes('\t')
    ? '\t'
    : firstLine.includes(';') && !firstLine.includes(',')
      ? ';'
      : ','

  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < clean.length; i += 1) {
    const char = clean[i]
    if (inQuotes) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          cell += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        cell += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (char !== '\r') {
      cell += char
    }
  }
  if (cell.length || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ''))
}

export function recordsFromRows(rows) {
  if (!rows?.length) return { error: 'ไฟล์ว่างหรืออ่านข้อมูลไม่ได้' }
  const headerRow = rows[0]
  const mapping = headerRow.map((h) => HEADER_ALIASES[normalizeKey(h)] || null)
  if (!mapping.includes('studentId')) {
    return { error: 'ไม่พบคอลัมน์รหัสนักศึกษา (studentId) ในไฟล์' }
  }
  if (!mapping.includes('assignment') && !mapping.includes('midterm') && !mapping.includes('final')) {
    return { error: 'ไม่พบคอลัมน์คะแนน (assignment / midterm / final)' }
  }
  const records = []
  rows.slice(1).forEach((cells, index) => {
    const record = { __row: index + 2, scores: {} }
    mapping.forEach((key, i) => {
      if (!key) return
      const raw = cells[i]
      if (key === 'studentId' || key === 'name') {
        record[key] = String(raw ?? '').trim()
      } else {
        const text = String(raw ?? '').trim()
        record.scores[key] = text === '' ? null : Number(text)
      }
    })
    if (!record.studentId && !record.name) return
    records.push(record)
  })
  if (!records.length) return { error: 'ไม่พบแถวข้อมูลนักศึกษาในไฟล์' }
  return { records }
}

export function isTabularFile(file) {
  const name = String(file?.name || '').toLowerCase()
  return ['.csv', '.xlsx', '.xls', '.txt'].some((ext) => name.endsWith(ext))
}

export async function readTabularFile(file) {
  const name = String(file?.name || '').toLowerCase()
  if (name.endsWith('.csv') || name.endsWith('.txt')) {
    const text = await file.text()
    return parseDelimited(text)
  }
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return []
  return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' })
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function toCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          const text = value === null || value === undefined ? '' : String(value)
          return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
        })
        .join(','),
    )
    .join('\r\n')
}

export function downloadCsv(filename, rows) {
  downloadBlob(filename, new Blob([`\uFEFF${toCsv(rows)}`], { type: 'text/csv;charset=utf-8;' }))
}

export function downloadXlsx(filename, sheets) {
  const workbook = XLSX.utils.book_new()
  sheets.forEach(({ name, rows }) => {
    const sheet = XLSX.utils.aoa_to_sheet(rows)
    sheet['!cols'] = rows[0]?.map((_, i) => ({ wch: i < 2 ? 20 : 14 }))
    XLSX.utils.book_append_sheet(workbook, sheet, name.slice(0, 31))
  })
  const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  downloadBlob(
    filename,
    new Blob([output], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
  )
}

export function subjectExportRows(subject, students, scoreMap, { withId = true } = {}) {
  const headers = [
    ...(withId ? ['รหัสนักศึกษา'] : []),
    'ชื่อ-นามสกุล',
    'ชั้นเรียน',
    ...SCORE_FIELDS.map((f) => `${FIELD_META[f].label} (${FIELD_META[f].max})`),
    'รวม (100)',
    'เกรด',
  ]
  const rows = students.map((student) => {
    const scores = scoreMap?.[student.id] || { assignment: 0, midterm: 0, final: 0 }
    const total = totalOf(scores)
    return [
      ...(withId ? [student.id] : []),
      student.name,
      student.classroom,
      ...SCORE_FIELDS.map((f) => scores[f] ?? 0),
      total,
      gradeOf(total),
    ]
  })
  return [headers, ...rows]
}

export function downloadSubjectCsv(subject, students, scoreMap) {
  downloadCsv(`${subject.id}-scores.csv`, subjectExportRows(subject, students, scoreMap))
}

export function downloadAllXlsx(subjects, students, scores) {
  const sheets = subjects.map((subject) => ({
    name: subject.id,
    rows: subjectExportRows(subject, students, scores[subject.id]),
  }))
  sheets.push({
    name: 'students',
    rows: [
      ['รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'ชั้นเรียน', 'รหัสยืนยัน'],
      ...students.map((s) => [s.id, s.name, s.classroom, s.verifyCode]),
    ],
  })
  downloadXlsx('gradecheck-all-scores.xlsx', sheets)
}

export function downloadImportTemplate(students, scores, subjectId, format = 'xlsx') {
  const rows = [
    ['studentId', 'name', ...SCORE_FIELDS],
    ...students.slice(0, 3).map((student) => {
      const scoresRow = scores[subjectId]?.[student.id] || {}
      return [student.id, student.name, ...SCORE_FIELDS.map((f) => scoresRow[f] ?? '')]
    }),
  ]
  if (format === 'csv') downloadCsv('gradecheck-import-template.csv', rows)
  else downloadXlsx('gradecheck-import-template.xlsx', [{ name: 'scores', rows }])
}
