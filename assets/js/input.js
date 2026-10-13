document.addEventListener("DOMContentLoaded", () => {
  const fortuneForm = document.getElementById("fortuneForm");
  const userNameInput = document.getElementById("userName");
  const birthInput = document.getElementById("birthDate");
  const calendarBtn = document.getElementById("calendarIconBtn");
  const submitBtn = document.getElementById("submitBtn");
  const unknownTimeCheckbox = document.getElementById("unknownTime"); // 시간 모름 체크박스

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

  // [신규 추가 및 수정] 시간모름 체크박스 상태에 따른 플레이스홀더(placeholder) 실시간 변환 로직
  if (unknownTimeCheckbox && birthInput) {
    unknownTimeCheckbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        // 시간 모름 체크 시: 시간 입력 가이드를 빼고 날짜만 치도록 안내 가이드 변경
        birthInput.placeholder = "YYYY.MM.DD";
      } else {
        // 체크 해제 시: 원래 가이드라인인 년월일시 형태로 롤백
        birthInput.placeholder = "YYYY.MM.DD HH:MM";
      }
    });
  }

  // 생년월일시 자동 포맷팅 인풋 이벤트 리스너
  if (birthInput) {
    birthInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/[^0-9]/g, "");
      let formatted = "";

      // [보안 가드라인] 시간 모름 상태면 최대 8자리(년월일)까지만 타이핑되도록 글자수 제제 차단
      if (unknownTimeCheckbox && unknownTimeCheckbox.checked) {
        if (value.length > 8) value = value.substr(0, 8);

        if (value.length <= 4) {
          formatted = value;
        } else if (value.length <= 6) {
          formatted = `${value.substr(0, 4)}.${value.substr(4)}`;
        } else {
          formatted = `${value.substr(0, 4)}.${value.substr(4, 2)}.${value.substr(6, 2)}`;
        }
        e.target.value = formatted;
        return; // 하단 12자리 포맷 로직 실행 방지 및 탈출
      }

      // 일반 상태일 때 (기존 12자리 포맷팅 완벽 유지)
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

  // 달력 독립 구동 제어부
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

  // 무료 운세 확인하기 버튼 제어
  if (fortuneForm) {
    fortuneForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const userName = userNameInput.value.trim();
      const birthDate = birthInput.value.trim();

      if (!userName || !birthDate) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        const spinner = submitBtn.querySelector(".kkaebi-spinner");
        if (spinner) spinner.classList.remove("hidden");
      }

      // 다른 화면에서 복구할 수 있도록 브라우저 로컬 저장소 기록 연동
      localStorage.setItem("kkaebiUserName", userName);
      localStorage.setItem("kkaebiUserGender", selectedGender);
      localStorage.setItem("kkaebiUserBirth", birthDate);

      // 사용자가 시간 모름 체크박스에 체크했는지 여부(true/false)만 안전하게 보관
      const isUnknownTime = unknownTimeCheckbox ? unknownTimeCheckbox.checked : false;
      localStorage.setItem("kkaebiUserUnknownTime", isUnknownTime);

      sessionStorage.setItem("kkaebi_run_fetch", "true");

      // 결과창 html 페이지 주소로 이동
      window.location.href = "./result";
    });
  }
});
