import {
  formatDistanceToNow,
  isAfter,
  differenceInMilliseconds,
  add,
} from 'date-fns';

export function* distanceStops(
  includeSeconds = false,
): IterableIterator<Duration> {
  if (includeSeconds) {
    yield* [5, 10, 20, 40, 60].map((seconds) => ({ seconds }));
  } else {
    yield { seconds: 30 };
  }

  for (let minutes = 1; minutes < 45; minutes++) {
    yield { minutes, seconds: 30 };
  }

  for (let hours = 1; hours < 24; hours++) {
    yield { hours, minutes: 29, seconds: 30 };
  }

  yield { hours: 23, minutes: 59, seconds: 30 };

  for (let days = 1; days < 29; days++) {
    yield { days, hours: 21, minutes: 59, seconds: 30 };
  }

  yield { days: 29, hours: 23, minutes: 59, seconds: 30 };
  yield { days: 44, hours: 23, minutes: 59, seconds: 30 };
  yield { days: 59, hours: 23, minutes: 59, seconds: 30 };
}

export const createPastAdapter = (
  options?: Parameters<typeof formatDistanceToNow>[1],
) => {
  return (baseDate: Parameters<typeof formatDistanceToNow>[0]) => ({
    subscribe(callback: (distance: string) => void) {
      let subscribed = true;
      let handle: number | undefined;

      const scheduleUpdate = () => {
        const now = new Date();
        let updatesAt: Date | undefined;

        for (const distance of distanceStops()) {
          updatesAt = add(baseDate, distance);
          if (isAfter(updatesAt, now)) {
            break;
          }
        }

        if (updatesAt != null) {
          const timeout = differenceInMilliseconds(updatesAt, now);

          if (timeout <= 0x7fffffff) {
            return setTimeout(handler, timeout);
          }
        }
      };

      const handler = () => {
        callback(this.formatDistance());
        if (subscribed) {
          handle = scheduleUpdate();
        }
      };

      handle = scheduleUpdate();

      return () => {
        subscribed = false;
        clearTimeout(handle);
      };
    },
    formatDistance() {
      return formatDistanceToNow(baseDate, options);
    },
  });
};
