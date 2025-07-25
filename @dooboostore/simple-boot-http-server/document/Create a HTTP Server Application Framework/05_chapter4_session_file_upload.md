# 제4장: 세션 관리와 파일 업로드

웹 애플리케이션에서 사용자 상태를 유지하고 클라이언트로부터 파일을 받는 것은 매우 흔한 요구사항입니다. `Simple-Boot-HTTP-Server`는 이러한 기능을 내장하여 개발자가 복잡한 구현 없이도 세션 관리와 파일 업로드를 처리할 수 있도록 돕습니다. 이 장에서는 세션 관리 시스템과 파일 업로드 처리 방법에 대해 알아봅니다.

## 4.1. 세션 관리 시스템

HTTP는 기본적으로 무상태(stateless) 프로토콜입니다. 즉, 각 요청은 독립적으로 처리되며 이전 요청에 대한 정보를 기억하지 않습니다. 세션(Session)은 이러한 무상태의 한계를 극복하고, 클라이언트와 서버 간의 연속적인 상호작용에서 사용자별 상태를 유지하기 위한 메커니즘입니다.

`Simple-Boot-HTTP-Server`는 다음과 같은 세션 관리 기능을 제공합니다.

-   **세션 ID 쿠키:** 클라이언트에게 고유한 세션 ID를 포함하는 쿠키를 자동으로 발급하고 관리합니다.
-   **메모리 기반 저장소:** 기본적으로 서버 메모리에 세션 데이터를 저장합니다. (확장 가능)
-   **세션 만료:** 설정된 시간(`expiredTime`)이 지나면 세션 데이터를 자동으로 정리합니다.
-   **`SessionManager`:** 세션 데이터의 생성, 조회, 업데이트, 삭제를 담당하는 핵심 클래스입니다.

### 구현 원리

`SimpleBootHttpServer`는 `HttpServerOption`에 정의된 `sessionOption`을 사용하여 `SessionManager`를 초기화합니다. 각 HTTP 요청이 들어올 때, `RequestResponse` 객체는 요청 헤더에서 세션 ID 쿠키를 확인합니다.

-   **새로운 세션:** 세션 ID 쿠키가 없으면, `SessionManager`는 새로운 세션 ID를 생성하고, `Set-Cookie` 헤더를 통해 클라이언트에게 세션 ID 쿠키를 발급합니다.
-   **기존 세션:** 세션 ID 쿠키가 있으면, 해당 ID로 `SessionManager`에서 세션 데이터를 조회합니다. 세션 데이터의 `access` 타임스탬프를 업데이트하여 세션 만료 시간을 갱신합니다.

라우트 핸들러에서는 `RequestResponse` 객체의 `reqSession()` 메소드를 통해 현재 요청의 세션 데이터에 접근할 수 있습니다. 이 메소드는 세션 데이터를 비동기적으로 로드하여 반환합니다.

```typescript
// session/SessionManager.ts (개념적)
export class SessionManager {
    private sessions = new Map<string, { access: number, data?: any }>(); // 기본 메모리 저장소

    constructor(private option: HttpServerOption) {
        this.sessionOption = option.sessionOption;
        // 주기적으로 만료된 세션 정리
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

        let dataSet = await this.getSessionDataSet(uuid); // 저장소에서 세션 데이터 조회
        const now = Date.now();

        if (dataSet) {
            if (this.isExpired(dataSet.access, now)) {
                delete dataSet.data; // 만료되었으면 데이터 초기화
            }
            dataSet.access = now; // 접근 시간 갱신
        } else {
            dataSet = { access: now }; // 새 세션 데이터 생성
        }
        await this.setSessionDataSet(uuid, dataSet); // 저장소에 세션 데이터 저장/업데이트
        return { uuid, dataSet };
    }

    // ... getSessionDataSet, setSessionDataSet, deleteSession 등 내부 메소드 ...
}
```

### 예제: 세션 관리 사용

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
        const session = await rr.reqSession(); // 현재 요청의 세션 데이터 가져오기

        let visitCount = session.visitCount || 0;
        visitCount++;
        session.visitCount = visitCount; // 세션 데이터 업데이트

        return { message: `You have visited this page ${visitCount} times.`, sessionId: session.uuid };
    }

    @Route({ path: '/session-reset' })
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    async sessionReset(rr: RequestResponse) {
        const session = await rr.reqSession();
        await rr.config.sessionManager?.deleteSession(session.uuid); // 세션 삭제
        return { message: 'Session reset successfully.' };
    }
}

const httpServerOption = new HttpServerOption({
    listen: { port: 3000 },
    sessionOption: { // 세션 옵션 설정
        key: 'MY_APP_SESSION',
        expiredTime: 1000 * 60 * 5, // 5분
        // provider: { ... 커스텀 세션 저장소 구현 가능 ... }
    }
});

const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server Session Management example started.');

/*
터미널에서 다음 명령어로 테스트:

# 여러 번 요청하여 방문 횟수 증가 확인
curl -v http://localhost:3000/session-test
curl -v http://localhost:3000/session-test

# 세션 초기화 후 다시 요청
curl -v http://localhost:3000/session-reset
curl -v http://localhost:3000/session-test
*/
```

## 4.2. 파일 업로드 처리

웹 애플리케이션에서 파일 업로드는 `multipart/form-data` Content-Type을 통해 이루어집니다. `Simple-Boot-HTTP-Server`는 이러한 요청을 파싱하여 파일과 텍스트 필드를 쉽게 처리할 수 있도록 돕습니다.

### 구현 원리

`RequestResponse` 객체는 `reqBodyMultipartFormData()` 메소드를 제공하여 `multipart/form-data` 요청의 바디를 파싱합니다. 이 메소드는 요청 스트림을 읽어 `Content-Type` 헤더의 `boundary`를 기준으로 각 파트를 분리합니다. 각 파트의 헤더(Content-Disposition, Content-Type 등)를 분석하여 파일인지 일반 텍스트 필드인지를 구분하고, 파싱된 데이터를 `MultipartData` 객체 배열로 반환합니다.

-   **`MultipartData`:** 파싱된 각 파트의 정보를 담는 타입입니다. `isFile` 속성을 통해 파일 여부를 판단하고, `name`, `filename`, `contentType`, `value` (Buffer 또는 string) 등의 정보를 가집니다.
-   **`reqBodyMultipartFormDataObject<T>()`:** 파싱된 `MultipartData` 배열을 일반 JavaScript 객체로 변환하여 반환하는 헬퍼 메소드입니다. 파일 데이터는 임시 경로에 저장하고 해당 경로를 반환합니다.

```typescript
// models/RequestResponse.ts (개념적 - 파일 업로드 관련)
export class RequestResponse {
  // ...
  async reqBodyMultipartFormData(): Promise<MultipartData[]> { /* ... 파싱 로직 ... */ }

  async reqBodyMultipartFormDataObject<T>(): Promise<T> {
    const m = await this.reqBodyMultipartFormData();
    const formData = {} as any;

    for (const it of m) {
      if (it.isFile) {
        // 파일인 경우 임시 경로에 저장하고 경로를 반환
        // 실제 구현에서는 FileUtils.writeFile 등을 사용
        const tempFilePath = `/tmp/${it.filename}-${Math.random().toString(36).substring(2, 9)}`;
        // fs.writeFileSync(tempFilePath, it.value); // 실제 파일 쓰기
        formData[it.name] = tempFilePath; // 파일 경로 저장
      } else {
        // 텍스트 필드인 경우 값 저장
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

### 예제: 파일 업로드 처리

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, POST, Mimes } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { ReqMultipartFormBody } from '@dooboostore/simple-boot-http-server/models/datas/body/ReqMultipartFormBody';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// 임시 파일 저장 경로 설정
const UPLOAD_DIR = path.join(os.tmpdir(), 'simple-boot-uploads');

// 업로드 디렉토리 생성 (서버 시작 시)
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
            // reqBodyMultipartFormDataObject를 사용하여 파일과 필드 데이터 파싱
            const formData: { description?: string; myFile?: string } = await rr.reqBodyMultipartFormDataObject();

            const description = formData.description || 'No description';
            const filePath = formData.myFile; // 파일은 임시 경로에 저장됨

            if (filePath && fs.existsSync(filePath)) {
                const newFileName = `uploaded_${path.basename(filePath)}`;
                const destinationPath = path.join(UPLOAD_DIR, newFileName);
                fs.renameSync(filePath, destinationPath); // 임시 파일을 영구 저장소로 이동
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
                // 파일 데이터는 Buffer로 제공됨
                const tempFilePath = path.join(UPLOAD_DIR, `raw_upload_${part.filename}`);
                fs.writeFileSync(tempFilePath, part.value); // 파일 저장
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
    fileUploadTempPath: UPLOAD_DIR, // 파일 업로드 임시 경로 설정
});

const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server File Upload example started.');

/*
터미널에서 다음 명령어로 테스트 (my_file.txt는 실제 존재하는 파일로 대체):

# 일반 파일 업로드
curl -X POST -F "description=This is a test file" -F "myFile=@./my_file.txt" http://localhost:3000/upload

# Raw Multipart Form Body 테스트
curl -X POST -F "description=Another test" -F "myFile=@./my_file.txt" http://localhost:3000/upload-raw
*/
```

세션 관리와 파일 업로드 처리는 웹 애플리케이션에서 사용자 상호작용을 풍부하게 하고 데이터를 교환하는 데 필수적인 기능입니다. `Simple-Boot-HTTP-Server`는 이러한 복잡한 기능들을 추상화하여 개발자가 쉽게 사용할 수 있도록 돕습니다.

다음 장에서는 `Simple-Boot-HTTP-Server`가 `Simple-Boot Core`의 강력한 기능들을 어떻게 활용하여 서버 애플리케이션을 구축하는지 알아보겠습니다.
