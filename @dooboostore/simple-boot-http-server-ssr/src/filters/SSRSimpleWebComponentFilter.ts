import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { HttpHeaders } from '@dooboostore/simple-boot-http-server/codes/HttpHeaders';
import { Filter } from '@dooboostore/simple-boot-http-server/filters/Filter';
import { Mimes } from '@dooboostore/simple-boot-http-server/codes/Mimes';
import { HttpStatus } from '@dooboostore/simple-boot-http-server/codes/HttpStatus';
import { SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import path from 'path';
import fs from 'fs';
import {HttpMethod} from "@dooboostore/simple-boot-http-server";

export type SWCSSRConfig = {
  frontDistPath: string;
  frontDistIndexFileName?: string;
  welcomUrl?: string;
  ssrExcludeFilter?: (rr: RequestResponse) => boolean;
  /**
   * (Deprecated for Playwright)
   * Function to register components for each request.
   * Playwright evaluates real JS files loaded from your index.html,
   * so component registration happens automatically in the browser context.
   */
  registerComponents?: (window: any) => Promise<void> | void;
  playwright?: {
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
    waitForSelector?: string;
    waitForTimeout?: number;
    timeout?: number;
    ignoreTags?: string[];
  };
};

/**
 * SSR Filter specifically for Simple Web Component (SWC).
 * It utilizes Playwright to render the page robustly and perfectly matching browser specs.
 *
 * ### Playwright Setup & Requirements
 *
 * To use this filter, Playwright must be installed in your server environment:
 * 1. Install playwright package: `npm install playwright` or `pnpm add playwright`
 * 2. Install browsers: `npx playwright install chromium`
 *
 * If running inside a Docker container (e.g., Alpine Linux), you must use an image that supports Playwright
 * or manually install OS dependencies. Playwright provides official Docker images: `mcr.microsoft.com/playwright:v1.x.x-focal`.
 */
export class SSRSimpleWebComponentFilter implements Filter {
  private welcomUrl = 'http://localhost';
  private browser?: any;

  constructor(public config: SWCSSRConfig) {
    this.welcomUrl = config.welcomUrl || this.welcomUrl;
  }

  async onInit(app: SimpleBootHttpServer) {
    // 1. Initialize Playwright browser when the server starts
    const { chromium } = await import('playwright');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'] // Allow CORS for local dev
    });
    console.log('🚀 Playwright Browser initialized for SSR Filter');
  }

  async onDestroy() {
    if (this.browser) {
      await this.browser.close();
      console.log('🛑 Playwright Browser closed');
    }
  }

  async proceedBefore({ rr, app, carrier }: { rr: RequestResponse; app: SimpleBootHttpServer; carrier: Map<string, any> }) {
    if (this.config.ssrExcludeFilter?.(rr)) {
      return true; // Bypass SSR and continue server chain
    }

    console.log('playwright2222222', rr.reqHeader('x-ssr-browser'));

    // 2. Prevent Infinite Loop:
    // If the request comes from Playwright itself, bypass SSR and serve the original static SPA file.
    if (rr.reqHeader('x-ssr-browser') === 'playwright') {
      return true;
    }

    if (rr.reqIsMethod(HttpMethod.GET) && rr.reqHasContentTypeHeader(Mimes.TextHtml)) {
      // Build target URL for Playwright to visit
      // Use the server's actual listening address and port if available
      const protocol = app.option.protocol || 'http';
      const host = app.option.hostname || '127.0.0.1';
      const port = app.option.port || 80;

      const url = rr.reqUrlObj({ host: `${host}:${port}` });
      url.protocol = protocol;

      const targetUrl = url.toString() ?? this.welcomUrl;

      if (!this.browser) {
        console.error('Playwright browser is not initialized. Bypassing SSR.');
        return true;
      }

      // Create a fresh context for isolation
      // IMPORTANT: We do NOT use `extraHTTPHeaders` globally because it attaches the header to EVERY request
      // Playwright makes (including CORS requests to FontAwesome or API requests).
      // Instead, we will set the header ONLY for the initial navigation request to our server.
      const context = await this.browser.newContext();
      const page = await context.newPage();

      try {
        // Intercept ONLY requests going to our local server and append the bypass header
        await page.route('**/*', route => {
          const request = route.request();

          // Only append the x-ssr-browser header for requests to the local server that are NOT API requests
          const isLocal = request.url().startsWith(targetUrl) || request.url().includes('localhost') || request.url().includes('127.0.0.1');
          const isApi = request.url().includes('/api/');

          if (isLocal && !isApi) {
            const headers = {
              ...request.headers(),
              'x-ssr-browser': 'playwright'
            };
            route.continue({ headers }).catch(() => {});
          } else {
            // For external requests (like font-awesome CORS) or API calls, do not add the custom header
            route.continue().catch(() => {});
          }
        });

        // 3. Navigate to the page and wait for the framework to finish rendering
        // but normally Playwright just navigates to the targetUrl and loads the real SPA resources.

        // 💡 Playwright ↔ Framework 통신 설정
        // 프론트엔드의 `bootfactory.ts` 안의 `onRouteChanged` 등에서
        // `if (window.onPlaywrightReady) window.onPlaywrightReady()` 라고 호출해주면,
        // 아래의 Promise가 즉시 resolve 되도록 연결합니다.
        let resolvePlaywrightReady: () => void;
        const playwrightReadyPromise = new Promise<void>(resolve => {
          resolvePlaywrightReady = resolve;
        });

        await page.exposeFunction('onPlaywrightReady', () => {
          console.log('⚡️ [SSR:Playwright] Received "onPlaywrightReady" signal from framework!');
          resolvePlaywrightReady();
        });

        // 3. Navigate to the page and wait for the framework to finish rendering
        // Since the server will return the `index.html` (due to the bypass header), Playwright will download
        // your main.js / bundle.js, evaluate it, and the Custom Elements will register themselves naturally!
        await page.goto(targetUrl, {
          waitUntil: this.config.playwright?.waitUntil ?? 'networkidle',
          timeout: this.config.playwright?.timeout ?? 15000
        });

        // 💡 Framework Load Wait (Crucial for SWC)
        // Wait for EITHER the framework to call `window.onPlaywrightReady()` OR a specific innerHTML condition
        await Promise.race([
          playwrightReadyPromise, // 직접 exposeFunction에서 트리거된 Promise

          page.waitForFunction(
            () => {
              // Fallback 1: If explicit signal variable is set
              return (window as any)._playwrightReadySignalFired === true;
            },
            { timeout: this.config.playwright?.timeout ?? 15000 }
          ),

          page.waitForFunction(
            () => {
              // Fallback 2: If no signal, just wait until body has content
              return document.body.innerHTML.trim().length > 100;
            },
            { timeout: this.config.playwright?.timeout ?? 15000 }
          )
        ]).catch(() => console.log('Wait for app mount timeout... proceeding anyway'));

        // 강제로 컴포넌트 렌더링 및 폰트어썸 등 리소스 로딩 대기 시간 추가 (안전 장치)
        // onPlaywrightReady 신호가 떨어져도, 비동기 렌더링(SwcLoop 등)이 DOM에 완전히 반영되는 데
        // 약간의 Microtask 지연이 있을 수 있으므로 아주 짧게만 기다려 줍니다.
        // await new Promise(resolve => setTimeout(resolve, 300));

        // Optional: Wait for a specific component to be visible
        if (this.config.playwright?.waitForSelector) {
          await page.waitForSelector(this.config.playwright.waitForSelector, {
            timeout: this.config.playwright?.timeout ?? 15000
          });
        }

        // Optional: Hardcoded wait time if explicitly set (fallback)
        if (this.config.playwright?.waitForTimeout) {
          await page.waitForTimeout(this.config.playwright.waitForTimeout);
        }

        // 4. Set SSR Attribute before extracting HTML
        await page.evaluate(() => {
          document.body.setAttribute('ssr-use', 'true');
        });

        // 5. Generate Final HTML
        const html = await page.evaluate(ignoreTags => {
          const skipTags = new Set(ignoreTags || []);

          function serializeNode(node: Node, inBody: boolean = false): string {
            if (node.nodeType === Node.TEXT_NODE) {
              const text = node.textContent || '';
              return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }
            if (node.nodeType === Node.COMMENT_NODE) {
              return `<!--${node.textContent}-->`;
            }
            if (node.nodeType !== Node.ELEMENT_NODE) {
              return '';
            }

            const el = node as Element;
            const tag = el.tagName.toLowerCase();
            const isBody = tag === 'body';
            const isInsideBody = inBody || isBody;

            // 🚫 Skip ignored tags (like <style>) ONLY if we are inside the <body>.
            // This ensures <style> tags in the <head> (global styles) are preserved!
            if (isInsideBody && skipTags.has(tag)) {
              return '';
            }

            let s = `<${tag}`;

            // 1. Serialize Attributes
            for (let i = 0; i < el.attributes.length; i++) {
              const attr = el.attributes[i];
              s += ` ${attr.name}="${attr.value.replace(/"/g, '&quot;')}"`;
            }

            // Handle void elements (self-closing)
            const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
            if (voidElements.has(tag)) {
              s += '>';
              return s;
            }
            s += '>';

            // 2. Serialize Shadow DOM (Declarative Shadow DOM)
            // MUST KEEP for SSR: Without this, the user receives an empty shell until JS loads and re-renders everything.
            // This allows the browser to paint the full UI (including styles inside the component) immediately.
            if (el.shadowRoot) {
              s += `<template shadowrootmode="${el.shadowRoot.mode}">`;
              for (let i = 0; i < el.shadowRoot.childNodes.length; i++) {
                s += serializeNode(el.shadowRoot.childNodes[i], isInsideBody);
              }
              s += '</template>';
            }

            // 3. Serialize Light DOM Children
            for (let i = 0; i < el.childNodes.length; i++) {
              s += serializeNode(el.childNodes[i], isInsideBody);
            }

            s += `</${tag}>`;
            return s;
          }

          let result = '<!DOCTYPE html>\n<html';
          const htmlNode = document.documentElement;
          for (let i = 0; i < htmlNode.attributes.length; i++) {
            const attr = htmlNode.attributes[i];
            result += ` ${attr.name}="${attr.value.replace(/"/g, '&quot;')}"`;
          }
          result += '>\n';

          if (document.head) result += serializeNode(document.head, false);
          result += '\n';
          if (document.body) result += serializeNode(document.body, true);

          result += '\n</html>';
          return result;
        }, this.config.playwright?.ignoreTags || []);
        console.log(`💈 [SSR:Playwright] Successfully rendered ${targetUrl}`);

        await this.writeOkHtmlAndEnd({ rr }, this.makeHTML(html));
      } catch (e) {
        console.error(`Playwright SSR Error for ${targetUrl}:`, e);
        // If Playwright fails (e.g., timeout), we bypass SSR so the client at least gets the CSR app
        return true;
      } finally {
        await context.close();
      }
      return false; // Tell SimpleBootHttpServer to stop routing because we've handled the response
    }
    return true;
  }

  makeHTML(html: string) {
    if (!/^<!DOCTYPE html>/i.test(html)) {
      html = '<!DOCTYPE html>\n' + html;
    }
    return html;
  }

  async writeOkHtmlAndEnd({ rr, status = HttpStatus.Ok }: { rr: RequestResponse; status?: HttpStatus }, html: string) {
    rr.resStatusCode(status);
    rr.resSetHeader(HttpHeaders.ContentType, Mimes.TextHtml);
    await rr.resEnd(html);
  }

  async proceedAfter() {
    return true;
  }
}
