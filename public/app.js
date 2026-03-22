const STORAGE_KEY = "habit-tracker-wave-state-v1";
const DEFAULT_HABITS = [
  { id: createId(), name: "Tomar agua", category: "Salud" },
  { id: createId(), name: "Leer 20 min", category: "Crecimiento" },
  { id: createId(), name: "Caminar", category: "Movimiento" }
];

const state = loadState();
const habitForm = document.getElementById("habitForm");
const habitNameInput = document.getElementById("habitName");
const habitCategoryInput = document.getElementById("habitCategory");
const resetDataButton = document.getElementById("resetDataButton");
const habitTableHead = document.getElementById("habitTableHead");
const habitTableBody = document.getElementById("habitTableBody");
const completionRate = document.getElementById("completionRate");
const habitCount = document.getElementById("habitCount");
const visibleDays = document.getElementById("visibleDays");
const emptyStateTemplate = document.getElementById("emptyStateTemplate");
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");
const monthFormatter = new Intl.DateTimeFormat("es-MX", { month: "long" });
const dayFormatter = new Intl.DateTimeFormat("es-MX", { weekday: "short" });
const fullDateFormatter = new Intl.DateTimeFormat("es-MX", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric"
});

initialize();

function initialize() {
  ensureSelectedPeriod();
  populateCalendarControls();
  render();

  habitForm.addEventListener("submit", handleHabitSubmit);
  resetDataButton.addEventListener("click", handleReset);
  monthSelect.addEventListener("change", handlePeriodChange);
  yearSelect.addEventListener("change", handlePeriodChange);
  window.addEventListener("resize", renderWave);
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const currentMonthKey = getMonthKeyFromDate(new Date());

  if (!stored) {
    return createInitialState(currentMonthKey);
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      selectedMonthKey: parsed.selectedMonthKey || parsed.monthKey || currentMonthKey,
      habits: Array.isArray(parsed.habits) && parsed.habits.length ? parsed.habits : structuredClone(DEFAULT_HABITS),
      entries: parsed.entries && typeof parsed.entries === "object" ? parsed.entries : {}
    };
  } catch (error) {
    return createInitialState(currentMonthKey);
  }
}

function createInitialState(monthKey) {
  return {
    selectedMonthKey: monthKey,
    habits: structuredClone(DEFAULT_HABITS),
    entries: {}
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function handleHabitSubmit(event) {
  event.preventDefault();

  const name = habitNameInput.value.trim();
  const category = habitCategoryInput.value.trim() || "Personal";

  if (!name) {
    habitNameInput.focus();
    return;
  }

  state.habits.push({
    id: createId(),
    name,
    category
  });

  habitForm.reset();
  saveState();
  render();
}

function handleReset() {
  const confirmed = window.confirm("Se borrarán los hábitos y todas las marcas de este mes. ¿Deseas continuar?");
  if (!confirmed) {
    return;
  }

  const nextState = createInitialState(state.selectedMonthKey);
  state.selectedMonthKey = nextState.selectedMonthKey;
  state.habits = nextState.habits;
  state.entries = nextState.entries;
  saveState();
  render();
}

function render() {
  syncCalendarControls();
  const days = getMonthDays();
  renderTable(days);
  updateSummary(days);
  renderWave();
}

function renderTable(days) {
  habitTableHead.innerHTML = "";
  habitTableBody.innerHTML = "";

  const headerRow = document.createElement("tr");
  const titleHead = document.createElement("th");
  titleHead.textContent = "Hábito";
  headerRow.appendChild(titleHead);

  days.forEach((day) => {
    const th = document.createElement("th");
    th.innerHTML = `
      <div class="day-label">
        <span>${day.dayNumber}</span>
        <span>${day.weekdayShort}</span>
      </div>
    `;
    headerRow.appendChild(th);
  });

  habitTableHead.appendChild(headerRow);

  if (!state.habits.length) {
    habitTableBody.appendChild(emptyStateTemplate.content.cloneNode(true));
    return;
  }

  state.habits.forEach((habit) => {
    const row = document.createElement("tr");
    const habitCell = document.createElement("td");
    habitCell.innerHTML = `
      <div class="habit-meta">
        <strong>${escapeHtml(habit.name)}</strong>
        <span>${escapeHtml(habit.category)}</span>
      </div>
    `;
    row.appendChild(habitCell);

    days.forEach((day) => {
      const cell = document.createElement("td");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "habit-check";
      checkbox.checked = isHabitDoneOnDate(habit.id, day.isoDate);
      checkbox.setAttribute("aria-label", `${habit.name} - ${day.fullLabel}`);
      checkbox.addEventListener("change", () => {
        toggleHabitEntry(habit.id, day.isoDate, checkbox.checked);
      });

      cell.appendChild(checkbox);
      row.appendChild(cell);
    });

    habitTableBody.appendChild(row);
  });
}

function toggleHabitEntry(habitId, isoDate, isChecked) {
  if (!state.entries[habitId]) {
    state.entries[habitId] = {};
  }

  if (isChecked) {
    state.entries[habitId][isoDate] = true;
  } else {
    delete state.entries[habitId][isoDate];
    if (!Object.keys(state.entries[habitId]).length) {
      delete state.entries[habitId];
    }
  }

  saveState();
  updateSummary(getMonthDays());
  renderWave();
}

function isHabitDoneOnDate(habitId, isoDate) {
  return Boolean(state.entries[habitId]?.[isoDate]);
}

function updateSummary(days) {
  const totalHabits = state.habits.length;
  const totalSlots = totalHabits * days.length;
  const totalCompleted = state.habits.reduce((count, habit) => {
    return count + Object.keys(state.entries[habit.id] || {}).length;
  }, 0);

  const percent = totalSlots ? Math.round((totalCompleted / totalSlots) * 100) : 0;
  completionRate.textContent = `${percent}%`;
  habitCount.textContent = String(totalHabits);
  visibleDays.textContent = String(days.length);
}

function renderWave() {
  if (!ctx) {
    return;
  }

  const bounds = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
  canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const days = getMonthDays();
  const completionByDay = days.map((day) => getCompletionForDate(day.isoDate));
  drawLineChart(completionByDay, days, bounds.width, bounds.height);
}

function drawLineChart(completionByDay, days, width, height) {
  ctx.clearRect(0, 0, width, height);

  const padding = { top: 24, right: 18, bottom: 46, left: 42 };
  const chartWidth = Math.max(width - padding.left - padding.right, 1);
  const chartHeight = Math.max(height - padding.top - padding.bottom, 1);

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "rgba(255, 42, 42, 0.08)");
  bg.addColorStop(1, "rgba(255, 255, 255, 0.01)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1;
  for (let step = 0; step <= 4; step += 1) {
    const y = padding.top + (chartHeight / 4) * step;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.font = "12px DM Sans";
  ctx.textAlign = "right";
  ["100%", "75%", "50%", "25%", "0%"].forEach((label, index) => {
    const y = padding.top + (chartHeight / 4) * index;
    ctx.fillText(label, padding.left - 8, y + 4);
  });

  const points = completionByDay.map((value, index) => {
    const x = padding.left + (completionByDay.length > 1 ? (chartWidth * index) / (completionByDay.length - 1) : chartWidth / 2);
    const y = padding.top + chartHeight - value * chartHeight;
    return { x, y, value, day: days[index]?.dayNumber ?? index + 1 };
  });

  if (!points.length) {
    return;
  }

  const areaFill = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
  areaFill.addColorStop(0, "rgba(255, 42, 42, 0.26)");
  areaFill.addColorStop(1, "rgba(255, 42, 42, 0.02)");
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
  ctx.lineTo(points[0].x, padding.top + chartHeight);
  ctx.closePath();
  ctx.fillStyle = areaFill;
  ctx.fill();

  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.strokeStyle = "#ff2a2a";
  ctx.lineWidth = 3;
  ctx.shadowColor = "rgba(255, 42, 42, 0.8)";
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;

  points.forEach((point, index) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(255, 42, 42, 0.7)";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    if (points.length <= 16 || index % 2 === 0 || index === points.length - 1) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.textAlign = "center";
      ctx.font = "11px DM Sans";
      ctx.fillText(String(point.day), point.x, height - 16);
    }
  });
}

function getCompletionForDate(isoDate) {
  if (!state.habits.length) {
    return 0;
  }

  const completedHabits = state.habits.reduce((count, habit) => {
    return count + (state.entries[habit.id]?.[isoDate] ? 1 : 0);
  }, 0);

  return completedHabits / state.habits.length;
}

function getMonthDays() {
  const { year, monthIndex } = getSelectedPeriod();
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(year, monthIndex, index + 1);
    const isoDate = toIsoDate(date);
    const fullLabel = fullDateFormatter.format(date);

    return {
      dayNumber: index + 1,
      isoDate,
      fullLabel,
      weekdayShort: dayFormatter.format(date)
    };
  });
}

function getMonthKeyFromDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getSelectedPeriod() {
  const [yearString, monthString] = state.selectedMonthKey.split("-");
  return {
    year: Number(yearString),
    monthIndex: Number(monthString) - 1
  };
}

function ensureSelectedPeriod() {
  if (!state.selectedMonthKey) {
    state.selectedMonthKey = getMonthKeyFromDate(new Date());
  }
}

function populateCalendarControls() {
  monthSelect.innerHTML = "";
  yearSelect.innerHTML = "";

  for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
    const option = document.createElement("option");
    option.value = String(monthIndex);
    option.textContent = capitalize(monthFormatter.format(new Date(2026, monthIndex, 1)));
    monthSelect.appendChild(option);
  }

  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 5; year <= currentYear + 5; year += 1) {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  }
}

function syncCalendarControls() {
  const { year, monthIndex } = getSelectedPeriod();
  monthSelect.value = String(monthIndex);
  if (![...yearSelect.options].some((option) => Number(option.value) === year)) {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  }
  yearSelect.value = String(year);
}

function handlePeriodChange() {
  const month = String(Number(monthSelect.value) + 1).padStart(2, "0");
  state.selectedMonthKey = `${yearSelect.value}-${month}`;
  saveState();
  render();
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
