import {RandomUtils} from '@dooboostore/core'
import { HttpServerOption, SessionOption } from '../option/HttpServerOption';
import {RequestResponse} from '../models/RequestResponse';

export class SessionManager {
    private sessions = new Map<string, { access: number, data?: any }>();
    public sessionOption: SessionOption;
    // uuid issued to a cookieless request, so later reqSession*() calls in the same request reuse it instead of minting another
    private issued = new WeakMap<RequestResponse, string>();

    constructor(private option: HttpServerOption) {
        this.sessionOption = option.sessionOption;
        const sweep = setInterval(async () => {
            const uuids = (await this.getSessionUUIDs());
            for (const uuid of uuids) {
                const dataSet = await this.getSessionDataSet(uuid);
                if (dataSet && this.isExpired(dataSet.access)) {
                    await this.deleteSession(uuid);
                }
            }
        }, this.sessionOption.expiredTime);
        sweep.unref(); // a housekeeping timer must not keep the process alive
    }

    /** Set-Cookie for a session that was just created for this request. */
    private issueCookie(rr: RequestResponse, uuid: string) {
        const o = this.sessionOption;
        const parts = [`${o.key}=${uuid}`, `Path=${o.path}`];
        if (o.httpOnly) parts.push('HttpOnly');
        if (o.secure) parts.push('Secure');
        if (o.sameSite) parts.push(`SameSite=${o.sameSite}`);
        if (o.maxAge != null) parts.push(`Max-Age=${o.maxAge}`);
        try {
            rr.resSetHeader('Set-Cookie', parts.join('; '));
        } catch {
            // headers already sent: the session still works for this request, the client just gets no cookie
        }
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
        let newCookie = false;
        if (rrOrUUID instanceof RequestResponse) {
            const cookie = rrOrUUID.reqCookieGet(this.sessionOption.key) ?? this.issued.get(rrOrUUID);
            newCookie = !cookie;
            uuid = cookie ?? this.makeUUID();
            if (newCookie) this.issued.set(rrOrUUID, uuid);
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
        if (newCookie) this.issueCookie(rrOrUUID as RequestResponse, uuid);
        return {uuid, dataSet};
    }
}