"use client";

import {
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type DailyCount = {
  k: string; // 콘텐츠 키 (글 slug 또는 경로)
  d: string; // KST 날짜 YYYY-MM-DD
  c: number;
};

export type ContentInfo = {
  key: string;
  title: string;
};

type Unit = "day" | "week" | "month" | "year";

type Bucket = {
  key: string;
  short: string;
  long: string;
};

const UNITS: { value: Unit; label: string; hint: string }[] = [
  { value: "day", label: "일간", hint: "최근 30일" },
  { value: "week", label: "주간", hint: "최근 12주" },
  { value: "month", label: "월간", hint: "최근 12개월" },
  { value: "year", label: "연간", hint: "전체 연도" },
];

const ALL = "__all__";
const BAR_LIMIT = 15;
const DAY_MS = 24 * 60 * 60 * 1000;

function parseDay(day: string) {
  return new Date(`${day}T00:00:00Z`);
}

function formatDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date: Date) {
  const offset = (date.getUTCDay() + 6) % 7; // 월요일 시작

  return new Date(date.getTime() - offset * DAY_MS);
}

function bucketKey(day: string, unit: Unit) {
  if (unit === "day") return day;
  if (unit === "week") return formatDay(startOfWeek(parseDay(day)));
  if (unit === "month") return day.slice(0, 7);

  return day.slice(0, 4);
}

function buildBuckets(unit: Unit, today: string, firstDay: string | null): Bucket[] {
  const todayDate = parseDay(today);

  if (unit === "day") {
    return Array.from({ length: 30 }, (_, index) => {
      const date = new Date(todayDate.getTime() - (29 - index) * DAY_MS);
      const m = date.getUTCMonth() + 1;
      const d = date.getUTCDate();

      return {
        key: formatDay(date),
        short: `${m}/${d}`,
        long: `${date.getUTCFullYear()}.${m}.${d}`,
      };
    });
  }

  if (unit === "week") {
    const thisWeek = startOfWeek(todayDate);

    return Array.from({ length: 12 }, (_, index) => {
      const start = new Date(thisWeek.getTime() - (11 - index) * 7 * DAY_MS);
      const end = new Date(start.getTime() + 6 * DAY_MS);

      return {
        key: formatDay(start),
        short: `${start.getUTCMonth() + 1}/${start.getUTCDate()}`,
        long: `${start.getUTCFullYear()}.${start.getUTCMonth() + 1}.${start.getUTCDate()} ~ ${
          end.getUTCMonth() + 1
        }.${end.getUTCDate()}`,
      };
    });
  }

  if (unit === "month") {
    const year = todayDate.getUTCFullYear();
    const month = todayDate.getUTCMonth();

    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(Date.UTC(year, month - (11 - index), 1));
      const y = date.getUTCFullYear();
      const m = date.getUTCMonth() + 1;

      return {
        key: `${y}-${String(m).padStart(2, "0")}`,
        short: `${m}월`,
        long: `${y}년 ${m}월`,
      };
    });
  }

  const lastYear = todayDate.getUTCFullYear();
  const firstYear = Math.min(
    firstDay ? Number(firstDay.slice(0, 4)) : lastYear,
    lastYear - 2
  );

  return Array.from({ length: lastYear - firstYear + 1 }, (_, index) => {
    const y = String(firstYear + index);

    return { key: y, short: `${y}년`, long: `${y}년` };
  });
}

function niceTicks(max: number) {
  if (max <= 0) return [0, 1];

  const rough = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 5, 10].map((n) => n * magnitude).find((n) => n >= rough) ?? magnitude * 10;
  const niceStep = Math.max(1, step);
  const top = Math.ceil(max / niceStep) * niceStep;

  return Array.from({ length: top / niceStep + 1 }, (_, index) => index * niceStep);
}

function formatCount(value: number) {
  return value.toLocaleString("ko-KR");
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

export default function ViewsCharts({
  daily,
  contents,
  today,
}: {
  daily: DailyCount[];
  contents: ContentInfo[];
  today: string;
}) {
  const [unit, setUnit] = useState<Unit>("week");
  const [content, setContent] = useState<string>(ALL);
  const [selected, setSelected] = useState<string | null>(null);

  const titles = useMemo(
    () => new Map(contents.map((item) => [item.key, item.title])),
    [contents]
  );

  const firstDay = useMemo(
    () => daily.reduce<string | null>((min, row) => (!min || row.d < min ? row.d : min), null),
    [daily]
  );

  const buckets = useMemo(() => {
    const list = buildBuckets(unit, today, firstDay);
    const last = list[list.length - 1];

    // 마지막 구간은 아직 끝나지 않았음을 표시
    if (last && unit !== "day") {
      list[list.length - 1] = { ...last, long: `${last.long} (진행 중)` };
    }

    return list;
  }, [unit, today, firstDay]);

  // bucket -> content -> count
  const grid = useMemo(() => {
    const valid = new Set(buckets.map((bucket) => bucket.key));
    const map = new Map<string, Map<string, number>>();

    daily.forEach((row) => {
      const key = bucketKey(row.d, unit);

      if (!valid.has(key)) return;

      const inner = map.get(key) ?? new Map<string, number>();
      inner.set(row.k, (inner.get(row.k) ?? 0) + row.c);
      map.set(key, inner);
    });

    return map;
  }, [daily, unit, buckets]);

  const series = useMemo(
    () =>
      buckets.map((bucket) => {
        const inner = grid.get(bucket.key);

        if (!inner) return 0;
        if (content !== ALL) return inner.get(content) ?? 0;

        let sum = 0;
        inner.forEach((value) => (sum += value));

        return sum;
      }),
    [buckets, grid, content]
  );

  const selectedIndex = Math.max(
    0,
    selected ? buckets.findIndex((bucket) => bucket.key === selected) : buckets.length - 1
  );
  const selectedBucket = buckets[selectedIndex];

  const ranking = useMemo(() => {
    const inner = grid.get(selectedBucket?.key ?? "");

    if (!inner) return [];

    return Array.from(inner.entries())
      .map(([key, count]) => ({ key, title: titles.get(key) ?? key, count }))
      .sort((a, b) => b.count - a.count);
  }, [grid, selectedBucket, titles]);

  const rankingTotal = ranking.reduce((sum, row) => sum + row.count, 0);
  const contentLabel = content === ALL ? "전체 콘텐츠" : titles.get(content) ?? content;

  function changeUnit(next: Unit) {
    setUnit(next);
    setSelected(null);
  }

  function toggleContent(key: string) {
    setContent((current) => (current === key ? ALL : key));
  }

  return (
    <section className="admin-panel viz-root">
      <div className="viz-toolbar">
        <div aria-label="집계 단위" className="viz-segment" role="group">
          {UNITS.map((item) => (
            <button
              aria-pressed={unit === item.value}
              key={item.value}
              onClick={() => changeUnit(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="viz-select">
          <span>콘텐츠</span>
          <select onChange={(event) => setContent(event.target.value)} value={content}>
            <option value={ALL}>전체 콘텐츠</option>
            {contents.map((item) => (
              <option key={item.key} value={item.key}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="viz-grid">
        <div className="viz-card">
          <h2>조회 추이</h2>
          <p className="viz-sub">
            {contentLabel} · {UNITS.find((item) => item.value === unit)?.hint} · 점을 눌러
            기간을 선택하세요
          </p>
          <LineChart
            buckets={buckets}
            onSelect={(index) => setSelected(buckets[index].key)}
            selectedIndex={selectedIndex}
            values={series}
          />
          <details className="viz-table">
            <summary>표로 보기</summary>
            <table>
              <thead>
                <tr>
                  <th scope="col">기간</th>
                  <th scope="col">조회수</th>
                </tr>
              </thead>
              <tbody>
                {buckets.map((bucket, index) => (
                  <tr key={bucket.key}>
                    <td>{bucket.long}</td>
                    <td>{formatCount(series[index])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>

        <div className="viz-card">
          <h2>콘텐츠별 조회수</h2>
          <p className="viz-sub">
            {selectedBucket?.long} · 총 {formatCount(rankingTotal)}회 · 막대를 누르면 추이에
            표시돼요
          </p>
          <BarList
            activeKey={content}
            onToggle={toggleContent}
            rows={ranking}
            total={rankingTotal}
          />
        </div>
      </div>
    </section>
  );
}

function LineChart({
  buckets,
  values,
  selectedIndex,
  onSelect,
}: {
  buckets: Bucket[];
  values: number[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const height = 260;
  const margin = { top: 20, right: 20, bottom: 32, left: 44 };
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = height - margin.top - margin.bottom;
  const ticks = niceTicks(Math.max(...values, 0));
  const yMax = ticks[ticks.length - 1];
  const step = values.length > 1 ? innerWidth / (values.length - 1) : 0;

  const x = (index: number) => margin.left + index * step;
  const y = (value: number) => margin.top + innerHeight - (value / yMax) * innerHeight;

  const linePath = values
    .map((value, index) => `${index ? "L" : "M"}${x(index)},${y(value)}`)
    .join("");
  const areaPath = `${linePath}L${x(values.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;

  // x축 라벨이 겹치지 않도록 간격을 둔다 (마지막 라벨은 항상 표시)
  const labelEvery = Math.max(1, Math.ceil(values.length / Math.max(1, innerWidth / 56)));
  const showLabel = (index: number) =>
    index === values.length - 1 ||
    (index % labelEvery === 0 && values.length - 1 - index >= labelEvery);

  const focusIndex = hover ?? selectedIndex;

  function handleKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onSelect(Math.max(0, selectedIndex - 1));
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      onSelect(Math.min(values.length - 1, selectedIndex + 1));
    }
  }

  return (
    <div className="viz-chart" ref={wrapRef}>
      {width > 0 ? (
        <svg
          aria-label={`조회 추이 선그래프. 선택된 기간 ${buckets[selectedIndex]?.long}, ${formatCount(
            values[selectedIndex] ?? 0
          )}회. 좌우 화살표로 기간을 바꿀 수 있어요.`}
          height={height}
          onKeyDown={handleKeyDown}
          onMouseLeave={() => setHover(null)}
          role="img"
          tabIndex={0}
          width={width}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                className={tick === 0 ? "viz-baseline" : "viz-gridline"}
                x1={margin.left}
                x2={width - margin.right}
                y1={y(tick)}
                y2={y(tick)}
              />
              <text className="viz-axis" textAnchor="end" x={margin.left - 10} y={y(tick) + 4}>
                {formatCount(tick)}
              </text>
            </g>
          ))}

          {buckets.map((bucket, index) =>
            showLabel(index) ? (
              <text
                className="viz-axis"
                key={bucket.key}
                textAnchor={index === values.length - 1 ? "end" : index === 0 ? "start" : "middle"}
                x={x(index)}
                y={height - 10}
              >
                {bucket.short}
              </text>
            ) : null
          )}

          <path className="viz-area" d={areaPath} />
          <path className="viz-line" d={linePath} />

          <line
            className="viz-crosshair"
            x1={x(focusIndex)}
            x2={x(focusIndex)}
            y1={margin.top}
            y2={margin.top + innerHeight}
          />
          <circle className="viz-dot" cx={x(focusIndex)} cy={y(values[focusIndex] ?? 0)} r={5} />

          {buckets.map((bucket, index) => (
            <rect
              className="viz-hit"
              height={innerHeight + margin.top}
              key={bucket.key}
              onClick={() => onSelect(index)}
              onMouseEnter={() => setHover(index)}
              width={Math.max(step, 1)}
              x={x(index) - step / 2}
              y={0}
            />
          ))}
        </svg>
      ) : null}

      {width > 0 && hover !== null ? (
        <div
          className={`viz-tooltip ${x(hover) > width / 2 ? "viz-tooltip-left" : "viz-tooltip-right"}`}
          style={{ left: x(hover), top: margin.top }}
        >
          <span>{buckets[hover]?.long}</span>
          <strong>{formatCount(values[hover] ?? 0)}회</strong>
        </div>
      ) : null}
    </div>
  );
}

function BarList({
  rows,
  total,
  activeKey,
  onToggle,
}: {
  rows: { key: string; title: string; count: number }[];
  total: number;
  activeKey: string;
  onToggle: (key: string) => void;
}) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    row: { title: string; count: number };
  } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  if (!rows.length) {
    return <p className="viz-empty">이 기간에는 조회 기록이 없습니다.</p>;
  }

  const max = rows[0].count;
  const visible = rows.slice(0, BAR_LIMIT);
  const rest = rows.slice(BAR_LIMIT);
  const restTotal = rest.reduce((sum, row) => sum + row.count, 0);

  function showTooltip(event: MouseEvent<HTMLButtonElement>, row: { title: string; count: number }) {
    const box = listRef.current?.getBoundingClientRect();

    if (!box) return;

    setTooltip({ x: event.clientX - box.left, y: event.clientY - box.top, row });
  }

  return (
    <div className="viz-bars" onMouseLeave={() => setTooltip(null)} ref={listRef}>
      {visible.map((row) => (
        <button
          aria-label={`${row.title}, ${formatCount(row.count)}회`}
          aria-pressed={activeKey === row.key}
          className="viz-bar-row"
          key={row.key}
          onClick={() => onToggle(row.key)}
          onMouseMove={(event) => showTooltip(event, row)}
          type="button"
        >
          <span className="viz-bar-title">{row.title}</span>
          <span className="viz-bar-track">
            <span className="viz-bar" style={{ width: `${(row.count / max) * 100}%` }} />
            <span className="viz-bar-value">{formatCount(row.count)}</span>
          </span>
        </button>
      ))}

      {rest.length ? (
        <p className="viz-rest">
          외 {rest.length}개 콘텐츠 · {formatCount(restTotal)}회
        </p>
      ) : null}

      {tooltip ? (
        <div className="viz-tooltip" style={{ left: tooltip.x, top: tooltip.y - 64 }}>
          <span>{tooltip.row.title}</span>
          <strong>
            {formatCount(tooltip.row.count)}회 · {((tooltip.row.count / total) * 100).toFixed(1)}%
          </strong>
        </div>
      ) : null}
    </div>
  );
}
