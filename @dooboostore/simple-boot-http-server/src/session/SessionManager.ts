import {RandomUtils} from '@dooboostore/core/random/RandomUtils'
import {HttpServerOption} from '../option/HttpServerOption';
import {RequestResponse} from '../models/RequestResponse';

export class SessionManager {
    private sessions = new Map<string, { access: number, data?: any }>();
    public sessionOption: { key: string; expiredTime: number, provider?: {uuids: () => Promise<string[]>, delete: (uuid: string) => Promise<void>, get: (uuid: string) => Promise<{ access: number, data?: any }>, set: (uuid: string, data: { access: number, data?: any }) => Promise<void>} };

    constructor(private option: HttpServerOption) {
        this.sessionOption = option.sessionOption;
        setInterval(async () => {
            const uuids = (await this.getSessionUUIDs());
            for (const uuid of uuids) {
                const dataSet = await this.getSessionDataSet(uuid);
                if (dataSet && this.isExpired(dataSet.access)) {
                    await this.deleteSession(uuid);
                }
            }
        }, this.sessionOption.expiredTime);
    }

    async getSessionUUIDs() {
        if (this.sessionOption.provider?.uuids) {
            return this.sessionOption.provider.uuids();
        } else {
            return Array.from(this.sessions.keys());
        }
    }

    async deleteSession(uuid: string) {
        if (this.sessionOption.provider?.delete) {
            this.sessionOption.provider.delete(uuid);
        } else {
            this.sessions.delete(uuid);
        }
    }

    async getSessionDataSet(uuid: string) {
        if (this.sessionOption.provider?.get) {
            return this.sessionOption.provider.get(uuid);
        } else {
            return this.sessions.get(uuid);
        }
    }

    async setSessionDataSet(uuid: string, dataSet: { access: number, data?: any }) {
        if (this.sessionOption.provider?.set) {
            this.sessionOption.provider.set(uuid, dataSet);
        } else {
            this.sessions.set(uuid, dataSet);
        }
    }

    isExpired(access: number, now: number = Date.now()) {
        return (now - access) >= this.option.sessionOption.expiredTime;
    }

    makeUUID() {
        return RandomUtils.uuid('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    }

    async session(): Promise<{ uuid: string, dataSet: { access: number, data?: any } }>;
    async session(uuid: string): Promise<{ uuid: string, dataSet: { access: number, data?: any } }>;
    async session(rr: RequestResponse): Promise<{ uuid: string, dataSet: { access: number, data?: any } }>;
    async session(rrOrUUID?: string | RequestResponse): Promise<{ uuid: string, dataSet: { access: number, data?: any } } >{
        let uuid: string;
        if (rrOrUUID instanceof RequestResponse) {
            uuid = rrOrUUID.reqCookieGet(this.sessionOption.key) ?? this.makeUUID();
        } else if (typeof rrOrUUID === 'string') {
            uuid = rrOrUUID;
        } else {
            uuid = this.makeUUID()
        }
        let dataSet = await this.getSessionDataSet(uuid);
        const now = Date.now();
        if (dataSet) {
            if (this.isExpired(dataSet.access, now)) {
                delete dataSet.data;
            }
            dataSet.access = now;
        } else {
            dataSet = {
                access: now
            }
        }
        await this.setSessionDataSet(uuid, dataSet);
        return {uuid, dataSet};
    }
}