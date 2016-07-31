import App from './App';
import Calls from './calls';

declare const app: App;

export default class Call {
    collection: Calls;

    constructor(options?: any) {
        if (options) {
            console.warn('TODO: Options ignored in Call constructor', options);
            // TODO: Probably drop these Options or the whole class. ~ F
        }

        this.contact.onCall = true;
        // temporary, this won't stay here
        app.navigate('/chat/' + encodeURIComponent(this.contact.jid));
    }

    end (reasonForEnding) {
        const reason = reasonForEnding || 'success';
        this.contact.onCall = false;
        if (this.jingleSession) {
            this.jingleSession.end(reasonForEnding);
        }
        this.collection.remove(this);
    }

    contact: {onCall; jid} = null;
    jingleSession: {end} = null;
    state: string = 'inactive';
    multiUser: boolean = false;
}
