# 제2장: 가장 단순한 템플릿 엔진 만들기

반응성 시스템이 데이터를 감지하는 '뇌'라면, 템플릿 엔진은 변경 사항을 화면에 그려내는 '손'입니다. 이 장에서는 HTML 템플릿을 분석하여 동적인 부분과 정적인 부분을 분리하고, 이를 데이터와 결합하여 실제 DOM으로 변환하는 과정을 단계별로 구현합니다.

## 2.1. 템플릿 파싱의 첫걸음

우리의 템플릿 엔진은 특별한 문법을 가집니다. 예를 들어, `${this.name}$`은 텍스트를, `#{this.htmlContent}#`는 HTML을 삽입합니다. 가장 먼저 할 일은 주어진 HTML 문자열에서 이런 표현식들을 찾아내는 것입니다.

정규표현식(Regular Expression)은 이 작업을 위한 강력한 도구입니다. `dom-render`에서는 `RawSet.expressionGroups` 메소드 내부에서 다음과 유사한 정규표현식을 사용합니다.

```javascript
// `${...}$` 또는 `#{...}#` 형태의 표현식을 찾는 정규표현식
const expressionRegex = /[$#]\{([\s\S.]*?)\}[$#]/g;

const template = '<div><p>Hello, ${this.user.name}$</p> <div class="content">#{this.post.content}#</div> </div>';

// String.prototype.matchAll() 또는 커스텀 유틸리티를 사용해 모든 일치 항목을 찾습니다.
const matches = Array.from(template.matchAll(expressionRegex));

// 결과:
// matches[0] -> ["${this.user.name}$", "this.user.name"]
// matches[1] -> ["#{this.post.content}#", "this.post.content"]
```

이 과정을 통해 우리는 템플릿의 어느 부분이 동적으로 변경되어야 하는지, 그리고 어떤 데이터에 의존하는지를 알 수 있습니다.

## 2.2. `RawSet`의 개념 설계

템플릿 전체를 하나의 큰 덩어리로 관리하는 것은 비효율적입니다. `this.user.name`이 바뀔 때마다 전체 템플릿을 다시 파싱하고 렌더링하는 것은 낭비입니다. 우리는 변경이 필요한 부분만 정확히 교체하고 싶습니다.

여기서 **`RawSet`** 이라는 핵심 개념이 등장합니다. `RawSet`은 **하나의 동적 표현식을 관리하는 최소 단위**입니다. 각 `RawSet`은 DOM 내에서 자신의 위치를 기억해야 합니다. `dom-render`는 이를 위해 주석 노드(Comment Node)나 `meta` 태그를 사용합니다.

```html
<!-- 원본 템플릿 -->
<p>Hello, ${this.user.name}$</p>

<!-- 파싱 후 DOM 구조 (개념적) -->
<p>
  Hello, 
  <!-- RawSet-UUID-12345-start -->
  <!-- 이 사이에 this.user.name의 값이 들어감 -->
  <!-- RawSet-UUID-12345-end -->
</p>
```

이렇게 하면, `this.user.name`이 변경되었을 때, 우리는 DOM 전체를 검색할 필요 없이 `RawSet-UUID-12345`에 해당하는 시작과 끝 지점 사이의 내용만 교체하면 됩니다.

`RawSet` 클래스는 다음과 같은 정보를 가집니다.

-   `uuid`: 각 `RawSet`을 식별하는 고유 ID.
-   `type`: 이것이 텍스트 노드인지(`TEXT`), 속성인지(`TARGET_ATTR`), 아니면 커스텀 엘리먼트인지(`TARGET_ELEMENT`) 구분.
-   `point`: DOM 내의 시작(`start`)과 끝(`end`) 노드에 대한 참조.
-   `dataSet`: 렌더링에 필요한 원본 템플릿 조각(`fragment`), 설정(`config`) 등의 정보.

`RawSet.checkPointCreates` 메소드는 주어진 DOM 노드를 순회하며 동적인 부분을 찾아내고, 위와 같은 구조로 `RawSet` 객체들을 생성하여 반환하는 역할을 합니다.

## 2.3. 1회성 렌더링 함수 구현

이제 반응성을 잠시 잊고, 주어진 데이터로 템플릿을 한 번만 렌더링하는 함수를 만들어 봅시다. 이 과정은 `RawSet.render` 메소드의 핵심 로직과 유사합니다.

1.  **`checkPointCreates` 호출:** 템플릿 문자열을 DOM 노드로 변환한 후, `RawSet.checkPointCreates`를 호출하여 `RawSet` 배열을 얻습니다.

2.  **`RawSet` 순회:** 각 `RawSet`을 순회하며 다음을 수행합니다.
    a.  `RawSet`이 가진 템플릿 조각(예: `${this.user.name}$`)에서 표현식(예: `this.user.name`)을 추출합니다.
    b.  `ScriptUtils.evalReturn` 같은 유틸리티를 사용해, 주어진 데이터 객체(`obj`)와 표현식을 기반으로 실제 값을 계산합니다. (단순히 `eval`을 사용하는 것은 보안상 위험하므로, 실제로는 `new Function()` 등을 사용해 스코프를 제한하는 것이 좋습니다.)
    c.  계산된 값으로 새로운 텍스트 노드나 DOM 요소를 생성합니다.
    d.  `RawSet`의 `point.start`와 `point.end` 사이의 기존 내용을 모두 지우고, 새로 생성된 노드를 삽입합니다.

이 과정을 모든 `RawSet`에 대해 반복하면, 템플릿은 완전히 렌더링된 DOM으로 변환됩니다.

```javascript
// 개념적인 1회성 렌더링 함수
function initialRender(templateString, data) {
  const targetElement = document.createElement('div');
  targetElement.innerHTML = templateString;

  const rawSets = RawSet.checkPointCreates(targetElement, data, config);

  for (const rawSet of rawSets) {
    // rawSet.render는 내부적으로 표현식을 평가하고 DOM을 교체합니다.
    rawSet.render(data, config);
  }

  return targetElement;
}
```

지금까지 우리는 템플릿을 분석하고, 동적 단위를 `RawSet`으로 정의했으며, 이를 기반으로 DOM을 생성하는 방법을 구현했습니다. 이제 다음 장에서는 1장에서 만든 반응성 시스템과 2장에서 만든 템플릿 엔진을 결합하여, 데이터 변경에 따라 DOM이 자동으로 업데이트되는 진정한 반응형 프레임워크의 심장을 만들어 보겠습니다.
