import { add, differenceInMilliseconds } from 'date-fns';
import { advanceBy, clear } from 'jest-date-mock';
import { es } from 'date-fns/locale';

import { createPastAdapter, distanceStops } from '../adapter';

jest.useFakeTimers();

afterEach(() => {
  clear();
});

test('calls callback whenever formatted distance would change', () => {
  const adapter = createPastAdapter();
  const callback = jest.fn();
  const unsubscribe = adapter(new Date()).subscribe(callback);

  advanceDuration();

  expect(callback).toHaveBeenNthCalledWith(1, '1 minute');
  expect(callback).toHaveBeenNthCalledWith(2, '2 minutes');
  expect(callback).toHaveBeenNthCalledWith(3, '3 minutes');

  expect(callback).toHaveBeenNthCalledWith(45, 'about 1 hour');
  expect(callback).toHaveBeenNthCalledWith(46, 'about 2 hours');
  expect(callback).toHaveBeenNthCalledWith(47, 'about 3 hours');

  expect(callback).toHaveBeenNthCalledWith(69, '1 day');
  expect(callback).toHaveBeenNthCalledWith(70, '2 days');
  expect(callback).toHaveBeenNthCalledWith(71, '3 days');

  expect(callback).toHaveBeenNthCalledWith(98, 'about 1 month');
  expect(callback).toHaveBeenNthCalledWith(99, 'about 2 months');
  expect(callback).toHaveBeenNthCalledWith(100, '2 months');

  unsubscribe();
});

test('include seconds', () => {
  const adapter = createPastAdapter({ includeSeconds: true });
  const callback = jest.fn();
  const unsubscribe = adapter(new Date()).subscribe(callback);

  advanceDuration(true);

  expect(callback).toHaveBeenNthCalledWith(1, 'less than 10 seconds');
  expect(callback).toHaveBeenNthCalledWith(2, 'less than 20 seconds');
  expect(callback).toHaveBeenNthCalledWith(3, 'half a minute');
  expect(callback).toHaveBeenNthCalledWith(4, 'less than a minute');
  expect(callback).toHaveBeenNthCalledWith(5, '1 minute');

  unsubscribe();
});

test('with suffix', () => {
  const adapter = createPastAdapter({ addSuffix: true });
  const callback = jest.fn();
  const unsubscribe = adapter(new Date()).subscribe(callback);

  advanceDuration();

  expect(callback).toHaveBeenNthCalledWith(1, '1 minute ago');
  expect(callback).toHaveBeenNthCalledWith(45, 'about 1 hour ago');
  expect(callback).toHaveBeenNthCalledWith(69, '1 day ago');
  expect(callback).toHaveBeenNthCalledWith(98, 'about 1 month ago');
  expect(callback).toHaveBeenNthCalledWith(99, 'about 2 months ago');
  expect(callback).toHaveBeenNthCalledWith(100, '2 months ago');

  unsubscribe();
});

test('with spanish locale', () => {
  const adapter = createPastAdapter({ locale: es });
  const callback = jest.fn();
  const unsubscribe = adapter(new Date()).subscribe(callback);

  advanceDuration();

  expect(callback).toHaveBeenNthCalledWith(1, '1 minuto');
  expect(callback).toHaveBeenNthCalledWith(45, 'alrededor de 1 hora');
  expect(callback).toHaveBeenNthCalledWith(69, '1 día');
  expect(callback).toHaveBeenNthCalledWith(98, 'alrededor de 1 mes');
  expect(callback).toHaveBeenNthCalledWith(99, 'alrededor de 2 meses');
  expect(callback).toHaveBeenNthCalledWith(100, '2 meses');

  unsubscribe();
});

function advanceDuration(includeSeconds = false) {
  const base = new Date();
  let previous = base;

  for (const distance of distanceStops(includeSeconds)) {
    const next = add(base, distance);
    const ms = differenceInMilliseconds(next, previous);

    advanceBy(ms);
    jest.runOnlyPendingTimers();

    previous = next;
  }
}
