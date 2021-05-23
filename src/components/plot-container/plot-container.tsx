import "d3-transition";
import "@d3fc/d3fc-element";
import "./plot-container.scss";

import { throttle } from "lodash";
import * as React from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createRef } from "react";

import { THROTTLE_INTERVAL, Y_AXIS_WIDTH } from "../../constants";
import { Core } from "../../core";
import { asyncSnapshot, formatter } from "../../helpers";
import { Bounds, ChartElement, Panel, Scenegraph, Viewport } from "../../types";
import { FcElement, Interval } from "../../types";
import { ChartInfo } from "../chart-info";
import { IndicatorInfo } from "../indicator-info";
import { SplitView } from "../split-view";
import { CloseButton } from "./close-button";
import { getStudyInfoFieldValue, studyInfoFields } from "./helpers";

export type PlotContainerProps = {
  width: number;
  height: number;
  decimalPlaces: number;
  scenegraph: Scenegraph;
  interval: Interval;
  initialViewport: Viewport;
  overlays: string[];
  proportion: number;
  onViewportChanged?: (viewport: Viewport) => void;
  onRightClick?: (position: [number, number]) => void;
  onGetDataRange?: (from: Date, to: Date, interval: Interval) => void;
  onClosePanel: (id: string) => void;
  onProportionChanged: (proportion: number) => void;
};

export const PlotContainer = forwardRef(
  (
    {
      scenegraph,
      interval,
      initialViewport,
      decimalPlaces,
      overlays,
      proportion,
      onViewportChanged = () => {},
      onGetDataRange = () => {},
      onClosePanel,
      onProportionChanged,
    }: PlotContainerProps,
    ref: React.Ref<ChartElement>
  ) => {
    useImperativeHandle(ref, () => ({
      panBy: (n: number) => {
        chartElement.current?.panBy(n);
      },
      reset: () => {
        chartElement.current?.reset();
      },
      snapshot: async () => {
        return snapshot();
      },
      zoomIn: (delta: number) => {
        chartElement.current?.zoomIn(delta);
      },
      zoomOut: (delta: number) => {
        chartElement.current?.zoomOut(delta);
      },
    }));

    const onViewportChangedThrottled = useMemo(
      () => throttle(onViewportChanged, 200),
      [onViewportChanged]
    );

    const onGetDataRangeThrottled = useMemo(
      () => throttle(onGetDataRange, 800),
      [onGetDataRange]
    );

    const snapshot = useCallback(() => asyncSnapshot(chartRef), []);
    const [bounds, setBounds] = useState<Bounds | null>(null);
    const [dataIndex, setDataIndex] = useState<number | null>(null);
    const [showPaneControls, setShowPaneControls] =
      useState<string | null>(null);
    const chartRef = useRef<FcElement>(null!);
    const xAxisRef = useRef<HTMLDivElement>(null!);

    const handleBoundsChanged = useMemo(
      () => throttle(setBounds, THROTTLE_INTERVAL),
      []
    );

    const handleDataIndexChanged = useMemo(
      () => throttle(setDataIndex, THROTTLE_INTERVAL),
      []
    );

    const handleViewportChanged = useMemo(
      () => throttle(onViewportChanged, THROTTLE_INTERVAL),
      [onViewportChanged]
    );

    const refs = useMemo(
      () =>
        scenegraph.panels
          .map((panel) => panel.id)
          .reduce((acc, value) => {
            acc[value] = createRef<HTMLDivElement>();
            return acc;
          }, {} as { [index: string]: React.RefObject<HTMLDivElement> }),
      [scenegraph.panels]
    );

    const chartElement = useRef<Core | null>(null);

    useEffect(() => {
      chartElement.current = new Core(
        Object.fromEntries(
          scenegraph.panels.map((panel) => [
            panel.id,
            {
              id: String(panel.id),
              ref: refs[panel.id],
              data: panel.originalData,
              renderableElements: panel.renderableElements.flat(1),
              yEncodingFields: panel.yEncodingFields,
              labels: panel.labels ?? [],
              labelLines: panel.labelLines ?? [],
            },
          ])
        ),
        {
          ref: xAxisRef,
          data: scenegraph.panels[0].originalData.map((d) => d.date),
        },
        initialViewport,
        decimalPlaces
      )
        .interval(interval)
        .on("redraw", () => {
          chartRef.current?.requestRedraw();
        })
        .on("bounds_changed", (bounds: Bounds) => {
          handleBoundsChanged(bounds);
        })
        .on("viewport_changed", (viewport: Viewport) => {
          handleViewportChanged(viewport);
        })
        .on("mousemove", (index: number, id: string) => {
          handleDataIndexChanged(index);
        })
        .on("mouseout", () => {
          handleDataIndexChanged(null);
        })
        .on("fetch_data", (from: Date, to: Date) => {
          onGetDataRangeThrottled(from, to, interval);
        });

      chartRef.current?.requestRedraw();

      requestAnimationFrame(() =>
        chartElement.current?.initialize(initialViewport)
      );

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update interval and fetch data callback
    useEffect(() => {
      if (chartElement.current) {
        chartElement.current
          .interval(interval)
          .on("fetch_data", (from: Date, to: Date) => {
            onGetDataRangeThrottled(from, to, interval);
          });
      }
    }, [interval, onGetDataRangeThrottled]);

    useEffect(() => {
      if (chartElement.current) {
        chartElement.current.update(
          Object.fromEntries(
            scenegraph.panels.map((panel) => [
              panel.id,
              {
                id: String(panel.id),
                ref: refs[panel.id],
                data: panel.originalData,
                renderableElements: panel.renderableElements.flat(1),
                yEncodingFields: panel.yEncodingFields,
                labels: panel.labels ?? [],
                labelLines: panel.labelLines ?? [],
              },
            ])
          ),
          {
            ref: xAxisRef,
            data: scenegraph.panels[0].originalData.map((d) => d.date),
          }
        );

        chartRef.current?.requestRedraw();
      }
    }, [chartElement, refs, scenegraph.panels]);

    useEffect(() => {
      if (chartElement.current) {
        chartElement.current.interval(interval);
      }
    }, [interval]);

    const panels = scenegraph.panels;

    const main = (
      <div
        ref={refs[panels[0].id]}
        className="plot-container__pane"
        onMouseOver={() => setShowPaneControls(panels[0].id)}
        onMouseOut={() => setShowPaneControls(null)}
      >
        <d3fc-canvas class="plot-area" use-device-pixel-ratio />
        <d3fc-svg class="plot-area-interaction" />
        <div className="plot-area-annotations" />
        <d3fc-canvas class="y-axis" use-device-pixel-ratio />
        <d3fc-svg
          class="y-axis-interaction"
          style={{
            width: `${Y_AXIS_WIDTH}px`,
          }}
        />
        <div className="plot-container__info-overlay">
          {bounds && <ChartInfo bounds={bounds} />}
          <IndicatorInfo
            title={studyInfoFields[panels[0].id].label}
            info={studyInfoFields[panels[0].id].fields.map((field) => ({
              id: field.id,
              label: field.label,
              value: formatter(
                getStudyInfoFieldValue(
                  panels[0].originalData,
                  dataIndex,
                  field.id
                ),
                decimalPlaces
              ),
            }))}
          />
          {overlays.map((overlay) => (
            <IndicatorInfo
              title={studyInfoFields[overlay].label}
              info={studyInfoFields[overlay].fields.map((field) => ({
                id: field.id,
                label: field.label,
                value: formatter(
                  getStudyInfoFieldValue(
                    panels[0].originalData,
                    dataIndex,
                    field.id
                  ),
                  decimalPlaces
                ),
              }))}
            />
          ))}
        </div>
      </div>
    );

    const showStudy = scenegraph.panels.length === 2;

    const study = showStudy ? (
      <div
        ref={refs[panels[1].id]}
        className="plot-container__pane"
        onMouseOver={() => setShowPaneControls(panels[1].id)}
        onMouseOut={() => setShowPaneControls(null)}
      >
        <d3fc-canvas class="plot-area" use-device-pixel-ratio />
        <d3fc-svg class="plot-area-interaction" />
        <div className="plot-area-annotations" />
        <d3fc-canvas class="y-axis" use-device-pixel-ratio />
        <d3fc-svg
          class="y-axis-interaction"
          style={{
            width: `${Y_AXIS_WIDTH}px`,
          }}
        />
        {panels[1].id !== "main" && (
          <div
            className="plot-container__close-button-wrapper"
            style={{
              right: `${Y_AXIS_WIDTH}px`,
              opacity: showPaneControls === panels[1].id ? 1 : 0,
              visibility:
                showPaneControls === panels[1].id ? "visible" : "hidden",
            }}
          >
            <div
              className="plot-container__close-button"
              onClick={() => {
                onClosePanel(panels[1].id);
              }}
            >
              <CloseButton size={16} />
            </div>
          </div>
        )}
        <div className="plot-container__info-overlay">
          <IndicatorInfo
            title={studyInfoFields[panels[1].id].label}
            info={studyInfoFields[panels[1].id].fields.map((field) => ({
              id: field.id,
              label: field.label,
              value: formatter(
                getStudyInfoFieldValue(
                  panels[1].originalData,
                  dataIndex,
                  field.id
                ),
                decimalPlaces
              ),
            }))}
          />
        </div>
      </div>
    ) : (
      <div>No study</div>
    );

    return (
      <d3fc-group ref={chartRef} class="plot-container__chart">
        <SplitView
          main={main}
          study={study}
          showStudy={showStudy}
          initialProportion={proportion}
          onResize={(proportion: number) => {
            chartRef.current?.requestRedraw();
            onProportionChanged(proportion);
          }}
        />
        <div ref={xAxisRef} className="plot-container__x-axis-container">
          <d3fc-canvas class="x-axis" use-device-pixel-ratio />
          <d3fc-svg class="x-axis-interaction" />
        </div>
      </d3fc-group>
    );
  }
);
