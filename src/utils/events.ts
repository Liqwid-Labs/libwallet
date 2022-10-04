export type EventEmitter<Events extends Record<string, object>> = {
  on: <T extends keyof Events>(event: T, listener: (event: Events[T]) => any) => () => void;
  off: <T extends keyof Events>(event: T, listener: (event: Events[T]) => any) => void;
  emit: <T extends keyof Events>(event: T, eventObj: Events[T]) => Promise<void>;
  once: <T extends keyof Events>(event: T, listener: (event: Events[T]) => any) => () => void;
  addEventListener: <T extends keyof Events>(
    event: T,
    listener: (event: Events[T]) => any,
  ) => () => void;
  removeEventListener: <T extends keyof Events>(
    event: T,
    listener: (event: Events[T]) => any,
  ) => void;
};

export function makeEventEmitter<Events extends Record<string, object>>({
  events: validEvents
}: {
  events: (keyof Events)[];
}): EventEmitter<Events> {
  type EventObj = { [T in keyof Events]: ((event: Events[T]) => any)[] };

  // Type safe even with cast because internal map covers typing
  const events: EventObj = Object.fromEntries(
    validEvents.map<[keyof Events, []]>((event) => [event, []]),
  ) as unknown as EventObj;

  function on<T extends keyof Events>(event: T, listener: (event: Events[T]) => any) {
    if (!validEvents.includes(event)) throw new Error(`Invalid event "${String(event)}" provided`);
    if (!Array.isArray(events[event])) events[event] = [];

    events[event]?.push(listener);

    return () => off(event, listener);
  }

  function off<T extends keyof Events>(event: T, listener: (event: Events[T]) => any) {
    if (!Array.isArray(events[event])) return;

    const listenerIndex = events[event].indexOf(listener);

    if (listenerIndex > -1) events[event].splice(listenerIndex, 1);
  }

  async function emit<T extends keyof Events>(event: T, eventObj: Events[T]) {
    if (!Array.isArray(events[event])) return;

    const listeners = events[event];
    for (const listener of listeners) {
      await Promise.resolve(listener(eventObj)).catch(console.error);
    }
  }

  function once<T extends keyof Events>(event: T, listener: (event: Events[T]) => any) {
    return on(event, function listenOnce(eventObj) {
      off(event, listenOnce);
      listener(eventObj);
    });
  }

  return { on, off, emit, once, addEventListener: on, removeEventListener: off };
}