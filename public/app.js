const STORAGE_KEY = "habit-tracker-wave-state-v2";
const FINANCE_COLORS = ["#22c55e", "#3b82f6", "#8b5cf6", "#facc15", "#f97316", "#ec4899", "#06b6d4", "#84cc16"];
const ROUTINE_DAYS = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" }
];
const EXERCISE_LIBRARY = {
  "pierna-anterior": [
    { name: "Sentadilla frontal", target: "cuadriceps" },
    { name: "Prensa inclinada", target: "cuadriceps" },
    { name: "Extensión de cuádriceps", target: "cuadriceps" },
    { name: "Zancadas caminando", target: "cuadriceps" },
    { name: "Step up", target: "gluteo" },
    { name: "Elevación de pantorrilla", target: "pantorrilla" }
  ],
  "pierna-posterior": [
    { name: "Peso muerto rumano", target: "femoral" },
    { name: "Curl femoral", target: "femoral" },
    { name: "Hip thrust", target: "gluteo" },
    { name: "Buenos días", target: "femoral" },
    { name: "Puente de glúteo", target: "gluteo" },
    { name: "Elevación de pantorrilla sentado", target: "pantorrilla" }
  ],
  espalda: [
    { name: "Dominadas", target: "espalda" },
    { name: "Jalón al pecho", target: "espalda" },
    { name: "Remo con barra", target: "espalda" },
    { name: "Remo con mancuerna", target: "espalda" },
    { name: "Pullover", target: "espalda" },
    { name: "Face pull", target: "hombro" }
  ],
  brazo: [
    { name: "Curl de bíceps", target: "biceps" },
    { name: "Curl martillo", target: "biceps" },
    { name: "Extensión de tríceps", target: "triceps" },
    { name: "Fondos", target: "triceps" },
    { name: "Press militar", target: "hombro" },
    { name: "Elevaciones laterales", target: "hombro" }
  ],
  pecho: [
    { name: "Press banca", target: "pecho" },
    { name: "Press inclinado", target: "pecho" },
    { name: "Aperturas con mancuerna", target: "pecho" },
    { name: "Flexiones", target: "pecho" },
    { name: "Press en máquina", target: "pecho" }
  ],
  abdomen: [
    { name: "Crunch", target: "abdomen" },
    { name: "Elevaciones de piernas", target: "abdomen" },
    { name: "Plancha", target: "abdomen" },
    { name: "Russian twist", target: "abdomen" },
    { name: "Ab wheel", target: "abdomen" }
  ]
};

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
const overviewScore = document.getElementById("overviewScore");
const overviewCenterScore = document.getElementById("overviewCenterScore");
const dashboardHabitScore = document.getElementById("dashboardHabitScore");
const dashboardBalanceValue = document.getElementById("dashboardBalanceValue");
const dashboardFinanceScore = document.getElementById("dashboardFinanceScore");
const dashboardTrainingScore = document.getElementById("dashboardTrainingScore");
const dashboardMainFocus = document.getElementById("dashboardMainFocus");
const dashboardInsights = document.getElementById("dashboardInsights");
const emptyStateTemplate = document.getElementById("emptyStateTemplate");
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const waveCanvas = document.getElementById("waveCanvas");
const waveCtx = waveCanvas.getContext("2d");
const overviewRadarCanvas = document.getElementById("overviewRadarCanvas");
const overviewRadarCtx = overviewRadarCanvas.getContext("2d");

const menuToggle = document.getElementById("menuToggle");
const menuClose = document.getElementById("menuClose");
const mobileMenu = document.getElementById("mobileMenu");
const menuBackdrop = document.getElementById("menuBackdrop");
const menuLinks = [...document.querySelectorAll(".menu-link")];
const sectionLabel = document.getElementById("currentSectionLabel");
const appSections = [...document.querySelectorAll(".app-section")];

const financeForm = document.getElementById("financeForm");
const financeType = document.getElementById("financeType");
const financeTitle = document.getElementById("financeTitle");
const financeCategory = document.getElementById("financeCategory");
const financeAmount = document.getElementById("financeAmount");
const financeDate = document.getElementById("financeDate");
const financeInstallments = document.getElementById("financeInstallments");
const financeBaseAmount = document.getElementById("financeBaseAmount");
const saveBaseAmountButton = document.getElementById("saveBaseAmountButton");
const toggleMoneyVisibility = document.getElementById("toggleMoneyVisibility");
const installmentMonthsLabel = document.getElementById("installmentMonthsLabel");
const financeBalance = document.getElementById("financeBalance");
const financeIncome = document.getElementById("financeIncome");
const financeExpenses = document.getElementById("financeExpenses");
const financeTableBody = document.getElementById("financeTableBody");
const financePieCanvas = document.getElementById("financePieCanvas");
const financePieCtx = financePieCanvas.getContext("2d");
const financeLegend = document.getElementById("financeLegend");
const financeEmptyStateTemplate = document.getElementById("financeEmptyStateTemplate");
const trainingProfileForm = document.getElementById("trainingProfileForm");
const trainingWeight = document.getElementById("trainingWeight");
const trainingHeight = document.getElementById("trainingHeight");
const trainingDays = document.getElementById("trainingDays");
const trainingMinutes = document.getElementById("trainingMinutes");
const trainingScore = document.getElementById("trainingScore");
const trainingBmi = document.getElementById("trainingBmi");
const trainingWeeklyMinutes = document.getElementById("trainingWeeklyMinutes");
const trainingNavLinks = [...document.querySelectorAll(".training-nav-link")];
const trainingViews = [...document.querySelectorAll(".training-view")];
const routineLibraryGroup = document.getElementById("routineLibraryGroup");
const routineSearch = document.getElementById("routineSearch");
const routineQuickDay = document.getElementById("routineQuickDay");
const routineExerciseLibrary = document.getElementById("routineExerciseLibrary");
const routineDropzones = [...document.querySelectorAll(".routine-dropzone")];
const trainingLogForm = document.getElementById("trainingLogForm");
const trainingLogDate = document.getElementById("trainingLogDate");
const trainingLogGroup = document.getElementById("trainingLogGroup");
const trainingLogExercise = document.getElementById("trainingLogExercise");
const trainingLogReps = document.getElementById("trainingLogReps");
const trainingLogWeight = document.getElementById("trainingLogWeight");
const trainingLogDuration = document.getElementById("trainingLogDuration");
const trainingLogTableBody = document.getElementById("trainingLogTableBody");
const bodyMap = document.getElementById("bodyMap");
const trainingInsights = document.getElementById("trainingInsights");
const stepperButtons = [...document.querySelectorAll(".stepper-button")];

const monthFormatter = new Intl.DateTimeFormat("es-MX", { month: "long" });
const dayFormatter = new Intl.DateTimeFormat("es-MX", { weekday: "short" });
const fullDateFormatter = new Intl.DateTimeFormat("es-MX", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric"
});
const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2
});
let activeRoutineDrag = null;

initialize();

function initialize() {
  ensureSelectedPeriod();
  populateCalendarControls();
  ensureMonthState(state.selectedMonthKey);
  attachEvents();
  render();
}

function attachEvents() {
  habitForm.addEventListener("submit", handleHabitSubmit);
  resetDataButton.addEventListener("click", handleReset);
  monthSelect.addEventListener("change", handlePeriodChange);
  yearSelect.addEventListener("change", handlePeriodChange);
  window.addEventListener("resize", () => {
    renderWave();
    renderFinancePie();
    renderOverview();
  });

  menuToggle.addEventListener("click", () => toggleMenu(true));
  menuClose.addEventListener("click", () => toggleMenu(false));
  menuBackdrop.addEventListener("click", () => toggleMenu(false));
  menuLinks.forEach((link) => {
    link.addEventListener("click", () => setActiveSection(link.dataset.section));
  });

  financeForm.addEventListener("submit", handleFinanceSubmit);
  financeType.addEventListener("change", syncFinanceForm);
  saveBaseAmountButton.addEventListener("click", handleBaseAmountSave);
  toggleMoneyVisibility.addEventListener("click", handleMoneyVisibilityToggle);
  trainingProfileForm.addEventListener("submit", handleTrainingProfileSubmit);
  trainingLogForm.addEventListener("submit", handleTrainingLogSubmit);
  trainingLogGroup.addEventListener("change", syncTrainingExerciseOptions);
  routineLibraryGroup.addEventListener("change", renderRoutineBuilder);
  routineSearch.addEventListener("input", renderRoutineBuilder);
  routineQuickDay.addEventListener("change", renderRoutineBuilder);
  routineExerciseLibrary.addEventListener("click", handleRoutineLibraryClick);
  routineExerciseLibrary.addEventListener("dragstart", handleRoutineDragStart);
  routineExerciseLibrary.addEventListener("dragend", clearRoutineDragState);
  routineDropzones.forEach((dropzone) => {
    dropzone.addEventListener("dragover", handleRoutineDragOver);
    dropzone.addEventListener("dragenter", handleRoutineDragEnter);
    dropzone.addEventListener("dragleave", handleRoutineDragLeave);
    dropzone.addEventListener("drop", handleRoutineDrop);
  });
  trainingNavLinks.forEach((link) => {
    link.addEventListener("click", () => setTrainingView(link.dataset.trainingView));
  });
  stepperButtons.forEach((button) => {
    button.addEventListener("click", handleStepperClick);
  });
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
      selectedMonthKey: parsed.selectedMonthKey || currentMonthKey,
      activeSection: parsed.activeSection || "dashboard",
      moneyHidden: Boolean(parsed.moneyHidden),
      monthData: normalizeMonthData(parsed.monthData, currentMonthKey)
    };
  } catch (error) {
    return createInitialState(currentMonthKey);
  }
}

function createInitialState(monthKey) {
  return {
    selectedMonthKey: monthKey,
    activeSection: "dashboard",
    moneyHidden: false,
    monthData: {
      [monthKey]: createEmptyMonthData()
    }
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createEmptyMonthData() {
  return {
    habits: [],
    entries: {},
    finances: [],
    baseAmount: 0,
    training: {
      profile: { weight: 0, height: 0, daysPerWeek: 0, minutesPerSession: 0 },
      routine: createEmptyRoutineSchedule(),
      logs: []
    }
  };
}

function createEmptyRoutineSchedule() {
  return ROUTINE_DAYS.reduce((acc, day) => {
    acc[day.key] = [];
    return acc;
  }, {});
}

function normalizeRoutineData(rawRoutine) {
  const schedule = createEmptyRoutineSchedule();
  if (Array.isArray(rawRoutine)) {
    schedule.monday = rawRoutine.map((item) => ({
      id: item.id || createId(),
      group: item.group || "general",
      target: normalizeRoutineTarget(item.target || item.subgroup || mapGroupToPrimaryTarget(item.group)),
      exercise: item.exercise || "Ejercicio",
      sourceId: `${item.group || "general"}::${item.exercise || "Ejercicio"}`
    }));
    return schedule;
  }

  if (!rawRoutine || typeof rawRoutine !== "object") {
    return schedule;
  }

  ROUTINE_DAYS.forEach((day) => {
    const items = Array.isArray(rawRoutine[day.key]) ? rawRoutine[day.key] : [];
    schedule[day.key] = items.map((item) => ({
      id: item.id || createId(),
      group: item.group || "general",
      target: normalizeRoutineTarget(item.target || mapGroupToPrimaryTarget(item.group)),
      exercise: item.exercise || "Ejercicio",
      sourceId: item.sourceId || `${item.group || "general"}::${item.exercise || "Ejercicio"}`
    }));
  });

  return schedule;
}

function normalizeMonthData(rawMonthData, currentMonthKey) {
  const normalized = {};

  if (rawMonthData && typeof rawMonthData === "object") {
    Object.entries(rawMonthData).forEach(([monthKey, monthState]) => {
      normalized[monthKey] = {
        habits: Array.isArray(monthState?.habits) ? monthState.habits : [],
        entries: monthState?.entries && typeof monthState.entries === "object" ? monthState.entries : {},
        finances: Array.isArray(monthState?.finances) ? monthState.finances : [],
        baseAmount: Number(monthState?.baseAmount || 0),
        training: {
          profile: {
            weight: Number(monthState?.training?.profile?.weight || 0),
            height: Number(monthState?.training?.profile?.height || 0),
            daysPerWeek: Number(monthState?.training?.profile?.daysPerWeek || 0),
            minutesPerSession: Number(monthState?.training?.profile?.minutesPerSession || 0)
          },
          routine: normalizeRoutineData(monthState?.training?.routine),
          logs: Array.isArray(monthState?.training?.logs) ? monthState.training.logs : []
        }
      };
    });
  }

  if (!normalized[currentMonthKey]) {
    normalized[currentMonthKey] = createEmptyMonthData();
  }

  return normalized;
}

function ensureSelectedPeriod() {
  if (!state.selectedMonthKey) {
    state.selectedMonthKey = getMonthKeyFromDate(new Date());
  }
}

function ensureMonthState(monthKey) {
  if (!state.monthData[monthKey]) {
    state.monthData[monthKey] = createEmptyMonthData();
  }

  if (!state.monthData[monthKey].training) {
    state.monthData[monthKey].training = {
      profile: { weight: 0, height: 0, daysPerWeek: 0, minutesPerSession: 0 },
      routine: createEmptyRoutineSchedule(),
      logs: []
    };
  }

  state.monthData[monthKey].training.routine = normalizeRoutineData(state.monthData[monthKey].training.routine);
}

function getCurrentMonthState() {
  ensureMonthState(state.selectedMonthKey);
  return state.monthData[state.selectedMonthKey];
}

function getRoutineSchedule() {
  return getCurrentMonthState().training.routine;
}

function getRoutineLibraryExercises() {
  return Object.entries(EXERCISE_LIBRARY).flatMap(([group, exercises]) =>
    exercises.map((exercise) => ({
      id: `${group}::${exercise.name}`,
      group,
      exercise: exercise.name,
      target: exercise.target
    }))
  );
}

function getDefaultRoutineDay() {
  const weekday = new Date().getDay();
  const map = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return map[weekday] || "monday";
}

function getRoutineDayLabel(dayKey) {
  return ROUTINE_DAYS.find((day) => day.key === dayKey)?.label || dayKey;
}

function normalizeRoutineTarget(target) {
  const validTargets = new Set(["cuadriceps", "femoral", "gluteo", "pantorrilla", "espalda", "biceps", "triceps", "hombro", "pecho", "abdomen", "general"]);
  return validTargets.has(target) ? target : "general";
}

function findLibraryExerciseById(sourceId) {
  return getRoutineLibraryExercises().find((exercise) => exercise.id === sourceId) || null;
}

function getRoutineInsertIndex(container, clientY) {
  const cards = [...container.querySelectorAll(".routine-card")].filter((card) => card.dataset.dragging !== "true");
  const nextCard = cards.find((card) => clientY < card.getBoundingClientRect().top + (card.getBoundingClientRect().height / 2));
  return nextCard ? cards.indexOf(nextCard) : cards.length;
}

function insertRoutineItem(schedule, dayKey, item, index) {
  const dayItems = schedule[dayKey] || [];
  const safeIndex = Math.max(0, Math.min(index, dayItems.length));
  dayItems.splice(safeIndex, 0, item);
  schedule[dayKey] = dayItems;
}

function moveRoutineItem(sourceDay, itemId, targetDay, targetIndex) {
  const schedule = getRoutineSchedule();
  const sourceItems = schedule[sourceDay] || [];
  const sourceIndex = sourceItems.findIndex((item) => item.id === itemId);
  if (sourceIndex === -1) {
    return;
  }

  const [movedItem] = sourceItems.splice(sourceIndex, 1);
  let nextIndex = targetIndex;
  if (sourceDay === targetDay && sourceIndex < targetIndex) {
    nextIndex -= 1;
  }
  insertRoutineItem(schedule, targetDay, movedItem, nextIndex);
}

function getSelectedPeriod() {
  const [yearString, monthString] = state.selectedMonthKey.split("-");
  return {
    year: Number(yearString),
    monthIndex: Number(monthString) - 1
  };
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

function setActiveSection(sectionId) {
  state.activeSection = sectionId;
  saveState();
  sectionLabel.textContent =
    sectionId === "balance" ? "Saldo actual" :
    sectionId === "training" ? "Entrenamiento" :
    sectionId === "habits" ? "Habit tracker" :
    "Dashboard";

  appSections.forEach((section) => {
    section.classList.toggle("is-active", section.id === `section-${sectionId}`);
  });

  menuLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.section === sectionId);
  });

  toggleMenu(false);

  if (sectionId === "balance") {
    renderFinancePie();
  } else if (sectionId === "training") {
    renderTraining();
  } else if (sectionId === "dashboard") {
    renderOverview();
  } else {
    renderWave();
  }
}

function toggleMenu(forceOpen) {
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : mobileMenu.classList.contains("is-open");
  mobileMenu.classList.toggle("is-open", shouldOpen);
  mobileMenu.setAttribute("aria-hidden", String(!shouldOpen));
  menuToggle.setAttribute("aria-expanded", String(shouldOpen));
  menuBackdrop.hidden = !shouldOpen;
}

function render() {
  syncCalendarControls();
  setActiveSection(state.activeSection || "dashboard");
  renderHabits();
  renderFinance();
  renderTraining();
  renderOverview();
  syncFinanceForm();
  renderMoneyVisibility();
}

function renderHabits() {
  const days = getMonthDays();
  renderHabitTable(days);
  updateHabitSummary(days);
  renderWave();
  scrollToToday(days);
}

function handleHabitSubmit(event) {
  event.preventDefault();

  const name = habitNameInput.value.trim();
  const category = habitCategoryInput.value.trim() || "Personal";
  if (!name) {
    habitNameInput.focus();
    return;
  }

  getCurrentMonthState().habits.push({
    id: createId(),
    name,
    category
  });

  habitForm.reset();
  saveState();
  renderHabits();
}

function handleReset() {
  const confirmed = window.confirm("Se borrarán los hábitos y todas las marcas de este mes. ¿Deseas continuar?");
  if (!confirmed) {
    return;
  }

  const monthState = getCurrentMonthState();
  monthState.habits = [];
  monthState.entries = {};
  saveState();
  renderHabits();
}

function renderHabitTable(days) {
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
    th.innerHTML = `<div class="day-label"><span>${day.dayNumber}</span><span>${day.weekdayShort}</span></div>`;
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
        <button class="habit-delete" type="button" aria-label="Eliminar ${escapeHtml(habit.name)}">×</button>
      </div>
    `;
    habitCell.querySelector(".habit-delete").addEventListener("click", () => deleteHabit(habit.id));
    row.appendChild(habitCell);

    days.forEach((day) => {
      const cell = document.createElement("td");
      if (day.isToday) {
        cell.dataset.isToday = "true";
      }
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "habit-check";
      checkbox.checked = Boolean(monthState.entries[habit.id]?.[day.isoDate]);
      checkbox.setAttribute("aria-label", `${habit.name} - ${day.fullLabel}`);
      checkbox.addEventListener("change", () => toggleHabitEntry(habit.id, day.isoDate, checkbox.checked));
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
  updateHabitSummary(getMonthDays());
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
  renderHabits();
}

function updateHabitSummary(days) {
  const monthState = getCurrentMonthState();
  const totalHabits = monthState.habits.length;
  const totalSlots = totalHabits * days.length;
  const totalCompleted = monthState.habits.reduce((count, habit) => count + Object.keys(monthState.entries[habit.id] || {}).length, 0);
  const percent = totalSlots ? Math.round((totalCompleted / totalSlots) * 100) : 0;
  completionRate.textContent = `${percent}%`;
  habitCount.textContent = String(totalHabits);
  visibleDays.textContent = String(days.length);
  dashboardHabitScore.textContent = `${percent}%`;
}

function getCompletionForDate(isoDate) {
  const monthState = getCurrentMonthState();
  if (!monthState.habits.length) {
    return 0;
  }

  const completedHabits = monthState.habits.reduce((count, habit) => count + (monthState.entries[habit.id]?.[isoDate] ? 1 : 0), 0);
  return completedHabits / monthState.habits.length;
}

function renderWave() {
  const bounds = waveCanvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(waveCanvas.clientWidth || bounds.width));
  const height = Math.max(1, Math.round(waveCanvas.clientHeight || bounds.height));
  const ratio = window.devicePixelRatio || 1;
  waveCanvas.width = Math.max(1, Math.floor(width * ratio));
  waveCanvas.height = Math.max(1, Math.floor(height * ratio));
  waveCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const days = getMonthDays();
  const completionByDay = days.map((day) => getCompletionForDate(day.isoDate));
  drawLineChart(completionByDay, days, width, height);
}

function drawLineChart(completionByDay, days, width, height) {
  waveCtx.clearRect(0, 0, width, height);
  const isCompact = width < 480;
  const padding = { top: 24, right: isCompact ? 10 : 18, bottom: isCompact ? 56 : 46, left: isCompact ? 34 : 42 };
  const chartWidth = Math.max(width - padding.left - padding.right, 1);
  const chartHeight = Math.max(height - padding.top - padding.bottom, 1);

  const bg = waveCtx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "rgba(255, 42, 42, 0.08)");
  bg.addColorStop(1, "rgba(255, 255, 255, 0.01)");
  waveCtx.fillStyle = bg;
  waveCtx.fillRect(0, 0, width, height);

  waveCtx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  waveCtx.lineWidth = 1;
  for (let step = 0; step <= 4; step += 1) {
    const y = padding.top + (chartHeight / 4) * step;
    waveCtx.beginPath();
    waveCtx.moveTo(padding.left, y);
    waveCtx.lineTo(width - padding.right, y);
    waveCtx.stroke();
  }

  waveCtx.fillStyle = "rgba(255, 255, 255, 0.75)";
  waveCtx.font = "12px DM Sans";
  waveCtx.textAlign = "right";
  ["100%", "75%", "50%", "25%", "0%"].forEach((label, index) => {
    const y = padding.top + (chartHeight / 4) * index;
    waveCtx.fillText(label, padding.left - 8, y + 4);
  });

  const points = completionByDay.map((value, index) => ({
    x: padding.left + (completionByDay.length > 1 ? (chartWidth * index) / (completionByDay.length - 1) : chartWidth / 2),
    y: padding.top + chartHeight - value * chartHeight,
    day: days[index]?.dayNumber ?? index + 1
  }));

  if (!points.length) {
    return;
  }

  const fill = waveCtx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
  fill.addColorStop(0, "rgba(255, 42, 42, 0.26)");
  fill.addColorStop(1, "rgba(255, 42, 42, 0.02)");
  waveCtx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      waveCtx.moveTo(point.x, point.y);
    } else {
      waveCtx.lineTo(point.x, point.y);
    }
  });
  waveCtx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
  waveCtx.lineTo(points[0].x, padding.top + chartHeight);
  waveCtx.closePath();
  waveCtx.fillStyle = fill;
  waveCtx.fill();

  waveCtx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      waveCtx.moveTo(point.x, point.y);
    } else {
      waveCtx.lineTo(point.x, point.y);
    }
  });
  waveCtx.strokeStyle = "#ff2a2a";
  waveCtx.lineWidth = 3;
  waveCtx.shadowColor = "rgba(255, 42, 42, 0.8)";
  waveCtx.shadowBlur = 12;
  waveCtx.stroke();
  waveCtx.shadowBlur = 0;

  points.forEach((point, index) => {
    waveCtx.beginPath();
    waveCtx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    waveCtx.fillStyle = "#ffffff";
    waveCtx.fill();

    if (points.length <= 14 || index % (isCompact ? 4 : 2) === 0 || index === points.length - 1) {
      waveCtx.fillStyle = "rgba(255, 255, 255, 0.75)";
      waveCtx.textAlign = "center";
      waveCtx.font = "11px DM Sans";
      waveCtx.fillText(String(point.day), point.x, height - 16);
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
  waveCtx.save();
  waveCtx.setLineDash([5, 5]);
  waveCtx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  waveCtx.lineWidth = 1.5;
  waveCtx.beginPath();
  waveCtx.moveTo(markerX, padding.top);
  waveCtx.lineTo(markerX, height - padding.bottom + 8);
  waveCtx.stroke();
  waveCtx.setLineDash([]);
  waveCtx.fillStyle = "#ffffff";
  waveCtx.textAlign = "center";
  waveCtx.font = "700 11px DM Sans";
  waveCtx.fillText("Hoy", markerX, padding.top - 8);
  waveCtx.restore();
}

function getMonthDays() {
  const { year, monthIndex } = getSelectedPeriod();
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const todayIso = toIsoDate(new Date());

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(year, monthIndex, index + 1);
    const isoDate = toIsoDate(date);
    return {
      dayNumber: index + 1,
      isoDate,
      fullLabel: fullDateFormatter.format(date),
      weekdayShort: dayFormatter.format(date),
      isToday: isoDate === todayIso
    };
  });
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

function syncFinanceForm() {
  const installmentMode = financeType.value === "installment";
  installmentMonthsLabel.classList.toggle("is-hidden", !installmentMode);
  financeCategory.value = financeType.value === "income" ? "Ingresos" : financeCategory.value === "Ingresos" ? "Otros" : financeCategory.value;
  if (!financeDate.value) {
    const { year, monthIndex } = getSelectedPeriod();
    const today = new Date();
    const safeDay = today.getFullYear() === year && today.getMonth() === monthIndex ? today.getDate() : 1;
    financeDate.value = toIsoDate(new Date(year, monthIndex, safeDay));
  }
}

function handleFinanceSubmit(event) {
  event.preventDefault();
  const amount = Number(financeAmount.value);
  const selectedDate = financeDate.value;

  if (!financeTitle.value.trim() || !amount || amount <= 0 || !selectedDate) {
    return;
  }

  const movementDate = new Date(`${selectedDate}T12:00:00`);
  const targetMonthKey = getMonthKeyFromDate(movementDate);
  ensureMonthState(targetMonthKey);
  const monthState = state.monthData[targetMonthKey];

  monthState.finances.push({
    id: createId(),
    type: financeType.value,
    title: financeTitle.value.trim(),
    category: financeCategory.value,
    amount,
    date: selectedDate,
    day: movementDate.getDate(),
    installments: financeType.value === "installment" ? Number(financeInstallments.value || 1) : 1
  });

  financeForm.reset();
  financeType.value = "income";
  syncFinanceForm();
  saveState();
  render();
}

function renderFinance() {
  renderFinanceSummary();
  renderFinanceTable();
  renderFinancePie();
}

function getExpandedMonthlyFinanceEntries() {
  const monthState = getCurrentMonthState();
  return monthState.finances.map((entry) => {
    if (entry.type !== "installment") {
      return {
        ...entry,
        monthlyAmount: entry.amount
      };
    }

    return {
      ...entry,
      monthlyAmount: entry.amount / Math.max(entry.installments || 1, 1)
    };
  });
}

function renderFinanceSummary() {
  const entries = getExpandedMonthlyFinanceEntries();
  const monthState = getCurrentMonthState();
  const baseAmount = Number(monthState.baseAmount || 0);
  const incomeTotal = entries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.monthlyAmount, 0);
  const expenseTotal = entries.filter((entry) => entry.type !== "income").reduce((sum, entry) => sum + entry.monthlyAmount, 0);
  const balance = baseAmount + incomeTotal - expenseTotal;
  const financeHealth = incomeTotal > 0 ? Math.max(0, Math.min(100, Math.round((balance / incomeTotal) * 100))) : 0;

  financeBaseAmount.value = monthState.baseAmount ? String(monthState.baseAmount) : "";
  financeIncome.textContent = formatMoneyValue(incomeTotal);
  financeExpenses.textContent = formatMoneyValue(expenseTotal);
  financeBalance.textContent = formatMoneyValue(balance);
  dashboardBalanceValue.textContent = formatMoneyValue(balance);
  dashboardFinanceScore.textContent = `${financeHealth}%`;
}

function renderFinanceTable() {
  financeTableBody.innerHTML = "";
  const monthState = getCurrentMonthState();

  if (!monthState.finances.length) {
    financeTableBody.appendChild(financeEmptyStateTemplate.content.cloneNode(true));
    return;
  }

  const rows = [...monthState.finances].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  rows.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(entry.title)}</td>
      <td>${entry.type === "income" ? "Entrada" : entry.type === "installment" ? "Plazos" : "Salida"}</td>
      <td>${escapeHtml(entry.category)}</td>
      <td>${entry.date ? formatShortDate(entry.date) : entry.day}</td>
      <td>${currencyFormatter.format(entry.type === "installment" ? entry.amount / Math.max(entry.installments || 1, 1) : entry.amount)}</td>
      <td><button class="habit-delete" type="button" aria-label="Eliminar ${escapeHtml(entry.title)}">×</button></td>
    `;
    row.querySelector(".habit-delete").addEventListener("click", () => deleteFinanceEntry(entry.id));
    financeTableBody.appendChild(row);
  });
}

function deleteFinanceEntry(entryId) {
  const monthState = getCurrentMonthState();
  monthState.finances = monthState.finances.filter((entry) => entry.id !== entryId);
  saveState();
  renderFinance();
}

function renderFinancePie() {
  const bounds = financePieCanvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(financePieCanvas.clientWidth || bounds.width));
  const height = Math.max(1, Math.round(financePieCanvas.clientHeight || bounds.height));
  const ratio = window.devicePixelRatio || 1;
  financePieCanvas.width = Math.max(1, Math.floor(width * ratio));
  financePieCanvas.height = Math.max(1, Math.floor(height * ratio));
  financePieCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  financePieCtx.clearRect(0, 0, width, height);
  financeLegend.innerHTML = "";

  const expenseTotals = getExpandedMonthlyFinanceEntries()
    .filter((entry) => entry.type !== "income")
    .reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.monthlyAmount;
      return acc;
    }, {});

  const slices = Object.entries(expenseTotals);
  if (!slices.length) {
    financeLegend.innerHTML = '<p class="empty-state">No hay gastos para mostrar en este mes.</p>';
    return;
  }

  const total = slices.reduce((sum, [, value]) => sum + value, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.28;
  const innerRadius = radius * 0.58;
  let startAngle = -Math.PI / 2;

  slices.forEach(([category, value], index) => {
    const angle = (value / total) * Math.PI * 2;
    const color = FINANCE_COLORS[index % FINANCE_COLORS.length];
    financePieCtx.beginPath();
    financePieCtx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
    financePieCtx.arc(centerX, centerY, innerRadius, startAngle + angle, startAngle, true);
    financePieCtx.closePath();
    financePieCtx.fillStyle = color;
    financePieCtx.fill();
    startAngle += angle;

    const item = document.createElement("div");
    item.className = "finance-legend-item";
    item.innerHTML = `
      <span class="legend-dot" style="background:${color}"></span>
      <span>${escapeHtml(category)}</span>
      <strong>${currencyFormatter.format(value)}</strong>
    `;
    financeLegend.appendChild(item);
  });

  financePieCtx.beginPath();
  financePieCtx.arc(centerX, centerY, innerRadius - 4, 0, Math.PI * 2);
  financePieCtx.fillStyle = "rgba(10, 10, 10, 0.95)";
  financePieCtx.fill();
  financePieCtx.fillStyle = "#ffffff";
  financePieCtx.textAlign = "center";
  financePieCtx.font = "700 18px Space Grotesk";
  financePieCtx.fillText("Gastos", centerX, centerY - 4);
  financePieCtx.font = "12px DM Sans";
  financePieCtx.fillStyle = "rgba(255,255,255,0.72)";
  financePieCtx.fillText(currencyFormatter.format(total), centerX, centerY + 18);
}

function renderOverview() {
  const days = getMonthDays();
  const monthState = getCurrentMonthState();
  const totalSlots = monthState.habits.length * days.length;
  const completed = monthState.habits.reduce((count, habit) => count + Object.keys(monthState.entries[habit.id] || {}).length, 0);
  const habitPercent = totalSlots ? Math.round((completed / totalSlots) * 100) : 0;
  const financeStats = getFinanceStats();
  const trainingStats = getTrainingStats();
  const areas = [
    { label: "Habitos", value: habitPercent },
    { label: "Finanzas", value: financeStats.health },
    { label: "Entrenamiento", value: trainingStats.score },
    { label: "Ahorro", value: financeStats.savingsScore },
    { label: "Estabilidad", value: Math.round((habitPercent + financeStats.health + trainingStats.score) / 3) }
  ];
  const overall = Math.round(areas.reduce((sum, area) => sum + area.value, 0) / areas.length);
  const weakest = [...areas].sort((a, b) => a.value - b.value)[0];
  const strongest = [...areas].sort((a, b) => b.value - a.value)[0];

  overviewScore.textContent = `${overall}%`;
  overviewCenterScore.textContent = `${overall}%`;
  dashboardMainFocus.textContent = weakest.label;
  dashboardTrainingScore.textContent = `${trainingStats.score}%`;
  drawOverviewRadar(areas.map((area) => area.label), areas.map((area) => area.value));
  renderDashboardInsights(areas, strongest, weakest);
}

function getFinanceStats() {
  const entries = getExpandedMonthlyFinanceEntries();
  const monthState = getCurrentMonthState();
  const baseAmount = Number(monthState.baseAmount || 0);
  const incomeTotal = entries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.monthlyAmount, 0);
  const expenseTotal = entries.filter((entry) => entry.type !== "income").reduce((sum, entry) => sum + entry.monthlyAmount, 0);
  const balance = baseAmount + incomeTotal - expenseTotal;
  const health = incomeTotal > 0 ? Math.max(0, Math.min(100, Math.round((balance / incomeTotal) * 100))) : 0;
  const savingsScore = incomeTotal > 0 ? Math.max(0, Math.min(100, Math.round(((incomeTotal - expenseTotal) / incomeTotal) * 100))) : 0;
  return { incomeTotal, expenseTotal, balance, health, savingsScore };
}

function getTrainingStats() {
  const training = getCurrentMonthState().training;
  const weight = Number(training.profile.weight || 0);
  const heightCm = Number(training.profile.height || 0);
  const weeklyMinutes = Number(training.profile.daysPerWeek || 0) * Number(training.profile.minutesPerSession || 0);
  const bmi = weight > 0 && heightCm > 0 ? weight / Math.pow(heightCm / 100, 2) : 0;
  const loadScore = training.logs.reduce((sum, log) => sum + (Number(log.reps || 0) * Number(log.weight || 0)), 0);
  const score = Math.max(0, Math.min(100, Math.round((weeklyMinutes / 5) + Math.min(loadScore / 40, 40))));
  return { bmi, weeklyMinutes, score };
}

function renderTraining() {
  const training = getCurrentMonthState().training;
  trainingWeight.value = training.profile.weight || "";
  trainingHeight.value = training.profile.height || "";
  trainingDays.value = training.profile.daysPerWeek || "";
  trainingMinutes.value = training.profile.minutesPerSession || "";
  if (!routineQuickDay.value) {
    routineQuickDay.value = getDefaultRoutineDay();
  }
  if (!trainingLogDate.value) {
    trainingLogDate.value = toIsoDate(new Date());
  }
  syncTrainingExerciseOptions();

  const stats = getTrainingStats();
  trainingScore.textContent = `${stats.score}%`;
  trainingBmi.textContent = stats.bmi ? stats.bmi.toFixed(1) : "0.0";
  trainingWeeklyMinutes.textContent = String(stats.weeklyMinutes);
  renderRoutineBuilder();
  renderTrainingLogTable();
  renderBodyMap();
  renderTrainingInsights(stats);
  setTrainingView(document.querySelector(".training-nav-link.is-active")?.dataset.trainingView || "profile");
}

function setTrainingView(viewId) {
  trainingNavLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.trainingView === viewId);
  });
  trainingViews.forEach((view) => {
    view.classList.toggle("is-active", view.dataset.trainingView === viewId);
  });
}

function handleTrainingProfileSubmit(event) {
  event.preventDefault();
  const profile = getCurrentMonthState().training.profile;
  profile.weight = Number(trainingWeight.value || 0);
  profile.height = Number(trainingHeight.value || 0);
  profile.daysPerWeek = Number(trainingDays.value || 0);
  profile.minutesPerSession = Number(trainingMinutes.value || 0);
  saveState();
  renderTraining();
  renderOverview();
}

function renderRoutineBuilder() {
  renderRoutineLibrary();
  renderRoutineWeek();
}

function renderRoutineLibrary() {
  const selectedGroup = routineLibraryGroup.value || "all";
  const searchTerm = routineSearch.value.trim().toLowerCase();
  const exercises = getRoutineLibraryExercises().filter((exercise) => {
    const matchesGroup = selectedGroup === "all" || exercise.group === selectedGroup;
    const matchesSearch = !searchTerm
      || exercise.exercise.toLowerCase().includes(searchTerm)
      || formatTrainingTarget(exercise.target).toLowerCase().includes(searchTerm)
      || formatTrainingGroup(exercise.group).toLowerCase().includes(searchTerm);
    return matchesGroup && matchesSearch;
  });

  routineExerciseLibrary.innerHTML = "";
  if (!exercises.length) {
    routineExerciseLibrary.innerHTML = '<p class="empty-state">No hay ejercicios que coincidan con tu búsqueda.</p>';
    return;
  }

  exercises.forEach((exercise) => {
    const item = document.createElement("article");
    item.className = "routine-library-item";
    item.setAttribute("draggable", "true");
    item.dataset.libraryExercise = exercise.id;
    item.innerHTML = `
      <div class="routine-library-copy">
        <span class="routine-chip">${escapeHtml(formatTrainingGroup(exercise.group))}</span>
        <strong>${escapeHtml(exercise.exercise)}</strong>
        <span>${escapeHtml(formatTrainingTarget(exercise.target))}</span>
      </div>
      <button class="routine-add-button" type="button" data-library-add="${escapeHtml(exercise.id)}">
        Agregar
      </button>
    `;
    routineExerciseLibrary.appendChild(item);
  });
}

function renderRoutineWeek() {
  const schedule = getRoutineSchedule();
  routineDropzones.forEach((dropzone) => {
    const dayKey = dropzone.dataset.routineDay;
    const dayItems = schedule[dayKey] || [];
    dropzone.innerHTML = "";

    if (!dayItems.length) {
      dropzone.innerHTML = `<div class="routine-placeholder">Suelta aquí tus ejercicios de ${escapeHtml(getRoutineDayLabel(dayKey).toLowerCase())}.</div>`;
    }

    dayItems.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "routine-card";
      card.setAttribute("draggable", "true");
      card.dataset.routineItemId = item.id;
      card.innerHTML = `
        <div class="routine-card-copy">
          <span>${escapeHtml(formatTrainingTarget(item.target))}</span>
          <strong>${index + 1}. ${escapeHtml(item.exercise)}</strong>
          <small>${escapeHtml(formatTrainingGroup(item.group))}</small>
        </div>
        <button class="routine-card-delete" type="button" aria-label="Eliminar ${escapeHtml(item.exercise)}">×</button>
      `;
      card.addEventListener("dragstart", handleRoutineDragStart);
      card.addEventListener("dragend", clearRoutineDragState);
      card.querySelector(".routine-card-delete").addEventListener("click", () => {
        const nextItems = (schedule[dayKey] || []).filter((entry) => entry.id !== item.id);
        schedule[dayKey] = nextItems;
        saveState();
        renderRoutineWeek();
      });
      dropzone.appendChild(card);
    });
  });
}

function handleRoutineLibraryClick(event) {
  const button = event.target.closest("[data-library-add]");
  if (!button) {
    return;
  }

  const exercise = findLibraryExerciseById(button.dataset.libraryAdd);
  if (!exercise) {
    return;
  }

  addExerciseToRoutineDay(exercise, routineQuickDay.value || getDefaultRoutineDay());
}

function addExerciseToRoutineDay(exercise, dayKey, insertIndex) {
  const schedule = getRoutineSchedule();
  insertRoutineItem(schedule, dayKey, {
    id: createId(),
    group: exercise.group,
    target: exercise.target,
    exercise: exercise.exercise,
    sourceId: exercise.id
  }, insertIndex ?? (schedule[dayKey]?.length || 0));
  saveState();
  renderRoutineWeek();
}

function handleTrainingLogSubmit(event) {
  event.preventDefault();
  if (!trainingLogExercise.value) {
    return;
  }
  const selectedExercise = getSelectedExerciseMeta();
  getCurrentMonthState().training.logs.push({
    id: createId(),
    date: trainingLogDate.value || toIsoDate(new Date()),
    group: trainingLogGroup.value,
    exercise: selectedExercise.name,
    target: selectedExercise.target,
    reps: Number(trainingLogReps.value || 0),
    weight: Number(trainingLogWeight.value || 0),
    duration: Number(trainingLogDuration.value || 0)
  });
  trainingLogForm.reset();
  trainingLogDate.value = toIsoDate(new Date());
  syncTrainingExerciseOptions();
  saveState();
  renderTraining();
  renderOverview();
}

function handleRoutineDragStart(event) {
  const libraryItem = event.target.closest("[data-library-exercise]");
  const routineCard = event.target.closest("[data-routine-item-id]");
  if (libraryItem) {
    const exercise = findLibraryExerciseById(libraryItem.dataset.libraryExercise);
    if (!exercise) {
      return;
    }
    activeRoutineDrag = { type: "library", exercise };
    libraryItem.classList.add("is-dragging");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("text/plain", exercise.id);
    }
    return;
  }

  if (!routineCard) {
    return;
  }

  const dayKey = routineCard.closest(".routine-dropzone")?.dataset.routineDay;
  if (!dayKey) {
    return;
  }

  activeRoutineDrag = { type: "routine", dayKey, itemId: routineCard.dataset.routineItemId };
  routineCard.dataset.dragging = "true";
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", routineCard.dataset.routineItemId || "");
  }
}

function handleRoutineDragEnter(event) {
  const dropzone = event.currentTarget;
  if (activeRoutineDrag) {
    dropzone.classList.add("is-drag-over");
  }
}

function handleRoutineDragLeave(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    event.currentTarget.classList.remove("is-drag-over");
  }
}

function handleRoutineDragOver(event) {
  if (!activeRoutineDrag) {
    return;
  }
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = activeRoutineDrag.type === "library" ? "copy" : "move";
  }
}

function handleRoutineDrop(event) {
  event.preventDefault();
  const dropzone = event.currentTarget;
  dropzone.classList.remove("is-drag-over");
  if (!activeRoutineDrag) {
    return;
  }

  const dayKey = dropzone.dataset.routineDay;
  const insertIndex = getRoutineInsertIndex(dropzone, event.clientY);
  if (activeRoutineDrag.type === "library") {
    addExerciseToRoutineDay(activeRoutineDrag.exercise, dayKey, insertIndex);
  } else {
    moveRoutineItem(activeRoutineDrag.dayKey, activeRoutineDrag.itemId, dayKey, insertIndex);
    saveState();
    renderRoutineWeek();
  }

  clearRoutineDragState();
}

function clearRoutineDragState() {
  activeRoutineDrag = null;
  document.querySelectorAll(".routine-dropzone").forEach((dropzone) => {
    dropzone.classList.remove("is-drag-over");
  });
  document.querySelectorAll("[data-routine-item-id]").forEach((card) => {
    delete card.dataset.dragging;
  });
  document.querySelectorAll(".routine-library-item").forEach((item) => {
    item.classList.remove("is-dragging");
  });
}

function renderTrainingLogTable() {
  const body = trainingLogTableBody;
  body.innerHTML = "";
  const logs = [...getCurrentMonthState().training.logs].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  if (!logs.length) {
    body.innerHTML = '<tr><td colspan="6" class="empty-state">Aún no hay registros de entrenamiento.</td></tr>';
    return;
  }
  logs.forEach((log) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(log.exercise)}</td>
      <td>${escapeHtml(formatTrainingGroup(log.group))}</td>
      <td>${formatShortDate(log.date)}</td>
      <td>${log.reps}</td>
      <td>${log.weight} kg</td>
      <td>${log.duration || 0} min</td>
      <td><button class="habit-delete" type="button" aria-label="Eliminar ${escapeHtml(log.exercise)}">×</button></td>
    `;
    row.querySelector(".habit-delete").addEventListener("click", () => {
      const training = getCurrentMonthState().training;
      training.logs = training.logs.filter((item) => item.id !== log.id);
      saveState();
      renderTraining();
      renderOverview();
    });
    body.appendChild(row);
  });
}

function renderBodyMap() {
  const weekly = getWeeklyTrainingLoadByTarget();
  bodyMap.querySelectorAll(".body-zone").forEach((zone) => {
    const key = zone.dataset.zone;
    const load = weekly[key] || 0;
    zone.style.fill = load > 0 ? getBodyHeatColor(load) : "rgba(255,255,255,0.08)";
    zone.style.stroke = "rgba(255,255,255,0.12)";
    zone.style.strokeWidth = "2";
  });
}

function getWeeklyTrainingLoadByTarget() {
  const logs = getCurrentMonthState().training.logs;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return logs.reduce((acc, log) => {
    const logDate = new Date(`${log.date}T12:00:00`);
    if (logDate < weekAgo) {
      return acc;
    }
    const key = log.target || mapGroupToPrimaryTarget(log.group);
    const load = (Number(log.reps || 0) * Math.max(Number(log.weight || 0), 1)) + (Number(log.duration || 0) * 4);
    acc[key] = (acc[key] || 0) + load;
    return acc;
  }, {});
}

function getBodyHeatColor(load) {
  if (load > 900) return "#ff2a2a";
  if (load > 500) return "#ff7a2a";
  if (load > 250) return "#ffd12a";
  return "#ffb3b3";
}

function renderTrainingInsights(stats) {
  const weekly = getWeeklyTrainingLoadByTarget();
  const topGroup = Object.entries(weekly).sort((a, b) => b[1] - a[1])[0];
  const weakGroup = ["cuadriceps", "femoral", "gluteo", "pantorrilla", "espalda", "biceps", "triceps", "hombro", "pecho", "abdomen"]
    .map((group) => [group, weekly[group] || 0])
    .sort((a, b) => a[1] - b[1])[0];

  trainingInsights.innerHTML = "";
  const items = [
    `IMC actual: ${stats.bmi ? stats.bmi.toFixed(1) : "0.0"}.`,
    `Trabajo dominante de la semana: ${topGroup ? formatTrainingTarget(topGroup[0]) : "Sin registros"}.`,
    `Zona a reforzar: ${weakGroup ? formatTrainingTarget(weakGroup[0]) : "Sin registros"}.`
  ];
  items.forEach((text) => {
    const item = document.createElement("div");
    item.className = "finance-legend-item";
    item.innerHTML = `
      <span class="legend-dot" style="background:#ff2a2a"></span>
      <span>Entrenamiento</span>
      <strong>${escapeHtml(text)}</strong>
    `;
    trainingInsights.appendChild(item);
  });
}

function formatTrainingGroup(group) {
  const map = {
    "pierna-anterior": "Pierna anterior",
    "pierna-posterior": "Pierna posterior",
    espalda: "Espalda",
    brazo: "Brazo",
    pecho: "Pecho",
    abdomen: "Abdomen"
  };
  return map[group] || group;
}

function formatTrainingTarget(target) {
  const map = {
    cuadriceps: "Cuadriceps",
    femoral: "Femoral",
    gluteo: "Gluteo",
    pantorrilla: "Pantorrilla",
    espalda: "Espalda",
    biceps: "Biceps",
    triceps: "Triceps",
    hombro: "Hombro",
    pecho: "Pecho",
    abdomen: "Abdomen",
    general: "General"
  };
  return map[target] || target;
}

function syncTrainingExerciseOptions() {
  const options = EXERCISE_LIBRARY[trainingLogGroup.value] || [];
  trainingLogExercise.innerHTML = "";
  options.forEach((exercise) => {
    const option = document.createElement("option");
    option.value = exercise.name;
    option.textContent = `${exercise.name} · ${formatTrainingTarget(exercise.target)}`;
    option.dataset.target = exercise.target;
    trainingLogExercise.appendChild(option);
  });
}

function getSelectedExerciseMeta() {
  const options = EXERCISE_LIBRARY[trainingLogGroup.value] || [];
  return options.find((item) => item.name === trainingLogExercise.value) || {
    name: trainingLogExercise.value,
    target: mapGroupToPrimaryTarget(trainingLogGroup.value)
  };
}

function mapGroupToPrimaryTarget(group) {
  const map = {
    "pierna-anterior": "cuadriceps",
    "pierna-posterior": "femoral",
    espalda: "espalda",
    brazo: "biceps",
    pecho: "pecho",
    abdomen: "abdomen"
  };
  return map[group] || "general";
}

function handleStepperClick(event) {
  const targetId = event.currentTarget.dataset.target;
  const step = Number(event.currentTarget.dataset.step || 0);
  const input = document.getElementById(targetId);
  if (!input) {
    return;
  }
  const current = Number(input.value || 0);
  const next = Math.max(Number(input.min || 0), current + step);
  input.value = String(next);
}

function drawOverviewRadar(labels, values) {
  const bounds = overviewRadarCanvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(overviewRadarCanvas.clientWidth || bounds.width));
  const height = Math.max(1, Math.round(overviewRadarCanvas.clientHeight || bounds.height));
  const ratio = window.devicePixelRatio || 1;
  overviewRadarCanvas.width = Math.max(1, Math.floor(width * ratio));
  overviewRadarCanvas.height = Math.max(1, Math.floor(height * ratio));
  overviewRadarCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  overviewRadarCtx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.34;
  const totalAxes = labels.length;

  for (let level = 1; level <= 4; level += 1) {
    const levelRadius = radius * (level / 4);
    overviewRadarCtx.beginPath();
    labels.forEach((_, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / totalAxes;
      const x = centerX + Math.cos(angle) * levelRadius;
      const y = centerY + Math.sin(angle) * levelRadius;
      if (index === 0) {
        overviewRadarCtx.moveTo(x, y);
      } else {
        overviewRadarCtx.lineTo(x, y);
      }
    });
    overviewRadarCtx.closePath();
    overviewRadarCtx.strokeStyle = "rgba(255,255,255,0.12)";
    overviewRadarCtx.stroke();
  }

  labels.forEach((label, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / totalAxes;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    overviewRadarCtx.beginPath();
    overviewRadarCtx.moveTo(centerX, centerY);
    overviewRadarCtx.lineTo(x, y);
    overviewRadarCtx.strokeStyle = "rgba(255,255,255,0.14)";
    overviewRadarCtx.stroke();
    overviewRadarCtx.fillStyle = "rgba(255,255,255,0.78)";
    overviewRadarCtx.font = "12px DM Sans";
    overviewRadarCtx.textAlign = "center";
    overviewRadarCtx.fillText(label, centerX + Math.cos(angle) * (radius + 18), centerY + Math.sin(angle) * (radius + 18));
  });

  overviewRadarCtx.beginPath();
  values.forEach((value, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / totalAxes;
    const pointRadius = radius * (Math.max(0, Math.min(100, value)) / 100);
    const x = centerX + Math.cos(angle) * pointRadius;
    const y = centerY + Math.sin(angle) * pointRadius;
    if (index === 0) {
      overviewRadarCtx.moveTo(x, y);
    } else {
      overviewRadarCtx.lineTo(x, y);
    }
  });
  overviewRadarCtx.closePath();
  const fill = overviewRadarCtx.createLinearGradient(0, 0, width, height);
  fill.addColorStop(0, "rgba(255, 42, 42, 0.38)");
  fill.addColorStop(1, "rgba(59, 130, 246, 0.22)");
  overviewRadarCtx.fillStyle = fill;
  overviewRadarCtx.strokeStyle = "#ffffff";
  overviewRadarCtx.lineWidth = 2;
  overviewRadarCtx.fill();
  overviewRadarCtx.stroke();
}

function renderDashboardInsights(areas, strongest, weakest) {
  dashboardInsights.innerHTML = "";
  const average = Math.round(areas.reduce((sum, area) => sum + area.value, 0) / areas.length);
  const insights = [
    {
      title: "Área más fuerte",
      body: `${strongest.label} es la zona donde hoy estás más estable, con ${strongest.value}%.`
    },
    {
      title: "Área a corregir",
      body: `${weakest.label} necesita atención prioritaria. Está en ${weakest.value}% y está bajando tu equilibrio general.`
    },
    {
      title: "Balance general",
      body: average >= 70
        ? "Tu balance general es bueno, pero conviene mantener consistencia para no inclinarte demasiado hacia una sola área."
        : "Tu balance todavía está cargado hacia pocas áreas. Te conviene subir la parte más débil para estabilizar tu progreso."
    }
  ];

  insights.forEach((insight) => {
    const item = document.createElement("div");
    item.className = "finance-legend-item";
    item.innerHTML = `
      <span class="legend-dot" style="background:#ff2a2a"></span>
      <span>${escapeHtml(insight.title)}</span>
      <strong>${escapeHtml(insight.body)}</strong>
    `;
    dashboardInsights.appendChild(item);
  });
}

function getMonthKeyFromDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatShortDate(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(date);
}

function handleBaseAmountSave() {
  const monthState = getCurrentMonthState();
  const nextBase = Number(financeBaseAmount.value || 0);
  monthState.baseAmount = nextBase >= 0 ? nextBase : 0;
  saveState();
  renderFinance();
  renderOverview();
}

function handleMoneyVisibilityToggle() {
  state.moneyHidden = !state.moneyHidden;
  saveState();
  renderMoneyVisibility();
  renderFinance();
  renderOverview();
}

function renderMoneyVisibility() {
  toggleMoneyVisibility.textContent = state.moneyHidden ? "Mostrar" : "Ocultar";
  toggleMoneyVisibility.setAttribute("aria-pressed", String(state.moneyHidden));
  financeBaseAmount.type = state.moneyHidden ? "password" : "number";
}

function formatMoneyValue(value) {
  return state.moneyHidden ? "••••••" : currencyFormatter.format(value);
}

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
