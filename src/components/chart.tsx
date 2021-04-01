import "./chart.scss";

import * as React from "react";

import { DataSource, PriceMonitoringBounds } from "../types";
import { FocusStyleManager, useHotkeys } from "@blueprintjs/core";

import AutoSizer from "react-virtualized-auto-sizer";
import { CandleInfo } from "./candle-info";
import { ChartInfo } from "./chart-info";
import { ChartInterface } from "../types";
import { HotkeysProvider } from "@blueprintjs/core";
import { Interval } from "../api/vega-graphql";
import { NonIdealState } from "./non-ideal-state";
import { PlotContainer } from "./plot-container";
import { PriceMonitoringInfo } from "./price-monitoring-info";
import { ResetButton } from "./reset-button";
import { constructTopLevelSpec } from "../helpers";
import { mergeData } from "../helpers";

FocusStyleManager.onlyShowFocusOnTabs();

export type ChartType = "area" | "candle" | "line";
export type Overlay =
  | "bollinger"
  | "envelope"
  | "ichimoku"
  | "priceMonitoringBounds";
export type Study = "eldarRay" | "volume" | "macd";

export type ChartProps = {
  dataSource: DataSource;
  chartType?: ChartType;
  study?: Study;
  overlay?: Overlay;
  interval: Interval;
  onSetInterval: (interval: Interval) => void;
};

export const Chart = React.forwardRef(
  (
    {
      dataSource,
      chartType = "candle",
      study,
      overlay,
      interval,
      onSetInterval,
    }: ChartProps,
    ref: React.Ref<ChartInterface>
  ) => {
    React.useImperativeHandle(ref, () => ({
      fitBounds: (bounds: [Date, Date]) => {
        chartRef.current.fitBounds(bounds);
      },
      panBy: (n: number) => {
        chartRef.current.reset();
      },
      panTo: (x: Date) => {
        chartRef.current.reset();
      },
      reset: () => {
        chartRef.current.reset();
      },
    }));

    const chartRef = React.useRef<ChartInterface>(null!);
    const [data, setData] = React.useState<any[]>([]);
    const [
      priceMonitoringBounds,
      setPriceMonitoringBounds,
    ] = React.useState<PriceMonitoringBounds | null>(null);
    const [bounds, setBounds] = React.useState<[Date, Date]>([
      new Date(),
      new Date(),
    ]);
    const [selectedIndex, setCandle] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const specification = React.useMemo(
      () => constructTopLevelSpec(data, chartType, overlay, study),
      [chartType, data, overlay, study]
    );

    const hotkeys = React.useMemo(
      () => [
        {
          combo: "r",
          global: true,
          label: "Reset",
          onKeyDown: () => {
            chartRef.current.reset();
          },
        },
        {
          combo: "left",
          global: true,
          label: "Refresh data",
          onKeyDown: () => {
            chartRef.current.panBy(-1);
          },
        },
        {
          combo: "right",
          global: true,
          label: "Focus text input",
          onKeyDown: () => {
            chartRef.current.panBy(1);
          },
        },
      ],
      []
    );

    const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeys);

    const query = React.useCallback(
      async (from: string, to: string, merge = true) => {
        const newData = await dataSource.query(interval, from, to);

        // TODO: need convenience functions for calculating range, sorting and distinct values and merging
        setData((data) => mergeData(newData, merge ? data : []));
      },
      [dataSource, interval]
    );

    React.useEffect(() => {
      function subscribe() {
        dataSource.subscribe(interval, (datum) => {
          setData((data) => mergeData([datum], data));
        });
      }

      const myDataSource = dataSource;

      query(
        new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString(),
        false
      );

      subscribe();

      return () => {
        myDataSource.unsubscribe();
      };
    }, [dataSource, interval, query]);

    React.useEffect(() => {
      setIsLoading(true);

      dataSource.onReady().then((configuration) => {
        console.info(`Data Source ready:`, configuration);
        setIsLoading(false);

        if (configuration.priceMonitoringBounds.length > 0) {
          setPriceMonitoringBounds(configuration.priceMonitoringBounds[0]);
        }
      });
    }, [dataSource]);

    const handleGetDataRange = React.useCallback(
      (from: string, to: string) => {
        query(from, to);
      },
      [query]
    );

    const handleOnMouseOut = React.useCallback(() => setCandle(null), []);

    if (isLoading) {
      return <NonIdealState icon="timeline-line-chart" title="Loading" />;
    }

    return (
      <HotkeysProvider>
        <div
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          style={{ height: "100%" }}
        >
          {!isLoading && data.length > 1 ? (
            <div className="chart-wrapper">
              <AutoSizer
                defaultHeight={150}
                defaultWidth={300}
                style={{ height: "100%", width: "100%" }} // TODO: Find a better method
              >
                {({ height, width }) => (
                  <PlotContainer
                    ref={chartRef}
                    width={width}
                    height={height}
                    specification={specification}
                    interval={interval}
                    decimalPlaces={dataSource.decimalPlaces}
                    onBoundsChanged={setBounds}
                    onMouseMove={setCandle}
                    onMouseOut={handleOnMouseOut}
                    onGetDataRange={handleGetDataRange}
                  />
                )}
              </AutoSizer>
              <div className="overlay">
                <ChartInfo
                  interval={interval}
                  bounds={bounds}
                  onSetInterval={onSetInterval}
                />

                {selectedIndex !== null && (
                  <CandleInfo
                    candle={data[selectedIndex]}
                    decimalPlaces={dataSource.decimalPlaces}
                  />
                )}
              </div>
            </div>
          ) : (
            <NonIdealState icon="timeline-line-chart" title="No data found" />
          )}
        </div>
      </HotkeysProvider>
    );
  }
);
