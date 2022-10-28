type EventObserversMap<E extends string, EMap extends Record<E, unknown>> = Record<E, ((eventData: EMap[E]) => void)[]>;

export type ChangeOfValue<T> = {
    oldValue: T;
    newValue: T;
};

export type PubSubable<Event extends string, EventDataMap extends Record<Event, unknown>> = {
    subscribe: (event: Event, callback: (eventData: EventDataMap[Event]) => void) => void;
    publish: (event: Event, eventData: EventDataMap[Event]) => void;
};

export class PubSub<Event extends string, EventDataMap extends Record<Event, unknown>> {
    private eventObserversMap: EventObserversMap<Event, EventDataMap>;

    constructor(events: Event[]) {
        this.eventObserversMap = events.reduce<EventObserversMap<Event, EventDataMap>>((acc, event) => {
            acc[event] = [];
            return acc;
        }, {} as EventObserversMap<Event, EventDataMap>);
    }

    subscribe<E extends Event>(event: E, callback: (eventData: EventDataMap[E]) => void): void {
        this.eventObserversMap[event].push(callback);
    }

    publish<E extends Event>(event: E, eventData: EventDataMap[E]): void {
        for (const observe of this.eventObserversMap[event]) {
            observe(eventData);
        }
    }
}
