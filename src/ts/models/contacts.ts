import Collection from './Collection';
import Contact from './contact';

export default class Contacts extends Collection<Contact> {
    comparator (model1, model2) {
        const show1 = model1.show;
        const show2 = model2.show;

        const name1 = model1.displayName.toLowerCase();
        const name2 = model2.displayName.toLowerCase();

        if (show1 === show2) {

            if (name1 === name2) {
                return 0;
            }
            if (name1 < name2) {
                return -1;
            }
            return 1;
        } else {
            if (show1 === 'offline') {
                return 1;
            }
            if (show2 === 'offline') {
                return -1;
            }

            if (name1 === name2) {
                return 0;
            }
            if (name1 < name2) {
                return -1;
            }

            return 1;
        }
    }
}
