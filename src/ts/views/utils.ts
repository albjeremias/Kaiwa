import { Component } from 'react';

export class Utils extends Component<{}, {}> {

    public static requireAuth(nextState: any, replace: any) {
        if (!Utils.isLoggedIn()) {
            replace('/login');
        }
    }

    public static isLoggedIn(): boolean {
        return !!localStorage.getItem('session');
    }
}
