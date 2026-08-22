(() => {
  "use strict";

  const API_URL = "https://public.api.energyzero.nl/public/v1/prices";
  const minute = 60000;
  const hour = 60 * minute;

  function priceUrl(referenceDate) {
    const date = new Date(referenceDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const params = new URLSearchParams({
      energyType: "ENERGY_TYPE_ELECTRICITY",
      date: `${day}-${month}-${date.getFullYear()}`,
      interval: "INTERVAL_QUARTER"
    });
    return `${API_URL}?${params}`;
  }

  function energyZeroPricePoints(payload) {
    return (Array.isArray(payload?.base) ? payload.base : []).map((item) => ({
      timestamp: item.start,
      value: Number(item.price?.value) * 1000
    })).filter((item) => Number.isFinite(item.value));
  }

  function normalisePricePoints(rawPoints) {
    const points = (Array.isArray(rawPoints) ? rawPoints : [])
      .map((point) => ({ start: new Date(point.timestamp).getTime(), value: Number(point.value) }))
      .filter((point) => Number.isFinite(point.start) && Number.isFinite(point.value))
      .sort((a, b) => a.start - b.start)
      .filter((point, index, all) => index === 0 || point.start !== all[index - 1].start);

    const steps = points.slice(1).map((point, index) => point.start - points[index].start).filter((step) => step > 0);
    const sortedSteps = [...steps].sort((a, b) => a - b);
    const fallbackStep = sortedSteps.length ? sortedSteps[Math.floor(sortedSteps.length / 2)] : 15 * minute;

    return points.map((point, index) => ({
      ...point,
      end: points[index + 1]?.start || point.start + fallbackStep
    }));
  }

  function averagePrice(start, end, intervals) {
    const duration = end - start;
    let covered = 0;
    let weightedPrice = 0;

    intervals.forEach((interval) => {
      const overlap = Math.max(0, Math.min(end, interval.end) - Math.max(start, interval.start));
      covered += overlap;
      weightedPrice += interval.value * overlap;
    });

    if (duration <= 0 || covered < duration - 1) return null;
    return weightedPrice / duration;
  }

  function localDayBounds(referenceDate, dayOffset) {
    const start = new Date(referenceDate);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + dayOffset);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start: start.getTime(), end: end.getTime() };
  }

  function hasPricesForDay(rawPoints, planningDate, dayOffset) {
    const intervals = normalisePricePoints(rawPoints);
    const bounds = localDayBounds(planningDate, dayOffset);
    return intervals.some((interval) => interval.start < bounds.end && interval.end > bounds.start);
  }

  function isPastTodayWindow(preferredWindow, planningDate, dayOffset = 0) {
    const planning = new Date(planningDate).getTime();
    const end = Number(preferredWindow?.end);
    return Number(dayOffset) === 0 && Number.isFinite(planning) && Number.isFinite(end) && end <= planning;
  }

  function timerChoices(timerRange, includeNow = false) {
    const min = Number(timerRange?.min);
    const max = Number(timerRange?.max);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max < min) return [];

    let choices;
    if (Array.isArray(timerRange?.choices)) {
      choices = timerRange.choices.map(Number).filter((value) => Number.isFinite(value) && value >= min && value <= max);
    } else {
      const step = Number(timerRange?.step || 1);
      if (!Number.isFinite(step) || step <= 0) return [];
      choices = [];
      for (let value = min; value <= max + 1e-9; value += step) choices.push(Number(value.toFixed(4)));
    }
    const unique = [...new Set(choices)].sort((a, b) => a - b);
    return includeNow ? [0, ...unique] : unique;
  }

  function scheduleForTimer(planningDate, cycleMinutes, delayHours, timerRange = { mode: "end" }) {
    const planning = new Date(planningDate).getTime();
    const duration = Number(cycleMinutes) * minute;
    const delay = Number(delayHours) * hour;
    if (![planning, duration, delay].every(Number.isFinite) || duration <= 0 || delay < 0) return null;
    if (delayHours === 0) return { start: planning, end: planning + duration };
    if (timerRange?.mode === "start") return { start: planning + delay, end: planning + delay + duration };
    return { start: planning + delay - duration, end: planning + delay };
  }

  function waitBoundsForTimer(cycleMinutes, delayHours, timerRange, preferredWindow) {
    const windowStart = Number(preferredWindow?.start);
    const windowEnd = Number(preferredWindow?.end);
    const marginMinutes = Math.max(0, Number(preferredWindow?.marginMinutes) || 0);
    const base = scheduleForTimer(0, cycleMinutes, delayHours, timerRange);
    if (!base || delayHours === 0 || base.start < 0 || !Number.isFinite(windowStart) || !Number.isFinite(windowEnd)) return null;

    const protectedStart = windowStart + marginMinutes * minute;
    const protectedEnd = windowEnd - marginMinutes * minute;
    const earliest = protectedStart - base.start;
    const latest = protectedEnd - base.end;
    return latest >= earliest ? { earliest, latest } : null;
  }

  function findWaitSchedule(planningDate, cycleMinutes, timerRange, preferredWindow) {
    const planning = new Date(planningDate).getTime();
    if (!Number.isFinite(planning) || !Number.isFinite(cycleMinutes) || cycleMinutes <= 0) return null;

    const candidates = timerChoices(timerRange).map((delayHours) => {
      const bounds = waitBoundsForTimer(cycleMinutes, delayHours, timerRange, preferredWindow);
      if (!bounds) return null;
      const activationTime = Math.ceil(Math.max(planning, bounds.earliest) / minute) * minute;
      if (activationTime > bounds.latest) return null;
      return { delayHours, activationTime, ...scheduleForTimer(activationTime, cycleMinutes, delayHours, timerRange) };
    }).filter(Boolean);

    candidates.sort((a, b) => a.activationTime - b.activationTime || a.delayHours - b.delayHours);
    return candidates[0] || null;
  }

  function findCheapestWaitSchedule(rawPoints, planningDate, cycleMinutes, timerRange, preferredWindow) {
    const planning = new Date(planningDate).getTime();
    if (!Number.isFinite(planning) || !Number.isFinite(cycleMinutes) || cycleMinutes <= 0) return null;
    const intervals = normalisePricePoints(rawPoints);
    const candidates = [];

    timerChoices(timerRange).forEach((delayHours) => {
      const bounds = waitBoundsForTimer(cycleMinutes, delayHours, timerRange, preferredWindow);
      if (!bounds) return;
      const firstMinute = Math.ceil(Math.max(planning, bounds.earliest) / minute) * minute;
      const lastMinute = Math.floor(bounds.latest / minute) * minute;
      for (let activationTime = firstMinute; activationTime <= lastMinute; activationTime += minute) {
        const schedule = scheduleForTimer(activationTime, cycleMinutes, delayHours, timerRange);
        const average = averagePrice(schedule.start, schedule.end, intervals);
        if (average !== null) candidates.push({ delayHours, activationTime, ...schedule, average });
      }
    });

    // Automatic suggestions prioritise the earliest wash start; price only resolves equal starts.
    candidates.sort((a, b) => a.start - b.start || a.average - b.average || a.activationTime - b.activationTime || a.delayHours - b.delayHours);
    return candidates[0] || null;
  }

  function choosePracticalSchedule(currentSchedule, waitSchedule, planningDate, preferredWindow) {
    const planning = new Date(planningDate).getTime();
    const windowStart = Number(preferredWindow?.start);
    const windowEnd = Number(preferredWindow?.end);
    const marginMinutes = Math.max(0, Number(preferredWindow?.marginMinutes) || 0);
    const protectedStart = windowStart + marginMinutes * minute;
    const protectedEnd = windowEnd - marginMinutes * minute;
    const candidates = [
      currentSchedule ? { ...currentSchedule, activationTime: planning } : null,
      waitSchedule
    ].filter(Boolean);
    const completeFits = candidates.filter((schedule) => schedule.start >= protectedStart && schedule.end <= protectedEnd);

    if (completeFits.length) {
      // Compare set-now and wait-to-set schedules by the wash itself, not by activation convenience.
      completeFits.sort((a, b) => a.start - b.start || a.average - b.average || a.activationTime - b.activationTime || a.delayHours - b.delayHours);
      return completeFits[0];
    }
    return candidates[0] || null;
  }

  function findLowPriceWindow(rawPoints, planningDate, dayOffset) {
    const bounds = localDayBounds(planningDate, dayOffset);
    const intervals = normalisePricePoints(rawPoints)
      .filter((interval) => interval.start < bounds.end && interval.end > bounds.start)
      .map((interval) => ({ ...interval, start: Math.max(interval.start, bounds.start), end: Math.min(interval.end, bounds.end) }));
    if (!intervals.length) return null;

    const minimum = Math.min(...intervals.map((interval) => interval.value));
    const threshold = Math.max(5, minimum + 10);
    const groups = [];
    intervals.filter((interval) => interval.value <= threshold).forEach((interval) => {
      const previous = groups[groups.length - 1];
      if (previous && interval.start <= previous.end + 1) {
        previous.end = Math.max(previous.end, interval.end);
        previous.weighted += interval.value * (interval.end - interval.start);
        previous.duration += interval.end - interval.start;
      } else {
        groups.push({ start: interval.start, end: interval.end, weighted: interval.value * (interval.end - interval.start), duration: interval.end - interval.start });
      }
    });

    groups.sort((a, b) => b.duration - a.duration || a.weighted / a.duration - b.weighted / b.duration || a.start - b.start);
    const best = groups[0];
    return best ? { start: best.start, end: best.end, average: best.weighted / best.duration, threshold } : null;
  }

  function findCheapestSchedule(rawPoints, planningDate, cycleMinutes, dayOffset = null, timerRange = { min: 3, max: 19 }, preferredWindow = null) {
    const planning = new Date(planningDate).getTime();
    if (!Number.isFinite(planning) || !Number.isFinite(cycleMinutes) || cycleMinutes <= 0) return null;

    const intervals = normalisePricePoints(rawPoints);
    const bounds = dayOffset === null ? null : localDayBounds(planningDate, dayOffset);
    const delayChoices = timerChoices(timerRange, dayOffset === 0);
    if (!delayChoices.length) return null;
    const candidates = delayChoices.map((delayHours) => {
      const schedule = scheduleForTimer(planningDate, cycleMinutes, delayHours, timerRange);
      return { delayHours, ...schedule, average: averagePrice(schedule.start, schedule.end, intervals) };
    }).filter((candidate) => candidate.average !== null && (candidate.delayHours === 0 || candidate.start >= planning) && (!bounds || (candidate.start >= bounds.start && candidate.end <= bounds.end)));

    if (!candidates.length) return null;
    const windowStart = Number(preferredWindow?.start);
    const windowEnd = Number(preferredWindow?.end);
    const marginMinutes = Math.max(0, Number(preferredWindow?.marginMinutes) || 0);
    if (Number.isFinite(windowStart) && Number.isFinite(windowEnd) && windowEnd > windowStart) {
      const protectedStart = windowStart + marginMinutes * minute;
      const protectedEnd = windowEnd - marginMinutes * minute;
      const completeFits = candidates.filter((candidate) => candidate.start >= protectedStart && candidate.end <= protectedEnd);
      if (completeFits.length) {
        completeFits.sort((a, b) => a.start - b.start || a.average - b.average || a.delayHours - b.delayHours);
        return completeFits[0];
      }

      candidates.forEach((candidate) => {
        candidate.windowOverlap = Math.max(0, Math.min(candidate.end, windowEnd) - Math.max(candidate.start, windowStart));
      });
      candidates.sort((a, b) => b.windowOverlap - a.windowOverlap || a.start - b.start || a.average - b.average || a.delayHours - b.delayHours);
      return candidates[0];
    }

    candidates.sort((a, b) => a.average - b.average || a.delayHours - b.delayHours);
    return candidates[0];
  }

  function timelineCoverage(schedule, windowStart, windowEnd, cycleMinutes) {
    const beforeMinutes = Math.min(cycleMinutes, Math.max(0, (windowStart - schedule.start) / minute));
    const afterMinutes = Math.min(cycleMinutes - beforeMinutes, Math.max(0, (schedule.end - windowEnd) / minute));
    return {
      beforePercent: beforeMinutes / cycleMinutes * 100,
      afterPercent: afterMinutes / cycleMinutes * 100
    };
  }

  function latestSafeStart(windowEnd, cycleMinutes, marginMinutes) {
    const end = new Date(windowEnd).getTime();
    if (![end, cycleMinutes, marginMinutes].every(Number.isFinite) || cycleMinutes <= 0 || marginMinutes < 0) return null;
    return end - (cycleMinutes + marginMinutes) * minute;
  }

  const scope = typeof window === "undefined" ? globalThis : window;
  scope.LaundryMarketPrices = { API_URL, choosePracticalSchedule, energyZeroPricePoints, findCheapestSchedule, findCheapestWaitSchedule, findLowPriceWindow, findWaitSchedule, hasPricesForDay, isPastTodayWindow, latestSafeStart, normalisePricePoints, priceUrl, scheduleForTimer, timelineCoverage, timerChoices };
})();
