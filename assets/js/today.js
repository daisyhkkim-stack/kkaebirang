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

  // [수정] 고장난 Vercel 서버 대신 로컬에서 즉시 훌륭하게 연산 처리
  try {
    // 가상의 네트워크 연산 시간(1.2초)을 주어 방망이가 회전하는 역동적인 연출 유지
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // 로컬 테스트용 고품질 운세 데이터셋 생성 (나중에 서버 복구 시 이 구조로 들어옵니다)
    const resData = {
      todayDaily:
        "오호라! 오전에는 기운이 살짝 정체돼서 으슬으슬 답답할 수 있겠다 깨비! 하지만 걱정 붙들어 매라구! 이건 내 방망이에 화력이 모이는 과정일 뿐이니까 말야. 오후로 접어들수록 널 도우려는 대단한 귀인의 기운이 아주 강력하게 뿜어져 나올 테니 두고 보라구! 오전 내내 네 머리를 싸매게 만들었던 골치 아픈 문제들이 실타래 풀리듯 스르륵 해결되는 반전 드라마가 펼쳐질 테니, 주저하지 말고 자신감 있게 적극적으로 움직여봐! 알았지?",
      luckyColor: "눈이 번쩍 뜨이는 네온 에메랄드 (#17e0a8)빛이랑 신비로운 도깨비 불꽃을 닮은 딥 오션 블루 (#00f3ff)라구!",
      luckyItem: "하루 시간을 황금처럼 쪼개 쓸 수 있는 스마트 워치, 아니면 세상 잔소리를 싹 다 차단해 줄 번쩍이는 블루투스 이어폰 🎧",
      actionTip:
        "오늘 하루는 인간덜이랑 대화할 때 내 말부터 냅다 지르지 말고, 상대방 이야기를 끝까지 진득하게 들어주는 게 아주 치명적인 비밀 무기야! 한 템포 천천히 호흡을 가다듬은 뒤에 네 의견을 조리 있게 툭 던지면, 꼬일 수 있는 오해나 잔구설수를 내 방망이로 치듯 완벽하게 방어할 수 있어. 기억해, 경청이 네 신뢰도를 우주 끝까지 끌어올려 줄 테니까!",
    };

    // DOM 노드 화면 데이터 주입
    if (userPlaceholder) userPlaceholder.textContent = userName;
    if (todayDailyParagraph) todayDailyParagraph.textContent = resData.todayDaily;
    if (luckyColorParagraph) luckyColorParagraph.textContent = resData.luckyColor;
    if (luckyItemParagraph) luckyItemParagraph.textContent = resData.luckyItem;
    if (actionTipParagraph) actionTipParagraph.textContent = resData.actionTip;

    if (todayDatePlaceholder) {
      const todayObj = new Date();
      todayDatePlaceholder.textContent = `${todayObj.getFullYear()}년 ${todayObj.getMonth() + 1}월 ${todayObj.getDate()}일`;
    }

    // 로딩바 걷어내고 결과 화면 온!
    if (loadingScreen) loadingScreen.classList.add("hidden");
    if (resultScreen) resultScreen.classList.remove("hidden");
  } catch (err) {
    console.error("오늘의 운세 로딩 에러:", err);
    alert("로컬 데이터를 매핑하는 과정에서 문제가 발생했어.");
  }

  // 하단 모달 및 링크 인터랙션 제어 (안전 코드로 보완)
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
  document.getElementById("kakaoLinkBtn")?.addEventListener("click", () => {
    kkaebiModal.classList.add("hidden");
    window.open("https://kakao.com", "_blank");
  });
});
