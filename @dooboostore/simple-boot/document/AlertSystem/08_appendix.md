# 부록: 더 나아가기

이 책을 통해 우리는 `AlertSystem`의 견고한 기반을 다졌습니다. 하지만 실제 프로덕션 환경에서는 더 다양하고 복잡한 요구사항에 마주치게 됩니다. 이 부록에서는 우리가 만든 시스템을 한 단계 더 발전시킬 수 있는 몇 가지 심화 주제에 대한 아이디어를 소개합니다.

## A.1. 확인/취소 버튼이 있는 알림 만들기

단순 정보 표시를 넘어, 사용자의 입력을 받는 다이얼로그 형태의 알림은 어떻게 만들 수 있을까요? `AlertFactoryConfig`를 확장하여 콜백 함수를 전달하는 방식으로 구현할 수 있습니다.

### 구현 아이디어

1.  **`AlertFactoryConfig` 확장**: `onConfirm?: () => void`, `onCancel?: () => void`, `confirmButtonText?: string` 와 같은 속성을 추가합니다.
2.  **`ConfirmAlertComponent` 구현**: 이 컴포넌트는 `config` 객체를 받아, `title`과 `text` 외에 `confirmButtonText` 등을 사용해 버튼을 렌더링합니다. 각 버튼의 클릭 이벤트에 `onConfirm`, `onCancel` 콜백을 연결하고, 콜백 실행 후 `alert.deActive()`를 호출하여 스스로 닫히도록 만듭니다.
3.  **`ConfirmAlert` 클래스**: `make()` 메소드에서 `new ConfirmAlertComponent(this.config)` 와 같이 컴포넌트에 설정을 전달합니다.
4.  **사용**:
    ```typescript
    alertService.createFromFactory('CONFIRM', { // 문자열로 커스텀 타입 지정
      title: '정말로 삭제하시겠습니까?',
      confirmButtonText: '삭제',
      onConfirm: () => {
        // 실제 삭제 로직 실행
        this.deleteItem(itemId);
      },
      onCancel: () => {
        console.log('삭제가 취소되었습니다.');
      }
    })?.active();
    ```

## A.2. 알림 큐(Queue) 관리

API 호출이 반복문 안에서 실행되는 등, 짧은 시간에 수많은 알림이 동시에 발생하면 화면이 알림으로 뒤덮여 사용자 경험을 해칠 수 있습니다. 이를 방지하기 위해 알림 큐를 도입할 수 있습니다.

### 구현 아이디어

-   **`AlertService` 수정**: `AlertService` 내부에 `alertQueue: Alert<any>[]` 배열과 `isDisplaying: boolean` 플래그를 둡니다.
-   **동작 변경**: `alert.active()`가 호출되면, `isDisplaying`이 `true`이면 즉시 표시하지 않고 `alertQueue`에 추가합니다. `false`이면 알림을 즉시 표시하고 `isDisplaying`을 `true`로 설정합니다.
-   **큐 처리**: 알림이 `deActive`될 때, `isDisplaying`을 `false`로 설정하고, `alertQueue`에 대기 중인 알림이 있다면 하나를 꺼내어 `active()`를 호출해줍니다.

## A.3. 애니메이션 연동

알림이 딱딱하게 나타나고 사라지는 것보다 부드러운 애니메이션이 가미되면 훨씬 보기 좋습니다.

### 구현 아이디어

-   **`Alert` 클래스 수정**: `active()`와 `deActive()` 메소드 로직을 수정합니다.
-   **`active()`**: `make()`를 통해 UI 컴포넌트를 생성하고 DOM에 추가한 직후, 바로 `opacity`를 `1`로 만드는 대신, `gsap`이나 `framer-motion` 같은 애니메이션 라이브러리를 사용하여 `opacity`를 0에서 1로, `transform`을 `translateY(-20px)`에서 `translateY(0)`으로 변경하는 등의 'enter' 애니메이션을 실행합니다.
-   **`deActive()`**: DOM에서 즉시 제거하는 대신, 'leave' 애니메이션(예: `opacity`를 0으로)을 먼저 실행하고, 애니메이션이 끝난 후에 DOM에서 제거하는 로직을 콜백으로 실행합니다.
