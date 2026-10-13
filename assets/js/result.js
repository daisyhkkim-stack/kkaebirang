document.addEventListener("DOMContentLoaded", async () => {
  // 브라우저 로컬 저장소에서 전 페이지가 심어둔 인적 사항 데이터 가로채기
  const userName = localStorage.getItem("kkaebiUserName") || "사용자";
  const selectedGender = localStorage.getItem("kkaebiUserGender") || "male";
  const birthDate = localStorage.getItem("kkaebiUserBirth") || "";

  // DOM 노드 엘리먼트 객체 추출
  const userPlaceholder = document.getElementById("user-placeholder");
  const financeParagraph = document.getElementById("fortune-finance");
  const relationParagraph = document.getElementById("fortune-relation");
  const wellnessParagraph = document.getElementById("fortune-wellness");

  const retryBtn = document.getElementById("retryBtn");
  const finalCtaBtn = document.getElementById("finalCtaBtn");
  const friendBtn = document.getElementById("friendBtn");

  const kkaebiModal = document.getElementById("kkaebiModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalCloseTodayBtn = document.getElementById("modalCloseTodayBtn");
  const kakaoLinkBtn = document.getElementById("kakaoLinkBtn");

  const kkaebiPaymentModal = document.getElementById("kkaebiPaymentModal");
  const payModalCloseBtn = document.getElementById("payModalCloseBtn");
  const payModalCancelBtn = document.getElementById("payModalCancelBtn");
  const realPayStartBtn = document.getElementById("realPayStartBtn");

  if (userPlaceholder) userPlaceholder.textContent = userName;

  // 처음 진입하든, 새로고침(F5)을 하든 생년월일 데이터만 있으면 무조건 방망이를 돌립니다.
  if (birthDate) {
    const loadingOverlay = document.getElementById("kkaebi-loading");
    if (loadingOverlay) loadingOverlay.classList.remove("hidden");

    try {
      // 요청하신 원본 배포 API 주소로 직접 연동 설정 완료
      const response = await fetch("./api/saju", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, userName, gender: selectedGender }),
      });

      if (!response.ok) throw new Error(`Server status ${response.status}`);
      const resData = await response.json();

      if (resData.success && resData.data) {
        if (financeParagraph) financeParagraph.textContent = resData.data.finance;
        if (relationParagraph) relationParagraph.textContent = resData.data.relation;
        if (wellnessParagraph) wellnessParagraph.textContent = resData.data.wellness;
      } else {
        setAllFortuneText("운세 데이터를 파싱하지 못했습니다. 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error("통신 에러 로그:", error);
      setAllFortuneText("깨비의 사주 계산기에 일시적 에러가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      // 데이터 바인딩이 끝나면 로딩 레이어 오프 처리
      if (loadingOverlay) loadingOverlay.classList.add("hidden");
    }
  } else {
    // 저장소에 아예 사주 데이터가 없는 비정상 접근 시 예외 처리
    setAllFortuneText("입력된 사주 정보가 없습니다. 첫 화면에서 다시 입력해 주세요.");
  }

  function setAllFortuneText(msg) {
    if (financeParagraph) financeParagraph.textContent = msg;
    if (relationParagraph) relationParagraph.textContent = msg;
    if (wellnessParagraph) wellnessParagraph.textContent = msg;
  }

  // 다른 정보로 다시하기 버튼 로직 (첫 메인 페이지 이동 및 자동 비우기 유도)
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      window.location.href = "./";
    });
  }

  // 전체운세 확인 버튼 클릭 시 예고 팝업 활성화
  if (finalCtaBtn) {
    finalCtaBtn.addEventListener("click", () => {
      if (kkaebiPaymentModal) {
        kkaebiPaymentModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      }
    });
  }

  // 결제 예고 팝업 닫기 함수군
  const closePayModal = () => {
    if (kkaebiPaymentModal) {
      kkaebiPaymentModal.classList.add("hidden");
      document.body.style.overflow = "";
    }
  };
  if (payModalCloseBtn) payModalCloseBtn.addEventListener("click", closePayModal);
  if (payModalCancelBtn) payModalCancelBtn.addEventListener("click", closePayModal);
  if (kkaebiPaymentModal) {
    kkaebiPaymentModal.addEventListener("click", (e) => {
      if (e.target === kkaebiPaymentModal) closePayModal();
    });
  }

  // 예고 팝업 속 확인 단추 클릭 시 프리미엄 결과 페이지로 무조건 이동 (Toss SDK 차단 처리)
  if (realPayStartBtn) {
    realPayStartBtn.addEventListener("click", () => {
      closePayModal();
      window.location.href = "./premium-result";
    });
  }

  // 친구되기 팝업 모달 제어
  const openModal = () => {
    if (kkaebiModal) {
      kkaebiModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  };

  const closeModal = () => {
    if (kkaebiModal) {
      kkaebiModal.classList.add("hidden");
      document.body.style.overflow = "";
    }
  };

  if (friendBtn) friendBtn.addEventListener("click", openModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalCloseTodayBtn) modalCloseTodayBtn.addEventListener("click", closeModal);

  if (kakaoLinkBtn) {
    kakaoLinkBtn.addEventListener("click", () => {
      alert("현재 준비중입니다. 정식 오픈하면 그때 만나요 ^^");
      closeModal();
    });
  }

  if (kkaebiModal) {
    kkaebiModal.addEventListener("click", (e) => {
      if (e.target === kkaebiModal) closeModal();
    });
  }
});
