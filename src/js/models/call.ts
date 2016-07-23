import App from './app';

declare const app: App;

export default class Call {
    constructor() {
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
