# Christine Park — 연구 포트폴리오 사이트

Astro로 직접 만든 정적 사이트예요. 수술실 모니터(어두운 청록 + 자극 파형)와 임상 조명(차가운 흰색)을 모티프로 했어요.

## 실행

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ 에 결과물 생성
```

Node.js 22 이상이 필요해요.

## 어디를 고치면 되나

| 바꾸고 싶은 것 | 파일 |
|---|---|
| 이름, 소개, 이메일, 링크, 경력, 스킬, 수상 | `src/data/site.ts` |
| 연구 프로젝트 (하나당 파일 하나) | `src/content/research/*.md` |
| 색, 글꼴, 여백 | `src/styles/global.css` 맨 위 `:root` |
| 첫 화면 파형 애니메이션 | `src/components/Hero.astro` |
| Aβ42/40 인터랙티브 그림 | `src/components/OperatingPoints.astro` |
| CV | `public/cv.pdf` 로 파일 넣기 |

### 새 프로젝트 추가
`src/content/research/` 에 `.md` 파일을 하나 만들고, 다른 파일의 맨 위(`---` 사이) 형식을 그대로 복사해서 채우면 목록과 상세 페이지가 자동으로 생겨요.

### 꼭 채워야 할 TODO
- `src/data/site.ts` 의 `email` (지금은 예시 주소)
- `src/content/research/atbtus-fes.md`, `ipsc-parkinsons.md` 의 TODO 주석 부분 (LinkedIn에서 잘려 있던 세부 내용)
- LinkedIn의 세 번째 프로젝트, 나머지 언어 3개
- GitHub / Google Scholar 링크 (`site.ts` 의 `links`)
- `public/cv.pdf`

## 배포 (GitHub Pages, 무료)

1. GitHub에 `<아이디>.github.io` 이름으로 새 저장소를 만들고 이 폴더를 올리기
   ```bash
   git init && git add . && git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/<아이디>/<아이디>.github.io.git
   git push -u origin main
   ```
2. 저장소 **Settings → Pages → Source** 를 **GitHub Actions** 로 선택
3. `astro.config.mjs` 의 `site` 를 `https://<아이디>.github.io` 로 수정 후 푸시
4. Actions 탭에서 초록 체크가 뜨면 `https://<아이디>.github.io` 에서 확인

커스텀 도메인(예: `christinepark.ca`)은 도메인 구입 후 Settings → Pages → Custom domain 에 입력하고, 도메인 DNS에 GitHub Pages 주소를 연결하면 돼요.
