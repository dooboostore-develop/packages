import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router, Route } from '@dooboostore/simple-boot/decorators/route/Router';
import { GET, POST } from '@dooboostore/simple-boot-http-server/decorators/MethodMapping';
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { ReqHeader } from '@dooboostore/simple-boot-http-server/models/datas/ReqHeader';
import { RouterModule } from '@dooboostore/simple-boot/route/RouterModule';
import { UserService } from '../services/UserService';
import { ReqFormUrlBody } from '@dooboostore/simple-boot-http-server/models/datas/body/ReqFormUrlBody';
import { ReqJsonBody } from '@dooboostore/simple-boot-http-server/models/datas/body/ReqJsonBody';
import { NotFoundError } from '@dooboostore/simple-boot-http-server/errors/NotFoundError';
import { BadRequestError } from '@dooboostore/simple-boot-http-server/errors/BadRequestError';

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
}
