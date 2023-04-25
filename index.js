import { createCanvas } from "canvas";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const base = searchParams.get("base");
    const target = searchParams.get("target");
    const interval = searchParams.get("interval");

    console.log(base, target, interval);

    const fetchUrl = `http://api.mochi.pod.town/api/v1/defi/coins/compare?base=${base}&target=${target}&interval=${interval}`;

    // Create chart data
    const res = await fetch(fetchUrl);
    const compareData = await res.json();

    const {
      times,
      ratios,
      from,
      to,
      base_coin,
      target_coin,
    } = compareData.data;

    const currRatio = ratios?.[ratios?.length - 1] ?? 0;

    const chart = await renderCompareTokenChart({
      times,
      ratios,
      chartLabel: `Price ratio | ${from} - ${to}`,
    });
    console.log({ chart });

    return new Response("Hello world");
  },
};

async function renderCompareTokenChart({
  times,
  ratios,
  chartLabel,
}) {
  if (!times || !times.length) return null;
  const image = await renderChartImage({
    chartLabel,
    labels: times,
    data: ratios,
  });

  return image;
}

function renderChartImage({
  chartLabel,
  labels,
  data = [],
  colorConfig,
  lineOnly,
}) {
  const chartCanvas = new ChartJSNodeCanvas({
    width: 700,
    height: 450,
  });

  if (!colorConfig) {
    colorConfig = {
      borderColor: "#009cdb",
      backgroundColor: getGradientColor(
        "rgba(53,83,192,0.9)",
        "rgba(58,69,110,0.5)"
      ),
    };
  }
  if (lineOnly) {
    colorConfig.backgroundColor = "rgba(0, 0, 0, 0)";
  }
  const xAxisConfig = {
    ticks: {
      font: {
        size: 16,
      },
      color: colorConfig.borderColor,
    },
    grid: {
      borderColor: colorConfig.borderColor,
    },
  };
  const yAxisConfig = {
    ticks: {
      font: {
        size: 16,
      },
      color: colorConfig.borderColor,
      callback: (value) => {
        const rounded = Number(value).toPrecision(2);
        return rounded.includes("e") && Number(value) < 1
          ? rounded
          : Number(rounded) < 0.01 ||
            Number(rounded) > 1000000
          ? Number(rounded).toExponential()
          : formatDigit(String(value));
      },
    },
    grid: {
      borderColor: colorConfig.borderColor,
    },
  };
  return chartCanvas.renderToBuffer({
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: chartLabel,
          data,
          borderWidth: lineOnly ? 10 : 3,
          pointRadius: 0,
          fill: true,
          ...colorConfig,
          tension: 0.2,
        },
      ],
    },
    options: {
      scales: {
        y: yAxisConfig,
        x: xAxisConfig,
      },
      plugins: {
        legend: {
          labels: {
            // This more specific font property overrides the global property
            font: {
              size: 18,
            },
          },
        },
      },
      ...(lineOnly && {
        scales: {
          x: {
            grid: {
              display: false,
            },
            display: false,
          },
          y: {
            grid: {
              display: false,
            },
            display: false,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      }),
    },
  });
}

function getGradientColor(fromColor, toColor) {
  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext("2d");
  const backgroundColor = ctx.createLinearGradient(
    0,
    0,
    0,
    400
  );
  backgroundColor.addColorStop(0, fromColor);
  backgroundColor.addColorStop(1, toColor);
  return backgroundColor;
}

function formatDigit(str, fractionDigits = 6) {
  const num = Number(str);
  const s = num.toLocaleString(undefined, {
    maximumFractionDigits: 18,
  });
  const [left, right = ""] = s.split(".");
  if (
    Number(right) === 0 ||
    right === "" ||
    left.length >= 4
  )
    return left;
  const numsArr = right.split("");
  let rightStr = numsArr.shift();
  while (
    Number(rightStr) === 0 ||
    rightStr.length < fractionDigits
  ) {
    const nextDigit = numsArr.shift();
    if (!nextDigit) break;
    rightStr += nextDigit;
  }
  while (rightStr.endsWith("0")) {
    rightStr = rightStr.slice(0, rightStr.length - 1);
  }
  return left + "." + rightStr;
}
