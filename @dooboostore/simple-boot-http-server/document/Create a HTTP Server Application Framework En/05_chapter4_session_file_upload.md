# Chapter 4: Session Management and File Uploads

In web applications, maintaining user state and receiving files from clients are very common requirements. `Simple-Boot-HTTP-Server` has these features built-in to help developers handle session management and file uploads without complex implementation. This chapter explores the session management system and how to handle file uploads.

## 4.1. Session Management System

HTTP is fundamentally a stateless protocol. This means that each request is handled independently, and no information about previous requests is remembered. A session is a mechanism to overcome this stateless limitation and maintain a user-specific state in a continuous interaction between the client and the server.

`Simple-Boot-HTTP-Server` provides the following session management features:

-   **Session ID Cookie:** Automatically issues and manages a cookie containing a unique session ID to the client.
-   **Memory-based Storage:** By default, session data is stored in the server's memory (expandable).
-   **Session Expiration:** Automatically cleans up session data after a set time (`expiredTime`).
-   **`SessionManager`:** The core class responsible for creating, retrieving, updating, and deleting session data.

### Implementation Principle

`SimpleBootHttpServer` initializes `SessionManager` using the `sessionOption` defined in `HttpServerOption`. When each HTTP request comes in, the `RequestResponse` object checks for a session ID cookie in the request header.

-   **New Session:** If there is no session ID cookie, `SessionManager` creates a new session ID and issues a session ID cookie to the client through the `Set-Cookie` header.
-   **Existing Session:** If there is a session ID cookie, the session data is retrieved from `SessionManager` with that ID. The `access` timestamp of the session data is updated to renew the session expiration time.

In the route handler, the session data for the current request can be accessed through the `reqSession()` method of the `RequestResponse` object. This method loads and returns the session data asynchronously.

```typescript
// session/SessionManager.ts (Conceptual)
export class SessionManager {
    private sessions = new Map<string, { access: number, data?: any }>(); // Default memory storage

    constructor(private option: HttpServerOption) {
        this.sessionOption = option.sessionOption;
        // Periodically clean up expired sessions
        setInterval(async () => { /* ... */ }, this.sessionOption.expiredTime);
    }

    async session(rrOrUUID?: string | RequestResponse): Promise<{ uuid: string, dataSet: { access: number, data?: any } }> {
        let uuid: string;
        if (rrOrUUID instanceof RequestResponse) {
            uuid = rrOrUUID.reqCookieGet(this.sessionOption.key) ?? this.makeUUID();
        } else if (typeof rrOrUUID === 'string') {
            uuid = rrOrUUID;
        } else {
            uuid = this.makeUUID();
        }

        let dataSet = await this.getSessionDataSet(uuid); // Retrieve session data from storage
        const now = Date.now();

        if (dataSet) {
            if (this.isExpired(dataSet.access, now)) {
                delete dataSet.data; // Clear data if expired
            }
            dataSet.access = now; // Update access time
        } else {
            dataSet = { access: now }; // Create new session data
        }
        await this.setSessionDataSet(uuid, dataSet); // Save/update session data in storage
        return { uuid, dataSet };
    }

    // ... internal methods like getSessionDataSet, setSessionDataSet, deleteSession ...
}
```

### Example: Using Session Management

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, GET, Mimes } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route } from '@dooboostore/simple-boot';

@Sim
@Router({ path: '' })
export class AppRouter {
    @Route({ path: '/session-test' })
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    async sessionTest(rr: RequestResponse) {
        const session = await rr.reqSession(); // Get session data for the current request

        let visitCount = session.visitCount || 0;
        visitCount++;
        session.visitCount = visitCount; // Update session data

        return { message: `You have visited this page ${visitCount} times.`, sessionId: session.uuid };
    }

    @Route({ path: '/session-reset' })
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    async sessionReset(rr: RequestResponse) {
        const session = await rr.reqSession();
        await rr.config.sessionManager?.deleteSession(session.uuid); // Delete session
        return { message: 'Session reset successfully.' };
    }
}

const httpServerOption = new HttpServerOption({
    listen: { port: 3000 },
    sessionOption: { // Session option configuration
        key: 'MY_APP_SESSION',
        expiredTime: 1000 * 60 * 5, // 5 minutes
        // provider: { ... custom session storage implementation possible ... }
    }
});

const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server Session Management example started.');

/*
Test with the following commands in the terminal:

# Request multiple times to see the visit count increase
curl -v http://localhost:3000/session-test
curl -v http://localhost:3000/session-test

# Reset the session and request again
curl -v http://localhost:3000/session-reset
curl -v http://localhost:3000/session-test
*/
```

## 4.2. Handling File Uploads

In web applications, file uploads are done through the `multipart/form-data` Content-Type. `Simple-Boot-HTTP-Server` helps to easily handle these requests by parsing them into files and text fields.

### Implementation Principle

The `RequestResponse` object provides the `reqBodyMultipartFormData()` method to parse the body of a `multipart/form-data` request. This method reads the request stream and separates each part based on the `boundary` in the `Content-Type` header. It analyzes the headers of each part (Content-Disposition, Content-Type, etc.) to distinguish between files and regular text fields, and returns the parsed data as an array of `MultipartData` objects.

-   **`MultipartData`:** A type that contains the information of each parsed part. It uses the `isFile` property to determine if it is a file and has information such as `name`, `filename`, `contentType`, and `value` (Buffer or string).
-   **`reqBodyMultipartFormDataObject<T>()`:** A helper method that converts the parsed `MultipartData` array into a regular JavaScript object and returns it. File data is saved to a temporary path, and that path is returned.

```typescript
// models/RequestResponse.ts (Conceptual - File upload related)
export class RequestResponse {
  // ...
  async reqBodyMultipartFormData(): Promise<MultipartData[]> { /* ... parsing logic ... */ }

  async reqBodyMultipartFormDataObject<T>(): Promise<T> {
    const m = await this.reqBodyMultipartFormData();
    const formData = {} as any;

    for (const it of m) {
      if (it.isFile) {
        // If it's a file, save it to a temporary path and return the path
        // In a real implementation, FileUtils.writeFile would be used
        const tempFilePath = `/tmp/${it.filename}-${Math.random().toString(36).substring(2, 9)}`;
        // fs.writeFileSync(tempFilePath, it.value); // Actual file writing
        formData[it.name] = tempFilePath; // Save file path
      } else {
        // If it's a text field, save the value
        const target = formData[it.name];
        if (Array.isArray(target)) {
          target.push(it.value);
        } else if (typeof target === 'string') {
          formData[it.name] = [target, it.value];
        } else {
          formData[it.name] = it.value;
        }
      }
    }
    return formData;
  }
  // ...
}
```

### Example: Handling File Uploads

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, POST, Mimes } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { ReqMultipartFormBody } from '@dooboostore/simple-boot-http-server/models/datas/body/ReqMultipartFormBody';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Set temporary file storage path
const UPLOAD_DIR = path.join(os.tmpdir(), 'simple-boot-uploads');

// Create upload directory (on server start)
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Sim
@Router({ path: '' })
export class AppRouter {
    @Route({ path: '/upload' })
    @POST({
        req: { contentType: [Mimes.MultipartFormData] },
        res: { contentType: Mimes.ApplicationJson }
    })
    async uploadFile(rr: RequestResponse) {
        try {
            // Parse file and field data using reqBodyMultipartFormDataObject
            const formData: { description?: string; myFile?: string } = await rr.reqBodyMultipartFormDataObject();

            const description = formData.description || 'No description';
            const filePath = formData.myFile; // The file is saved in a temporary path

            if (filePath && fs.existsSync(filePath)) {
                const newFileName = `uploaded_${path.basename(filePath)}`;
                const destinationPath = path.join(UPLOAD_DIR, newFileName);
                fs.renameSync(filePath, destinationPath); // Move the temporary file to permanent storage
                console.log(`File saved to: ${destinationPath}`);
                return { success: true, message: 'File uploaded successfully', description, filePath: destinationPath };
            } else {
                return { success: false, message: 'No file uploaded or file not found.', description };
            }
        } catch (error: any) {
            console.error('File upload error:', error);
            return { success: false, message: `File upload failed: ${error.message}` };
        }
    }

    @Route({ path: '/upload-raw' })
    @POST({
        req: { contentType: [Mimes.MultipartFormData] },
        res: { contentType: Mimes.ApplicationJson }
    })
    async uploadFileRaw(body: ReqMultipartFormBody) {
        console.log('Raw Multipart Form Body:', body);
        const uploadedFiles: { name: string; filename: string; size: number; tempPath: string }[] = [];

        for (const part of body.field) {
            if (part.isFile) {
                // File data is provided as a Buffer
                const tempFilePath = path.join(UPLOAD_DIR, `raw_upload_${part.filename}`);
                fs.writeFileSync(tempFilePath, part.value); // Save file
                uploadedFiles.push({
                    name: part.name,
                    filename: part.filename,
                    size: part.value.length,
                    tempPath: tempFilePath
                });
            } else {
                console.log(`Field: ${part.name} = ${part.value}`);
            }
        }
        return { success: true, message: 'Raw file upload processed', files: uploadedFiles };
    }
}

const httpServerOption = new HttpServerOption({
    listen: { port: 3000 },
    fileUploadTempPath: UPLOAD_DIR, // Set temporary file upload path
});

const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server File Upload example started.');

/*
Test with the following command in the terminal (replace my_file.txt with an actual existing file):

# Regular file upload
curl -X POST -F "description=This is a test file" -F "myFile=@./my_file.txt" http://localhost:3000/upload

# Raw Multipart Form Body test
curl -X POST -F "description=Another test" -F "myFile=@./my_file.txt" http://localhost:3000/upload-raw
*/
```

Session management and file upload handling are essential features for enriching user interaction and exchanging data in web applications. `Simple-Boot-HTTP-Server` abstracts these complex features to help developers use them easily.

The next chapter will explore how `Simple-Boot-HTTP-Server` utilizes the powerful features of `Simple-Boot Core` to build server applications.
