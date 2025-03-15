NestJS

기능 총 3가지 (Sign-up, Login, Auth)
SQLite를 사용해 데이터를 인메모리에서 가져오는 방식을 채용

Auth의 경우 현재 헤더에 있는 토큰이 어떤 상태인지 확인하는 기능을 만들었다.
database.config 파일과 env-validation.config를 추가해 env 파일에 대한 검증

3.35.24.114

```
intern_node_back
├─ .eslintrc.js
├─ .prettierrc
├─ configs
│  ├─ database.config.ts
│  └─ env-validation.config.ts
├─ nest-cli.json
├─ package-lock.json
├─ package.json
├─ README.md
├─ src
│  ├─ app.controller.spec.ts
│  ├─ app.controller.ts
│  ├─ app.module.ts
│  ├─ app.service.ts
│  ├─ auth
│  │  ├─ auth.controller.spec.ts
│  │  ├─ auth.controller.ts
│  │  ├─ auth.module.ts
│  │  ├─ auth.service.spec.ts
│  │  ├─ auth.service.ts
│  │  ├─ dto
│  │  │  ├─ login.dto.ts
│  │  │  └─ sign-up.dto.ts
│  │  └─ strategies
│  │     └─ jwt.strategy.ts
│  ├─ main.ts
│  └─ user
│     ├─ entities
│     │  └─ user.entity.ts
│     ├─ user.module.ts
│     ├─ user.service.spec.ts
│     └─ user.service.ts
├─ test
│  ├─ app.e2e-spec.ts
│  └─ jest-e2e.json
├─ tsconfig.build.json
└─ tsconfig.json

```
