# 고등 한국사 1등급 메이커

고1 한국사 1·2 교과서 기반 단원별 맞춤형 4지선다 퀴즈 / 실전 200제 문제은행 웹앱.

## 배포 파일 구성

이 폴더는 **GitHub Pages에 올릴 파일만** 모아둔 배포 전용 폴더입니다.
아래 파일 전체를 저장소 루트에 업로드하세요.

```
index.html          메인 퀴즈 앱 (진입점)
lesson.html         수업 절차 지도안 페이지
.nojekyll           GitHub Pages의 Jekyll 전처리 비활성화 (필수)
.gitattributes      줄바꿈(CRLF/LF) 자동 변환 고정
css/
  style.css         폰트·사료 박스·인쇄용 스타일
data/
  data.js           단원 + 200문항 데이터 (전역 변수, file:// 에서도 동작)
  units.json        단원 데이터 (HTTP 환경 fallback)
  questions.json    문항 데이터 (HTTP 환경 fallback)
js/
  quiz.js           퀴즈 엔진 (출제·채점·타이머·북마크)
  sound.js          효과음
  app.js            화면 렌더링 및 이벤트 바인딩
```

업로드에서 **제외한 것**: 원본 PDF 5개(총 약 120MB — GitHub 권장 용량 초과, 앱 동작에 불필요),
`scratch/`(문항 생성용 파이썬 작업 스크립트).

## GitHub Pages 배포 방법

1. GitHub에서 새 저장소를 만듭니다 (Public).
2. 이 `deploy` 폴더의 **내용물**을 저장소 루트에 업로드합니다.
   폴더째로 올리면 주소가 `.../deploy/index.html` 이 되므로, 폴더가 아니라 안에 있는 파일들을 올려야 합니다.
   - 웹 업로드 시: `Add file > Upload files` 에서 `index.html`, `lesson.html`, `css`, `data`, `js` 를 드래그
   - `.nojekyll` 은 웹 UI에서 드래그가 안 될 수 있으므로, 안 올라갔다면
     `Add file > Create new file` 로 파일명에 `.nojekyll` 을 입력하고 빈 내용으로 커밋
3. `Settings > Pages` 에서 Source를 `Deploy from a branch`, Branch를 `main` / `/ (root)` 로 지정하고 Save.
4. 1~2분 뒤 `https://<사용자명>.github.io/<저장소명>/` 로 접속.

### git CLI로 올리는 경우

```bash
cd deploy
git init
git add -A
git commit -m "Deploy 고등 한국사 1등급 메이커"
git branch -M main
git remote add origin https://github.com/<사용자명>/<저장소명>.git
git push -u origin main
```

## 배포 시 주의사항 (로컬과 다르게 보일 때)

- **경로 대소문자**: GitHub Pages는 대소문자를 구분합니다. Windows 로컬에서는 `CSS/Style.css` 도
  열리지만 서버에서는 404가 됩니다. 이 폴더의 참조는 모두 소문자로 통일되어 있습니다.
- **`.nojekyll` 누락**: 없으면 Jekyll이 파일을 전처리하면서 일부 파일이 배포에서 빠질 수 있습니다.
- **CDN 버전 고정**: 배포본은 Tailwind `3.4.17`, Lucide `1.33.0` 으로 버전을 고정했습니다.
  원본은 `cdn.tailwindcss.com` / `lucide@latest` 를 쓰는데, 이 경우 라이브러리가 업데이트되는 순간
  로컬 캐시(구버전)와 서버 최신 버전이 달라져 레이아웃·아이콘이 다르게 보일 수 있습니다.
- **브라우저 캐시**: 수정 후 반영이 안 보이면 `Ctrl+Shift+R` 로 강제 새로고침하세요.
- **첫 로딩 시 스타일 깜빡임**: Tailwind CDN은 브라우저에서 CSS를 실시간 생성하므로 순간적으로
  스타일 없는 화면이 보일 수 있습니다(정상). 완전히 없애려면 Tailwind를 미리 빌드해
  정적 CSS 파일로 교체해야 합니다.

## 사용 기술

Tailwind CSS (Play CDN) · Lucide Icons · Vanilla JavaScript (빌드 도구 없음)
