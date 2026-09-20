# 프로젝트 배포 및 연동 지침 (Deployment Guidelines)

이 프로젝트는 GitHub와 Vercel이 연동되어 있어, GitHub에 코드가 푸시(push)되면 Vercel을 통해 자동으로 웹에 배포됩니다.

따라서 AI 에이전트(Antigravity)는 프로젝트 내에서 파일 및 코드를 수정한 뒤 다음 지침을 반드시 따라야 합니다:

1. **Git Commit**: 변경된 모든 내용을 확인하고 의미 있는 커밋 메시지와 함께 `git commit`을 수행하세요.
2. **Git Push**: 커밋한 내용을 연결된 GitHub 원격 저장소에 `git push` 하여 업로드하세요.
3. **배포 확인**: 푸시가 완료되면 Vercel을 통해 자동으로 웹에 적용되므로, 이 과정이 누락되지 않도록 작업의 마지막 단계로 항상 수행해야 합니다.
