const STORAGE_KEY = "habit-tracker-wave-state-v1";

const state = loadState();
const habitForm = document.getElementById("habitForm");
const habitNameInput = document.getElementById("habitName");
const habitCategoryInput = document.getElementById("habitCategory");
const resetDataButton = document.getElementById("resetDataButton");
const habitTableHead = document.getElementById("habitTableHead");
const habitTableBody = document.getElementById("habitTableBody");
const tableScroll = document.querySelector(".table-scroll");
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
    const monthData = normalizeMonthData(parsed.monthData, parsed.habits, parsed.entries, currentMonthKey);
    return {
      selectedMonthKey: parsed.selectedMonthKey || parsed.monthKey || currentMonthKey,
      monthData
    };
  } catch (error) {
    return createInitialState(currentMonthKey);
  }
}

function createInitialState(monthKey) {
  return {
    selectedMonthKey: monthKey,
    monthData: {
      [monthKey]: createEmptyMonthData()
    }
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

  const monthState = getCurrentMonthState();
  monthState.habits.push({
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

  state.monthData[state.selectedMonthKey] = createEmptyMonthData();
  saveState();
  render();
}

function render() {
  syncCalendarControls();
  const days = getMonthDays();
  renderTable(days);
  updateSummary(days);
  renderWave();
  scrollToToday(days);
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
    if (day.isToday) {
      th.dataset.isToday = "true";
    }
    th.innerHTML = `
      <div class="day-label">
        <span>${day.dayNumber}</span>
        <span>${day.weekdayShort}</span>
      </div>
    `;
    headerRow.appendChild(th);
  });

  habitTableHead.appendChild(headerRow);
  const monthState = getCurrentMonthState();

  if (!monthState.habits.length) {
    habitTableBody.appendChild(emptyStateTemplate.content.cloneNode(true));
    return;
  }

  monthState.habits.forEach((habit) => {
    const row = document.createElement("tr");
    const habitCell = document.createElement("td");
    habitCell.innerHTML = `
      <div class="habit-cell">
        <div class="habit-meta">
          <strong>${escapeHtml(habit.name)}</strong>
          <span>${escapeHtml(habit.category)}</span>
        </div>
        <button class="habit-delete" type="button" aria-label="Eliminar ${escapeHtml(habit.name)}">✕</button>
      </div>
    `;
    habitCell.querySelector(".habit-delete").addEventListener("click", () => {
      deleteHabit(habit.id);
    });
    row.appendChild(habitCell);

    days.forEach((day) => {
      const cell = document.createElement("td");
      if (day.isToday) {
        cell.dataset.isToday = "true";
      }
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
  const monthState = getCurrentMonthState();

  if (!monthState.entries[habitId]) {
    monthState.entries[habitId] = {};
  }

  if (isChecked) {
    monthState.entries[habitId][isoDate] = true;
  } else {
    delete monthState.entries[habitId][isoDate];
    if (!Object.keys(monthState.entries[habitId]).length) {
      delete monthState.entries[habitId];
    }
  }

  saveState();
  updateSummary(getMonthDays());
  renderWave();
}

function deleteHabit(habitId) {
  const monthState = getCurrentMonthState();
  const habit = monthState.habits.find((item) => item.id === habitId);
  if (!habit) {
    return;
  }

  const confirmed = window.confirm(`Se eliminará el hábito "${habit.name}" y todos sus registros guardados. ¿Deseas continuar?`);
  if (!confirmed) {
    return;
  }

  monthState.habits = monthState.habits.filter((item) => item.id !== habitId);
  delete monthState.entries[habitId];
  saveState();
  render();
}

function isHabitDoneOnDate(habitId, isoDate) {
  return Boolean(getCurrentMonthState().entries[habitId]?.[isoDate]);
}

function updateSummary(days) {
  const monthState = getCurrentMonthState();
  const totalHabits = monthState.habits.length;
  const totalSlots = totalHabits * days.length;
  const totalCompleted = monthState.habits.reduce((count, habit) => {
    return count + Object.keys(monthState.entries[habit.id] || {}).length;
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
  const width = Math.max(1, Math.round(canvas.clientWidth || bounds.width));
  const height = Math.max(1, Math.round(canvas.clientHeight || bounds.height));
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(width * ratio));
  canvas.height = Math.max(1, Math.floor(height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const days = getMonthDays();
  const completionByDay = days.map((day) => getCompletionForDate(day.isoDate));
  drawLineChart(completionByDay, days, width, height);
}

function drawLineChart(completionByDay, days, width, height) {
  ctx.clearRect(0, 0, width, height);

  const isCompact = width < 480;
  const padding = {
    top: 24,
    right: isCompact ? 10 : 18,
    bottom: isCompact ? 56 : 46,
    left: isCompact ? 34 : 42
  };
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

    if (points.length <= 14 || index % (isCompact ? 4 : 2) === 0 || index === points.length - 1) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.textAlign = "center";
      ctx.font = "11px DM Sans";
      ctx.fillText(String(point.day), point.x, height - 16);
    }
  });

  drawTodayMarker(days, points, padding, height);
}

function drawTodayMarker(days, points, padding, height) {
  const todayIndex = getTodayIndexForVisibleMonth(days);
  if (todayIndex < 0 || !points[todayIndex]) {
    return;
  }

  const markerX = points[todayIndex].x;
  ctx.save();
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(markerX, padding.top);
  ctx.lineTo(markerX, height - padding.bottom + 8);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "700 11px DM Sans";
  ctx.fillText("Hoy", markerX, padding.top - 8);
  ctx.restore();
}

function getCompletionForDate(isoDate) {
  const monthState = getCurrentMonthState();
  if (!monthState.habits.length) {
    return 0;
  }

  const completedHabits = monthState.habits.reduce((count, habit) => {
    return count + (monthState.entries[habit.id]?.[isoDate] ? 1 : 0);
  }, 0);

  return completedHabits / monthState.habits.length;
}

function getMonthDays() {
  const { year, monthIndex } = getSelectedPeriod();
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const today = new Date();
  const todayIso = toIsoDate(today);

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(year, monthIndex, index + 1);
    const isoDate = toIsoDate(date);
    const fullLabel = fullDateFormatter.format(date);

    return {
      dayNumber: index + 1,
      isoDate,
      fullLabel,
      weekdayShort: dayFormatter.format(date),
      isToday: isoDate === todayIso
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
  ensureMonthState(state.selectedMonthKey);
  saveState();
  render();
}

function getTodayIndexForVisibleMonth(days) {
  const today = new Date();
  const { year, monthIndex } = getSelectedPeriod();
  if (today.getFullYear() !== year || today.getMonth() !== monthIndex) {
    return -1;
  }

  return days.findIndex((day) => day.isoDate === toIsoDate(today));
}

function scrollToToday(days) {
  if (!tableScroll) {
    return;
  }

  const todayIndex = getTodayIndexForVisibleMonth(days);
  if (todayIndex < 0) {
    tableScroll.scrollLeft = 0;
    return;
  }

  const todayHeader = habitTableHead.querySelector('th[data-is-today="true"]');
  if (!todayHeader) {
    return;
  }

  const targetLeft = todayHeader.offsetLeft - tableScroll.clientWidth / 2 + todayHeader.clientWidth / 2;
  tableScroll.scrollLeft = Math.max(0, targetLeft);
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

function getCurrentMonthState() {
  ensureMonthState(state.selectedMonthKey);
  return state.monthData[state.selectedMonthKey];
}

function ensureMonthState(monthKey) {
  if (!state.monthData) {
    state.monthData = {};
  }

  if (!state.monthData[monthKey]) {
    state.monthData[monthKey] = createEmptyMonthData();
  }
}

function createEmptyMonthData() {
  return {
    habits: [],
    entries: {}
  };
}

function normalizeMonthData(rawMonthData, legacyHabits, legacyEntries, currentMonthKey) {
  const normalized = {};

  if (rawMonthData && typeof rawMonthData === "object") {
    Object.entries(rawMonthData).forEach(([monthKey, monthState]) => {
      normalized[monthKey] = {
        habits: Array.isArray(monthState?.habits) ? monthState.habits : [],
        entries: monthState?.entries && typeof monthState.entries === "object" ? monthState.entries : {}
      };
    });
  }

  if (!Object.keys(normalized).length && (Array.isArray(legacyHabits) || legacyEntries)) {
    normalized[currentMonthKey] = {
      habits: Array.isArray(legacyHabits) ? legacyHabits : [],
      entries: legacyEntries && typeof legacyEntries === "object" ? legacyEntries : {}
    };
  }

  if (!normalized[currentMonthKey]) {
    normalized[currentMonthKey] = createEmptyMonthData();
  }

  return normalized;
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
