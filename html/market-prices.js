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

  function findCheapestSchedule(rawPoints, planningDate, cycleMinutes) {
    const planning = new Date(planningDate).getTime();
    if (!Number.isFinite(planning) || !Number.isFinite(cycleMinutes) || cycleMinutes <= 0) return null;

    const intervals = normalisePricePoints(rawPoints);
    const candidates = Array.from({ length: 17 }, (_, index) => index + 3).map((delayHours) => {
      const end = planning + delayHours * hour;
      const start = end - cycleMinutes * minute;
      return { delayHours, start, end, average: averagePrice(start, end, intervals) };
    }).filter((candidate) => candidate.average !== null);

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

  const scope = typeof window === "undefined" ? globalThis : window;
  scope.LaundryMarketPrices = { API_URL, findCheapestSchedule, normalisePricePoints, timelineCoverage };
})();
