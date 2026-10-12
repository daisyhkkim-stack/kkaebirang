document.addEventListener("DOMContentLoaded", async () => {
  // 1. 로컬 스토리지에서 인덱스 화면이 저장해 둔 유저 정보 3종 세트 추출
  const userName = localStorage.getItem("kkaebiUserName");
  const birthDate = localStorage.getItem("kkaebiUserBirth");
  const gender = localStorage.getItem("kkaebiUserGender") || "male";

  // 만약 인덱스를 안 거치고 주소창으로 다이렉트 접속해서 정보가 없다면 메인으로 튕겨내기
  if (!userName || !birthDate) {
    alert("사주 정보가 확인되지 않았어! 메인 화면에서 먼저 확인해 줄래?");
    location.href = "/";
    return;
  }

  // 2. DOM 객체 바인딩
  const loadingScreen = document.getElementById("kkaebi-loading");
  const resultScreen = document.getElementById("kkaebi-step-result");
  const userPlaceholder = document.getElementById("user-placeholder");

  const todayDailyParagraph = document.getElementById("fortune-todayDaily");
  const luckyColorParagraph = document.getElementById("fortune-luckyColor");
  const luckyItemParagraph = document.getElementById("fortune-luckyItem");
  const actionTipParagraph = document.getElementById("fortune-actionTip");
  const todayDatePlaceholder = document.getElementById("today-date-placeholder");

  // 모달 객체
  const kkaebiPaymentModal = document.getElementById("kkaebiPaymentModal");
  const kkaebiModal = document.getElementById("kkaebiModal");

  // 3. 페이지 열리자마자 자동으로 비동기 API 통신 실행
  try {
    const response = await fetch("/api/today-saju", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, birthDate, gender }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      const resData = result.data;

      // 데이터 주입 작업
      if (userPlaceholder) userPlaceholder.textContent = userName;
      if (todayDailyParagraph) todayDailyParagraph.textContent = resData.todayDaily;
      if (luckyColorParagraph) luckyColorParagraph.textContent = resData.luckyColor;
      if (luckyItemParagraph) luckyItemParagraph.textContent = resData.luckyItem;
      if (actionTipParagraph) actionTipParagraph.textContent = resData.actionTip;

      if (todayDatePlaceholder) {
        const todayObj = new Date();
        todayDatePlaceholder.textContent = `${todayObj.getFullYear()}년 ${todayObj.getMonth() + 1}월 ${todayObj.getDate()}일`;
      }

      // 화면 즉시 로딩 오프 및 결과 온!
      if (loadingScreen) loadingScreen.classList.add("hidden");
      if (resultScreen) resultScreen.classList.remove("hidden");
    } else {
      alert(result.error || "오늘의 일진 보따리를 푸는 데 실패했어. 다시 시도할게!");
      location.href = "/";
    }
  } catch (err) {
    console.error("오늘의 운세 페이지 로딩 에러:", err);
    alert("네트워크 연결이 일시적으로 원활하지 않아.");
    location.href = "/";
  }

  // 4. 모달 인터랙션 이벤트 바인딩
  document.getElementById("finalCtaBtn").addEventListener("click", () => kkaebiPaymentModal.classList.remove("hidden"));
  document.getElementById("payModalCloseBtn").addEventListener("click", () => kkaebiPaymentModal.classList.add("hidden"));
  document.getElementById("payModalCancelBtn").addEventListener("click", () => kkaebiPaymentModal.classList.add("hidden"));

  document.getElementById("friendBtn").addEventListener("click", () => kkaebiModal.classList.remove("hidden"));
  document.getElementById("modalCloseBtn").addEventListener("click", () => kkaebiModal.classList.add("hidden"));
  document.getElementById("kakaoLinkBtn").addEventListener("click", () => {
    kkaebiModal.classList.add("hidden");
    window.open("https://kakao.com", "_blank");
  });
});
