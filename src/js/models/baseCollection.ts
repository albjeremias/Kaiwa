export default class Collection<T> extends Array<T> {
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
}
