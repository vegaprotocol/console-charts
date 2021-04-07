import { Interval } from "../stories/api/vega-graphql";

export interface DataSource {
  readonly decimalPlaces: number;
  onReady(): Promise<{
    decimalPlaces: number;
    supportedIntervals: Interval[];
    priceMonitoringBounds: any;
  }>;
  query(interval: Interval, from: string, to: string): Promise<any>;
  subscribe(interval: Interval, onSubscriptionData: (data: any) => void): void;
  unsubscribe(): void;
}
