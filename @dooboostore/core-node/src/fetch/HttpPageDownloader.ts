import { HttpFetcher, HttpFetcherRequest } from '@dooboostore/core/fetch/HttpFetcher';
import * as fs from "fs";
import * as path from "path";

export class HttpPageDownloader {
    constructor(
        private baseUrl: string,
        private httpFetcher: HttpFetcher = new HttpFetcher()
    ) {}

    async download(route: string): Promise<string> {
        const url = `${this.baseUrl}${route}`;
        const request: HttpFetcherRequest = {
            target: { url },
        };
        const response = await this.httpFetcher.get(request);
        const blob = await response.blob()
        return await blob.text();
    }

    public async downloadAndSave(outputDir: string, route: string): Promise<void> {
        try {
            console.log(`Generating page for route: ${route}`);
            const htmlContent = await this.download(route);

            const filePath = this.getFilePathForRoute(outputDir, route);
            const dir = path.dirname(filePath);
            this.ensureDirectoryExists(dir);

            fs.writeFileSync(filePath, htmlContent, "utf8");
            console.log(`Generated: ${filePath}`);
        } catch (error) {
            console.error(`Error generating page for route ${route}:`, error);
        }
    }

    public async downloadAndSaveAll(outputDir: string, routes: string[]): Promise<void> {
        for (const route of routes) {
            await this.downloadAndSave(outputDir, route);
        }
    }

    private getFilePathForRoute(outputDir: string, route: string): string {
        if (route === "/") {
            return path.join(outputDir, "index.html");
        }

        const cleanRoute = route.replace(/^\//, "").replace(/\/$/, "");

        if (cleanRoute === "") {
            return path.join(outputDir, "index.html");
        }

        return path.join(outputDir, cleanRoute, "index.html");
    }

    private ensureDirectoryExists(dirPath: string) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
}