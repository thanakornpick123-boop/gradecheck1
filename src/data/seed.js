export const STORAGE_KEY = 'gradecheck-demo-v1'
export const SESSION_KEY = 'gradecheck-session-v1'
export const DATA_VERSION = 1

export const SEMESTER = 'ภาคเรียนที่ 1 ปีการศึกษา 2569'
export const CLASSROOM = 'IT-1/1'
export const DEPARTMENT = 'สาขาเทคโนโลยีสารสนเทศ'
export const SCHOOL_NAME = 'วิทยาลัยเทคโนโลยีดิจิทัล'

const STUDENT_NAMES = [
  'ณัฐวุฒิ ศรีสุข',
  'พิมพ์ชนก วงศ์ทอง',
  'ธนกร อินทร์แก้ว',
  'สุภัทรา แก้วมณี',
  'กิตติพงษ์ บุญมา',
  'อารียา สายทอง',
  'ภูริช สุขใจ',
  'มณีรัตน์ ทองดี',
  'ศิรินภา ใจดี',
  'ธีรเดช พูลสวัสดิ์',
  'ปิยะดา แสงทอง',
  'รัฐพล เมืองไทย',
  'ช่อฟ้า ดอกไม้',
  'ชนาธิป กล้าหาญ',
  'นภัสสร รัตนโชติ',
  'วัชรพล เกียรติศักดิ์',
  'เกวลิน สุขสวัสดิ์',
  'ภาณุพงศ์ ธรรมรักษ์',
  'อริสรา เพชรงาม',
  'ณภัทร วงศ์วิวัฒน์',
  'สิริลักษณ์ บัวงาม',
  'ต้นกล้า เจริญสุข',
  'ภัทราวดี ศิลา',
  'พีรภัทร ทรัพย์มาก',
]

const VERIFY_CODES = [
  '4821', '7310', '2654', '9087', '1145', '6723', '3890', '5462',
  '7018', '2931', '8456', '3207', '6594', '1825', '4760', '9238',
  '5473', '2160', '7845', '3912', '6058', '1487', '9326', '5284',
]

const SUBJECT_DEFS = [
  {
    id: 'IT101',
    name: 'การเขียนโปรแกรมเบื้องต้น',
    credits: 3,
    teacher: 'อ.กิตติศักดิ์ ใจกล้า',
    published: true,
    visible: { assignment: true, midterm: true, final: true },
  },
  {
    id: 'IT102',
    name: 'ระบบฐานข้อมูล',
    credits: 3,
    teacher: 'อ.สุพัตรา วิเศษศรี',
    published: true,
    visible: { assignment: true, midterm: true, final: false },
  },
  {
    id: 'IT201',
    name: 'การพัฒนาเว็บแอปพลิเคชัน',
    credits: 3,
    teacher: 'อ.ธนวัฒน์ พัฒนกิจ',
    published: true,
    visible: { assignment: true, midterm: true, final: true },
  },
  {
    id: 'IT202',
    name: 'เครือข่ายคอมพิวเตอร์',
    credits: 3,
    teacher: 'อ.วีระ มั่นคง',
    published: false,
    visible: { assignment: true, midterm: true, final: true },
  },
  {
    id: 'GE101',
    name: 'ภาษาอังกฤษเพื่อการสื่อสาร',
    credits: 2,
    teacher: 'อ.มณีรัตน์ สุขสมบูรณ์',
    published: true,
    visible: { assignment: true, midterm: true, final: true },
  },
]

function pseudoRandom(i, j, salt) {
  const x = Math.sin((i + 1) * 97.13 + (j + 1) * 41.77 + salt * 13.31) * 10000
  return x - Math.floor(x)
}

function makeScore(i, j) {
  return {
    assignment: Math.round(10 + pseudoRandom(i, j, 1) * 20),
    midterm: Math.round(8 + pseudoRandom(i, j, 2) * 22),
    final: Math.round(12 + pseudoRandom(i, j, 3) * 28),
  }
}

export function buildSeed() {
  const students = STUDENT_NAMES.map((name, i) => ({
    id: String(67010001 + i),
    name,
    classroom: CLASSROOM,
    verifyCode: VERIFY_CODES[i],
  }))

  const scores = {}
  SUBJECT_DEFS.forEach((subject, j) => {
    scores[subject.id] = {}
    students.forEach((student, i) => {
      scores[subject.id][student.id] = makeScore(i, j)
    })
  })

  const now = Date.now()
  const at = (minutesAgo) => new Date(now - minutesAgo * 60 * 1000).toISOString()

  const auditLogs = [
    {
      id: 'seed-log-1',
      at: at(12),
      actor: 'ผู้ดูแลระบบ',
      role: 'admin',
      action: 'score_edit',
      subjectId: 'IT101',
      studentId: '67010003',
      field: 'final',
      oldValue: '33',
      newValue: '35',
    },
    {
      id: 'seed-log-2',
      at: at(48),
      actor: 'อ.สุพัตรา วิเศษศรี',
      role: 'teacher',
      action: 'score_edit',
      subjectId: 'IT102',
      studentId: '67010007',
      field: 'midterm',
      oldValue: '18',
      newValue: '21',
    },
    {
      id: 'seed-log-3',
      at: at(95),
      actor: 'ผู้ดูแลระบบ',
      role: 'admin',
      action: 'visibility',
      subjectId: 'IT102',
      studentId: null,
      field: 'final',
      oldValue: 'แสดง',
      newValue: 'ซ่อน',
    },
    {
      id: 'seed-log-4',
      at: at(190),
      actor: 'อ.ธนวัฒน์ พัฒนกิจ',
      role: 'teacher',
      action: 'import',
      subjectId: 'IT201',
      studentId: null,
      field: null,
      detail: 'นำเข้าคะแนนจากไฟล์ web_scores.xlsx (24 รายการ)',
    },
    {
      id: 'seed-log-5',
      at: at(320),
      actor: 'ผู้ดูแลระบบ',
      role: 'admin',
      action: 'publish',
      subjectId: 'IT202',
      studentId: null,
      field: null,
      oldValue: 'เผยแพร่',
      newValue: 'ซ่อน',
    },
  ]

  return {
    version: DATA_VERSION,
    students,
    subjects: SUBJECT_DEFS.map((s) => ({ ...s, visible: { ...s.visible } })),
    scores,
    accounts: [
      {
        username: 'admin',
        password: 'admin1234',
        displayName: 'ผู้ดูแลระบบ',
        role: 'admin',
        title: 'ฝ่ายวิชาการ',
      },
      {
        username: 'teacher01',
        password: 'teacher1234',
        displayName: 'อ.กิตติศักดิ์ ใจกล้า',
        role: 'teacher',
        title: 'อาจารย์ผู้สอน · IT101',
      },
    ],
    auditLogs,
  }
}
