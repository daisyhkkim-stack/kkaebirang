document.addEventListener("DOMContentLoaded", async () => {
  const userName = localStorage.getItem("kkaebiUserName");
  const birthDate = localStorage.getItem("kkaebiUserBirth");
  const gender = localStorage.getItem("kkaebiUserGender") || "male";
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

  const kkaebiPaymentModal = document.getElementById("kkaebiPaymentModal");
  const kkaebiModal = document.getElementById("kkaebiModal");

  // [today.js 내부 연동 교체 구간] 가짜 데이터 걷어내고 실시간 AI 연동 탑재
  try {
    // 💡 백엔드 서버로 오늘의 운세 데이터 요청 전송
    const response = await fetch("/api/today-saju", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthDate, userName, gender }),
    });

    if (!response.ok) throw new Error(`Server status ${response.status}`);
    const resDataWrapper = await response.json();

    if (resDataWrapper.success && resDataWrapper.data) {
      const resData = resDataWrapper.data;

      // DOM 노드 화면에 AI 운세 실시간 주입
      if (userPlaceholder) userPlaceholder.textContent = userName;
      if (todayDailyParagraph) todayDailyParagraph.textContent = resData.todayDaily;
      if (luckyColorParagraph) luckyColorParagraph.textContent = resData.luckyColor;
      if (luckyItemParagraph) luckyItemParagraph.textContent = resData.luckyItem;
      if (actionTipParagraph) actionTipParagraph.textContent = resData.actionTip;
    }

    if (todayDatePlaceholder) {
      const todayObj = new Date();
      todayDatePlaceholder.textContent = `${todayObj.getFullYear()}년 ${todayObj.getMonth() + 1}월 ${todayObj.getDate()}일`;
    }

    // 로딩바 걷어내고 결과 화면 온!
    if (loadingScreen) loadingScreen.classList.add("hidden");
    if (resultScreen) resultScreen.classList.remove("hidden");
  } catch (err) {
    console.error("오늘의 운세 로딩 에러:", err);
    alert("도깨비가 운세를 가져오는 데 실패했어. 다시 시도해 줄래?");
  }

  // 하단 모달 및 링크 인터랙션 제어 (완벽 보정 완료)
  const finalCtaBtn = document.getElementById("finalCtaBtn");
  if (finalCtaBtn && kkaebiPaymentModal) {
    finalCtaBtn.addEventListener("click", () => kkaebiPaymentModal.classList.remove("hidden"));
  }
  document.getElementById("payModalCloseBtn")?.addEventListener("click", () => kkaebiPaymentModal.classList.add("hidden"));
  document.getElementById("payModalCancelBtn")?.addEventListener("click", () => kkaebiPaymentModal.classList.add("hidden"));

  const friendBtn = document.getElementById("friendBtn");
  if (friendBtn && kkaebiModal) {
    friendBtn.addEventListener("click", () => kkaebiModal.classList.remove("hidden"));
  }
  document.getElementById("modalCloseBtn")?.addEventListener("click", () => kkaebiModal.classList.add("hidden"));

  // 💡 [수정 완료] 중첩 리스너를 지우고, kkaebiModal을 안전하게 직접 닫도록 구조 교체
  const targetKakaoBtn = document.getElementById("kakaoLinkBtn");
  if (targetKakaoBtn) {
    targetKakaoBtn.addEventListener("click", () => {
      alert("현재 준비중입니다. 정식 오픈하면 그때 만나요 ^^");
      if (kkaebiModal) {
        kkaebiModal.classList.add("hidden"); // 에러 유발하던 closeModal() 대신 직관적으로 모달 닫기
      }
    });
  }
});
