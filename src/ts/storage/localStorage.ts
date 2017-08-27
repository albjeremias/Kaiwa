import {ISession} from '../redux/Session';

const SESSION_KEY = 'session';

export function readSession(): ISession | undefined {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : undefined;
}

export function writeSession(session: ISession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function removeSession(): void {
    localStorage.removeItem(SESSION_KEY);
}
