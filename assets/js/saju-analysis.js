// ./assets/js/saju-analysis.js
document.addEventListener("DOMContentLoaded", async () => {
  const userName = localStorage.getItem("kkaebiUserName") || "사용자";
  const birthDate = localStorage.getItem("kkaebiUserBirth") || "";
  const selectedGender = localStorage.getItem("kkaebiUserGender") || "male";
  const isLunar = localStorage.getItem("kkaebiUserIsLunar") === "true";
  const isUnknownTime = localStorage.getItem("kkaebiUserUnknownTime") === "true";
  const backToTotalFortuneBtn = document.getElementById("backToTotalFortuneBtn");
  const goBackToInputBtn = document.getElementById("goBackToInputBtn");

  if (!birthDate) {
    alert("인적 사항 데이터 조회가 되지 않습니다 깨비! 입력창으로 복귀합니다.");
    window.location.href = "./index";
    return;
  }

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

  const userPlaceholder = document.getElementById("user-placeholder");
  if (userPlaceholder) userPlaceholder.textContent = userName;

  document.getElementById("goDaeunPageBtn")?.addEventListener("click", () => {
    window.location.href = "./daeun-result";
  });
  document.getElementById("backToResultBtn")?.addEventListener("click", () => {
    window.location.href = "./result";
  });
  document.getElementById("backToTodayBtn")?.addEventListener("click", () => {
    window.location.href = "./today";
  });

  const renderAnalysisDOM = (cardsList) => {
    const deck = document.getElementById("analysisDeck");
    if (!deck) return;
    deck.innerHTML = "";

    cardsList.forEach((item) => {
      const card = document.createElement("div");
      card.className = "fortune-card";
      card.style.cursor = "default";

      let tagClass = "tag-birth";
      if (item.category === "FINANCE") tagClass = "tag-money";
      if (item.category === "RELATION") tagClass = "tag-love";
      if (item.category === "DIAGNOSIS") tagClass = "analysis-header-tag";

      let listHTML = "";
      if (item.bullets && Array.isArray(item.bullets)) {
        item.bullets.forEach((b) => {
          listHTML += `<li>${b}</li>`;
        });
      }

      card.innerHTML = `
        <div class="card-header-zone">
          <div class="card-tag ${tagClass}">${item.category}</div>
          <h3 class="card-title" style="font-size: 1.15rem;">${item.title}</h3>
        </div>
        <div style="text-align: left; margin-top: 4px;">
          <span class="badge-keyword">${item.badge}</span>
        </div>
        <p class="card-desc" style="text-align: left; margin-top: 10px; color: #ffffff; font-weight: 500;">
          ${item.desc}
        </p>
        <ul class="bullet-list">
          ${listHTML}
        </ul>
      `;
      deck.appendChild(card);
    });
  };

  const loadingScreen = document.getElementById("kkaebi-loading");
  const resultScreen = document.getElementById("kkaebi-step-result");

  // 🛠️ [캐시 확인 엔진] 입력 정보가 동일한지 대조
  const analysisCacheKey = `manse_analysis_${userName}_${selectedGender}_${birthDate}_${isLunar}_${isUnknownTime}`;
  const cachedDataString = localStorage.getItem("kkaebiCacheManseData");
  const cachedKeyString = localStorage.getItem("kkaebiCacheManseKey");

  if (cachedKeyString === analysisCacheKey && cachedDataString) {
    try {
      const parsedData = JSON.parse(cachedDataString);
      renderAnalysisDOM(parsedData);

      if (loadingScreen) loadingScreen.classList.add("hidden");
      if (resultScreen) resultScreen.classList.remove("hidden");
      return; // 💥 캐시가 완벽히 일치하므로 실제 API 요청을 차단하고 함수를 종료합니다! [1.2]
    } catch (e) {
      console.warn("캐시 오염, 신규 AI 계산 처리");
    }
  }

  // 캐시가 없거나 유저가 새로 입력했을 경우에만 실제 서버 엔드포인트 호출 [1.2]
  try {
    const response = await fetch("api/saju-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate: birthDate,
        userName: userName,
        gender: selectedGender,
        isLunar: isLunar,
      }),
    });

    if (!response.ok) throw new Error(`Server status ${response.status}`);
    const resData = await response.json();

    if (resData.success && resData.data) {
      renderAnalysisDOM(resData.data);

      // 💡 다음 조회를 대비해 받아온 실시간 제미나이 풀이 배열을 로컬스토리지에 저장
      localStorage.setItem("kkaebiCacheManseKey", analysisCacheKey);
      localStorage.setItem("kkaebiCacheManseData", JSON.stringify(resData.data));
    } else {
      alert("도깨비의 사주 데이터를 파싱하지 못했습니다 깨비!");
    }
  } catch (error) {
    console.error("실시간 사주 분석 API 요청 실패:", error);
    alert("사주 연산 장치에 연결하지 못했습니다.");
  } finally {
    if (loadingScreen) loadingScreen.classList.add("hidden");
    if (resultScreen) resultScreen.classList.remove("hidden");
  }
});
