export default class Collection<T> extends Array<T> {
    bind: (events: string, handler: () => void, instance?: any) => void;
    once: (event: string, handler: () => void);
    pluck: (key: string) => any;
    reset: () => void;
    trigger: (event: string) => void;

    parent: any;

    first() {
        return this[0];
    }

    last() {
        return this[this.length - 1];
    }

    add(item) {
        this.push(item);
    }

    get(str: string): T {
        return null;
    }

    comparator(item1, item2): number {
        return 0;
    }

    sort() {
        return super.sort(this.comparator);
    }

    findWhere(property: string, value: T): T {
        return super.some((v) => (v as any)[property] === value);
    }

    remove(value: T) {
        this.splice(this.indexOf(T), 1);
    }
}
