import {
  BarElement,
  CandleElement,
  CrosshairElement,
  GridElement,
  LineElement,
  XAxisElement,
  XAxisTooltipElement,
  YAxisAnnotationElement,
  YAxisElement,
  YAxisTooltipElement,
} from "../elements";
import { Color, Gradient, Mark, MarkDef } from "../mark";
import { Field } from "../channeldef";
import { PositionalElement, Scenegraph } from "../types";
import {
  Predicate,
  isFieldGTPredicate,
  isFieldLTPredicate,
} from "../predicate";
import {
  indicatorBollingerBands,
  indicatorElderRay,
  indicatorEnvelope,
  indicatorMacd,
  indicatorMovingAverage,
} from "@d3fc/d3fc-technical-indicator";

import { AreaElement } from "../elements/element-area";
import { Colors } from "../helpers";
import { Data } from "../data";
import { Encoding } from "../encoding";
import { OutputNode } from "../compile/data/dataflow";
import { RuleElement } from "../elements";
import { Specification } from "../spec";
import { TechnicalIndicatorTransformNode } from "../compile/data/technicalIndicator";
import { compile } from "../compile/compile";
import { extent } from "d3-array";

const PADDING_INNER = 0.4;

function createElement(type: Mark, options: any): PositionalElement {
  if (type === "area") {
    return new AreaElement(options);
  } else if (type === "bar") {
    return new BarElement(options);
  } else if (type === "line") {
    return new LineElement(options);
  } else if (type === "rule") {
    return new RuleElement(options);
  }

  throw new Error(`Element type not recognized: ${type}`);
}

function getAreaConfig(
  data: any,
  x: string,
  y: string,
  y2: string,
  fill: string | Gradient | undefined,
  line: Color | undefined
) {
  if (y2 === undefined) {
    return {
      points: data.map((d: any) => [d[x], 0, d[y]]),
      fill: fill ?? Colors.GRAY,
      line: line,
    };
  }

  return {
    points: data.map((d: any) => [d[x], d[y], d[y2]]),
    fill: fill ?? Colors.GRAY,
    line: line,
  };
}

function getBarConfig(
  d: any,
  x: string,
  y: string,
  y2: string,
  width: number,
  fill: string | null,
  stroke: string | null
) {
  let base = 0;

  if (y2) {
    base = d[y2];
  }

  return {
    x: d[x],
    y: Math.max(d[y] as number, base),
    height: Math.abs(base - (d[y] as number)),
    width: width * (1 - PADDING_INNER),
    fill: fill,
    stroke: stroke,
  };
}

function getLineConfig(data: any, x: string, y: string, color: string | null) {
  return {
    points: data.map((d: any) => [d[x], d[y]]),
    color: color,
  };
}

function getRuleConfig(
  d: any,
  x: string,
  x2: string,
  y: string,
  y2: string,
  color: string | null
) {
  if (x === undefined) {
    return {
      x: null,
      x2: null,
      y: d[y],
      y2: y2 !== undefined ? d[y2] : null,
      color: color,
    };
  }

  if (y === undefined) {
    return {
      x: d[x],
      x2: x2 !== undefined ? d[x2] : null,
      y: null,
      y2: null,
      color: color,
    };
  }

  return {
    x: d[x],
    x2: x2 !== undefined ? d[x2] : null,
    y: d[y],
    y2: d[y2],
    color,
  };
}

export function compileLayer(
  data: Data,
  encoding: Encoding<Field>,
  mark: Mark | MarkDef,
  candleWidth: number
) {
  let markType: string;
  let cfg = {};

  if (typeof mark === "object") {
    markType = mark.type;
  } else {
    markType = mark;
  }

  if (markType === "area" && typeof Mark === "object") {
    cfg = getAreaConfig(
      data?.values,
      encoding.x?.field!,
      encoding.y?.field!,
      encoding.y2?.field!,
      (mark as MarkDef)?.color,
      (mark as MarkDef)?.line?.color
    );

    return [createElement("area", cfg)];
  } else if (markType === "line") {
    cfg = getLineConfig(
      data?.values,
      encoding.x?.field!,
      encoding.y?.field!,
      getConditionalColor(encoding?.color)(null)
    );

    return [createElement("line", cfg)];
  }

  return data?.values
    ?.map((d: any) => {
      let cfg = {};

      if (markType === "bar") {
        cfg = getBarConfig(
          d,
          encoding.x?.field!,
          encoding.y?.field!,
          encoding.y2?.field!,
          candleWidth,
          getConditionalColor(encoding.fill)(d),
          getConditionalColor(encoding.stroke)(d)
        );
      } else if (markType === "rule") {
        cfg = getRuleConfig(
          d,
          encoding.x?.field!,
          encoding.x2?.field!,
          encoding.y?.field!,
          encoding.y2?.field!,
          getConditionalColor(encoding?.color)(d)
        );
      }

      return createElement((markType as any) ?? "bar", cfg);
    })
    .filter((d) => d.x !== undefined);
}

export function parseLayer(
  layer: Specification,
  data: Data,
  encoding: Encoding<Field>,
  candleWidth: number
) {
  const series: any[] = [];
  let layerData = data;
  let layerEncoding = encoding;

  if (layer?.data) {
    layerData = layer.data;
  }

  if (layer?.encoding) {
    layerEncoding = { ...encoding, ...layer.encoding };
  }

  if (layer?.mark) {
    series.push(
      compileLayer(layerData, layerEncoding, layer.mark, candleWidth)
    );
  }

  if (layer?.layer) {
    for (const subLayer of layer.layer) {
      series.push(
        ...parseLayer(subLayer, layerData, layerEncoding, candleWidth)
      );
    }
  }

  return series;
}

function extractYDomain(layer: Specification) {
  const mappedData = extractYEncodingFields(layer).flatMap(
    (field: any) =>
      (layer.data?.values?.map((d: any) => d[field]) as unknown) as number
  );

  const domain = extent(mappedData) as [number, number];
  const domainSize = Math.abs(domain[1] - domain[0]);

  // TO DO: Include zero if specified in specification
  return [domain[0] - domainSize * 0.1, domain[1] + domainSize * 0.2] as [
    number,
    number
  ];
}

function extractYEncodingFields(layer: Specification) {
  const yEncodingFields: string[] = [];

  if (layer?.encoding) {
    if (layer.encoding.y?.field) {
      yEncodingFields.push(layer.encoding.y.field);
    }

    if (layer.encoding.y2?.field) {
      yEncodingFields.push(layer.encoding.y2.field);
    }
  }

  if (layer?.layer) {
    for (const subLayer of layer.layer) {
      yEncodingFields.push(...extractYEncodingFields(subLayer));
    }
  }

  return yEncodingFields;
}

/**
 * Parse top-level view specification into a scenegraph model
 * @param data
 * @param specification
 * @param candleWidth
 * @param decimalPlaces
 */
export function parse(
  data: any[],
  specification: Specification[],
  candleWidth: number,
  decimalPlaces: number
): Scenegraph {
  if (specification.length > 2) {
    console.warn(
      `Expected no more than 2 panels. Received ${specification.length}`
    );
  }

  const inputSpec: Specification = {
    data: { values: data },
    mark: "area",
    transform: specification[0].transform,
  };

  const model = compile(inputSpec);

  const outputNode = model.component.data.outputNodes["data"];

  let head: OutputNode | null = outputNode;
  let newData = [...data];

  while (head !== null) {
    if (head instanceof TechnicalIndicatorTransformNode) {
      const transform = head.assemble();

      switch (transform.method) {
        case "bollinger":
          {
            const indicatorData = indicatorBollingerBands()(
              data.map((d) => d[transform.on])
            );

            newData = newData.map((d, i) => ({ ...d, ...indicatorData[i] }));
          }
          break;
        case "eldarRay":
          {
            const indicatorData = indicatorElderRay()(
              data.map((d) => d[transform.on])
            );

            newData = newData.map((d, i) => ({ ...d, ...indicatorData[i] }));
          }
          break;
        case "envelope":
          {
            const indicatorData = indicatorEnvelope()(
              data.map((d) => d[transform.on])
            );

            newData = newData.map((d, i) => ({ ...d, ...indicatorData[i] }));
          }
          break;
        case "movingAverage":
          {
            const indicatorData = indicatorMovingAverage()(
              data.map((d) => d[transform.on])
            );

            newData = newData.map((d, i) => ({
              ...d,
              movingAverage: indicatorData[i],
            }));
          }
          break;
        case "macd":
          {
            const indicatorData = indicatorMacd()(
              data.map((d) => d[transform.on])
            );

            newData = newData.map((d, i) => ({ ...d, ...indicatorData[i] }));
          }
          break;
      }
    }

    head = head.parent;
  }

  specification[0].data = { values: newData };

  return {
    panels: specification.map((panel) => {
      return {
        id: panel.name ?? "",
        data: parseLayer(panel, { values: newData }, {}, candleWidth),
        originalData: panel.data?.values ?? [],
        grid: new GridElement(),
        axis: new YAxisElement(),
        crosshair: new CrosshairElement(),
        axisTooltip: new YAxisTooltipElement(decimalPlaces),
        annotations: [
          new YAxisAnnotationElement(
            (panel.data?.values[panel.data?.values.length - 1] as any)?.close,
            decimalPlaces
          ),
        ],
        yEncodingFields: extractYEncodingFields(panel),
        yDomain: extractYDomain(panel),
      };
    }),
    xAxis: {
      id: "x-axis",
      originalData: data,
      data: [
        data.map(
          (candle) =>
            new CandleElement({
              ...candle,
              x: candle.date,
              width: candleWidth * (1 - PADDING_INNER),
            })
        ),
      ],
      axis: new XAxisElement(),
      axisTooltip: new XAxisTooltipElement(),
    },
  };
}

function getConditionalColor(colorDef: any | undefined) {
  let color: (datum: any) => string | null;

  if (colorDef === undefined) {
    color = () => null;
  } else if ("condition" in colorDef) {
    const predicate: Predicate = colorDef.condition?.test;

    if (isFieldLTPredicate(predicate)) {
      color = (datum) =>
        datum[predicate.field] < datum[predicate.lt]
          ? colorDef.condition.value ?? Colors.GRAY
          : colorDef.value ?? Colors.GRAY;
    } else if (isFieldGTPredicate(predicate)) {
      color = (datum) =>
        datum[predicate.field] > datum[predicate.gt]
          ? colorDef.condition.value ?? Colors.GRAY
          : colorDef.value ?? Colors.GRAY;
    } else {
      color = () => null;
    }
  } else if ("value" in colorDef) {
    color = () => colorDef.value;
  } else {
    color = () => null;
  }

  return color;
}
