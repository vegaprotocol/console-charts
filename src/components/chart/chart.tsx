import "../../styles/variables.css";
import "./chart.css";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FONT_FAMILY_MONOSPACE, INITIAL_NUM_CANDLES } from "../../constants";
import {
  constructTopLevelSpec,
  getCandleWidth,
  getSubMinutes,
} from "../../helpers";
import { mergeData } from "../../helpers";
import { parse } from "../../scenegraph/parse";
import {
  Annotation,
  Candle,
  ChartElement,
  ChartType,
  DataSource,
  Interval,
  Overlay,
  PriceMonitoringBounds,
  Study,
  Viewport,
} from "../../types";
import { ErrorBoundary } from "../error-boundary";
import { NonIdealState } from "../non-ideal-state";
import { PlotContainer } from "../plot-container";
import { useOnReady } from "./hooks";

const noop = () => {};

export type Options = {
  chartType?: ChartType;
  overlays?: Overlay[];
  studies?: Study[];
  simple?: boolean;
  initialNumCandles?: number;
};

export type ChartProps = {
  /** Responsible for fetching data */
  dataSource: DataSource;
  initialViewport?: Viewport;
  interval: Interval;
  options?: Options;
  onOptionsChanged?: (options: Options) => void;
  onViewportChanged?: (viewport: Viewport) => void;
};

export const Chart = forwardRef(
  (
    {
      dataSource,
      interval,
      options = {
        chartType: "candle",
        studies: [],
        overlays: [],
        initialNumCandles: INITIAL_NUM_CANDLES,
      },
      initialViewport,
      onOptionsChanged = noop,
      onViewportChanged = noop,
    }: ChartProps,
    ref: React.Ref<ChartElement>
  ) => {
    const {
      chartType = "candle",
      studies = [],
      overlays = [],
      simple = false,
      initialNumCandles = INITIAL_NUM_CANDLES,
    } = options;

    useImperativeHandle(ref, () => ({
      panBy: (n: number) => {
        chartRef.current.panBy(n);
      },
      reset: () => {
        chartRef.current.reset();
      },
      snapshot: async () => {
        return chartRef.current ? await chartRef.current.snapshot() : null;
      },
      zoomIn: (delta: number) => {
        chartRef.current.zoomIn(delta);
      },
      zoomOut: (delta: number) => {
        chartRef.current.zoomOut(delta);
      },
    }));

    const chartRef = useRef<ChartElement>(null!);
    const [data, setData] = useState<Candle[]>([]);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [proportion, setProportion] = useState(2 / 3);
    const [internalInterval, setInternalInterval] = useState(interval);

    // Callback for fetching historical data
    const query = useCallback(
      async (from: Date, to: Date, interval: Interval, merge = true) => {
        const newData = await dataSource.query(
          interval,
          from.toISOString(),
          to.toISOString()
        );

        setData((data) => mergeData(newData, merge ? data : []));
      },
      [dataSource]
    );

    // Wait for data source onReady call before showing content
    const { loading, configuration } = useOnReady(dataSource);

    const specification = useMemo(
      () =>
        constructTopLevelSpec(
          data,
          chartType,
          overlays[0],
          studies[0],
          configuration?.priceMonitoringBounds
        ),
      [chartType, data, overlays, configuration?.priceMonitoringBounds, studies]
    );

    // Compile data and view specification into scenegraph ready for rendering
    const scenegraph = useMemo(
      () =>
        parse(
          specification,
          getCandleWidth(internalInterval),
          dataSource.decimalPlaces,
          annotations
        ),
      [annotations, dataSource.decimalPlaces, internalInterval, specification]
    );

    // Initial data fetch and subscriptions
    useEffect(() => {
      const fetchData = async (interval: Interval) => {
        await query(
          new Date(
            new Date().getTime() -
              1000 * 60 * getSubMinutes(interval, INITIAL_NUM_CANDLES)
          ),
          new Date(),
          interval,
          false
        );

        setInternalInterval(interval);
      };

      function subscribe(interval: Interval) {
        dataSource.subscribeData(interval, (datum) => {
          setData((data) => mergeData([datum], data));
        });
      }

      if (!loading) {
        const myDataSource = dataSource;

        // Initial data fetch
        fetchData(interval);

        // Set up subscriptions
        subscribe(interval);

        return () => {
          myDataSource.unsubscribeData();
          setData([]);
        };
      }
    }, [dataSource, interval, loading, query]);

    // React to streaming annotations changes
    useEffect(() => {
      function subscribe() {
        if (dataSource.subscribeAnnotations) {
          dataSource.subscribeAnnotations((annotations) => {
            setAnnotations(annotations);
          });
        }
      }

      if (!loading) {
        const myDataSource = dataSource;

        subscribe();

        return () => {
          myDataSource.unsubscribeAnnotations &&
            myDataSource.unsubscribeAnnotations();
          setAnnotations([]);
        };
      }
    }, [dataSource, loading]);

    useLayoutEffect(() => {
      document.documentElement.style.setProperty(
        "--pennant-font-family-monospace",
        FONT_FAMILY_MONOSPACE
      );

      return () => {
        document.documentElement.style.removeProperty(
          "--pennant-font-family-monospace"
        );
      };
    }, []);

    const handleViewportChanged = useCallback(
      (viewport: Viewport) => {
        onViewportChanged(viewport);
      },
      [onViewportChanged]
    );

    const handleGetDataRange = useCallback(
      (from: Date, to: Date, interval: Interval) => {
        query(from, to, interval);
      },
      [query]
    );

    const handleClosePane = useCallback(
      (id: string) => {
        onOptionsChanged({
          ...options,
          studies: studies.filter((study) => study !== id),
        });
      },
      [onOptionsChanged, options, studies]
    );

    const viewport = useMemo(
      () =>
        initialViewport ?? {
          date: data.length > 0 ? data[data.length - 1].date : new Date(),
          intervalWidth: 10,
        },
      [data, initialViewport]
    );

    // Show fallback UI while waiting for data
    if (loading) {
      return <NonIdealState title="Loading" />;
    }

    // We failed to construct a scenegraph. Something went wrong with the data
    if (!scenegraph) {
      return <NonIdealState title="No data found" />;
    }

    return (
      <ErrorBoundary>
        <div className="chart__wrapper">
          <PlotContainer
            ref={chartRef}
            width={400}
            height={300}
            decimalPlaces={dataSource.decimalPlaces}
            scenegraph={scenegraph}
            interval={internalInterval}
            initialViewport={viewport}
            overlays={overlays}
            proportion={proportion}
            simple={simple}
            initialNumCandles={initialNumCandles}
            onViewportChanged={handleViewportChanged}
            onGetDataRange={handleGetDataRange}
            onClosePane={handleClosePane}
            onProportionChanged={setProportion}
          />
        </div>
      </ErrorBoundary>
    );
  }
);
