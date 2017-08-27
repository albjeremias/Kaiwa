export default class Collection<T> {
    once: (event: string, handler: () => void) => void;
    pluck: (key: string) => any;
    reset: () => void;
    trigger: (event: string) => void;

    parent: any;

    items: T[];

    constructor(items: T[] = []) {
        this.items = items;
    }

    get length() {
        return this.items.length;
    }

    first() {
        return this.items[0];
    }

    last() {
        return this.items[this.items.length - 1];
    }

    add(item: T) {
        this.items.push(item);
    }

    filter(predicate: (item: T) => boolean) {
        return new Collection<T>(this.items.filter(predicate));
    }

    get(str: string | undefined): T | undefined {
        return undefined;
    }

    comparator(item1: T, item2: T): number {
        return 0;
    }

    forEach(action: (item: T) => void): void {
        this.items.forEach(action);
    }

    sort() {
        return this.items.sort(this.comparator);
    }

    findWhere(property: string, value: any): T {
        return this.where(property, value)[0];
    }

    remove(value: T) {
        this.items.splice(this.items.indexOf(value), 1);
    }

    where(property: string, value: any): T[] {
        return this.items.filter((v) => (v as any)[property] === value);
    }

    bind(events: string, handler: () => void, instance?: any) {
        console.warn(`TODO: Binding event ${event} on Collection object`);
        // TOOD: Really this method should never be called. ~ F
    }
}
