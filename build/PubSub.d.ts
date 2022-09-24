export declare type PubSubable<Event extends string, EventDataMap extends Record<Event, unknown>> = {
    subscribe: (event: Event, callback: (eventData: EventDataMap[Event]) => void) => void;
    publish: (event: Event, eventData: EventDataMap[Event]) => void;
};
export declare class PubSub<Event extends string, EventDataMap extends Record<Event, unknown>> {
    private eventObserversMap;
    constructor(events: Event[]);
    subscribe<E extends Event>(event: E, callback: (eventData: EventDataMap[E]) => void): void;
    publish<E extends Event>(event: E, eventData: EventDataMap[E]): void;
}
