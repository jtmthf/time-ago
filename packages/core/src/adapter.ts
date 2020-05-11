export interface Adapter {
  subscribe(from: Date, callback: AdapterCallback): AdapterUnsubscribe;
}

export type AdapterCallback = (distance: string) => void;
export type AdapterUnsubscribe = () => void;
