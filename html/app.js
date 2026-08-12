(() => {
  "use strict";

  const MACHINES = [
    {
      id: "samsung-wf-y4bk-b4bk",
      brand: "Samsung",
      model: "WF702Y4BKWQ/EN",
      optionKey: "samsungMachineOption",
      timerKey: "samsungTimerName",
      timerRange: { min: 3, max: 19 },
      prewashMinutes: 18,
      defaultProgram: "dark",
      groups: ["dialGroup", "quickGroup"],
      manualKey: "samsungManualPage",
      referenceKey: "samsungReferenceText",
      programs: [
        { id: "cotton", nameKey: "cotton", minutes: 133, group: "dialGroup" },
        { id: "synthetics", nameKey: "synthetics", minutes: 105, group: "dialGroup" },
        { id: "jeans", nameKey: "jeans", minutes: 77, group: "dialGroup" },
        { id: "bedding", nameKey: "bedding", minutes: 100, group: "dialGroup" },
        { id: "dark", nameKey: "dark", minutes: 78, group: "dialGroup" },
        { id: "daily", nameKey: "daily", minutes: 66, group: "dialGroup" },
        { id: "drum", nameKey: "drum", minutes: 104, group: "dialGroup" },
        { id: "baby", nameKey: "baby", minutes: 142, group: "dialGroup" },
        { id: "sports", nameKey: "sports", minutes: 72, group: "dialGroup" },
        { id: "hand", nameKey: "hand", minutes: 30, group: "dialGroup" },
        { id: "wool", nameKey: "wool", minutes: 38, group: "dialGroup" },
        ...[15, 20, 30, 40, 50, 60].map((minutes) => ({ id: `quick-${minutes}`, nameKey: "quick", minutes, group: "quickGroup" }))
      ]
    },
    {
      id: "bosch-wae284a7nl-12",
      brand: "Bosch",
      model: "WAE284A7NL/12",
      optionKey: "boschMachineOption",
      timerKey: "boschTimerName",
      timerRange: { min: 1, max: 24 },
      prewashMinutes: 0,
      defaultProgram: "cotton-40",
      groups: ["boschCottonGroup", "boschOtherGroup"],
      manualKey: "boschManualPage",
      referenceKey: "boschReferenceText",
      programs: [
        { id: "cotton-20", nameKey: "boschCotton20", minutes: 150, group: "boschCottonGroup" },
        { id: "cotton-30", nameKey: "boschCotton30", minutes: 150, group: "boschCottonGroup" },
        { id: "cotton-40", nameKey: "boschCotton40", minutes: 150, group: "boschCottonGroup" },
        { id: "cotton-60", nameKey: "boschCotton60", minutes: 165, group: "boschCottonGroup" },
        { id: "cotton-90", nameKey: "boschCotton90", minutes: 165, group: "boschCottonGroup" },
        { id: "easy-care-40", nameKey: "boschEasyCare40", minutes: 105, group: "boschOtherGroup" },
        { id: "quick-mix-40", nameKey: "boschQuickMix40", minutes: 75, group: "boschOtherGroup" },
        { id: "delicates-30", nameKey: "boschDelicates30", minutes: 45, group: "boschOtherGroup" },
        { id: "wool-30", nameKey: "boschWool30", minutes: 45, group: "boschOtherGroup" },
        { id: "super-quick-15", nameKey: "boschSuperQuick15", minutes: 15, group: "boschOtherGroup" }
      ]
    }
  ];

  const minute = 60000;
  const hour = 60 * minute;
  const $ = (selector) => document.querySelector(selector);
  const form = $("#planner-form");
  const machineSelect = $("#machine-profile");
  const programme = $("#programme");
  const measured = $("#measured-time");
  const marketButtons = Array.from(document.querySelectorAll("[data-suggest-day]"));
  const marketPrices = window.LaundryMarketPrices;
  const i18n = window.LaundryI18n;
  const t = (key, values) => i18n.t(key, values);
  let machineId = MACHINES[0].id;
  let overrides = {};
  let preferredPrograms = {};
  let suggestionActive = false;
  let lastMarketResult = null;
  let lastSuggestionDayOffset = null;

  try {
    const savedMachine = localStorage.getItem("washer-machine-profile");
    if (MACHINES.some((item) => item.id === savedMachine)) machineId = savedMachine;
  } catch (_) {}
  try {
    const savedV2 = localStorage.getItem("washer-program-overrides-v2");
    const saved = JSON.parse(savedV2 || "{}");
    if (saved && typeof saved === "object") overrides = saved;
    else overrides = {};
    if (!savedV2) {
      const legacy = JSON.parse(localStorage.getItem("washer-program-overrides") || "{}");
      if (legacy && typeof legacy === "object") overrides[MACHINES[0].id] = legacy;
    }
  } catch (_) { overrides = {}; }
  try {
    const saved = JSON.parse(localStorage.getItem("washer-preferred-programs") || "{}");
    if (saved && typeof saved === "object") preferredPrograms = saved;
    else preferredPrograms = {};
    const legacyPreference = localStorage.getItem("washer-preferred-program");
    if (!preferredPrograms[MACHINES[0].id] && MACHINES[0].programs.some((item) => item.id === legacyPreference)) {
      preferredPrograms[MACHINES[0].id] = legacyPreference;
    }
  } catch (_) { preferredPrograms = {}; }

  function currentMachine() {
    return MACHINES.find((item) => item.id === machineId) || MACHINES[0];
  }

  function preferredProgramId() {
    const machine = currentMachine();
    const saved = preferredPrograms[machine.id];
    return machine.programs.some((item) => item.id === saved) ? saved : machine.defaultProgram;
  }

  function machineOverrides() {
    const machine = currentMachine();
    if (!overrides[machine.id] || typeof overrides[machine.id] !== "object") overrides[machine.id] = {};
    return overrides[machine.id];
  }

  function inputValue(date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * minute).toISOString().slice(0, 16);
  }

  function getDefaultWindow(now) {
    const start = new Date(now);
    const end = new Date(now);
    if (now.getHours() < 7) {
      start.setDate(start.getDate() - 1);
      start.setHours(23, 0, 0, 0);
      end.setHours(7, 0, 0, 0);
    } else {
      start.setHours(23, 0, 0, 0);
      end.setTime(start.getTime() + 8 * hour);
    }
    return { start, end };
  }

  function durationText(total) {
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    if (!hours) return t("durationMin", { minutes });
    if (!minutes) return t("durationHour", { hours });
    return t("durationHoursMinutes", { hours, minutes });
  }

  function momentText(date) {
    return new Intl.DateTimeFormat(i18n.language === "nl" ? "nl-NL" : "en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" }).format(date);
  }

  function timeText(date) {
    return new Intl.DateTimeFormat(i18n.language === "nl" ? "nl-NL" : "en-GB", { hour: "2-digit", minute: "2-digit" }).format(date);
  }

  function programName(item) {
    return t(item.nameKey, { minutes: item.minutes });
  }

  function currentProgram() {
    const machine = currentMachine();
    return machine.programs.find((item) => item.id === programme.value) || machine.programs[0];
  }

  function cycleMinutes() {
    const machine = currentMachine();
    const selected = currentProgram();
    return (machineOverrides()[selected.id] || selected.minutes) + ($("#prewash").checked ? machine.prewashMinutes : 0);
  }

  function delayChoices(includeNow = true) {
    const { min, max } = currentMachine().timerRange;
    const choices = Array.from({ length: max - min + 1 }, (_, index) => index + min);
    return includeNow ? [0, ...choices] : choices;
  }

  function fillMachines() {
    machineSelect.replaceChildren();
    MACHINES.forEach((machine) => {
      const option = document.createElement("option");
      option.value = machine.id;
      option.textContent = t(machine.optionKey);
      machineSelect.append(option);
    });
    machineSelect.value = machineId;
  }

  function fillProgrammes() {
    const machine = currentMachine();
    const selectedValue = programme.value || preferredProgramId();
    programme.replaceChildren();
    machine.groups.forEach((groupName) => {
      const group = document.createElement("optgroup");
      group.label = t(groupName);
      machine.programs.filter((item) => item.group === groupName).forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = `${programName(item)} · ${durationText(item.minutes)}`;
        group.append(option);
      });
      programme.append(group);
    });
    programme.value = machine.programs.some((item) => item.id === selectedValue) ? selectedValue : preferredProgramId();

    $("#reference-grid").replaceChildren();
    machine.programs.forEach((item) => {
      const row = document.createElement("div");
      const name = document.createElement("span");
      const time = document.createElement("strong");
      name.textContent = programName(item);
      time.textContent = `${item.minutes} min`;
      row.append(name, time);
      $("#reference-grid").append(row);
    });
  }

  function updateMachineCopy() {
    const machine = currentMachine();
    $("#model-chip").textContent = `${machine.brand} ${machine.model}`;
    $("#hero-timer-label").textContent = t(machine.timerKey).toUpperCase();
    $(".dial-label-top").textContent = `${machine.timerRange.min}h`;
    $(".dial-label-right").textContent = `${machine.timerRange.max}h`;
    $("#why-range").innerHTML = t("why1", { timer: t(machine.timerKey), min: machine.timerRange.min, max: machine.timerRange.max });
    $("#manual-page").textContent = t(machine.manualKey);
    $("#reference-text").innerHTML = t(machine.referenceKey);
    $("#prewash-row").hidden = !machine.prewashMinutes;
    if (!machine.prewashMinutes) $("#prewash").checked = false;
  }

  function updateMeasuredField() {
    const selected = currentProgram();
    measured.placeholder = String(selected.minutes);
    measured.value = machineOverrides()[selected.id] || "";
    $("#measured-note").textContent = t("savedFor", { program: programName(selected) });
  }

  function updatePreferenceControls() {
    const machine = currentMachine();
    const preferred = machine.programs.find((item) => item.id === preferredProgramId()) || machine.programs[0];
    const button = $("#set-preferred-programme");
    const selectedIsPreferred = programme.value === preferred.id;
    $("#preferred-programme-label").textContent = t("preferredInBrowser", { program: programName(preferred) });
    button.textContent = t(selectedIsPreferred ? "preferred" : "makePreferred");
    button.disabled = selectedIsPreferred;
  }

  function savePreferredProgram() {
    preferredPrograms[currentMachine().id] = programme.value;
    try { localStorage.setItem("washer-preferred-programs", JSON.stringify(preferredPrograms)); } catch (_) {}
    updatePreferenceControls();
  }

  function updateSafetyOptions() {
    const options = $("#safety-margin").options;
    options[0].textContent = t("noMargin");
    Array.from(options).slice(1).forEach((option) => { option.textContent = t("minutes", { count: option.value }); });
  }

  function setMarketStatus(message, state = "") {
    const status = $("#market-status");
    status.textContent = message;
    status.dataset.state = state;
  }

  function invalidateSuggestion() {
    if (!suggestionActive) return;
    suggestionActive = false;
    lastMarketResult = null;
    lastSuggestionDayOffset = null;
    updateWindowContext();
    setMarketStatus(t("settingsChanged"));
  }

  function updateWindowContext() {
    const margin = Number($("#safety-margin").value);
    $("#window-context").textContent = suggestionActive ? t("marketWindow", { margin }) : t("manualWindow");
  }

  function marketPriceText(pricePerMwh) {
    return new Intl.NumberFormat(i18n.language === "nl" ? "nl-NL" : "en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(pricePerMwh / 10);
  }

  function renderMarketSuccess() {
    if (!lastMarketResult) return;
    const { best, cheapWindow, availableUntil, dayOffset } = lastMarketResult;
    const overlapMinutes = overlap(best.start, best.end, cheapWindow.start, cheapWindow.end);
    const percent = Math.round(overlapMinutes / cycleMinutes() * 100);
    const margin = Number($("#safety-margin").value);
    const latestStart = new Date(marketPrices.latestSafeStart(cheapWindow.end, cycleMinutes(), margin));
    const firstSafeStart = new Date(cheapWindow.start + margin * minute);
    let deadline = "";
    if (dayOffset === 0 && latestStart >= firstSafeStart) {
      deadline = new Date($("#planning-time").value) <= latestStart
        ? t("startDeadline", { deadline: timeText(latestStart), margin })
        : t("startDeadlinePassed", { deadline: timeText(latestStart), margin });
    }
    setMarketStatus(t("marketSuccess", { day: t(dayOffset ? "tomorrow" : "today"), program: programName(currentProgram()), start: momentText(new Date(best.start)), end: momentText(new Date(best.end)), lowStart: momentText(new Date(cheapWindow.start)), lowEnd: momentText(new Date(cheapWindow.end)), percent, price: marketPriceText(best.average), available: momentText(availableUntil), deadline }), "success");
  }

  function updateMarketButtons(activeButton = null) {
    marketButtons.forEach((button) => {
      button.textContent = button === activeButton ? t("checking") : t(Number(button.dataset.suggestDay) ? "suggestTomorrow" : "suggestToday");
    });
  }

  async function suggestMarketWindow(dayOffset = 0) {
    const planning = new Date($("#planning-time").value);
    if (Number.isNaN(planning.getTime())) {
      setMarketStatus(t("invalidPlanning"), "error");
      return;
    }

    const activeButton = marketButtons.find((button) => Number(button.dataset.suggestDay) === dayOffset);
    marketButtons.forEach((button) => { button.disabled = true; });
    updateMarketButtons(activeButton);
    setMarketStatus(t("fetching"));

    try {
      const response = await fetch(marketPrices.priceUrl(planning));
      if (!response.ok) throw new Error(`Price service returned ${response.status}`);
      const points = marketPrices.energyZeroPricePoints(await response.json());
      const timerRange = currentMachine().timerRange;
      const best = marketPrices.findCheapestSchedule(points, planning, cycleMinutes(), dayOffset, timerRange);
      const cheapWindow = marketPrices.findLowPriceWindow(points, planning, dayOffset);
      const intervals = marketPrices.normalisePricePoints(points);
      if (!intervals.length) throw new Error("The price feed returned no usable values");

      if (!best || !cheapWindow) {
        const unavailable = dayOffset === 1 && !marketPrices.hasPricesForDay(points, planning, dayOffset);
        setMarketStatus(t(unavailable ? "tomorrowUnavailable" : "noDayFit", { day: t(dayOffset ? "tomorrow" : "today"), min: timerRange.min, max: timerRange.max, timer: t(currentMachine().timerKey) }), "error");
        return;
      }

      $("#cheap-start").value = inputValue(new Date(cheapWindow.start));
      $("#cheap-end").value = inputValue(new Date(cheapWindow.end));
      suggestionActive = true;
      lastSuggestionDayOffset = dayOffset;
      lastMarketResult = { best, cheapWindow, dayOffset, availableUntil: new Date(intervals[intervals.length - 1].end) };
      updateWindowContext();
      calculate();
      renderMarketSuccess();
    } catch (_) {
      setMarketStatus(t("marketError"), "error");
    } finally {
      marketButtons.forEach((button) => { button.disabled = false; });
      updateMarketButtons();
    }
  }

  function overlap(start, end, windowStart, windowEnd) {
    return Math.max(0, (Math.min(end, windowEnd) - Math.max(start, windowStart)) / minute);
  }

  function calculate() {
    const planning = new Date($("#planning-time").value);
    const windowStart = new Date($("#cheap-start").value);
    const windowEnd = new Date($("#cheap-end").value);
    const machine = currentMachine();
    const selected = currentProgram();
    const margin = Number($("#safety-margin").value);
    const plannedMinutes = cycleMinutes();

    if ([planning, windowStart, windowEnd].some((date) => Number.isNaN(date.getTime()))) return renderError(t("invalidDate"));
    if (windowEnd <= windowStart) return renderError(t("invalidWindow"));

    const schedules = delayChoices().map((delayHours) => {
      const end = new Date(planning.getTime() + delayHours * hour);
      const start = delayHours === 0 ? planning : new Date(end.getTime() - plannedMinutes * minute);
      const actualEnd = delayHours === 0 ? new Date(planning.getTime() + plannedMinutes * minute) : end;
      return { delayHours, start, end: actualEnd, overlapMinutes: overlap(start, actualEnd, windowStart, windowEnd) };
    }).filter((schedule) => schedule.delayHours === 0 || schedule.start >= planning);

    const protectedStart = new Date(windowStart.getTime() + margin * minute);
    const protectedEnd = new Date(windowEnd.getTime() - margin * minute);
    const fitting = schedules.filter((item) => item.start >= protectedStart && item.end <= protectedEnd);
    const marketSchedule = suggestionActive && lastMarketResult ? schedules.find((item) => item.delayHours === lastMarketResult.best.delayHours) : null;

    if (marketSchedule && fitting.includes(marketSchedule)) return renderSchedule(marketSchedule, selected, plannedMinutes, windowStart, windowEnd, true);

    if (!marketSchedule && fitting.length) {
      const centre = (windowStart.getTime() + windowEnd.getTime()) / 2;
      fitting.sort((a, b) => Math.abs((a.start.getTime() + a.end.getTime()) / 2 - centre) - Math.abs((b.start.getTime() + b.end.getTime()) / 2 - centre));
      return renderSchedule(fitting[0], selected, plannedMinutes, windowStart, windowEnd, true);
    }

    schedules.sort((a, b) => b.overlapMinutes - a.overlapMinutes);
    const closestSchedule = marketSchedule || schedules[0];
    let message = t("noWholeFit", { timer: t(machine.timerKey) });
    let warningTitle = "";
    const windowMinutes = (windowEnd - windowStart) / minute;
    const percent = Math.round(closestSchedule.overlapMinutes / plannedMinutes * 100);
    if (percent === 100 && margin > 0) {
      const startBuffer = Math.max(0, Math.round((closestSchedule.start - windowStart) / minute));
      const endBuffer = Math.max(0, Math.round((windowEnd - closestSchedule.end) / minute));
      const availableMargin = Math.min(startBuffer, endBuffer);
      const shortfall = Math.max(0, margin - availableMargin);
      message = t("safetyMessage", { used: shortfall, margin });
      warningTitle = t("safetyTitle", { shortfall });
    } else if (plannedMinutes + margin * 2 > windowMinutes) message = t("tooLong");
    else if (windowEnd.getTime() < planning.getTime() + machine.timerRange.min * hour) message = t("tooEarly", { min: machine.timerRange.min });
    else if (windowStart.getTime() > planning.getTime() + machine.timerRange.max * hour) message = t("tooLate", { max: machine.timerRange.max });
    renderSchedule(closestSchedule, selected, plannedMinutes, windowStart, windowEnd, false, message, percent, warningTitle);
  }

  function renderError(message) {
    $("#result").classList.remove("result-warning");
    $("#result-content").innerHTML = `<div class="empty-result"><div class="empty-dial" aria-hidden="true">—</div><h2>${t("checkWindow")}</h2><p class="manual-error"></p></div>`;
    $(".manual-error").textContent = message;
  }

  function renderSchedule(schedule, selected, plannedMinutes, windowStart, windowEnd, exact, message = "", percent = 0, warningTitle = "") {
    const timerName = t(currentMachine().timerKey);
    $("#result").classList.toggle("result-warning", !exact);
    $("#result-content").innerHTML = `
      <div class="delay-readout${schedule.delayHours === 0 ? " immediate-readout" : ""}"><strong id="delay-number"></strong><span id="delay-unit">h</span></div>
      <h2>${schedule.delayHours === 0 ? t("startNowHeading") : timerName}</h2>
      <p class="instruction">${t(schedule.delayHours === 0 ? "instructionNow" : "instruction", { timer: timerName })}</p>
      <div class="warning-box" id="warning-box"${exact ? " hidden" : ""}><strong id="warning-title"></strong><span id="warning-message"></span></div>
      <div class="timeline" aria-label="${t("expectedTiming")}"><div class="timeline-track" id="timeline-track"><span></span></div><div class="timeline-labels"><span><small>${t("washStarts")}</small><strong id="wash-start"></strong></span><span><small>${t("washEnds")}</small><strong id="wash-end"></strong></span></div></div>
      <dl class="summary-list"><div><dt>${t("programLabel")}</dt><dd id="summary-programme"></dd></div><div><dt>${t("plannedDuration")}</dt><dd id="summary-duration"></dd></div><div><dt>${t(suggestionActive ? "marketBandSummary" : "windowSummary")}</dt><dd id="summary-window"></dd></div></dl>
      <button class="refresh-button" id="refresh-result" type="button">${t("refresh")}</button>`;
    $("#delay-number").textContent = schedule.delayHours === 0 ? t("nowReadout") : schedule.delayHours;
    $("#delay-unit").hidden = schedule.delayHours === 0;
    const delayInline = $("#delay-inline");
    if (delayInline) delayInline.textContent = `${schedule.delayHours}h`;
    $("#wash-start").textContent = momentText(schedule.start);
    $("#wash-end").textContent = momentText(schedule.end);
    $("#summary-programme").textContent = programName(selected);
    $("#summary-duration").textContent = durationText(plannedMinutes);
    $("#summary-window").textContent = `${momentText(windowStart)} – ${momentText(windowEnd)}`;
    const coverage = marketPrices.timelineCoverage(schedule, windowStart, windowEnd, plannedMinutes);
    const track = $("#timeline-track");
    track.style.setProperty("--outside-before", `${coverage.beforePercent}%`);
    track.style.setProperty("--inside-until", `${100 - coverage.afterPercent}%`);
    track.classList.toggle("outside-start", coverage.beforePercent > 0);
    track.classList.toggle("outside-end", coverage.afterPercent > 0);
    if (!exact) {
      $("#warning-title").textContent = warningTitle || t("closestTitle", { percent });
      $("#warning-message").textContent = message;
    }
    $("#refresh-result").addEventListener("click", useNow);
  }

  async function useNow() {
    const shouldReoptimise = suggestionActive;
    const dayOffset = lastSuggestionDayOffset;
    $("#planning-time").value = inputValue(new Date());
    if (shouldReoptimise) await suggestMarketWindow(dayOffset); else calculate();
  }

  function updateMachine() {
    machineId = machineSelect.value;
    try { localStorage.setItem("washer-machine-profile", machineId); } catch (_) {}
    invalidateSuggestion();
    fillProgrammes();
    updateMachineCopy();
    updateMeasuredField();
    updatePreferenceControls();
    setMarketStatus(t("marketDefault"));
    calculate();
  }

  fillMachines();
  fillProgrammes();
  updateMachineCopy();
  const now = new Date();
  const cheap = getDefaultWindow(now);
  $("#planning-time").value = inputValue(now);
  $("#cheap-start").value = inputValue(cheap.start);
  $("#cheap-end").value = inputValue(cheap.end);
  updateMeasuredField();
  updatePreferenceControls();
  updateSafetyOptions();
  updateWindowContext();

  i18n.onChange(() => {
    fillMachines();
    fillProgrammes();
    updateMachineCopy();
    updateMeasuredField();
    updatePreferenceControls();
    updateSafetyOptions();
    updateWindowContext();
    updateMarketButtons();
    if (suggestionActive) renderMarketSuccess(); else setMarketStatus(t("marketDefault"));
    calculate();
  });

  $("#advanced-toggle").addEventListener("click", () => {
    const panel = $("#advanced-panel");
    panel.hidden = !panel.hidden;
    $("#advanced-toggle").setAttribute("aria-expanded", String(!panel.hidden));
    $("#advanced-toggle span").textContent = panel.hidden ? "+" : "−";
  });
  machineSelect.addEventListener("change", updateMachine);
  $("#use-now").addEventListener("click", useNow);
  $("#set-preferred-programme").addEventListener("click", savePreferredProgram);
  marketButtons.forEach((button) => button.addEventListener("click", () => suggestMarketWindow(Number(button.dataset.suggestDay))));
  programme.addEventListener("change", () => { invalidateSuggestion(); updateMeasuredField(); updatePreferenceControls(); calculate(); });
  measured.addEventListener("input", () => {
    invalidateSuggestion();
    const selected = currentProgram();
    const value = Number(measured.value);
    if (measured.value && value > 0) machineOverrides()[selected.id] = Math.round(value); else delete machineOverrides()[selected.id];
    try { localStorage.setItem("washer-program-overrides-v2", JSON.stringify(overrides)); } catch (_) {}
    calculate();
  });
  form.addEventListener("input", (event) => { if (event.target !== measured && event.target !== machineSelect) { invalidateSuggestion(); calculate(); } });
  form.addEventListener("submit", (event) => event.preventDefault());
  calculate();
})();
