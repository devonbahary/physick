type ObserverCallback<T> = (eventData: T) => void;

export class Observable<T> {
    private observers: ObserverCallback<T>[] = [];

    observe(callback: ObserverCallback<T>): void {
        this.observers.push(callback);
    }

    notify(eventData: T): void {
        for (const observe of this.observers) {
            observe(eventData);
        }
    }
}
