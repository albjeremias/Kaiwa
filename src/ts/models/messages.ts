import Collection from './Collection';
import Message from './message';

export default class Messages extends Collection<Message> {
    comparator(m1: Message, m2: Message): number {
        return Number(m1.created) - Number(m2.created);
    }
}
