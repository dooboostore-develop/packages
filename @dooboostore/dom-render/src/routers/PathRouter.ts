import { Router, RouterConfig } from './Router';

export class PathRouter extends Router {
    constructor(config: RouterConfig) {
        super(config);
    }

    getSearchParams(): URLSearchParams {
        return (new URL(this.config.window.document.location.href)).searchParams;
    }

    set(path: string, data?: any, title: string = ''): void {
        super.pushState(data, title, path);
    }

    getUrl(): string {
        const url = new URL(this.config.window.document.location.href);
        return url.pathname + url.search;
    }

    getPath(): string {
        return this.config.window.location.pathname;
    }
}
