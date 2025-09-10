import { ComponentBase } from '@dooboostore/dom-render/components/ComponentBase';
import template from './hello.component.html';
import { ApiService } from '@dooboostore/simple-boot/fetch/ApiService';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';

@Component({ template })
export class HelloComponent extends ComponentBase {
    message = 'loading...';

    constructor(private apiService: ApiService) {
        super();
    }

    async sayHello() {
        try {
            const res = await this.apiService.get<{ message: string }>({ target: '/api/hello' });
            this.message = res.message;
        } catch (e) {
            this.message = 'Error: ' + (e as Error).message;
        }
    }
}
