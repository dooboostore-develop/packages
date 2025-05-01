import {SimpleBootHttpServer} from '../SimpleBootHttpServer';

export interface OnInit {
    onInit(app: SimpleBootHttpServer): Promise<void>;
}