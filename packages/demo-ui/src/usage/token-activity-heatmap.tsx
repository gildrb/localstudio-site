"use client";
import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./token-activity-heatmap.styles.ts";

import { memo, useState } from "react";
import { formatNumber } from "../lib/formatters";
import type { UsageStats } from "./types";

const DAY_MS = 86_400_000;
const WEEKS = 53;
const LEVEL_STYLES = [
  styles.level0,
  styles.level1,
  styles.level2,
  styles.level3,
  styles.level4,
] as const;

const WEEK_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
type DailyUsage = UsageStats["daily"][number];
type ActivityUsage = Pick<DailyUsage, "requests" | "total_tokens">;

export type ActivityPeriod = "daily" | "weekly";

const startOfUtcDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const calendarStart = (end: Date): Date => {
  const currentWeek = new Date(end.getTime() - end.getUTCDay() * DAY_MS);
  return new Date(currentWeek.getTime() - (WEEKS - 1) * 7 * DAY_MS);
};

const dateKey = (date: Date): string => date.toISOString().slice(0, 10);

const dateLabel = (date: Date): string =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

const weekLabel = (date: Date): string => {
  const end = new Date(date.getTime() + 6 * DAY_MS);
  const formatter = WEEK_DATE_FORMATTER;
  return `${formatter.format(date)} – ${formatter.format(end)}`;
};

const quantile = (values: number[], fraction: number): number =>
  values[Math.min(values.length - 1, Math.floor(values.length * fraction))] ?? 0;

const thresholds = (daily: ActivityUsage[]): number[] => {
  const values: number[] = [];
  for (const day of daily) if (day.total_tokens > 0) values.push(day.total_tokens);
  values.sort((a, b) => a - b);
  return [quantile(values, 0.25), quantile(values, 0.5), quantile(values, 0.75)];
};

const activityLevel = (value: number, limits: number[]): number => {
  if (value <= 0) return 0;
  if (value <= (limits[0] ?? 0)) return 1;
  if (value <= (limits[1] ?? 0)) return 2;
  if (value <= (limits[2] ?? 0)) return 3;
  return 4;
};

const monthLabels = (start: Date): Array<{ key: string; label: string | null }> =>
  Array.from({ length: WEEKS }, (_, week) => {
    const date = new Date(start.getTime() + week * 7 * DAY_MS);
    const previous = new Date(date.getTime() - 7 * DAY_MS);
    const label =
      week > 0 && date.getUTCMonth() === previous.getUTCMonth()
        ? null
        : date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
    return { key: dateKey(date), label };
  });

const weeklyUsage = (daily: DailyUsage[]): Map<string, ActivityUsage> => {
  const weekly = new Map<string, ActivityUsage>();
  for (const day of daily) {
    const date = new Date(`${day.date}T00:00:00.000Z`);
    const week = new Date(date.getTime() - date.getUTCDay() * DAY_MS);
    const key = dateKey(week);
    const existing = weekly.get(key) ?? { requests: 0, total_tokens: 0 };
    weekly.set(key, {
      requests: existing.requests + day.requests,
      total_tokens: existing.total_tokens + day.total_tokens,
    });
  }
  return weekly;
};

export const TokenActivityHeatmap = memo(function TokenActivityHeatmap({
  daily,
  period = "daily",
}: {
  daily: DailyUsage[];
  period?: ActivityPeriod;
}) {
  const end = startOfUtcDay(new Date());
  const start = calendarStart(end);
  const byDate =
    period === "daily" ? new Map(daily.map((day) => [day.date, day])) : weeklyUsage(daily);
  const values = Array.from(byDate.values());
  const limits = thresholds(values);
  const cellCount = period === "daily" ? WEEKS * 7 : WEEKS;
  const interval = period === "daily" ? DAY_MS : 7 * DAY_MS;
  const cells = Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(start.getTime() + index * interval);
    const usage = byDate.get(dateKey(date));
    return { date, usage, level: activityLevel(usage?.total_tokens ?? 0, limits) };
  });
  const [activeDate, setActiveDate] = useState(() => dateKey(end));
  const foundIndex = cells.findIndex(({ date }) => dateKey(date) === activeDate);
  const activeIndex = foundIndex >= 0 ? foundIndex : cells.length - 1;
  const activeCell = cells[activeIndex];
  const activeLabel = activeCell
    ? `${period === "daily" ? dateLabel(activeCell.date) : weekLabel(activeCell.date)} · ${formatNumber(activeCell.usage?.total_tokens ?? 0)} tokens · ${formatNumber(activeCell.usage?.requests ?? 0)} requests`
    : "No activity data";

  function selectCell(index: number) {
    const cell = cells[Math.max(0, Math.min(index, cells.length - 1))];
    if (cell) setActiveDate(dateKey(cell.date));
  }

  return (
    <div {...stylex.props(demoStyles.reset, styles.div130)}>
      <div {...stylex.props(demoStyles.reset, styles.div131)}>
        <div {...stylex.props(demoStyles.reset, styles.div132)}>
          {monthLabels(start).map(({ key, label }) => (
            <span key={key} {...stylex.props(demoStyles.reset, styles.span134)}>
              {label}
            </span>
          ))}
        </div>
        <div
          {...stylex.props(demoStyles.reset, styles.heatmap, period === "daily" ? styles.dailyGrid : styles.weeklyGrid)}
          role="slider"
          tabIndex={0}
          aria-label={`${period === "daily" ? "Daily" : "Weekly"} token activity for the past year`}
          aria-valuemin={0}
          aria-valuemax={cells.length - 1}
          aria-valuenow={activeIndex}
          aria-valuetext={activeLabel}
          aria-orientation="horizontal"
          onKeyDown={(event) => {
            let next = activeIndex;
            if (event.key === "ArrowRight") next += 1;
            else if (event.key === "ArrowLeft") next -= 1;
            else if (event.key === "ArrowUp") next += period === "daily" ? 7 : 1;
            else if (event.key === "ArrowDown") next -= period === "daily" ? 7 : 1;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = cells.length - 1;
            else return;
            event.preventDefault();
            selectCell(next);
          }}
        >
          {cells.map(({ date, level }) => {
            const key = dateKey(date);
            return (
              <span
                key={key}
                aria-hidden="true"
                onMouseEnter={() => setActiveDate(key)}
                {...stylex.props(demoStyles.reset, styles.cell, key === activeDate && styles.selectedCell, LEVEL_STYLES[level] ?? styles.level0)}
              />
            );
          })}
        </div>
        <div {...stylex.props(demoStyles.reset, styles.div178)}>
          <span {...stylex.props(demoStyles.reset, styles.span179)}>
            {activeLabel}
          </span>
          <div {...stylex.props(demoStyles.reset, styles.div182)}>
            <span {...stylex.props(demoStyles.reset)}>Less</span>
            {LEVEL_STYLES.map((levelStyle, index) => (
              <span key={index} {...stylex.props(demoStyles.reset, styles.legendCell, levelStyle)} />
            ))}
            <span {...stylex.props(demoStyles.reset)}>More</span>
          </div>
        </div>
      </div>
    </div>
  );
});
