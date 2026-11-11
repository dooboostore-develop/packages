import 'reflect-metadata';
import { Controller, Get, Post, Param, Body, Injectable, Module, Inject } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { PORT, ROUTES, UserService as Plain } from './_common.ts';

@Injectable() class UserService extends Plain {}

class Ctl {
  constructor(@Inject(UserService) private users: UserService) {}
  hello() { return { hello: 'world' }; }
  user(id: string) { return this.users.find(id); }
  echo(body: unknown) { return body; }
}
// Decorators are applied by hand so the 100-route case does not need 100 hand-written methods.
const P = Ctl.prototype as any;
const method = (name: string, fn: (...a: any[]) => any) => Object.defineProperty(P, name, { value: fn, writable: true, configurable: true });
Get('hello')(P, 'hello', Object.getOwnPropertyDescriptor(P, 'hello')!);
Get('users/:id')(P, 'user', Object.getOwnPropertyDescriptor(P, 'user')!);
Param('id')(P, 'user', 0);
Post('echo')(P, 'echo', Object.getOwnPropertyDescriptor(P, 'echo')!);
Body()(P, 'echo', 0);
for (let i = 0; i < ROUTES; i++) { method('r' + i, () => ({ route: i })); Get('r/' + i)(P, 'r' + i, Object.getOwnPropertyDescriptor(P, 'r' + i)!); }
Controller()(Ctl);
// DI metadata normally emitted for the constructor; explicit @Inject above covers it.

@Module({ controllers: [Ctl], providers: [UserService] }) class AppModule {}

const app = process.env.NEST_ADAPTER === 'fastify'
  ? await NestFactory.create(AppModule, new FastifyAdapter(), { logger: false })
  : await NestFactory.create(AppModule, new ExpressAdapter(), { logger: false });
await app.listen(PORT, '127.0.0.1');
