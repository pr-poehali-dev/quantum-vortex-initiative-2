import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GodRays, MeshGradient } from "@paper-design/shaders-react"
import Icon from "@/components/ui/icon"

type Tab = "grades" | "attendance" | "schedule"

const CLASSES = ["9А", "9Б", "10А", "10Б", "11А"]
const SUBJECTS = ["Математика", "Физика", "Химия", "Русский язык", "История", "Биология", "Английский язык"]
const GRADE_VALUES = ["5", "4", "3", "2", "Н"]

const STUDENTS: Record<string, string[]> = {
  "9А": ["Александров Иван", "Борисова Мария", "Васильев Дмитрий", "Григорьева Анна", "Дмитриев Кирилл", "Ерёмина Ольга"],
  "9Б": ["Жуков Артём", "Захарова Юлия", "Иванов Павел", "Козлова Елена", "Лебедев Максим", "Морозова Алина"],
  "10А": ["Никитин Андрей", "Орлова Вика", "Петров Сергей", "Романова Дарья", "Смирнов Алексей", "Тихонова Ксения"],
  "10Б": ["Ульянов Роман", "Фёдорова Ирина", "Харитонов Глеб", "Цветкова Надя", "Чернов Илья", "Шевцова Полина"],
  "11А": ["Щукин Тимур", "Эрдман Карина", "Яковлев Денис", "Абрамова Света", "Белов Николай", "Волкова Таня"],
}

const SCHEDULE: Record<string, { time: string; subject: string; class: string }[]> = {
  "Понедельник": [
    { time: "08:00", subject: "Математика", class: "9А" },
    { time: "09:50", subject: "Физика", class: "10А" },
    { time: "11:40", subject: "Математика", class: "11А" },
    { time: "13:30", subject: "Физика", class: "9Б" },
  ],
  "Вторник": [
    { time: "08:00", subject: "Физика", class: "10Б" },
    { time: "09:50", subject: "Математика", class: "9Б" },
    { time: "11:40", subject: "Математика", class: "10А" },
  ],
  "Среда": [
    { time: "08:00", subject: "Математика", class: "9А" },
    { time: "09:50", subject: "Физика", class: "11А" },
    { time: "13:30", subject: "Математика", class: "10Б" },
  ],
  "Четверг": [
    { time: "09:50", subject: "Физика", class: "9А" },
    { time: "11:40", subject: "Физика", class: "10А" },
    { time: "13:30", subject: "Математика", class: "9Б" },
  ],
  "Пятница": [
    { time: "08:00", subject: "Математика", class: "10А" },
    { time: "09:50", subject: "Математика", class: "11А" },
    { time: "11:40", subject: "Физика", class: "10Б" },
  ],
}

const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"]
const TODAY_IDX = Math.min(new Date().getDay() - 1, 4)
const SAFE_TODAY = TODAY_IDX < 0 ? 0 : TODAY_IDX

type GradeEntry = { value: string; date: string; comment: string }
type GradesState = Record<string, Record<string, GradeEntry[]>>
type AttendanceState = Record<string, Record<string, "present" | "absent" | "late">>

function initGrades(): GradesState {
  const state: GradesState = {}
  Object.keys(STUDENTS).forEach((cls) => {
    state[cls] = {}
    STUDENTS[cls].forEach((s) => { state[cls][s] = [] })
  })
  return state
}

function initAttendance(): AttendanceState {
  const state: AttendanceState = {}
  Object.keys(STUDENTS).forEach((cls) => {
    state[cls] = {}
    STUDENTS[cls].forEach((s) => { state[cls][s] = "present" })
  })
  return state
}

function avg(entries: GradeEntry[]): string {
  const nums = entries.map((e) => parseInt(e.value)).filter((n) => !isNaN(n))
  if (!nums.length) return "—"
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
}

export default function Hero() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("grades")
  const [selectedClass, setSelectedClass] = useState("9А")
  const [selectedSubject, setSelectedSubject] = useState("Математика")
  const [selectedDay, setSelectedDay] = useState(SAFE_TODAY)
  const [grades, setGrades] = useState<GradesState>(initGrades)
  const [attendance, setAttendance] = useState<AttendanceState>(initAttendance)
  const [addingFor, setAddingFor] = useState<string | null>(null)
  const [newGrade, setNewGrade] = useState("5")
  const [newComment, setNewComment] = useState("")
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleAddGrade = (student: string) => {
    const today = new Date().toLocaleDateString("ru-RU")
    setGrades((prev) => {
      const updated = { ...prev }
      updated[selectedClass] = { ...updated[selectedClass] }
      updated[selectedClass][student] = [
        ...(updated[selectedClass][student] || []),
        { value: newGrade, date: today, comment: newComment },
      ]
      return updated
    })
    setAddingFor(null)
    setNewComment("")
    showToast(`Оценка ${newGrade} добавлена: ${student}`)
  }

  const handleDeleteGrade = (student: string, idx: number) => {
    setGrades((prev) => {
      const updated = { ...prev }
      updated[selectedClass] = { ...updated[selectedClass] }
      const arr = [...(updated[selectedClass][student] || [])]
      arr.splice(idx, 1)
      updated[selectedClass][student] = arr
      return updated
    })
  }

  const toggleAttendance = (student: string) => {
    setAttendance((prev) => {
      const states: ("present" | "absent" | "late")[] = ["present", "absent", "late"]
      const cur = prev[selectedClass]?.[student] || "present"
      const next = states[(states.indexOf(cur) + 1) % 3]
      showToast(next === "absent" ? `${student} — Отсутствует` : next === "late" ? `${student} — Опоздал` : `${student} — Присутствует`)
      return { ...prev, [selectedClass]: { ...prev[selectedClass], [student]: next } }
    })
  }

  const attendanceCount = (cls: string) => {
    const s = attendance[cls] || {}
    return {
      present: Object.values(s).filter((v) => v === "present").length,
      absent: Object.values(s).filter((v) => v === "absent").length,
      late: Object.values(s).filter((v) => v === "late").length,
    }
  }

  return (
    <>
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <div className="absolute inset-0">
          <GodRays
            colorBack="#00000000"
            colors={["#FFFFFF6E", "#C8D8FF", "#8AAAF3", "#6B8FE8"]}
            colorBloom="#FFFFFF"
            offsetX={0.85}
            offsetY={-1}
            intensity={1}
            spotty={0.45}
            midSize={10}
            midIntensity={0}
            density={0.12}
            bloom={0.15}
            speed={1}
            scale={1.6}
            frame={3332042.8159981333}
            style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0 }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 text-center">
          <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium text-blue-800">
            <Icon name="BookOpen" size={16} />
            Электронный журнал
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[90%] tracking-[-0.03em] text-black mix-blend-exclusion max-w-2xl">
            Школьный журнал учителя
          </h1>
          <p className="text-base sm:text-lg md:text-xl leading-[160%] text-black max-w-xl px-4">
            Оценки, посещаемость, расписание — всё в одном месте. Удобно, быстро, всегда под рукой.
          </p>

          <AnimatePresence initial={false}>
            {!isOpen && (
              <motion.div className="inline-block relative">
                <motion.div
                  style={{ borderRadius: "100px" }}
                  layout
                  layoutId="journal-card"
                  className="absolute inset-0 bg-[#1D4ED8] items-center justify-center transform-gpu will-change-transform"
                />
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout={false}
                  onClick={() => setIsOpen(true)}
                  className="h-15 px-6 sm:px-8 py-3 text-lg sm:text-xl font-regular text-white tracking-[-0.01em] relative flex items-center gap-2"
                >
                  <Icon name="BookOpen" size={20} />
                  Открыть журнал
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3">
            <motion.div
              layoutId="journal-card"
              transition={{ duration: 0.3 }}
              style={{ borderRadius: "24px" }}
              layout
              className="relative flex h-full w-full overflow-hidden bg-[#1D4ED8] transform-gpu will-change-transform"
            >
              <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                layout={false}
                transition={{ duration: 0.15, delay: 0.05 }}
                className="absolute h-full inset-0 overflow-hidden pointer-events-none"
                style={{ borderRadius: "24px" }}
              >
                <MeshGradient
                  speed={0.5}
                  colors={["#1E40AF", "#1D4ED8", "#2563EB", "#1E3A8A"]}
                  distortion={0.5}
                  swirl={0.1}
                  grainMixer={0}
                  grainOverlay={0}
                  className="inset-0 sticky top-0"
                  style={{ height: "100%", width: "100%" }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="relative z-10 flex flex-col h-full w-full"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/20 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Icon name="BookOpen" size={22} className="text-white" />
                    <span className="text-white text-lg font-semibold tracking-tight">Журнал учителя</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 text-white/80 text-sm">
                      <Icon name="Calendar" size={14} />
                      {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                    >
                      <Icon name="X" size={18} />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 px-4 sm:px-8 py-3 border-b border-white/10 flex-shrink-0">
                  {(["grades", "attendance", "schedule"] as Tab[]).map((tab) => {
                    const labels: Record<Tab, string> = { grades: "Оценки", attendance: "Посещаемость", schedule: "Расписание" }
                    const icons: Record<Tab, string> = { grades: "Star", attendance: "UserCheck", schedule: "Clock" }
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          activeTab === tab ? "bg-white text-blue-800" : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Icon name={icons[tab]} size={14} />
                        {labels[tab]}
                      </button>
                    )
                  })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4">

                  {/* GRADES TAB */}
                  {activeTab === "grades" && (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {CLASSES.map((cls) => (
                            <button
                              key={cls}
                              onClick={() => setSelectedClass(cls)}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                selectedClass === cls ? "bg-white text-blue-800" : "bg-white/10 text-white hover:bg-white/20"
                              }`}
                            >
                              {cls}
                            </button>
                          ))}
                        </div>
                        <select
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="bg-white/10 text-white rounded-full px-3 py-1 text-sm border-none outline-none cursor-pointer"
                        >
                          {SUBJECTS.map((s) => <option key={s} value={s} className="text-black">{s}</option>)}
                        </select>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-[1fr_auto_auto] gap-0">
                          <div className="px-4 py-2 text-white/50 text-xs font-mono uppercase">Ученик</div>
                          <div className="px-4 py-2 text-white/50 text-xs font-mono uppercase text-center">Оценки</div>
                          <div className="px-4 py-2 text-white/50 text-xs font-mono uppercase text-center">Ср.</div>
                        </div>
                        {STUDENTS[selectedClass]?.map((student) => {
                          const studentGrades = grades[selectedClass]?.[student] || []
                          return (
                            <div key={student} className="border-t border-white/10">
                              <div className="grid grid-cols-[1fr_auto_auto] gap-0 items-center">
                                <div className="px-4 py-3 text-white text-sm">{student}</div>
                                <div className="px-2 py-2 flex flex-wrap gap-1 justify-end max-w-[200px] sm:max-w-xs">
                                  {studentGrades.map((g, i) => (
                                    <button
                                      key={i}
                                      title={g.comment || g.date}
                                      onClick={() => handleDeleteGrade(student, i)}
                                      className={`w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center transition-all hover:scale-110 ${
                                        g.value === "5" ? "bg-green-400 text-green-900" :
                                        g.value === "4" ? "bg-blue-300 text-blue-900" :
                                        g.value === "3" ? "bg-yellow-300 text-yellow-900" :
                                        g.value === "2" ? "bg-red-400 text-red-900" :
                                        "bg-white/20 text-white"
                                      }`}
                                    >
                                      {g.value}
                                    </button>
                                  ))}
                                  {addingFor === student ? (
                                    <div className="flex items-center gap-1">
                                      <select
                                        value={newGrade}
                                        onChange={(e) => setNewGrade(e.target.value)}
                                        className="w-12 h-7 rounded-full text-xs text-center bg-white text-blue-800 font-bold border-none outline-none cursor-pointer"
                                      >
                                        {GRADE_VALUES.map((g) => <option key={g} value={g}>{g}</option>)}
                                      </select>
                                      <input
                                        placeholder="Комментарий"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="hidden sm:block w-24 h-7 rounded-full text-xs px-2 bg-white/20 text-white placeholder:text-white/50 border-none outline-none"
                                      />
                                      <button onClick={() => handleAddGrade(student)} className="w-7 h-7 rounded-full bg-green-400 text-green-900 flex items-center justify-center hover:bg-green-300">
                                        <Icon name="Check" size={12} />
                                      </button>
                                      <button onClick={() => setAddingFor(null)} className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30">
                                        <Icon name="X" size={12} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setAddingFor(student)}
                                      className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all"
                                    >
                                      <Icon name="Plus" size={12} />
                                    </button>
                                  )}
                                </div>
                                <div className="px-4 py-3 text-white font-bold text-sm text-center min-w-[40px]">
                                  {avg(studentGrades)}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Учеников", value: STUDENTS[selectedClass]?.length || 0, icon: "Users" },
                          { label: "Всего оценок", value: Object.values(grades[selectedClass] || {}).reduce((a, b) => a + b.length, 0), icon: "Star" },
                          { label: "Средний балл", value: (() => {
                            const all = Object.values(grades[selectedClass] || {}).flat()
                            const nums = all.map(e => parseInt(e.value)).filter(n => !isNaN(n))
                            if (!nums.length) return "—"
                            return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
                          })(), icon: "TrendingUp" },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-1">
                            <Icon name={stat.icon} size={16} className="text-white/60" />
                            <div className="text-white text-xl font-bold">{stat.value}</div>
                            <div className="text-white/60 text-xs">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ATTENDANCE TAB */}
                  {activeTab === "attendance" && (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap gap-1.5">
                        {CLASSES.map((cls) => (
                          <button
                            key={cls}
                            onClick={() => setSelectedClass(cls)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                              selectedClass === cls ? "bg-white text-blue-800" : "bg-white/10 text-white hover:bg-white/20"
                            }`}
                          >
                            {cls}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {(() => {
                          const c = attendanceCount(selectedClass)
                          return [
                            { label: "Присутствуют", value: c.present, color: "text-green-300", icon: "UserCheck" },
                            { label: "Отсутствуют", value: c.absent, color: "text-red-300", icon: "UserX" },
                            { label: "Опоздали", value: c.late, color: "text-yellow-300", icon: "Clock" },
                          ].map((s) => (
                            <div key={s.label} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-1">
                              <Icon name={s.icon} size={16} className={s.color} />
                              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                              <div className="text-white/60 text-xs">{s.label}</div>
                            </div>
                          ))
                        })()}
                      </div>

                      <div className="bg-white/10 rounded-2xl overflow-hidden">
                        {STUDENTS[selectedClass]?.map((student, i) => {
                          const status = attendance[selectedClass]?.[student] || "present"
                          const statusConfig = {
                            present: { label: "Присутствует", color: "bg-green-400/20 text-green-200", dot: "bg-green-400" },
                            absent: { label: "Отсутствует", color: "bg-red-400/20 text-red-200", dot: "bg-red-400" },
                            late: { label: "Опоздал", color: "bg-yellow-400/20 text-yellow-200", dot: "bg-yellow-400" },
                          }[status]
                          return (
                            <div key={student} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-white/10" : ""}`}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                                  {student.split(" ")[0][0]}{student.split(" ")[1]?.[0]}
                                </div>
                                <span className="text-white text-sm">{student}</span>
                              </div>
                              <button
                                onClick={() => toggleAttendance(student)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${statusConfig.color}`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                {statusConfig.label}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                      <p className="text-white/40 text-xs text-center">Нажмите на статус для смены: присутствует → отсутствует → опоздал</p>
                    </div>
                  )}

                  {/* SCHEDULE TAB */}
                  {activeTab === "schedule" && (
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {DAYS.map((day, i) => (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(i)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                              selectedDay === i ? "bg-white text-blue-800" : "bg-white/10 text-white hover:bg-white/20"
                            }`}
                          >
                            {day}
                            {i === SAFE_TODAY && <span className="ml-1 text-xs opacity-60">•</span>}
                          </button>
                        ))}
                      </div>

                      <div className="bg-white/10 rounded-2xl overflow-hidden">
                        {SCHEDULE[DAYS[selectedDay]]?.length ? (
                          SCHEDULE[DAYS[selectedDay]].map((lesson, i) => (
                            <div key={i} className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? "border-t border-white/10" : ""}`}>
                              <div className="text-white/50 font-mono text-sm w-12 flex-shrink-0">{lesson.time}</div>
                              <div className="flex-1">
                                <div className="text-white font-medium text-sm">{lesson.subject}</div>
                              </div>
                              <div className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{lesson.class}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-white/40 text-sm">Уроков нет</div>
                        )}
                      </div>

                      <div className="bg-white/10 rounded-2xl p-4">
                        <div className="text-white/60 text-xs font-mono uppercase mb-3">Статистика недели</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-white text-2xl font-bold">
                              {Object.values(SCHEDULE).reduce((a, b) => a + b.length, 0)}
                            </div>
                            <div className="text-white/60 text-xs">Уроков в неделю</div>
                          </div>
                          <div>
                            <div className="text-white text-2xl font-bold">{CLASSES.length}</div>
                            <div className="text-white/60 text-xs">Классов</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Toast */}
              <AnimatePresence>
                {toast && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-blue-900 text-sm font-medium px-5 py-2.5 rounded-full shadow-lg z-20"
                  >
                    {toast}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
