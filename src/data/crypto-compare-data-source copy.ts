import { DataSource } from "../types/data-source";
import { Interval } from "../api/vega-graphql";
import { addDecimal } from "../helpers";

const API_KEY =
  "541aa2fde7a4ca90365d4ac19fabc0740bd190f106e3e53d8f2144a3b2bdc297";

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`,
  "protocolOne"
);

export function extendCandle(candle: any, decimalPlaces: number): any {
  return {
    ...candle,
    date: new Date(candle.datetime),
    high: Number(addDecimal(candle.high, decimalPlaces)),
    low: Number(addDecimal(candle.low, decimalPlaces)),
    open: Number(addDecimal(candle.open, decimalPlaces)),
    close: Number(addDecimal(candle.close, decimalPlaces)),
    volume: Number(addDecimal(candle.volume, decimalPlaces)),
  };
}

export class CryptoCompareDataSource implements DataSource {
  get decimalPlaces(): number {
    return 2;
  }

  async onReady() {
    return Promise.resolve({
      supportedIntervals: [Interval.I1D, Interval.I1H, Interval.I1M],
    });
  }

  async query(interval: Interval, from: string, to: string) {
    const limit = 100;
    const toTs = Math.floor(new Date(to).getTime() / 1000);
    let resolution; // day hour minute

    switch (interval) {
      case Interval.I1D:
        resolution = "day";
        break;
      case Interval.I1H:
        resolution = "hour";
        break;
      case Interval.I1M:
        resolution = "minute";
        break;
      default:
        resolution = "minute";
    }

    const res = await fetch(
      `https://min-api.cryptocompare.com/data/v2/histo${resolution}?fsym=BTC&tsym=USD&limit=${limit}&=${toTs}&api_key=${API_KEY}`
    );

    const data = await res.json();

    return data.Data.Data.map((d: any) => ({
      date: new Date(d.time * 1000),
      open: d.open,
      close: d.close,
      high: d.high,
      low: d.low,
      volume: d.volumeto,
    }));
  }

  subscribe(interval: Interval, onSubscriptionData: (data: any) => void) {
    socket.onopen = function onStreamOpen() {
      var subRequest = {
        action: "SubAdd",
        subs: ["24~CCCAGG~BTC~USD~m"],
      };

      socket.send(JSON.stringify(subRequest));
    };

    socket.onmessage = function onStreamMessage(message) {
      const data = JSON.parse(message.data);

      if (data.TYPE === "24") {
        const tick = {
          date: new Date(data.TS * 1000),
          open: data.OPEN,
          high: data.HIGH,
          low: data.LOW,
          close: data.CLOSE,
        };

        onSubscriptionData(tick);
      }
    };
  }

  unsubscribe() {
    const subRequest = {
      action: "SubRemove",
      subs: ["24~CCCAGG~BTC~USD~m"],
    };

    socket.send(JSON.stringify(subRequest));
  }
}
