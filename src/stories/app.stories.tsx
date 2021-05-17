import "./app.stories.scss";

import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import {
  Button,
  Intent,
  MenuItem,
  HotkeysProvider,
  useHotkeys,
} from "@blueprintjs/core";
import { ChartType, Overlay, Study } from "../types";
import { ItemRenderer, Select } from "@blueprintjs/select";
import { Meta, Story } from "@storybook/react";

import { VegaDataSource } from "./data-source/vega-protocol-data-source";
import { AppToaster } from "./components/toaster";
import { Chart } from "../components/chart";
import { ChartControls } from "./components/chart-controls";
import { ChartElement } from "../types";
import { CryptoCompareDataSource } from "./data-source/crypto-compare-data-source";
import { Interval } from "./api/vega-graphql";
import { useMemo, useRef, useState } from "react";
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

const MarketSelect = Select.ofType<Market>();

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

export const VegaProtocol: Story = () => {
  const ref = useRef<ChartElement>(null!);
  const [market, setMarket] = useState(data.markets[1].id);
  const [chartType, setChartType] = useState<ChartType>("ohlc");
  const [study, setStudy] = useState<Study | null>(null);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [interval, setInterval] = useState(Interval.I1M);

  const dataSource = useMemo(
    () =>
      new VegaDataSource(
        client,
        market,
        "0a0ed5f704cf29041bfa320b1015b0b0c0eedb101954ecd687e513d8472a3ff6"
      ),
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
      </div>
      <div>
        <ChartControls
          interval={interval}
          chartType={chartType}
          overlay={overlay}
          study={study}
          onSetInterval={setInterval}
          onSetChartType={setChartType}
          onSetOverlay={setOverlay}
          onSetStudy={setStudy}
          onSnapshot={async () => {
            const blob = await ref.current.snapshot();

            if (blob) {
              if (navigator.clipboard) {
                await navigator?.clipboard?.write?.([
                  new ClipboardItem({ "image/png": blob }),
                ]);

                AppToaster.show({
                  intent: Intent.SUCCESS,
                  message: "Copied to clipboard",
                });
              } else {
                console.log("Clipboard API not found");
              }
            }
          }}
        />
      </div>
      <div style={{ height: "60vh" }}>
        <Chart
          ref={ref}
          dataSource={dataSource}
          options={{
            chartType: chartType,
            studies: study === null ? [] : [study],
            overlays: overlay === null ? [] : [overlay],
          }}
          interval={interval}
          onOptionsChanged={(options) => {
            setStudy(options.studies?.length === 0 ? null : study);
          }}
        />
      </div>
    </div>
  );
};

export const CryptoCompare: Story = () => {
  const ref = useRef<ChartElement>(null!);
  const [chartType, setChartType] = useState<ChartType>("ohlc");
  const [study, setStudy] = useState<Study | null>(null);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [interval, setInterval] = useState(Interval.I1M);

  const dataSource = useMemo(() => new CryptoCompareDataSource(), []);

  const hotkeys = useMemo(
    () => [
      {
        combo: "down",
        global: false,
        preventDefault: true,
        stopPropagation: true,
        label: "Zoom out",
        onKeyDown: () => ref.current.zoomOut(0.1),
      },

      {
        combo: "left",
        global: false,
        preventDefault: true,
        stopPropagation: true,
        label: "Pan left",
        onKeyDown: () => ref.current.panBy(-1),
      },
      {
        combo: "right",
        global: false,
        preventDefault: true,
        stopPropagation: true,
        group: "Input",
        label: "Pan right",
        onKeyDown: () => ref.current.panBy(1),
      },
      {
        combo: "up",
        global: false,
        preventDefault: true,
        stopPropagation: true,
        label: "Zoom in",
        onKeyDown: () => ref.current.zoomIn(0.1),
      },
    ],
    []
  );

  const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeys);

  return (
    <HotkeysProvider>
      <div
        tabIndex={0}
        className="container bp3-dark"
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      >
        <h1>Crypto Compare Charts</h1>
        <ChartControls
          interval={interval}
          chartType={chartType}
          overlay={overlay}
          study={study}
          onSetInterval={setInterval}
          onSetChartType={setChartType}
          onSetOverlay={setOverlay}
          onSetStudy={setStudy}
          onSnapshot={async () => {
            const blob = await ref.current.snapshot();

            if (blob) {
              if (navigator.clipboard) {
                try {
                  // @ts-ignore
                  await navigator.clipboard.write([
                    new ClipboardItem({ "image/png": blob }),
                  ]);

                  AppToaster.show({
                    intent: Intent.SUCCESS,
                    message: "Copied to clipboard",
                  });
                } catch (error) {
                  AppToaster.show({
                    intent: Intent.WARNING,
                    message: "Unable to copy to clipboard",
                  });
                  console.log(error);
                }
              } else {
                AppToaster.show({
                  intent: Intent.WARNING,
                  message: "Unable to copy to clipboard",
                });
                console.log("Clipboard API not found");
              }
            }
          }}
        />
        <div style={{ height: "425px" }}>
          <Chart
            ref={ref}
            dataSource={dataSource}
            options={{
              chartType: chartType,
              studies: study === null ? [] : [study],
              overlays: overlay === null ? [] : [overlay],
            }}
            interval={interval}
            onOptionsChanged={(options) => {
              setStudy(options.studies?.length === 0 ? null : study);
            }}
          />
        </div>
        <button onClick={() => ref.current.reset()}>reset</button>
      </div>
    </HotkeysProvider>
  );
};
