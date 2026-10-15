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

  const todayObj = new Date();
  const dateString = `${todayObj.getFullYear()}년 ${todayObj.getMonth() + 1}월 ${todayObj.getDate()}일`;
  if (todayDatePlaceholder) todayDatePlaceholder.textContent = dateString;

  // 💡 [추가] 2027년 총운 결과창(result.html)으로 복귀 라우팅
  if (backToTotalFortuneBtn) {
    backToTotalFortuneBtn.addEventListener("click", () => {
      window.location.href = "./result";
    });
  }

  // 💡 [추가] 처음으로 돌아가기 단추 바인딩
  if (goBackToInputBtn) {
    goBackToInputBtn.addEventListener("click", () => {
      window.location.href = "./";
    });
  }

  const renderTodayView = (data) => {
    if (userPlaceholder) userPlaceholder.textContent = userName;
    if (todayDailyParagraph) todayDailyParagraph.textContent = data.todayDaily;
    if (luckyColorParagraph) luckyColorParagraph.textContent = data.luckyColor;
    if (luckyItemParagraph) luckyItemParagraph.textContent = data.luckyItem;
    if (actionTipParagraph) actionTipParagraph.textContent = data.actionTip;
  };

  // 🛠️ [캐싱 엔진 적용] 오늘의 운세 중복 호출 방지용 스토리지 분기 제어
  const todayCacheKey = `today_${userName}_${gender}_${birthDate}_${isLunar}_${isUnknownTime}_${todayObj.getDate()}`;
  const localCacheData = localStorage.getItem("kkaebiCacheTodayData");
  const localCacheKey = localStorage.getItem("kkaebiCacheTodayKey");

  if (localCacheKey === todayCacheKey && localCacheData) {
    try {
      renderTodayView(JSON.parse(localCacheData));
      if (loadingScreen) loadingScreen.classList.add("hidden");
      if (resultScreen) resultScreen.classList.remove("hidden");
      return; // 💥 API 연동을 원천 차단하고 탈출합니다.
    } catch (e) {
      console.warn("오늘의 운세 캐시 오염 발생");
    }
  }

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
      // 로컬스토리지에 캐시 등록
      localStorage.setItem("kkaebiCacheTodayKey", todayCacheKey);
      localStorage.setItem("kkaebiCacheTodayData", JSON.stringify(resDataWrapper.data));
    }

    if (loadingScreen) loadingScreen.classList.add("hidden");
    if (resultScreen) resultScreen.classList.remove("hidden");
  } catch (err) {
    console.error("오늘의 운세 로딩 에러:", err);
    alert("도깨비가 오늘 하루 운세를 가져오는 데 실패했어. 다시 시도해 줄래?");
  }

  // 모달 제어
  const kkaebiModal = document.getElementById("kkaebiModal");
  document.getElementById("friendBtn")?.addEventListener("click", () => kkaebiModal?.classList.remove("hidden"));
  document.getElementById("modalCloseBtn")?.addEventListener("click", () => kkaebiModal?.classList.add("hidden"));
  document.getElementById("modalCloseTodayBtn")?.addEventListener("click", () => kkaebiModal?.classList.add("hidden"));

  const targetKakaoBtn = document.getElementById("kakaoLinkBtn");
  if (targetKakaoBtn) {
    targetKakaoBtn.addEventListener("click", () => {
      alert("현재 준비중입니다. 정식 오픈하면 그때 만나요 ^^");
      kkaebiModal?.classList.add("hidden");
    });
  }
});
