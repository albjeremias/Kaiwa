import App from '../models/App';
import Me from '../models/me';

declare const app: App;
declare const me: Me;

export interface Page {
    show(animation);
    hide();
}

export class PageMixIn implements Page {
    $: JQueryStatic;

    animateRemove: () => void;
    render: () => void;
    trigger: (event) => void;

    $el: JQuery;
    cache: boolean;
    detached: boolean;
    el: Element;
    model: any;

    show (animation) {
        const self = this;

        $('body').scrollTop(0);

        if (this.detached) {
            this.$('#pages').append(this.el);
            this.detached = false;
        } else {
            this.render();
        }

        this.$el.addClass('active');

        app.currentPage = this;

        app.state.pageTitle = _.result(self, 'title');

        this.trigger('pageloaded');

        if (this.model.jid) {
            me.setActiveContact(this.model.jid);
        }

        return this;
    }

    hide () {
        const self = this;

        this.$el.removeClass('active');

        this.trigger('pageunloaded');

        if (this.cache) {
            this.$el.detach();
            this.detached = true;
        } else {
            this.animateRemove();
        }

        me.setActiveContact('');

        return this;
    }
}
