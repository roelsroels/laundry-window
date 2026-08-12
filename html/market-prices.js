(() => {
  "use strict";

  const API_URL = "https://spot.utilitarian.io/electricity/NL/latest/";
  const minute = 60000;
  const hour = 60 * minute;

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

  function findCheapestSchedule(rawPoints, planningDate, cycleMinutes, dayOffset = null) {
    const planning = new Date(planningDate).getTime();
    if (!Number.isFinite(planning) || !Number.isFinite(cycleMinutes) || cycleMinutes <= 0) return null;

    const intervals = normalisePricePoints(rawPoints);
    const bounds = dayOffset === null ? null : localDayBounds(planningDate, dayOffset);
    const delayChoices = dayOffset === 0 ? [0, ...Array.from({ length: 17 }, (_, index) => index + 3)] : Array.from({ length: 17 }, (_, index) => index + 3);
    const candidates = delayChoices.map((delayHours) => {
      const end = planning + delayHours * hour;
      const start = delayHours === 0 ? planning : end - cycleMinutes * minute;
      const actualEnd = delayHours === 0 ? planning + cycleMinutes * minute : end;
      return { delayHours, start, end: actualEnd, average: averagePrice(start, actualEnd, intervals) };
    }).filter((candidate) => candidate.average !== null && (!bounds || (candidate.start >= bounds.start && candidate.end <= bounds.end)));

    candidates.sort((a, b) => a.average - b.average || a.delayHours - b.delayHours);
    return candidates[0] || null;
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
  scope.LaundryMarketPrices = { API_URL, findCheapestSchedule, findLowPriceWindow, hasPricesForDay, latestSafeStart, normalisePricePoints, timelineCoverage };
})();
