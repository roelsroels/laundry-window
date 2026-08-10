(() => {
  "use strict";

  const PROGRAMS = [
    { id: "cotton", name: "Cotton", minutes: 133, group: "Dial programmes" },
    { id: "synthetics", name: "Synthetics", minutes: 105, group: "Dial programmes" },
    { id: "jeans", name: "Jeans", minutes: 77, group: "Dial programmes" },
    { id: "bedding", name: "Bedding", minutes: 100, group: "Dial programmes" },
    { id: "dark", name: "Dark garments", minutes: 78, group: "Dial programmes" },
    { id: "daily", name: "Daily wash", minutes: 66, group: "Dial programmes" },
    { id: "drum", name: "Eco drum clean", minutes: 104, group: "Dial programmes" },
    { id: "baby", name: "Baby care", minutes: 142, group: "Dial programmes" },
    { id: "sports", name: "Outdoor care", minutes: 72, group: "Dial programmes" },
    { id: "hand", name: "Hand wash", minutes: 30, group: "Dial programmes" },
    { id: "wool", name: "Wool", minutes: 38, group: "Dial programmes" },
    ...[15, 20, 30, 40, 50, 60].map((minutes) => ({ id: `quick-${minutes}`, name: `Quick wash · ${minutes} min`, minutes, group: "Quick wash button" }))
  ];

  const minute = 60000;
  const hour = 60 * minute;
  const $ = (selector) => document.querySelector(selector);
  const form = $("#planner-form");
  const programme = $("#programme");
  const measured = $("#measured-time");
  let overrides = {};

  try { overrides = JSON.parse(localStorage.getItem("washer-program-overrides") || "{}"); } catch (_) { overrides = {}; }

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
    if (!hours) return `${minutes} min`;
    if (!minutes) return `${hours} hr`;
    return `${hours} hr ${minutes} min`;
  }

  function momentText(date) {
    return new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" }).format(date);
  }

  function currentProgram() {
    return PROGRAMS.find((item) => item.id === programme.value) || PROGRAMS[0];
  }

  function fillProgrammes() {
    ["Dial programmes", "Quick wash button"].forEach((groupName) => {
      const group = document.createElement("optgroup");
      group.label = groupName;
      PROGRAMS.filter((item) => item.group === groupName).forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = `${item.name} · ${durationText(item.minutes)}`;
        group.append(option);
      });
      programme.append(group);
    });
    programme.value = "cotton";

    PROGRAMS.filter((item) => item.group === "Dial programmes").forEach((item) => {
      const row = document.createElement("div");
      const name = document.createElement("span");
      const time = document.createElement("strong");
      name.textContent = item.name;
      time.textContent = `${item.minutes} min`;
      row.append(name, time);
      $("#reference-grid").append(row);
    });
  }

  function updateMeasuredField() {
    const selected = currentProgram();
    measured.placeholder = String(selected.minutes);
    measured.value = overrides[selected.id] || "";
    $("#measured-note").textContent = `Saved on this device for ${selected.name}.`;
  }

  function overlap(start, end, windowStart, windowEnd) {
    return Math.max(0, (Math.min(end, windowEnd) - Math.max(start, windowStart)) / minute);
  }

  function calculate() {
    const planning = new Date($("#planning-time").value);
    const windowStart = new Date($("#cheap-start").value);
    const windowEnd = new Date($("#cheap-end").value);
    const selected = currentProgram();
    const margin = Number($("#safety-margin").value);
    const cycleMinutes = (overrides[selected.id] || selected.minutes) + ($("#prewash").checked ? 18 : 0);

    if ([planning, windowStart, windowEnd].some((date) => Number.isNaN(date.getTime()))) return renderError("Choose a valid date and time.");
    if (windowEnd <= windowStart) return renderError("The cheap-price end must be after its start.");

    const schedules = Array.from({ length: 17 }, (_, index) => index + 3).map((delayHours) => {
      const end = new Date(planning.getTime() + delayHours * hour);
      const start = new Date(end.getTime() - cycleMinutes * minute);
      return { delayHours, start, end, overlapMinutes: overlap(start, end, windowStart, windowEnd) };
    });

    const protectedStart = new Date(windowStart.getTime() + margin * minute);
    const protectedEnd = new Date(windowEnd.getTime() - margin * minute);
    const fitting = schedules.filter((item) => item.start >= protectedStart && item.end <= protectedEnd);

    if (fitting.length) {
      const centre = (windowStart.getTime() + windowEnd.getTime()) / 2;
      fitting.sort((a, b) => Math.abs((a.start.getTime() + a.end.getTime()) / 2 - centre) - Math.abs((b.start.getTime() + b.end.getTime()) / 2 - centre));
      return renderSchedule(fitting[0], selected, cycleMinutes, windowStart, windowEnd, true);
    }

    schedules.sort((a, b) => b.overlapMinutes - a.overlapMinutes);
    let message = "No whole-hour Delay End setting keeps this complete cycle inside the window.";
    const windowMinutes = (windowEnd - windowStart) / minute;
    if (cycleMinutes + margin * 2 > windowMinutes) message = "This programme is longer than the cheap-price window (including your margin).";
    else if (windowEnd.getTime() < planning.getTime() + 3 * hour) message = "This window ends before the machine’s minimum 3-hour Delay End setting.";
    else if (windowStart.getTime() > planning.getTime() + 19 * hour) message = "This window starts beyond the machine’s 19-hour Delay End limit.";
    renderSchedule(schedules[0], selected, cycleMinutes, windowStart, windowEnd, false, message, Math.round(schedules[0].overlapMinutes / cycleMinutes * 100));
  }

  function renderError(message) {
    $("#result").classList.remove("result-warning");
    $("#result-content").innerHTML = `<div class="empty-result"><div class="empty-dial" aria-hidden="true">—</div><h2>Check the window</h2><p class="manual-error"></p></div>`;
    $(".manual-error").textContent = message;
  }

  function renderSchedule(schedule, selected, cycleMinutes, windowStart, windowEnd, exact, message = "", percent = 0) {
    $("#result").classList.toggle("result-warning", !exact);
    $("#result-content").innerHTML = `
      <div class="delay-readout"><strong id="delay-number"></strong><span>h</span></div>
      <h2>Delay End</h2>
      <p class="instruction">Press <strong>Uitgesteld einde</strong> until the display shows <strong id="delay-inline"></strong>, then press Start/Pause.</p>
      <div class="warning-box" id="warning-box"${exact ? " hidden" : ""}><strong id="warning-title"></strong><span id="warning-message"></span></div>
      <div class="timeline" aria-label="Expected wash timing"><div class="timeline-track"><span></span></div><div class="timeline-labels"><span><small>WASH STARTS</small><strong id="wash-start"></strong></span><span><small>WASH ENDS</small><strong id="wash-end"></strong></span></div></div>
      <dl class="summary-list"><div><dt>Programme</dt><dd id="summary-programme"></dd></div><div><dt>Planned duration</dt><dd id="summary-duration"></dd></div><div><dt>Cheap window</dt><dd id="summary-window"></dd></div></dl>
      <button class="refresh-button" id="refresh-result" type="button">Refresh “now” before setting the machine</button>`;
    $("#delay-number").textContent = schedule.delayHours;
    $("#delay-inline").textContent = `${schedule.delayHours}h`;
    $("#wash-start").textContent = momentText(schedule.start);
    $("#wash-end").textContent = momentText(schedule.end);
    $("#summary-programme").textContent = selected.name;
    $("#summary-duration").textContent = durationText(cycleMinutes);
    $("#summary-window").textContent = `${momentText(windowStart)} – ${momentText(windowEnd)}`;
    if (!exact) {
      $("#warning-title").textContent = `Closest fit · ${percent}% on cheap energy`;
      $("#warning-message").textContent = message;
    }
    $("#refresh-result").addEventListener("click", useNow);
  }

  function useNow() {
    $("#planning-time").value = inputValue(new Date());
    calculate();
  }

  fillProgrammes();
  const now = new Date();
  const cheap = getDefaultWindow(now);
  $("#planning-time").value = inputValue(now);
  $("#cheap-start").value = inputValue(cheap.start);
  $("#cheap-end").value = inputValue(cheap.end);
  updateMeasuredField();

  $("#advanced-toggle").addEventListener("click", () => {
    const panel = $("#advanced-panel");
    panel.hidden = !panel.hidden;
    $("#advanced-toggle").setAttribute("aria-expanded", String(!panel.hidden));
    $("#advanced-toggle span").textContent = panel.hidden ? "+" : "−";
  });
  $("#use-now").addEventListener("click", useNow);
  programme.addEventListener("change", () => { updateMeasuredField(); calculate(); });
  measured.addEventListener("input", () => {
    const selected = currentProgram();
    const value = Number(measured.value);
    if (measured.value && value > 0) overrides[selected.id] = Math.round(value); else delete overrides[selected.id];
    try { localStorage.setItem("washer-program-overrides", JSON.stringify(overrides)); } catch (_) {}
    calculate();
  });
  form.addEventListener("input", (event) => { if (event.target !== measured) calculate(); });
  form.addEventListener("submit", (event) => event.preventDefault());
  calculate();
})();
