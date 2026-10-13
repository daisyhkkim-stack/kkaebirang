document.addEventListener("DOMContentLoaded", () => {
  const fortuneForm = document.getElementById("fortuneForm");
  const userNameInput = document.getElementById("userName");

  const genderButtons = document.querySelectorAll(".btn-gender");
  let selectedGender = "male"; // 기본값 남성 세팅

  // 성별 버튼 선택 토글 스위치 인터랙션
  genderButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      genderButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedGender = btn.getAttribute("data-gender");
    });
  });

  const inputStep = document.getElementById("kkaebi-step-input");
  const resultStep = document.getElementById("kkaebi-step-result");

  const userPlaceholder = document.getElementById("user-placeholder");

  const submitBtn = document.getElementById("submitBtn");
  const retryBtn = document.getElementById("retryBtn");
  const finalCtaBtn = document.getElementById("finalCtaBtn");

  const friendBtn = document.getElementById("friendBtn");
  const kkaebiModal = document.getElementById("kkaebiModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalCloseTodayBtn = document.getElementById("modalCloseTodayBtn");
  const kakaoLinkBtn = document.getElementById("kakaoLinkBtn");

  /* 결제 관련 모달 제어 객체 추출 */
  const kkaebiPaymentModal = document.getElementById("kkaebiPaymentModal");
  const payModalCloseBtn = document.getElementById("payModalCloseBtn");
  const payModalCancelBtn = document.getElementById("payModalCancelBtn");
  const realPayStartBtn = document.getElementById("realPayStartBtn");

  /* 달력 관련 객체 추출 */
  const birthInput = document.getElementById("birthDate");
  const calendarBtn = document.getElementById("calendarIconBtn");

  /* AI 사주 결과를 개별적으로 집어넣을 하위 태그 추출 */
  const financeParagraph = document.getElementById("fortune-finance");
  const relationParagraph = document.getElementById("fortune-relation");
  const wellnessParagraph = document.getElementById("fortune-wellness");

  /* 토스페이먼츠 v2 SDK 초기화 객체 생성 */
  let tossPaymentInstance = null;
  const clientKey = "test_gck_docs_O6bx5ZgA";

  try {
    if (typeof TossPaymentsV2 !== "undefined") {
      tossPaymentInstance = TossPaymentsV2(clientKey, { customerKey: TossPaymentsV2.ANONYMOUS });
    }
  } catch (err) {
    console.error("토스페이먼츠 라이브러리 로드 실패:", err);
  }

  // 생년월일시 자동 포맷팅 인풋 이벤트 리스너
  if (birthInput) {
    birthInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/[^0-9]/g, "");
      let formatted = "";

      if (value.length > 12) {
        value = value.substr(0, 12);
      }

      if (value.length <= 4) {
        formatted = value;
      } else if (value.length <= 6) {
        formatted = `${value.substr(0, 4)}.${value.substr(4)}`;
      } else if (value.length <= 8) {
        formatted = `${value.substr(0, 4)}.${value.substr(4, 2)}.${value.substr(6)}`;
      } else if (value.length <= 10) {
        formatted = `${value.substr(0, 4)}.${value.substr(4, 2)}.${value.substr(6, 2)} ${value.substr(8)}`;
      } else {
        formatted = `${value.substr(0, 4)}.${value.substr(4, 2)}.${value.substr(6, 2)} ${value.substr(8, 2)}:${value.substr(10)}`;
      }

      e.target.value = formatted;
    });

    birthInput.addEventListener("keydown", (e) => {
      const value = e.target.value;
      if (e.key === "Backspace") {
        if (value.endsWith(".") || value.endsWith(" ") || value.endsWith(":")) {
          e.preventDefault();
          e.target.value = value.substring(0, value.length - 2);
        }
      }
    });
  }

  // 1. 무료 운세 확인하기 버튼 제어 (기존 script.js 내부 submit 리스너 수정 적용)
  if (fortuneForm) {
    fortuneForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userName = userNameInput.value.trim();
      const birthDate = birthInput.value.trim();

      if (!userName || !birthDate) return;

      const loadingOverlay = document.getElementById("kkaebi-loading");
      if (loadingOverlay) loadingOverlay.classList.remove("hidden");

      if (submitBtn) {
        submitBtn.disabled = true;
        const spinner = submitBtn.querySelector(".kkaebi-spinner");
        if (spinner) spinner.classList.remove("hidden");
      }

      if (userPlaceholder) userPlaceholder.textContent = userName;
      localStorage.setItem("kkaebiUserName", userName);
      localStorage.setItem("kkaebiUserGender", selectedGender);
      localStorage.setItem("kkaebiUserBirth", birthDate);

      try {
        // const response = await fetch("/api/saju", {
        const response = await fetch("https://kkaebirang.vercel.app/api/saju", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ birthDate, userName, gender: selectedGender }),
        });

        if (!response.ok) throw new Error(`Server status ${response.status}`);
        const resData = await response.json();

        // 비동기 데이터 뷰 바인딩
        if (resData.success && resData.data) {
          if (financeParagraph) financeParagraph.textContent = resData.data.finance;
          if (relationParagraph) relationParagraph.textContent = resData.data.relation;
          if (wellnessParagraph) wellnessParagraph.textContent = resData.data.wellness;
        } else {
          const errorMsg = "운세 데이터를 파싱하지 못했습니다. 다시 시도해 주세요.";
          if (financeParagraph) financeParagraph.textContent = errorMsg;
          if (relationParagraph) relationParagraph.textContent = errorMsg;
          if (wellnessParagraph) wellnessParagraph.textContent = errorMsg;
        }

        if (inputStep) {
          inputStep.classList.remove("active");
          inputStep.classList.add("hidden");
        }
        if (resultStep) {
          resultStep.classList.remove("hidden");
          resultStep.classList.add("active");
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("통신 에러 로그:", error);

        const errMsg = "깨비의 사주 계산기에 일시적 에러가 발생했습니다. 다시 시도해 주세요.";
        if (financeParagraph) financeParagraph.textContent = errMsg;
        if (relationParagraph) relationParagraph.textContent = errMsg;
        if (wellnessParagraph) wellnessParagraph.textContent = errMsg;

        if (inputStep) {
          inputStep.classList.add("hidden");
        }
        if (resultStep) {
          resultStep.classList.remove("hidden");
        }
      } finally {
        // [로딩 제거] 성공하든 실패하든 로딩 레이어와 스피너 상태값 복구 완전 오프 처리
        if (loadingOverlay) loadingOverlay.classList.add("hidden");

        if (submitBtn) {
          submitBtn.disabled = false;
          const spinner = submitBtn.querySelector(".kkaebi-spinner");
          if (spinner) spinner.classList.add("hidden");
        }
      }
    });
  }

  // 2. 다른 정보로 다시하기 버튼 로직 (입력 폼 리셋 및 첫 화면 복귀)
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      if (fortuneForm) fortuneForm.reset();
      if (financeParagraph) financeParagraph.textContent = "";
      if (relationParagraph) relationParagraph.textContent = "";
      if (wellnessParagraph) wellnessParagraph.textContent = "";

      if (resultStep) {
        resultStep.classList.remove("active");
        resultStep.classList.add("hidden");
      }
      if (inputStep) {
        inputStep.classList.remove("hidden");
        inputStep.classList.add("active");
      }
      if (userNameInput) userNameInput.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 3. 전체운세 확인 버튼 클릭 시 예고 팝업 활성화
  if (finalCtaBtn) {
    finalCtaBtn.addEventListener("click", () => {
      if (kkaebiPaymentModal) {
        kkaebiPaymentModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      }
    });
  }

  // 3.5 결제 예고 팝업 닫기 함수군
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

  // 3.6 예고 팝업 속 확인 단추 클릭 시 프리미엄 결과 페이지로 이동 (결제 생략)
  if (realPayStartBtn) {
    realPayStartBtn.addEventListener("click", () => {
      closePayModal();

      const birthDate = birthInput ? birthInput.value.trim() : "";
      const userName = userNameInput ? userNameInput.value.trim() : "";

      if (birthDate) localStorage.setItem("kkaebiUserBirth", birthDate);
      if (userName) localStorage.setItem("kkaebiUserName", userName);

      window.location.href = "./premium-result";
    });
  }
  // 4. 친구되기 팝업 모달 제어
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

  // if (kakaoLinkBtn) {
  //   kakaoLinkBtn.addEventListener("click", () => {
  //     alert("카카오 채널 연동 페이지 또는 간편가입 API로 링크가 연결됩니다.");
  //     closeModal();
  //   });
  // }

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

  // 5. 달력 독립 구동 제어부
  if (birthInput && typeof flatpickr === "function") {
    const kkaebiCalendar = flatpickr(birthInput, {
      locale: "ko",
      dateFormat: "Y.m.d H:i",
      enableTime: true,
      time_24hr: true,
      disableMobile: "true",
      allowInput: true,
      clickOpens: false,
    });

    if (calendarBtn) {
      calendarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        kkaebiCalendar.open();
      });
    }
  }
});
