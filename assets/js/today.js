// ./assets/js/today.js
document.addEventListener("DOMContentLoaded", async () => {
  const userName = localStorage.getItem("kkaebiUserName");
  const birthDate = localStorage.getItem("kkaebiUserBirth");
  const gender = localStorage.getItem("kkaebiUserGender") || "male";
  const isLunar = localStorage.getItem("kkaebiUserIsLunar") === "true";
  const isUnknownTime = localStorage.getItem("kkaebiUserUnknownTime") === "true";

  if (!userName || !birthDate) {
    alert("사주 정보가 확인되지 않았어! 메인 화면에서 먼저 확인해 줄래?");
    location.href = "./";
    return;
  }

  const loadingScreen = document.getElementById("kkaebi-loading");
  const resultScreen = document.getElementById("kkaebi-step-result");
  const userPlaceholder = document.getElementById("user-placeholder");

  const todayDailyParagraph = document.getElementById("fortune-todayDaily");
  const luckyColorParagraph = document.getElementById("fortune-luckyColor");
  const luckyItemParagraph = document.getElementById("fortune-luckyItem");
  const actionTipParagraph = document.getElementById("fortune-actionTip");
  const todayDatePlaceholder = document.getElementById("today-date-placeholder");

  const backToTotalFortuneBtn = document.getElementById("backToTotalFortuneBtn");
  const goBackToInputBtn = document.getElementById("goBackToInputBtn");
  const goSajuAnalysisBtn = document.getElementById("goSajuAnalysisBtn");

  // 현재 날짜 텍스트 세팅
  const todayObj = new Date();
  const currentYear = todayObj.getFullYear();
  const currentMonth = todayObj.getMonth() + 1; // 0부터 시작하므로 +1
  const currentDate = todayObj.getDate();

  const dateString = `${currentYear}년 ${currentMonth}월 ${currentDate}일`;
  if (todayDatePlaceholder) todayDatePlaceholder.textContent = dateString;

  // 화면에 오늘의 운세 데이터를 그리는 공통 렌더러 함수
  const renderTodayView = (data) => {
    if (userPlaceholder) userPlaceholder.textContent = userName;
    if (todayDailyParagraph) todayDailyParagraph.textContent = data.todayDaily;
    if (luckyColorParagraph) luckyColorParagraph.textContent = data.luckyColor;
    if (luckyItemParagraph) luckyItemParagraph.textContent = data.luckyItem;
    if (actionTipParagraph) actionTipParagraph.textContent = data.actionTip;
  };

  // 🛠️ 캐싱 엔진 처리 제어부
  const todayCacheKey = `today_${userName}_${gender}_${birthDate}_${isLunar}_${isUnknownTime}_${currentYear}_${currentMonth}_${currentDate}`;
  const localCacheData = localStorage.getItem("kkaebiCacheTodayData");
  const localCacheKey = localStorage.getItem("kkaebiCacheTodayKey");

  if (localCacheKey === todayCacheKey && localCacheData) {
    try {
      renderTodayView(JSON.parse(localCacheData));
      if (loadingScreen) loadingScreen.classList.add("hidden");
      if (resultScreen) resultScreen.classList.remove("hidden");
      // 💡 [버그 수정] 하단 리스너들이 무조건 실행되도록 return 대신 바로 아래 서버 통신만 패스하도록 처리합니다.
    } catch (e) {
      console.warn("오늘의 운세 캐시 오염 발생, 서버 통신 재시도");
      await fetchTodayFortuneFromServer();
    }
  } else {
    // 캐시가 없거나 날짜가 바뀌었을 때만 서버에서 호출
    await fetchTodayFortuneFromServer();
  }

  // 💡 서버에서 오늘의 운세를 받아오는 가동 함수
  async function fetchTodayFortuneFromServer() {
    try {
      const response = await fetch("/api/today-saju", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, userName, gender }),
      });

      if (!response.ok) throw new Error(`Server status ${response.status}`);
      const resDataWrapper = await response.json();

      if (resDataWrapper.success && resDataWrapper.data) {
        renderTodayView(resDataWrapper.data);
        // 로컬스토리지에 당일 전용 캐시 등록
        localStorage.setItem("kkaebiCacheTodayKey", todayCacheKey);
        localStorage.setItem("kkaebiCacheTodayData", JSON.stringify(resDataWrapper.data));
      }

      if (loadingScreen) loadingScreen.classList.add("hidden");
      if (resultScreen) resultScreen.classList.remove("hidden");
    } catch (err) {
      console.error("오늘의 운세 로딩 에러:", err);
      alert("도깨비가 오늘 하루 운세를 가져오는 데 실패했어. 다시 시도해 줄래?");
    }
  }

  // 💡 [해결 확인] 캐시 동작 여부와 완벽히 격리되어 무조건 상시 구동되는 라우팅 리스너 영역

  // 1. 만세력 사주정국 화면으로 이동
  if (goSajuAnalysisBtn) {
    goSajuAnalysisBtn.addEventListener("click", () => {
      window.location.href = "./saju-manse";
    });
  }

  // 2. 2027년 총운 결과창(result.html)으로 복귀
  if (backToTotalFortuneBtn) {
    backToTotalFortuneBtn.addEventListener("click", () => {
      window.location.href = "./result";
    });
  }

  // 3. 메인 입력창으로 돌아가기
  if (goBackToInputBtn) {
    goBackToInputBtn.addEventListener("click", () => {
      window.location.href = "./";
    });
  }
});
