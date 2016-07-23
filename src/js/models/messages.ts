import Collection from './baseCollection';
import Message from './message';

export default class Messages extends Collection<Message> {
    comparator(m1, m2): number {
        return Number(m1.created) - Number(m2.created);
    }
}
