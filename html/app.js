(() => {
  "use strict";

  const MACHINES = window.LaundryMachines;

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
  const localised = (value) => typeof value === "string" ? value : value?.[i18n.language] || value?.en || "";
  let machineId = MACHINES[0].id;
  let overrides = {};
  let preferredPrograms = {};
  let suggestionActive = false;
  let lastMarketResult = null;
  let lastExpiredMarketWindow = null;
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
    return localised(item.label);
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
    return marketPrices.timerChoices(currentMachine().timerRange, includeNow);
  }

  function timerValueText(hours) {
    const whole = Math.floor(hours);
    const minutes = Math.round((hours - whole) * 60);
    if (!minutes) return String(whole);
    return `${whole}:${String(minutes).padStart(2, "0")}`;
  }

  function fillMachines() {
    machineSelect.replaceChildren();
    MACHINES.forEach((machine) => {
      const option = document.createElement("option");
      option.value = machine.id;
      option.textContent = localised(machine.option);
      machineSelect.append(option);
    });
    machineSelect.value = machineId;
  }

  function fillProgrammes() {
    const machine = currentMachine();
    const selectedValue = programme.value || preferredProgramId();
    programme.replaceChildren();
    machine.groups.forEach((groupData) => {
      const group = document.createElement("optgroup");
      group.label = localised(groupData.label);
      machine.programs.filter((item) => item.group === groupData.id).forEach((item) => {
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
    const timerName = localised(machine.timer);
    const timerMode = machine.timerRange.mode || "end";
    $("#model-chip").textContent = `${machine.brand} ${machine.model}`;
    $("#hero-timer-label").textContent = timerName.toUpperCase();
    $(".dial-label-top").textContent = `${timerValueText(machine.timerRange.min)}h`;
    $(".dial-label-right").textContent = `${timerValueText(machine.timerRange.max)}h`;
    $("#why-title").innerHTML = t(timerMode === "start" ? "whyTitleStart" : "whyTitleEnd");
    $("#why-range").innerHTML = t("why1", { timer: timerName, min: timerValueText(machine.timerRange.min), max: timerValueText(machine.timerRange.max), increments: localised(machine.timerIncrements) });
    $("#why-semantics").innerHTML = t(timerMode === "start" ? "why2Start" : "why2End");
    $("#manual-page").textContent = localised(machine.manual);
    $("#reference-text").innerHTML = localised(machine.reference);
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
    lastExpiredMarketWindow = null;
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
    const setup = best.activationTime && best.activationTime > new Date($("#planning-time").value).getTime()
      ? t("marketSetAt", { time: momentText(new Date(best.activationTime)) })
      : "";
    setMarketStatus(t("marketSuccess", { day: t(dayOffset ? "tomorrow" : "today"), program: programName(currentProgram()), start: momentText(new Date(best.start)), end: momentText(new Date(best.end)), lowStart: momentText(new Date(cheapWindow.start)), lowEnd: momentText(new Date(cheapWindow.end)), percent, price: marketPriceText(best.average), available: momentText(availableUntil), deadline, setup }), "success");
  }

  function renderExpiredMarketWindow() {
    if (!lastExpiredMarketWindow) return;
    const { start, end } = lastExpiredMarketWindow;
    const message = t("todayWindowPassed", { start: momentText(new Date(start)), end: momentText(new Date(end)) });
    setMarketStatus(message, "error");
    $(".result-kicker").textContent = t("noTimerSelection");
    $("#result").classList.remove("result-warning");
    $("#result-content").innerHTML = `
      <div class="empty-result">
        <div class="empty-dial" aria-hidden="true">—</div>
        <h2>${t("todayWindowPassedHeading")}</h2>
        <p>${message}</p>
        <button class="refresh-button" id="suggest-tomorrow-result" type="button">${t("suggestTomorrow")}</button>
      </div>`;
    $("#suggest-tomorrow-result").addEventListener("click", () => suggestMarketWindow(1));
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
      const cheapWindow = marketPrices.findLowPriceWindow(points, planning, dayOffset);
      const intervals = marketPrices.normalisePricePoints(points);
      if (!intervals.length) throw new Error("The price feed returned no usable values");
      const timerRange = currentMachine().timerRange;
      const preferredWindow = cheapWindow ? {
        start: cheapWindow.start,
        end: cheapWindow.end,
        marginMinutes: Number($("#safety-margin").value)
      } : null;
      if (cheapWindow && marketPrices.isPastTodayWindow(cheapWindow, planning, dayOffset)) {
        $("#cheap-start").value = inputValue(new Date(cheapWindow.start));
        $("#cheap-end").value = inputValue(new Date(cheapWindow.end));
        suggestionActive = true;
        lastSuggestionDayOffset = dayOffset;
        lastMarketResult = null;
        lastExpiredMarketWindow = cheapWindow;
        updateWindowContext();
        renderExpiredMarketWindow();
        return;
      }
      const currentBest = cheapWindow ? marketPrices.findCheapestSchedule(points, planning, cycleMinutes(), dayOffset, timerRange, preferredWindow) : null;
      const waitBest = cheapWindow ? marketPrices.findCheapestWaitSchedule(points, planning, cycleMinutes(), timerRange, preferredWindow) : null;
      const best = marketPrices.choosePracticalSchedule(currentBest, waitBest, planning, preferredWindow);

      if (!best || !cheapWindow) {
        const unavailable = dayOffset === 1 && !marketPrices.hasPricesForDay(points, planning, dayOffset);
        setMarketStatus(t(unavailable ? "tomorrowUnavailable" : "noDayFit", { day: t(dayOffset ? "tomorrow" : "today"), min: timerValueText(timerRange.min), max: timerValueText(timerRange.max), timer: localised(currentMachine().timer) }), "error");
        return;
      }

      $("#cheap-start").value = inputValue(new Date(cheapWindow.start));
      $("#cheap-end").value = inputValue(new Date(cheapWindow.end));
      suggestionActive = true;
      lastSuggestionDayOffset = dayOffset;
      lastExpiredMarketWindow = null;
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
      const raw = marketPrices.scheduleForTimer(planning, plannedMinutes, delayHours, machine.timerRange);
      const start = new Date(raw.start);
      const end = new Date(raw.end);
      return { delayHours, start, end, overlapMinutes: overlap(start, end, windowStart, windowEnd) };
    }).filter((schedule) => schedule.delayHours === 0 || schedule.start >= planning);

    const protectedStart = new Date(windowStart.getTime() + margin * minute);
    const protectedEnd = new Date(windowEnd.getTime() - margin * minute);
    const fitting = schedules.filter((item) => item.start >= protectedStart && item.end <= protectedEnd);
    const marketBest = suggestionActive && lastMarketResult?.best;
    const marketSchedule = marketBest ? {
      ...marketBest,
      start: new Date(marketBest.start),
      end: new Date(marketBest.end),
      activationTime: new Date(marketBest.activationTime || planning),
      overlapMinutes: overlap(marketBest.start, marketBest.end, windowStart, windowEnd)
    } : null;

    schedules.sort((a, b) => b.overlapMinutes - a.overlapMinutes);
    const closestNow = schedules[0];

    if (marketSchedule && marketSchedule.start >= protectedStart && marketSchedule.end <= protectedEnd) {
      return renderSchedule(marketSchedule, selected, plannedMinutes, windowStart, windowEnd, true, "", 100, "", marketSchedule.activationTime > planning ? closestNow : null);
    }

    if (fitting.length) {
      const centre = (windowStart.getTime() + windowEnd.getTime()) / 2;
      fitting.sort((a, b) => Math.abs((a.start.getTime() + a.end.getTime()) / 2 - centre) - Math.abs((b.start.getTime() + b.end.getTime()) / 2 - centre));
      return renderSchedule(fitting[0], selected, plannedMinutes, windowStart, windowEnd, true);
    }

    const waitSchedule = marketPrices.findWaitSchedule(planning, plannedMinutes, machine.timerRange, {
      start: windowStart.getTime(),
      end: windowEnd.getTime(),
      marginMinutes: margin
    });
    if (waitSchedule && waitSchedule.activationTime > planning.getTime()) {
      return renderSchedule({ ...waitSchedule, start: new Date(waitSchedule.start), end: new Date(waitSchedule.end), activationTime: new Date(waitSchedule.activationTime) }, selected, plannedMinutes, windowStart, windowEnd, true, "", 100, "", closestNow);
    }

    const closestSchedule = marketSchedule || closestNow;
    let message = t("noTimerFit", { timer: localised(machine.timer) });
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
    else {
      const delayed = schedules.filter((item) => item.delayHours > 0);
      if (delayed.length && windowEnd.getTime() < Math.min(...delayed.map((item) => item.start.getTime()))) message = t("tooEarly", { min: timerValueText(machine.timerRange.min) });
      else if (delayed.length && windowStart.getTime() > Math.max(...delayed.map((item) => item.end.getTime()))) message = t("tooLate", { max: timerValueText(machine.timerRange.max) });
    }
    renderSchedule(closestSchedule, selected, plannedMinutes, windowStart, windowEnd, false, message, percent, warningTitle);
  }

  function renderError(message) {
    $("#result").classList.remove("result-warning");
    $("#result-content").innerHTML = `<div class="empty-result"><div class="empty-dial" aria-hidden="true">—</div><h2>${t("checkWindow")}</h2><p class="manual-error"></p></div>`;
    $(".manual-error").textContent = message;
  }

  function renderSchedule(schedule, selected, plannedMinutes, windowStart, windowEnd, exact, message = "", percent = 0, warningTitle = "", nowAlternative = null) {
    const timerName = localised(currentMachine().timer);
    const planning = new Date($("#planning-time").value);
    const activationTime = schedule.activationTime ? new Date(schedule.activationTime) : planning;
    const requiresWait = activationTime > planning;
    const protectedStart = new Date(windowStart.getTime() + Number($("#safety-margin").value) * minute);
    const alignmentMinutes = suggestionActive && exact && !requiresWait && schedule.delayHours > 0
      ? Math.max(0, Math.round((schedule.start - protectedStart) / minute))
      : 0;
    $(".result-kicker").textContent = t("selectMachine");
    $("#result").classList.toggle("result-warning", !exact);
    $("#result-content").innerHTML = `
      <div class="delay-readout${schedule.delayHours === 0 ? " immediate-readout" : ""}"><strong id="delay-number"></strong><span id="delay-unit">h</span></div>
      <h2>${schedule.delayHours === 0 ? t("startNowHeading") : timerName}</h2>
      <p class="instruction">${t(schedule.delayHours === 0 ? "instructionNow" : requiresWait ? "instructionWait" : "instruction", { timer: timerName, time: timeText(activationTime) })}</p>
      <div class="wait-box" id="wait-box"${requiresWait ? "" : " hidden"}><strong>${t("waitTitle", { time: timeText(activationTime) })}</strong><span id="wait-message"></span></div>
      <div class="alignment-box" id="alignment-box"${alignmentMinutes ? "" : " hidden"}><strong>${t("alignmentTitle")}</strong><span>${t("alignmentMessage", { minutes: alignmentMinutes, timer: timerName })}</span></div>
      <div class="warning-box" id="warning-box"${exact ? " hidden" : ""}><strong id="warning-title"></strong><span id="warning-message"></span></div>
      <div class="timeline" aria-label="${t("expectedTiming")}"><div class="timeline-track" id="timeline-track"><span></span></div><div class="timeline-labels"><span><small>${t("washStarts")}</small><strong id="wash-start"></strong></span><span><small>${t("washEnds")}</small><strong id="wash-end"></strong></span></div></div>
      <dl class="summary-list">${requiresWait ? `<div><dt>${t("setMachineAt")}</dt><dd id="summary-setting"></dd></div>` : ""}<div><dt>${t("programLabel")}</dt><dd id="summary-programme"></dd></div><div><dt>${t("plannedDuration")}</dt><dd id="summary-duration"></dd></div><div><dt>${t(suggestionActive ? "marketBandSummary" : "windowSummary")}</dt><dd id="summary-window"></dd></div></dl>
      <button class="refresh-button" id="refresh-result" type="button">${t("refresh")}</button>`;
    $("#delay-number").textContent = schedule.delayHours === 0 ? t("nowReadout") : timerValueText(schedule.delayHours);
    $("#delay-unit").hidden = schedule.delayHours === 0;
    const delayInline = $("#delay-inline");
    if (delayInline) delayInline.textContent = `${timerValueText(schedule.delayHours)}h`;
    if (requiresWait) {
      $("#summary-setting").textContent = momentText(activationTime);
      const waitMinutes = Math.max(1, Math.round((activationTime - planning) / minute));
      const alternativePercent = nowAlternative ? Math.round(nowAlternative.overlapMinutes / plannedMinutes * 100) : 0;
      $("#wait-message").textContent = nowAlternative
        ? t("waitBenefit", { minutes: waitMinutes, timer: timerName, delay: timerValueText(nowAlternative.delayHours), start: momentText(nowAlternative.start), end: momentText(nowAlternative.end), percent: alternativePercent })
        : t("waitMinutes", { minutes: waitMinutes });
    }
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
    if (lastExpiredMarketWindow) renderExpiredMarketWindow();
    else {
      if (suggestionActive) renderMarketSuccess(); else setMarketStatus(t("marketDefault"));
      calculate();
    }
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
