export interface ISession {
    jid?: string;
    password?: string;
    server?: string;
    connURL?: string;
    wsURL?: string;
    boshURL?: string;
    transport?: string;
}

export function login(session: ISession) {
    return { type: 'LOGIN', session };
}

