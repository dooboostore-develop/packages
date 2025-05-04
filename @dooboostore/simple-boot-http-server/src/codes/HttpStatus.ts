export enum HttpStatus {
    Ok = 200,

    /**
     * HTTP 301 Moved Permanently 리디렉션 상태 응답 코드는 요청한 리소스가 Location 헤더에 주어진 URL로 완전히 옮겨졌다는 것을 나타냅니다. 브라우저는 이 페이지로 리디렉트하고, 검색 엔진은 해당 리소스로 연결되는 링크를 갱신합니다.
     */
    MovedPermanently = 301,
    /**
     * https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/302
     * HTTP(HyperText Transfer Protocol) 302 Found 리디렉션 상태 응답 코드는 요청한 리소스가 Location 헤더에 지정된 URL로 일시적으로 이동되었음을 나타냅니다. 브라우저는 이 페이지로 리디렉션되지만 검색 엔진은 리소스에 대한 링크를 업데이트하지 않습니다('SEO-speak'에서는 'link-juice'가 새 URL로 전송되지 않는다고 합니다).
     * 명세서에서 리디렉션이 수행될 때 메서드(및 본문)가 변경되지 않도록 요구하더라도 모든 사용자 에이전트가 이를 준수하는 것은 아닙니다. 여러분은 여전히 이러한 유형의 버그가 있는 소프트웨어를 찾을 수 있습니다. 따라서 따라서 302 코드는 GET 또는 HEAD 메서드에 대한 응답으로만 설정하고 이 경우 메서드 변경이 명시적으로 금지되므로 307 Temporary Redirect 를 대신 사용하는 것이 좋습니다.
     * 사용하던 메서드를 GET으로 변경하려는 경우, 303 See Other을 대신 사용하십시오. PUT 메서드에 대한 응답을 업로드된 리소스가 아니라 'You successfully updown XYZ'와 같은 확인 메시지로 주고 싶을때 유용합니다.
     */
    Found = 302,
    /**
     * HTTP(HyperText Transfer Protocol) 303 See Other 리디렉션 상태 응답 코드는 리디렉션이 요청한 리소스 자체에 연결되지 않고 다른 페이지(예: 확인 페이지, 실제 개체 표시(HTTP range-14 참조) 또는 업로드 진행률 페이지)에 연결됨을 나타냅니다. 이 응답 코드는 PUT 또는 POST의 결과로 다시 전송되는 경우가 많습니다. 이 리디렉션 페이지를 표시하는 데 사용되는 방법은 항상 GET입니다.
     */
    SeeOther = 303,
    /**
     * 클라이언트 리디렉션 응답 코드 304 Not Modified 는 요청된 리소스를 재전송할 필요가 없음을 나타낸다. 캐시된 자원으로의 암묵적인 리디렉션이다. 이 는 GET 나 HEAD 요청처럼 요청 방법이 안전 한 경우 또는 요청이 조건부로 If-None-Match 또는 If-Modified-Since 헤더를 사용할 때 응답 된다.
     * 이에 상응하는 200 OK 응답에는 Cache-Control, Content-Location, Date, ETag, Expires, 그리고 Vary 가 포함되어 있었을 것이다.
     */
    NotModified = 304,
    /**
     * HTTP 307 Temporary Redirect 리다이렉트 상태 응답 코드는 요청한 리소스가 Location 헤더에 주어진 URL 로 임시로 옮겨졌다는 것을 나타냅니다.
     * 원래 요청한 메소드와 Body 를 재사용하여 요청을 리다이렉트 합니다. 여기서 메소드를 GET으로 바꾸기 위해서 303 See Other를 사용하시면 됩니다. 이것은 PUT요청에 업로드된 리소스가 아닌 "You successfully uploaded XYZ"와 같은 확인메시지 응답을 제공 하는데에 유용합니다.
     * 307과 302가 유일하게 다른점은 307은 Method 와 Body 를 변경하지 않고 리다이렉트 요청을 하도록 보장합니다. 302응답으로 인하여 일부 오래된 클라이언트들은 메소드를 GET으로 틀리게 변경하였습니다. GET이 아닌 다른 메소드에 302동작은 웹에서 예상되지 않지만 307 동작은 예상할수 있습니다. GET 요청에 대해서는 동일하게 동작 합니다.
     */
    TemporaryRedirect = 307,
    /**
     * 하이퍼텍스트 전송 프로토콜 (HTTP) 308 Permanent Redirect 리디렉션 상태 응답 코드는 요청된 리소스가 Location 헤더에 지정된 URL로 확실히 이동되었음을 나타냅니다. 브라우저가 이 페이지로 리디렉션되고 검색엔진은 리소스에 대한 링크를 업데이트합니다('SEO-speak'에서는 'link-juice'가 새 URL로 전송됩니다).
     * 요청 메서드와 본문은 변경되지 않지만, 301은 때때로 GET 메서드로 잘못 변경될 수 있습니다.
     */
    PermanentRedirect = 308,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
    HttpVersionNotSupported = 505
}
