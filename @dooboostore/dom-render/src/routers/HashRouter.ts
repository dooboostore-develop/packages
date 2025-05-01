import { Router, RouterConfig } from './Router';
import {LocationUtils} from '@dooboostore/core-web/location/LocationUtils';


export class HashRouter extends Router {

    constructor(config: RouterConfig) {
        super(config);
    }

    getSearchParams(): URLSearchParams {
        const hashSearch = LocationUtils.hashSearch(this.config.window);
        if (hashSearch) {
            return new URLSearchParams(hashSearch);
        } else {
            return (new URL(this.config.window.document.location.href)).searchParams;
        }
    }

    set(path: string, data?: any, title: string = ''): void {
        if (path === '/') {
            super.pushState(data, title, '/');
        } else {
            path = '#' + path;
            super.pushState(data, title, path);
        }
    }

    getUrl(): string {
        return LocationUtils.hash(this.config.window) || '/';
    }

    getPath(): string {
        return LocationUtils.hashPath(this.config.window) || '/';
    }
}
