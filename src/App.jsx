import React, { useEffect, useMemo, useState } from "react";
import "./App.scss";

const STORAGE_KEY = "goals_calendar_days";

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let week = new Array(7).fill(null);
  // fill leading blanks (Sunday=0)
  let day = 1;
  for (let i = 0; i < startDay; i++) week[i] = null;
  for (let i = startDay; i < 7; i++) {
    week[i] = new Date(year, month, day++);
  }
  weeks.push(week);
  while (day <= daysInMonth) {
    week = new Array(7).fill(null);
    for (let i = 0; i < 7 && day <= daysInMonth; i++) {
      week[i] = new Date(year, month, day++);
    }
    weeks.push(week);
  }
  return weeks;
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function App() {
  const today = new Date();
  const [baseDate, setBaseDate] = useState(startOfMonth(today));
  const [days, setDays] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const [selected, setSelected] = useState(null); // date string
  const [note, setNote] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
  }, [days]);

  const matrix = useMemo(() => {
    return getMonthMatrix(baseDate.getFullYear(), baseDate.getMonth());
  }, [baseDate]);

  function openDay(d) {
    const key = formatDate(d);
    setSelected(key);
    const data = days[key] || { note: "", progress: 0 };
    setNote(data.note || "");
    setProgress(data.progress || 0);
  }

  function saveAndClose() {
    setDays((prev) => ({ ...prev, [selected]: { note, progress } }));
    setSelected(null);
  }

  function closeWithoutSave() {
    setSelected(null);
  }

  function prevMonth() {
    setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1));
  }

  function nextMonth() {
    setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1));
  }

  return (
    <div className="app calendar-app">
      <header className="cal-header">
        <button onClick={prevMonth} aria-label="Previous month">
          ‹
        </button>
        <h2>
          {baseDate.toLocaleString(undefined, { month: "long" })}{" "}
          {baseDate.getFullYear()}
        </h2>
        <button onClick={nextMonth} aria-label="Next month">
          ›
        </button>
      </header>

      <div className="calendar">
        <div className="weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
            <div key={w} className="wd">
              {w}
            </div>
          ))}
        </div>
        <div className="weeks">
          {matrix.map((week, wi) => (
            <div className="week" key={wi}>
              {week.map((d, di) => {
                if (!d) return <div key={di} className="day empty" />;
                const key = formatDate(d);
                const data = days[key] || { note: "", progress: 0 };
                const pct = Math.max(0, Math.min(100, data.progress || 0));
                const gradient = `linear-gradient(135deg, rgba(99,102,241,0.9) ${pct}%, rgba(255,255,255,0) ${pct}%)`;
                return (
                  <button
                    key={di}
                    className="day"
                    style={{ background: gradient }}
                    onClick={() => openDay(d)}
                    title={`${key} — ${pct}%`}
                  >
                    <div className="date-num">{d.getDate()}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-content">
            <h3>{selected}</h3>
            <label>
              Прогресс: {progress}%
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
              />
            </label>
            <label>
              Заметка:
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button onClick={saveAndClose}>Сохранить и закрыть</button>
              <button onClick={closeWithoutSave} className="ghost">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
