import "./app.stories.scss";

import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import { Meta, Story } from "@storybook/react";

import { ApolloDataSource } from "../data/vega-protocol-data-source";
import { Chart } from "../components/chart";
import { ChartInterface } from "../types";
import { CryptoCompareDataSource } from "../data/crypto-compare-data-source";
import { Interval } from "../api/vega-graphql";
import React from "react";
import { WebSocketLink } from "@apollo/client/link/ws";
import data from "./app.stories.json";
import { getMainDefinition } from "@apollo/client/utilities";

export default {
  title: "Overview/Application Examples",
} as Meta;

const httpLink = new HttpLink({
  uri: "https://lb.testnet.vega.xyz/query",
});

const wsLink = new WebSocketLink({
  uri: "wss://lb.testnet.vega.xyz/query",
  options: {
    reconnect: true,
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

type Market = {
  id: string;
  tradableInstrument: { instrument: { name: string } };
};

type ChartType = {
  id: "candle" | "area";
  label: string;
};

type Study = {
  id: "eldarRay" | "macd" | "none" | "volume";
  label: string;
};

type Overlay = {
  id: "bollinger" | "envelope" | "ichimoku" | "priceMonitoringBounds" | "none";
  label: string;
};

const MarketSelect = Select.ofType<Market>();
const ChartSelect = Select.ofType<ChartType>();
const StudySelect = Select.ofType<Study>();
const OverlaySelect = Select.ofType<Overlay>();

const renderMarket: ItemRenderer<any> = (
  market: Market,
  { handleClick, modifiers }: any
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  return (
    <MenuItem
      active={modifiers.active}
      key={market.id}
      label={market.tradableInstrument.instrument.name}
      onClick={handleClick}
      text={market.tradableInstrument.instrument.name}
    />
  );
};

const renderChart: ItemRenderer<ChartType> = (
  chart: ChartType,
  { handleClick, modifiers }: any
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  return (
    <MenuItem
      active={modifiers.active}
      key={chart.id}
      onClick={handleClick}
      text={chart.label}
    />
  );
};

const renderStudy: ItemRenderer<Study> = (
  study: Study,
  { handleClick, modifiers }: any
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  return (
    <MenuItem
      active={modifiers.active}
      key={study.id}
      onClick={handleClick}
      text={study.label}
    />
  );
};

const renderOverlay: ItemRenderer<Overlay> = (
  overlay: Overlay,
  { handleClick, modifiers }: any
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  return (
    <MenuItem
      active={modifiers.active}
      key={overlay.id}
      onClick={handleClick}
      text={overlay.label}
    />
  );
};

const chartTypes: ChartType[] = [
  { id: "candle", label: "Candlestick" },
  { id: "area", label: "Area" },
];

const studies: Study[] = [
  { id: "none", label: "None" },
  { id: "eldarRay", label: "Eldar-ray" },
  { id: "volume", label: "Volume" },
  { id: "macd", label: "Macd" },
];

const overlays: Overlay[] = [
  { id: "none", label: "None" },
  { id: "bollinger", label: "Bollinger Bands" },
  { id: "envelope", label: "Envelope" },
  { id: "ichimoku", label: "Ichimoku" },
  { id: "priceMonitoringBounds", label: "Price Monitoring Bounds" },
];

export const VegaProtocol: Story = () => {
  const ref = React.useRef<ChartInterface>(null!);
  const [market, setMarket] = React.useState(data.markets[1].id);
  const [chartType, setChartType] = React.useState(chartTypes[0].id);
  const [study, setStudy] = React.useState(studies[0].id);
  const [overlay, setOverlay] = React.useState(overlays[0].id);
  const [interval, setInterval] = React.useState(Interval.I15M);

  const dataSource = React.useMemo(
    () => new ApolloDataSource(client, market, 5),
    [market]
  );

  return (
    <div className="container bp3-dark">
      <h1>Vega Protocol Charts</h1>
      <div className="content-wrapper">
        <MarketSelect
          items={data.markets}
          itemRenderer={renderMarket}
          onItemSelect={(item: Market) => {
            setMarket(item.id);
          }}
          noResults={<MenuItem disabled={true} text="No results." />}
          filterable={false}
        >
          <Button
            text={
              data.markets.find((s) => s.id === market)?.tradableInstrument
                .instrument.name ?? "No market selected"
            }
            disabled={false}
          />
        </MarketSelect>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span>Chart</span>
          <ChartSelect
            items={chartTypes}
            itemRenderer={renderChart}
            onItemSelect={(item: ChartType) => {
              setChartType(item.id);
            }}
            noResults={<MenuItem disabled={true} text="No results." />}
            filterable={false}
          >
            <Button
              text={
                chartTypes.find((s) => s.id === chartType)?.label ??
                "No study selected"
              }
              disabled={false}
            />
          </ChartSelect>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span>Study</span>
          <StudySelect
            items={studies}
            itemRenderer={renderStudy}
            onItemSelect={(item: Study) => {
              setStudy(item.id);
            }}
            noResults={<MenuItem disabled={true} text="No results." />}
            filterable={false}
          >
            <Button
              text={
                studies.find((s) => s.id === study)?.label ??
                "No study selected"
              }
              disabled={false}
            />
          </StudySelect>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span>Overlay</span>
          <OverlaySelect
            items={overlays}
            itemRenderer={renderOverlay}
            onItemSelect={(item: Overlay) => {
              setOverlay(item.id);
            }}
            noResults={<MenuItem disabled={true} text="No results." />}
            filterable={false}
          >
            <Button
              text={
                overlays.find((s) => s.id === overlay)?.label ??
                "No overlay selected"
              }
              disabled={false}
            />
          </OverlaySelect>
        </div>
      </div>
      <div style={{ height: "60vh" }}>
        <Chart
          ref={ref}
          dataSource={dataSource}
          chartType={chartType}
          study={study === "none" ? undefined : study}
          overlay={overlay === "none" ? undefined : overlay}
          interval={interval}
          onSetInterval={setInterval}
        />
      </div>
    </div>
  );
};

export const CryptoCompare: Story = () => {
  const ref = React.useRef<ChartInterface>(null!);
  const [chartType, setChartType] = React.useState(chartTypes[0].id);
  const [study, setStudy] = React.useState(studies[0].id);
  const [overlay, setOverlay] = React.useState(overlays[0].id);
  const [interval, setInterval] = React.useState(Interval.I1M);

  const dataSource = React.useMemo(() => new CryptoCompareDataSource(), []);

  return (
    <div className="container bp3-dark">
      <h1>Crypto Compare Charts</h1>
      <div className="content-wrapper">
        <div style={{ display: "flex", gap: "24px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span>Chart</span>
            <ChartSelect
              items={chartTypes}
              itemRenderer={renderChart}
              onItemSelect={(item: ChartType) => {
                setChartType(item.id);
              }}
              noResults={<MenuItem disabled={true} text="No results." />}
              filterable={false}
            >
              <Button
                text={
                  chartTypes.find((s) => s.id === chartType)?.label ??
                  "No study selected"
                }
                disabled={false}
              />
            </ChartSelect>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span>Study</span>
            <StudySelect
              items={studies}
              itemRenderer={renderStudy}
              onItemSelect={(item: Study) => {
                setStudy(item.id);
              }}
              noResults={<MenuItem disabled={true} text="No results." />}
              filterable={false}
            >
              <Button
                text={
                  studies.find((s) => s.id === study)?.label ??
                  "No study selected"
                }
                disabled={false}
              />
            </StudySelect>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span>Overlay</span>
            <OverlaySelect
              items={overlays}
              itemRenderer={renderOverlay}
              onItemSelect={(item: Overlay) => {
                setOverlay(item.id);
              }}
              noResults={<MenuItem disabled={true} text="No results." />}
              filterable={false}
            >
              <Button
                text={
                  overlays.find((s) => s.id === overlay)?.label ??
                  "No overlay selected"
                }
                disabled={false}
              />
            </OverlaySelect>
          </div>
        </div>
      </div>
      <div style={{ height: "40vh" }}>
        <Chart
          ref={ref}
          dataSource={dataSource}
          chartType={chartType}
          study={study === "none" ? undefined : study}
          overlay={overlay === "none" ? undefined : overlay}
          interval={interval}
          onSetInterval={setInterval}
        />
      </div>
    </div>
  );
};
