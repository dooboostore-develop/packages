import { Sim, Router, Route, RouterModule } from '@dooboostore/simple-boot';
import {
  GET, POST, PUT, DELETE,
  RequestResponse, ReqHeader, ReqJsonBody, ReqSearchParamsObj,
  NotFoundError, BadRequestError,
  HttpHeaders, HttpStatus, Mimes
} from '@dooboostore/simple-boot-http-server';
import { UserService } from '../services/UserService';
import { ServerResponse } from 'http';

@Sim({
  using: [UserService]
})
@Router({ path: '/api' })
export class ApiRouter {
  constructor(private userService: UserService) {
    console.log('📡 ApiRouter initialized with UserService');
  }

  /**
   * GET /api/hello
   * Simple hello world endpoint
   */
  @Route({ path: '/hello' })
  @GET({ res: { contentType: 'application/json' } })
  hello(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
    const response = {
      message: 'Hello from Simple Boot HTTP Server!',
      timestamp: new Date().toISOString(),
      method: 'GET',
      path: '/api/hello'
    };

    return response;
  }

  /**
   * GET /api/users
   * Get all users
   */
  @Route({ path: '/users' })
  @GET({ res: { contentType: 'application/json' } })
  getUsers(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
    const users = this.userService.getAllUsers();

    return {
      success: true,
      data: users,
      count: users.length
    };
  }

  /**
   * POST /api/users
   * Create a new user
   */
  @Route({ path: '/users' })
  @POST({ res: { contentType: 'application/json' } })
  createUser(rr: RequestResponse, header: ReqHeader, userData: ReqJsonBody, routerModule: RouterModule) {
    // RequestResponse에서 body 파싱
    // rr.reqBodyStringData()
    try {
      const newUser = this.userService.createUser(userData);
      return {
        success: true,
        message: 'User created successfully',
        data: newUser
      };
    } catch (error) {
      throw new BadRequestError({
        message: JSON.stringify({
          success: false,
          error: 'Invalid JSON data'
        })
      });
    }
  }

  /**
   * GET /api/time
   * Get current server time
   */
  @Route({ path: '/time' })
  @GET({ res: { contentType: 'application/json' } })
  getTime(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
    const now = new Date();
    return {
      timestamp: now.toISOString(),
      unix: now.getTime(),
      formatted: now.toLocaleString('ko-KR'),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  /**
   * GET /api/users/find?id=1
   * Find a single user by id
   */
  @Route({ path: '/users/find' })
  @GET({ res: { contentType: 'application/json' } })
  getUserById(searchParams: ReqSearchParamsObj) {
    const user = this.userService.getUserById(Number(searchParams.id));
    if (!user) {
      throw new NotFoundError({ message: JSON.stringify({ success: false, error: 'User not found' }) });
    }
    return { success: true, data: user };
  }

  /**
   * PUT /api/users
   * Update an existing user
   */
  @Route({ path: '/users' })
  @PUT({ res: { contentType: 'application/json' } })
  updateUser(userData: ReqJsonBody) {
    const { id, ...rest } = userData as { id: number; [key: string]: any };
    const updated = this.userService.updateUser(Number(id), rest);
    if (!updated) {
      throw new NotFoundError({ message: JSON.stringify({ success: false, error: 'User not found' }) });
    }
    return { success: true, data: updated };
  }

  /**
   * DELETE /api/users?id=1
   * Delete a user
   */
  @Route({ path: '/users' })
  @DELETE({ res: { contentType: 'application/json' } })
  deleteUser(searchParams: ReqSearchParamsObj) {
    const ok = this.userService.deleteUser(Number(searchParams.id));
    if (!ok) {
      throw new NotFoundError({ message: JSON.stringify({ success: false, error: 'User not found' }) });
    }
    return { success: true };
  }

  /**
   * GET /api/stream/time
   * Server-Sent Events: `res: { manual: true }`로 프레임워크의 자동 응답 처리를 끄고
   * ServerResponse를 직접 주입받아 매 초 현재 시각을 push한다.
   */
  @Route({ path: '/stream/time' })
  @GET({ res: { manual: true } })
  streamTime(res: ServerResponse) {
    res.writeHead(HttpStatus.Ok, {
      [HttpHeaders.ContentType]: Mimes.TextEventStream,
      [HttpHeaders.CacheControl]: 'no-cache',
      [HttpHeaders.Connection]: 'keep-alive'
    });
    res.write(': connected\n\n');

    return new Promise<void>(resolve => {
      const timer = setInterval(() => {
        res.write(`data: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
      }, 1000);

      res.on('close', () => {
        clearInterval(timer);
        resolve();
      });
    });
  }
}
