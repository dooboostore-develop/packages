import { Sim, Router, Route, RouterModule } from '@dooboostore/simple-boot';
import { GET, RequestResponse, ReqHeader, ResourceResolver } from '@dooboostore/simple-boot-http-server';
import { ApiRouter } from './ApiRouter';

@Sim
@Router({
  path: '',
  routers: [ApiRouter]
})
export class AppRouter {
  /**
   * Home page - serves index.html
   */
  @Route({ path: '/' })
  @GET({res: {contentType: 'text/html; charset=utf-8'}})
  index(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {

    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Boot HTTP Server Example</title>
    <link rel="stylesheet" href="/resources/index.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🚀 Simple Boot HTTP Server</h1>
            <p>A powerful HTTP server framework built on Simple Boot</p>
        </header>

        <main>
            <section class="card">
                <h2>✨ Features</h2>
                <ul>
                    <li>🎯 Router-based architecture with @Router and @Route decorators</li>
                    <li>📦 Dependency Injection with @Sim decorator</li>
                    <li>🔌 HTTP Method decorators (@GET, @POST, @PUT, @DELETE)</li>
                    <li>📁 Static file serving from resources directory</li>
                    <li>⚡ Built-in JSON and form data parsing</li>
                    <li>🛠️ Request/Response abstraction</li>
                </ul>
            </section>

            <section class="card">
                <h2>🔗 Available Endpoints</h2>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <code>/</code>
                    <span>- Home page (this page)</span>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <code>/api/hello</code>
                    <span>- Hello world JSON response</span>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <code>/api/users</code>
                    <span>- Get list of users</span>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <code>/api/users</code>
                    <span>- Create a new user</span>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <code>/api/time</code>
                    <span>- Get current server time</span>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <code>/api/users/find?id=1</code>
                    <span>- Find a user by id</span>
                </div>
                <div class="endpoint">
                    <span class="method put">PUT</span>
                    <code>/api/users</code>
                    <span>- Update an existing user</span>
                </div>
                <div class="endpoint">
                    <span class="method delete">DELETE</span>
                    <code>/api/users?id=1</code>
                    <span>- Delete a user</span>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <code>/api/stream/time</code>
                    <span>- Server-Sent Events (manual response streaming)</span>
                </div>
            </section>

            <section class="card">
                <h2>🧪 Test API</h2>
                <button onclick="testGet()" class="btn">Test GET /api/hello</button>
                <button onclick="testPost()" class="btn">Test POST /api/users</button>
                <button onclick="testTime()" class="btn">Test GET /api/time</button>
                <button onclick="testFindUser()" class="btn">Test GET /api/users/find?id=1</button>
                <button onclick="testUpdateUser()" class="btn">Test PUT /api/users</button>
                <button onclick="testDeleteUser()" class="btn">Test DELETE /api/users?id=3</button>
                <pre id="response"></pre>
            </section>

            <section class="card">
                <h2>📡 SSE Streaming Demo</h2>
                <button onclick="toggleStream()" id="streamBtn" class="btn">Connect /api/stream/time</button>
                <pre id="streamLog"></pre>
            </section>
        </main>

        <footer>
            <p>Built with ❤️ using @dooboostore/simple-boot-http-server</p>
        </footer>
    </div>

    <script>
        const responseEl = document.getElementById('response');

        async function testGet() {
            try {
                const res = await fetch('/api/hello');
                const data = await res.json();
                responseEl.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                responseEl.textContent = 'Error: ' + err.message;
            }
        }

        async function testPost() {
            try {
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' })
                });
                const data = await res.json();
                responseEl.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                responseEl.textContent = 'Error: ' + err.message;
            }
        }

        async function testTime() {
            try {
                const res = await fetch('/api/time');
                const data = await res.json();
                responseEl.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                responseEl.textContent = 'Error: ' + err.message;
            }
        }

        async function testFindUser() {
            try {
                const res = await fetch('/api/users/find?id=1');
                const data = await res.json();
                responseEl.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                responseEl.textContent = 'Error: ' + err.message;
            }
        }

        async function testUpdateUser() {
            try {
                const res = await fetch('/api/users', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: 1, name: 'Alice Updated' })
                });
                const data = await res.json();
                responseEl.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                responseEl.textContent = 'Error: ' + err.message;
            }
        }

        async function testDeleteUser() {
            try {
                const res = await fetch('/api/users?id=3', { method: 'DELETE' });
                const data = await res.json();
                responseEl.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                responseEl.textContent = 'Error: ' + err.message;
            }
        }

        let eventSource = null;
        const streamLogEl = document.getElementById('streamLog');
        const streamBtnEl = document.getElementById('streamBtn');

        function toggleStream() {
            if (eventSource) {
                eventSource.close();
                eventSource = null;
                streamBtnEl.textContent = 'Connect /api/stream/time';
                streamLogEl.textContent += '\\n[closed]';
                return;
            }
            streamLogEl.textContent = '';
            eventSource = new EventSource('/api/stream/time');
            streamBtnEl.textContent = 'Disconnect';
            eventSource.onmessage = (e) => {
                streamLogEl.textContent += e.data + '\\n';
                streamLogEl.scrollTop = streamLogEl.scrollHeight;
            };
            eventSource.onerror = () => {
                streamLogEl.textContent += '[error]\\n';
            };
        }
    </script>
</body>
</html>
    `;
    
   return html;
  }

  @Route({path: '/resources/index.css'})
  @GET({resolver: ResourceResolver})
  img(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
    return 'src/resources/index.css'
  }
}
