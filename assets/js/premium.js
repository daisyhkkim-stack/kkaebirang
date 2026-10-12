document.addEventListener("DOMContentLoaded", async () => {
  const premiumUserPlaceholder = document.getElementById("premium-user-placeholder");
  const backToHomeBtn = document.getElementById("backToHomeBtn");
  const shareKkaebiBtn = document.getElementById("shareKkaebiBtn");
  const timelineContainer = document.getElementById("kkaebi-monthly-timeline-display");
  const financeMetaContainer = document.getElementById("display-finance-meta");
  const loadingOverlay = document.getElementById("kkaebi-loading");

  let cachedMonthsData = [];
  let currentActiveTheme = "summary"; // 초기 기본 탭: 월별 총운

  // 로컬 스토리지 데이터 및 성별(gender) 값 확보
  const savedName = localStorage.getItem("kkaebiUserName") || "사용자";
  const savedBirth = localStorage.getItem("kkaebiUserBirth") || "";
  const savedGender = localStorage.getItem("kkaebiUserGender") || "male";

  if (premiumUserPlaceholder) {
    premiumUserPlaceholder.textContent = savedName;
  }

  // [동적 엔진] 어떤 탭이든 1월~12월 카드를 실시간 가공하여 뿌려주는 함수
  function renderTimelineByTheme(theme) {
    if (!cachedMonthsData || cachedMonthsData.length === 0 || !timelineContainer) return;

    // 기존 화면에 그려져 있던 카드 노드를 깨끗하게 초기화
    timelineContainer.innerHTML = "";

    cachedMonthsData.forEach((m) => {
      const card = document.createElement("div");
      card.className = "month-card";

      // 선택한 탭 테마(summary, finance, relation, wellness)에 맞는 텍스트 추출
      const themeDesc = m[theme] || "운세 데이터를 산출하지 못했습니다.";

      // 각 달에 맞춰 동적 뼈대 생성 및 주입 (fade-refresh 애니메이션 적용)
      card.innerHTML = `
        <div class="month-number">${m.month}월</div>
        <div class="month-body">
          <h4 class="month-title">${m.title}</h4>
          <p class="month-desc fade-refresh">${themeDesc}</p>
        </div>
      `;
      timelineContainer.appendChild(card);
    });
  }

  // 백엔드 통합 동적 운세 데이터 호출 세션
  try {
    const response = await fetch("/api/premium", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 성별 파라미터까지 완벽하게 동기화하여 백엔드로 송신
      body: JSON.stringify({ birthDate: savedBirth, userName: savedName, gender: savedGender }),
    });

    const resData = await response.json();

    if (resData.success && resData.data) {
      const d = resData.data;

      // 종합 총평 및 비밀 비책 주입
      document.getElementById("premium-summary").textContent = d.summary;
      document.getElementById("premium-secret").textContent = d.secret;

      // 재물운 전용 상/하반기 분석 및 행동 지침 동적 대입
      document.getElementById("finance-half-1").textContent = d.financeHalf1;
      document.getElementById("finance-half-2").textContent = d.financeHalf2;

      if (d.financeRules && d.financeRules.length >= 3) {
        document.getElementById("finance-rule-1").textContent = d.financeRules[0];
        document.getElementById("finance-rule-2").textContent = d.financeRules[1];
        document.getElementById("finance-rule-3").textContent = d.financeRules[2];
      }

      // 12달 데이터 전역 캐시에 세팅 및 첫 화면 가동
      cachedMonthsData = d.months;
      renderTimelineByTheme(currentActiveTheme);

      // 하단 스탯 핵심 게이지 바 연출 처리
      const finBar = document.getElementById("bar-finance");
      const finVal = document.getElementById("val-finance");
      if (finBar) finBar.style.width = `${d.statFinance}%`;
      if (finVal) finVal.textContent = `${d.statFinance}퍼센트`;

      const relBar = document.getElementById("bar-relation");
      const relVal = document.getElementById("val-relation");
      if (relBar) relBar.style.width = `${d.statRelation}%`;
      if (relVal) relVal.textContent = `${d.statRelation}퍼센트`;

      document.getElementById("val-direction").textContent = d.statDirection;
      document.getElementById("val-color").textContent = d.statColor;
    } else {
      alert("리포트를 생성하지 못했습니다. 첫 화면에서 다시 시도해 주세요.");
      window.location.href = "./index";
    }
  } catch (err) {
    console.error("프리미엄 데이터 연산 에러 로그:", err);
    alert("네트워크 서버와의 연결이 원활하지 않습니다.");
  } finally {
    // 성공 혹은 에러가 나더라도 최종 단계에서 3D 방망이 로딩 스크린을 숨김 처리
    if (loadingOverlay) {
      loadingOverlay.classList.add("hidden");
    }
  }

  // 4단 독립 패널 스위칭 제어용 탭 이벤트 리스너 바인딩
  const tabButtons = document.querySelectorAll(".theme-tab-btn");
  const sectionTitle = document.querySelector(".premium-section-title"); // 이동 가이드 기준점 확보

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");

      currentActiveTheme = e.target.getAttribute("data-theme");

      // 1. 공통 타임라인 영역의 12달 카드를 선택한 테마 데이터로 전면 교체 렌더링
      renderTimelineByTheme(currentActiveTheme);

      // 2. 재물운 탭일 때만 하단의 상/하반기 상세 리포트 박스를 추가로 노출
      if (currentActiveTheme === "finance") {
        if (financeMetaContainer) financeMetaContainer.classList.remove("hidden");
      } else {
        if (financeMetaContainer) financeMetaContainer.classList.add("hidden");
      }

      // [핵심 기능 추가] 탭 클릭 시 열두 달 상세 가이드 타이틀 위치로 화면을 부드럽게 스크롤 이동
      if (sectionTitle) {
        sectionTitle.scrollIntoView({
          behavior: "smooth", // 딱딱하게 튀지 않고 부드러운 애니메이션 모션으로 스크롤 이동
          block: "start", // 브라우저 화면의 최상단(top: 0)에 정렬 타이밍 맞춤
        });
      }
    });
  });

  // 홈으로 돌아가기 단추 제어 (데이터 클리어)
  if (backToHomeBtn) {
    backToHomeBtn.addEventListener("click", () => {
      localStorage.removeItem("kkaebiUserName");
      localStorage.removeItem("kkaebiUserBirth");
      localStorage.removeItem("kkaebiUserGender");
      window.location.href = "./index";
    });
  }

  // 주소 공유하기 (클립보드 API 작동)
  if (shareKkaebiBtn) {
    shareKkaebiBtn.addEventListener("click", () => {
      const currentUrl = window.location.origin + "/index";
      navigator.clipboard
        .writeText(currentUrl)
        .then(() => {
          alert("깨비랑의 접속 주소가 복사되었습니다. 카카오톡이나 문자메시지 창에 붙여넣기 하여 소중한 지인에게 영험한 운세를 추천해 보세요.");
        })
        .catch((error) => {
          console.error("클립보드 복사 차단 에러:", error);
          alert("현재 브라우저 보안 환경상 자동 복사가 차단되었습니다. 주소창 주소를 직접 복사하여 공유해 주세요.");
        });
    });
  }

  const stickySensor = document.getElementById("kkaebi-sticky-sensor");
  const themeTabsNav = document.querySelector(".premium-theme-tabs");

  if (stickySensor && themeTabsNav) {
    // 센서 노드가 화면에 보이는지 여부를 감시하는 관측관 배치
    const stickyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 센서가 상단 뷰포트(화면) 밖으로 나가서 안 보이기 시작할 때 고정으로 판정!
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            themeTabsNav.classList.add("is-sticky");
          } else {
            // 센서가 다시 화면 안으로 복귀하면 고정 클래스 즉시 해제
            themeTabsNav.classList.remove("is-sticky");
          }
        });
      },
      {
        root: null, // 브라우저 뷰포트 자체를 기준으로 삼음
        threshold: [0], // 단 1픽셀이라도 경계선에 걸치면 즉시 감지 트리거 가동
      },
    );

    // 센서 감시 시작
    stickyObserver.observe(stickySensor);
  }
});
