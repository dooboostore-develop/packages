import {getSim} from "@dooboostore/simple-boot";
export * from './UserServiceBack'
import {UserServiceBack} from "@swc-back-end/services/UserServiceBack";

console.log('service index call');

export const services = [getSim(UserServiceBack)];