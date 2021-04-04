import "./chart-controls.scss";

import {
  Alignment,
  Button,
  ButtonGroup,
  IconName,
  Menu,
  MenuDivider,
  MenuItem,
} from "@blueprintjs/core";
import { ChartType, Overlay, Study } from "../../../components/chart";
import { GQLInterval, INTERVALS } from "../../../helpers";
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";

import { Interval } from "../../../api/vega-graphql";

const chartTypeIcon = new Map<ChartType, IconName>([
  ["area", "timeline-area-chart"],
  ["candle", "waterfall-chart"],
  ["line", "timeline-line-chart"],
]);

const intervals: GQLInterval[] = ["I15M", "I1D", "I1H", "I1M", "I5M", "I6H"];

export type ChartControlsProps = {
  interval: Interval;
  chartType: ChartType;
  overlay: Overlay | null;
  study: Study | null;
  onSetInterval: (interval: Interval) => void;
  onSetChartType: (chartType: ChartType) => void;
  onSetOverlay: (overlay: Overlay) => void;
  onSetStudy: (study: Study) => void;
};

export const ChartControls = ({
  interval,
  chartType,
  overlay,
  study,
  onSetInterval,
  onSetChartType,
  onSetOverlay,
  onSetStudy,
}: ChartControlsProps) => {
  return (
    <div className="chart-controls">
      <ButtonGroup minimal style={{ minWidth: "120px" }}>
        <Popover2
          content={
            <Menu>
              <MenuDivider title="Minutes" />
              <MenuItem
                active={INTERVALS[interval] === "1m"}
                text="1m"
                onClick={() => onSetInterval(Interval.I1M)}
              />
              <MenuItem
                active={INTERVALS[interval] === "5m"}
                text="5m"
                onClick={() => onSetInterval(Interval.I5M)}
              />
              <MenuItem
                active={INTERVALS[interval] === "15m"}
                text="15m"
                onClick={() => onSetInterval(Interval.I15M)}
              />
              <MenuDivider title="Hours" />
              <MenuItem
                active={INTERVALS[interval] === "1h"}
                text="1h"
                onClick={() => onSetInterval(Interval.I1H)}
              />
              <MenuItem
                active={INTERVALS[interval] === "6h"}
                text="6h"
                onClick={() => onSetInterval(Interval.I6H)}
              />
              <MenuDivider title="Days" />
              <MenuItem
                active={INTERVALS[interval] === "1d"}
                text="1d"
                onClick={() => onSetInterval(Interval.I1D)}
              />
            </Menu>
          }
          placement="bottom-start"
        >
          <div style={{ minWidth: "70px" }}>
            <Button
              alignText={Alignment.LEFT}
              fill
              rightIcon="caret-down"
              text={INTERVALS[interval]}
            />
          </div>
        </Popover2>
        <Popover2
          content={
            <Menu>
              <MenuItem
                active={chartType === "candle"}
                text="Candlestick"
                icon="waterfall-chart"
                onClick={() => onSetChartType("candle")}
              />
              <MenuItem
                active={chartType === "line"}
                text="Line"
                icon="timeline-line-chart"
                onClick={() => onSetChartType("line")}
              />
              <MenuItem
                active={chartType === "area"}
                text="Mountain"
                icon="timeline-area-chart"
                onClick={() => onSetChartType("area")}
              />
            </Menu>
          }
          placement="bottom-start"
        >
          <Button rightIcon="caret-down" icon={chartTypeIcon.get(chartType)} />
        </Popover2>
        <Popover2
          content={
            <Menu>
              <MenuDivider title="Overlays" />
              <MenuItem
                active={overlay === "bollinger"}
                text="Bollinger bands"
                onClick={() => onSetOverlay("bollinger")}
              />
              <MenuItem
                active={overlay === "priceMonitoringBounds"}
                text="Price monitoring bounds"
                onClick={() => onSetOverlay("priceMonitoringBounds")}
              />
              <MenuDivider title="Studies" />
              <MenuItem
                active={study === "eldarRay"}
                text="Eldar-ray"
                onClick={() => onSetStudy("eldarRay")}
              />
              <MenuItem
                active={study === "macd"}
                text="MACD"
                onClick={() => onSetStudy("macd")}
              />
            </Menu>
          }
          placement="bottom-start"
        >
          <Button
            rightIcon="caret-down"
            icon="function"
            text="Indicators and studies"
          />
        </Popover2>
      </ButtonGroup>
      <ButtonGroup minimal>
        <Tooltip2 content="Save image">
          <Button icon="camera" />
        </Tooltip2>
      </ButtonGroup>
    </div>
  );
};
