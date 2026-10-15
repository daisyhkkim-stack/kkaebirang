// ./assets/js/input.js
document.addEventListener("DOMContentLoaded", () => {
  const fortuneForm = document.getElementById("fortuneForm");
  const userNameInput = document.getElementById("userName");
  const birthInput = document.getElementById("birthDate");
  const calendarBtn = document.getElementById("calendarIconBtn");
  const submitBtn = document.getElementById("submitBtn");
  const unknownTimeCheckbox = document.getElementById("unknownTime");
  const isLunarCheckbox = document.getElementById("isLunar");
  const goToTodayDirectBtn = document.getElementById("goToTodayDirectBtn");
  const kkaebiLoadModal = document.getElementById("kkaebiLoadModal");
  const btnLoadFresh = document.getElementById("btnLoadFresh");
  const btnLoadCached = document.getElementById("btnLoadCached");
  const genderButtons = document.querySelectorAll(".btn-gender");
  let selectedGender = "male";

  // 성별 UI 전환 헬퍼 함수
  const updateGenderUI = (gender) => {
    selectedGender = gender;
    genderButtons.forEach((b) => {
      if (b.getAttribute("data-gender") === gender) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  };

  genderButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      updateGenderUI(btn.getAttribute("data-gender"));
    });
  });

  // 달력 인스턴스 초기화
  let kkaebiCalendar = null;
  if (birthInput && typeof flatpickr === "function") {
    kkaebiCalendar = flatpickr(birthInput, {
      locale: "ko",
      dateFormat: "Y.m.d H:i",
      enableTime: true,
      time_24hr: true,
      disableMobile: "true",
      allowInput: true,
      clickOpens: false,
      onChange: function (selectedDates, dateStr, instance) {
        birthInput.value = dateStr;
      },
    });

    if (calendarBtn) {
      calendarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        kkaebiCalendar.open();
      });
    }
  }

  const initSavedUserModal = () => {
    const savedName = localStorage.getItem("kkaebiUserName");
    const savedBirth = localStorage.getItem("kkaebiUserBirth");
    const savedGender = localStorage.getItem("kkaebiUserGender");
    const savedIsLunar = localStorage.getItem("kkaebiUserIsLunar") === "true";
    const savedUnknownTime = localStorage.getItem("kkaebiUserUnknownTime") === "true";

    // 데이터가 멀쩡히 보존되어 있을 때만 모달 오픈
    if (savedName && savedBirth && kkaebiLoadModal) {
      kkaebiLoadModal.classList.remove("hidden");
      document.body.style.overflow = "hidden"; // 배경 스크롤 방지

      // 1) 불러오기 클릭 시 인풋창에 데이터 바인딩 싱크 처리
      btnLoadCached?.addEventListener("click", () => {
        if (userNameInput) userNameInput.value = savedName;
        if (savedGender) updateGenderUI(savedGender);

        if (isLunarCheckbox) {
          isLunarCheckbox.checked = savedIsLunar;
          const fakeLunarBtn = document.querySelector(".btn-lunar-fake");
          if (fakeLunarBtn && savedIsLunar) fakeLunarBtn.classList.add("active");
        }

        if (unknownTimeCheckbox && birthInput) {
          unknownTimeCheckbox.checked = savedUnknownTime;
          if (savedUnknownTime) {
            birthInput.placeholder = "YYYY.MM.DD";
            kkaebiCalendar?.set("enableTime", false);
            kkaebiCalendar?.set("dateFormat", "Y.m.d");
          } else {
            birthInput.placeholder = "YYYY.MM.DD HH:MM";
            kkaebiCalendar?.set("enableTime", true);
            kkaebiCalendar?.set("dateFormat", "Y.m.d H:i");
          }
        }

        if (birthInput) birthInput.value = savedBirth;

        // 모달 닫기
        kkaebiLoadModal.classList.add("hidden");
        document.body.style.overflow = "";
      });

      // 2) 새로하기 클릭 시 깔끔하게 기존 운세/인적사항 캐시 비우고 새로 시작
      btnLoadFresh?.addEventListener("click", () => {
        localStorage.removeItem("kkaebiCacheTotalKey");
        localStorage.removeItem("kkaebiCacheTotalData");
        localStorage.removeItem("kkaebiCacheTodayKey");
        localStorage.removeItem("kkaebiCacheTodayData");

        // 폼 인풋값 명시적 초기화
        if (userNameInput) userNameInput.value = "";
        if (birthInput) birthInput.value = "";
        updateGenderUI("male");
        if (isLunarCheckbox) isLunarCheckbox.checked = false;
        if (unknownTimeCheckbox) unknownTimeCheckbox.checked = false;

        const fakeLunarBtn = document.querySelector(".btn-lunar-fake");
        if (fakeLunarBtn) fakeLunarBtn.classList.remove("active");

        // 모달 닫기
        kkaebiLoadModal.classList.add("hidden");
        document.body.style.overflow = "";
      });
    }
  };

  // 기본 세팅 완료 후 실행
  initSavedUserModal();

  // 시간 모름 토글 처리 로직
  if (unknownTimeCheckbox && birthInput) {
    unknownTimeCheckbox.addEventListener("change", (e) => {
      let currentValue = birthInput.value.trim();

      if (e.target.checked) {
        birthInput.placeholder = "YYYY.MM.DD";
        if (kkaebiCalendar) {
          kkaebiCalendar.set("enableTime", false);
          kkaebiCalendar.set("dateFormat", "Y.m.d");
        }
        if (currentValue) {
          birthInput.value = currentValue.split(" ")[0];
        }
      } else {
        birthInput.placeholder = "YYYY.MM.DD HH:MM";
        if (kkaebiCalendar) {
          kkaebiCalendar.set("enableTime", true);
          kkaebiCalendar.set("dateFormat", "Y.m.d H:i");
        }
        if (currentValue && !currentValue.includes(" ")) {
          birthInput.value = `${currentValue} 00:00`;
        }
      }
    });
  }

  // 키보드 타이핑 자동 포맷터 코드 구간
  if (birthInput) {
    birthInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/[^0-9]/g, "");
      let formatted = "";

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
        return;
      }

      if (value.length > 12) value = value.substr(0, 12);

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

  // 로컬 정보 빌드 저장 함수
  const saveUserData = () => {
    const userName = userNameInput.value.trim();
    const birthDate = birthInput.value.trim();
    if (!userName || !birthDate) return false;

    localStorage.setItem("kkaebiUserName", userName);
    localStorage.setItem("kkaebiUserGender", selectedGender);
    localStorage.setItem("kkaebiUserBirth", birthDate);
    localStorage.setItem("kkaebiUserIsLunar", isLunarCheckbox ? isLunarCheckbox.checked : false);
    localStorage.setItem("kkaebiUserUnknownTime", unknownTimeCheckbox ? unknownTimeCheckbox.checked : false);
    sessionStorage.setItem("kkaebi_run_fetch", "true");
    return true;
  };

  if (fortuneForm) {
    fortuneForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!saveUserData()) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.querySelector(".kkaebi-spinner")?.classList.remove("hidden");
      }
      window.location.href = "./result";
    });
  }

  if (goToTodayDirectBtn) {
    goToTodayDirectBtn.addEventListener("click", () => {
      if (!fortuneForm.reportValidity()) {
        return;
      }

      if (saveUserData()) {
        window.location.href = "./today";
      }
    });
  }
});
