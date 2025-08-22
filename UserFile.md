
# 질문

리액트를 활용한 github page를 만들 때, deploy 방법이 
1. deploy from branch
2. deploy from github action
이렇게 있잖아.

근데 내가 2번으로 하려고 했는데 workflow 파일을 첨부한 이미지에 있는 
1. create your own
2. github page jekyll
3. static HTML
이렇게 세 가지 중에 1번을 하려고 했었는데  CI/CD 과정에서 계속 빌드 오류가 뜨더라.

그래서 결국 deploy를 2번이 아니라 1번으로 하면 안정적일 것 같은데, 이 방법이 더 안좋은 것들이 무엇인지 궁금해.
그리고 1번을 했을 때 내가 겪은 빌드 오류를 너가 해결할 방법이 구체적이면 1번을 시도하고 싶어.
---
# 답변

* Deploy from branch 장단점
   - 장점: 간단하고 빠르게 배포할 수 있다.
   - 단점: CI/CD 파이프라인을 활용하지 않기 때문에, 자동화된 테스트나 빌드 과정이 없다.

* Deploy from GitHub Action 장단점
   - 장점: CI/CD 파이프라인을 통해 자동화된 테스트와 빌드 과정을 거칠 수 있다.
   - 단점: 설정이 복잡할 수 있으며, 빌드 오류가 발생할 경우 디버깅이 어려울 수 있다.

* Action으로 CI/CD 자동화하여 배포 시 고려할 사항
   - Node 버전 로컬/Action에서 동일 여부
   - npm 사용
   - package.json 내부에 다음 항목 확인
      - homepage 필드(React Router 등 경로 문제 방지용)
      - scripts에 start/build/test 정의 존재
   - 의존성 설치 성공 여부(네트워크, private registry, 토큰 필요 여부, 캐시 문제 여부)
   -메모리/타임아웃 문제: CRA 빌드 중 OOM
   -npm ci 권장(package-lock 기반)
   개발자용/배포용 의존성 구분
---
# package.json이란?
> package.json은 Node.js/자바스크립트 프로젝트의 메타데이터와 의존성/스크립트 정의를 담은 JSON 파일입니다. 프로젝트 이름, 버전, 실행·빌드 명령, 사용 라이브러리 목록 등을 한곳에 선언해서 npm/yarn 같은 패키지 매니저가 읽고 동작하게 합니다. React, Vite, Next 등 대부분의 JS 프로젝트가 이 파일을 핵심으로 사용합니다.

* 주요 필드 (핵심 요약)
- name: 패키지(프로젝트) 이름
- version: 버전 (semver; 예: 1.2.3)
- description: 한줄 설명
- main: 라이브러리 진입점 파일 (node 패키지일 경우)
- scripts: npm run으로 실행할 커맨드 집합 (start, build, test, predeploy 등)
- dependencies: 런타임 의존성(배포 시 필요)
- devDependencies: 개발/빌드 시만 필요한 의존성
- peerDependencies: 호스트 환경(사용자 프로젝트)에 요구되는 패키지
- engines: 요구 Node 버전 등 실행 환경
- repository / homepage / license: 메타 정보
- files: 패키지에 포함할 파일 목록(배포용)
- keywords: 검색용 키워드
---
# npm ci란?
- npm ci는 CI(Continuous Integration) 환경용으로 설계된 설치 명령입니다.
- 동작
   현재 저장소에 있는 package-lock.json(또는 npm-shrinkwrap.json)에 명시된 정확한 패키지 버전들만 설치합니다. 설치 전 기존 node_modules를 제거하고, 더 빠르고 재현 가능한 설치를 수행합니다.
- 주요 특징
   lockfile에 명시된 정확한 버전만 설치 (deterministic)
   node_modules를 전부 지우고 다시 설치
   보통 npm install보다 빠름 (캐시/병렬 설치 최적화)

# npm ci vs npm install (핵심 차이)
   - 요구 조건:
      npm ci는 반드시 package-lock.json(또는 shrinkwrap)이 있어야 함; 없으면 실패.
      npm install은 lockfile이 없어도 동작하고, 필요하면 lockfile을 생성/업데이트함.
   - 동작 비교:
      npm ci: lockfile에 엄격히 따름, node_modules 제거 → 재설치, 더 빠르고 예측 가능.
      npm install: package.json의 범위(예: ^1.2.0)를 기준으로 최신 범위 내 버전 설치 → lockfile 업데이트 가능.
   - 사용 시기:
      CI/빌드서버: npm ci
      개발 중 새 패키지 추가/lockfile 갱신: npm install


# package-lock.json란?
> package-lock.json은 프로젝트에 실제로 설치된 각 패키지의 정확한 버전(의존성 트리 전체)을 고정(lock)한 파일입니다.

- 목적:
   동일한 의존성 트리를 재현 가능하게 보장(로컬 ↔ CI ↔ 다른 개발자)
   보안/버그 재현 및 디버깅을 쉽게 함
   누가 생성하나: npm install이 실행되면 자동 생성/갱신됩니다.
   커밋: 팀 프로젝트에서는 반드시 커밋해서 공유해야 함.
- 요약: package-lock.json은 의존성의 정확한 스냅샷이고, npm ci는 그 스냅샷을 그대로 빠르고 재현 가능하게 설치하는 CI 전용 명령입니다. 문제가 있으면 lockfile과 package.json의 일치 여부, Node/npm 버전, 레지스트리 인증을 먼저 확인하세요.

# 권장 Github Actions 패턴
1. 저장소에 package-lock.json 커밋
2. CI workflow에서:
   Node 버전 고정 (예: 18)
   npm ci 사용 후 npm run build 예:

# CRA( Create React App )란?
> Create React App(CRA)은 Facebook(현 Meta)에서 만든 React 애플리케이션 초기화 도구입니다. 한 번의 명령으로 개발용 서버, 빌드 설정(webpack, Babel 등), 테스트 환경, lint 설정 등 번거로운 설정을 숨겨 개발자가 바로 코드 작성에 집중하도록 해줍니다.

- 목표: 설정 없이도 표준화된 React 앱을 빠르게 만들고 빌드하도록 돕는 도구.

---
# 현재 계획
- 현 상황:
   Github Page Deploy를 From Github Action으로 선택함

1. Github Action로 배포하여 빈 페이지라도 github page에 올리는 것을 목표로 함
   - CI/CD를 통해 빌드 자동화를 하므로 main 외 다른 브랜치 필요 없음
2. 액션 및 깃허브 페이지 활성화가 정상적으로 실행되어 세팅-페이지 에 URL이 표시되는 것이 최종 목표
   - 그 과정에서, 코파일럿이 직접 적절한 워크플로우를 생성할 것.
   - 또한 필요없는 항목은 .gitignore로 제외하면서 소스 컨트롤을 최적화 해줄 것.