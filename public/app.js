const STORAGE_KEY = "habit-tracker-wave-state-v2";
const FINANCE_COLORS = ["#22c55e", "#3b82f6", "#8b5cf6", "#facc15", "#f97316", "#ec4899", "#06b6d4", "#84cc16"];

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
const installmentMonthsLabel = document.getElementById("installmentMonthsLabel");
const financeBalance = document.getElementById("financeBalance");
const financeIncome = document.getElementById("financeIncome");
const financeExpenses = document.getElementById("financeExpenses");
const financeTableBody = document.getElementById("financeTableBody");
const financePieCanvas = document.getElementById("financePieCanvas");
const financePieCtx = financePieCanvas.getContext("2d");
const financeLegend = document.getElementById("financeLegend");
const financeEmptyStateTemplate = document.getElementById("financeEmptyStateTemplate");

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
    finances: []
  };
}

function normalizeMonthData(rawMonthData, currentMonthKey) {
  const normalized = {};

  if (rawMonthData && typeof rawMonthData === "object") {
    Object.entries(rawMonthData).forEach(([monthKey, monthState]) => {
      normalized[monthKey] = {
        habits: Array.isArray(monthState?.habits) ? monthState.habits : [],
        entries: monthState?.entries && typeof monthState.entries === "object" ? monthState.entries : {},
        finances: Array.isArray(monthState?.finances) ? monthState.finances : []
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
}

function getCurrentMonthState() {
  ensureMonthState(state.selectedMonthKey);
  return state.monthData[state.selectedMonthKey];
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
  renderOverview();
  syncFinanceForm();
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
  const incomeTotal = entries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.monthlyAmount, 0);
  const expenseTotal = entries.filter((entry) => entry.type !== "income").reduce((sum, entry) => sum + entry.monthlyAmount, 0);
  const balance = incomeTotal - expenseTotal;
  const financeHealth = incomeTotal > 0 ? Math.max(0, Math.min(100, Math.round((balance / incomeTotal) * 100))) : 0;

  financeIncome.textContent = currencyFormatter.format(incomeTotal);
  financeExpenses.textContent = currencyFormatter.format(expenseTotal);
  financeBalance.textContent = currencyFormatter.format(balance);
  dashboardBalanceValue.textContent = currencyFormatter.format(balance);
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
  const areas = [
    { label: "Hábitos", value: habitPercent },
    { label: "Finanzas", value: financeStats.health },
    { label: "Ahorro", value: financeStats.savingsScore },
    { label: "Energía", value: habitPercent > 0 ? Math.max(20, Math.round(habitPercent * 0.9)) : 0 },
    { label: "Estabilidad", value: Math.round((habitPercent + financeStats.health) / 2) }
  ];
  const overall = Math.round(areas.reduce((sum, area) => sum + area.value, 0) / areas.length);
  const weakest = [...areas].sort((a, b) => a.value - b.value)[0];
  const strongest = [...areas].sort((a, b) => b.value - a.value)[0];

  overviewScore.textContent = `${overall}%`;
  overviewCenterScore.textContent = `${overall}%`;
  dashboardMainFocus.textContent = weakest.label;
  drawOverviewRadar(areas.map((area) => area.label), areas.map((area) => area.value));
  renderDashboardInsights(areas, strongest, weakest);
}

function getFinanceStats() {
  const entries = getExpandedMonthlyFinanceEntries();
  const incomeTotal = entries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.monthlyAmount, 0);
  const expenseTotal = entries.filter((entry) => entry.type !== "income").reduce((sum, entry) => sum + entry.monthlyAmount, 0);
  const balance = incomeTotal - expenseTotal;
  const health = incomeTotal > 0 ? Math.max(0, Math.min(100, Math.round((balance / incomeTotal) * 100))) : 0;
  const savingsScore = incomeTotal > 0 ? Math.max(0, Math.min(100, Math.round(((incomeTotal - expenseTotal) / incomeTotal) * 100))) : 0;
  return { incomeTotal, expenseTotal, balance, health, savingsScore };
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
