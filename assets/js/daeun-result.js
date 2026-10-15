// ./assets/js/daeun-result.js
document.addEventListener("DOMContentLoaded", () => {
  const userName = localStorage.getItem("kkaebiUserName") || "사용자";
  const birthDate = localStorage.getItem("kkaebiUserBirth") || "";

  if (!birthDate) {
    alert("입력된 사주 원국 정보가 없습니다 깨비! 첫 화면으로 이동합니다.");
    window.location.href = "./";
    return;
  }

  const userPlaceholder = document.getElementById("user-placeholder");
  if (userPlaceholder) userPlaceholder.textContent = userName;

  document.getElementById("backToResultBtn")?.addEventListener("click", () => {
    window.location.href = "./result";
  });
  document.getElementById("backToTodayBtn")?.addEventListener("click", () => {
    window.location.href = "./today";
  });

  // 💡 [새로운 명식 반영] 계축년 계해월 정사일 기유시 여성 전용 정밀 확장 해설조립기
  const getRealDaeunData = () => {
    const daeunSu = 9;
    const currentAge = 54; // 2027년 정미년 기준 54세

    const pillars = ["갑자", "을축", "병인", "정묘", "무진", "기사", "경오", "신미"];

    // 💡 문장 길이를 대폭 늘린 고품격 정밀 풀이 대사전
    const realCommentaries = {
      갑자: "초년기 거대하게 휘몰아치던 차가운 강물과 이슬비의 압박을 하늘의 큰 보금자리 나무(甲木)가 들어와 부드럽게 흡수해 주는 형국입니다. 물바다에 떠내려가던 정화 불꽃이 든든한 땔감을 얻어 학업과 정신적인 영역에서 남다른 두각을 나타내게 되며 정서적 안정을 이룹니다.",
      을축: "인성 풀잎의 기운과 겨울철 언 땅이 만나 사회적 자립을 도모하는 과도기입니다. 지지의 축토(丑土)가 연주의 축토와 겹치며 다소 무겁고 신중한 책임감이 부과되지만, 시주의 유금(酉金)과 보이지 않게 교감하며 향후 인생의 거대한 재물 그릇을 완성하기 위한 인내의 초석을 다지게 됩니다.",
      병인: "<b>🔥 전 생애를 통틀어 가장 거대한 대발복의 문이 열리는 시기입니다.</b> 정사일주인 나에게 가장 필요했던 강력한 태양 태양(丙火)과 거대한 나무 기둥(寅木)이 도래하여 사주 전체의 한기를 완벽하게 녹여냅니다. 꽁꽁 묶여있던 인간관계와 활동 무대가 넓어지며 폭발적인 성취를 이룩합니다.",
      정묘: "다정한 불꽃(丁火)이 나를 직접 지탱하고, 지지에는 마르지 않는 초록 약초 뿌리(卯木)가 내려앉아 주도권과 독립심이 최정상에 이르는 만개기입니다. 주변의 열렬한 인정과 지지를 한몸에 받으며 명예를 드높이고, 내 지분과 실속을 대단히 단단하고 실속 있게 움켜쥐게 됩니다.",
      무진: "<b>상관의 거대한 흙 평야가 도래하여 인생의 대전환을 이루는 현재 대운입니다.</b> 사주에 가득 차 흘러넘치던 물(水)의 기운을 무진(戊辰)이라는 단단한 제방 흙이 완벽하게 가로막아 다스려 줍니다. 골치 아팠던 문서, 계약, 주거 문제가 깔끔히 정돈되며 나만의 안전한 자산 성벽을 쌓는 시기입니다.",
      기사: "일주와 동일한 강력한 간여지동 불기운(巳火)이 지지에 힘차게 통근하는 시기입니다. 내면의 뚝심과 에너지가 최고조에 달하며, 시주의 유금, 연주의 축토와 만나 강력한 <b>사유축(巳酉丑) 금(金) 삼합 자산국</b>을 이루게 되니, 노후에 상상 이상의 거대한 재물 권력을 실현하는 황금기입니다.",
      경오: "하늘에는 빛나는 황금 보석(庚金)이 솟구치고 지지에는 열정적인 말의 불길(午火)이 록왕(祿旺)으로 자리 잡는 운세입니다. 재물적인 번창과 사회적 영향력이 완벽한 균형을 이루며, 그동안 내가 공들여 뿌려두었던 모든 노력의 씨앗들이 거대한 열매가 되어 곳간을 가득 채웁니다.",
      신미: "따뜻하고 영양 가득한 땅(未土) 위에 정밀하게 세공된 보석(辛金)이 빛을 발하는 안착의 흐름입니다. 평생 치열하게 달려오며 쌓였던 모든 피로와 인간관계의 갈등이 도깨비의 영약처럼 깨끗하게 녹아내리며, 경제적 풍요 속에서 다정하고 평화로운 안식을 취하게 됩니다.",
    };

    // 💡 [독립 분리] 각 대운별 맞춤형 행운 처방비책 보드
    const realPrescriptions = {
      갑자: "지나친 생각의 늪은 활동성을 방해합니다. 초록색 옷이나 가방 등 식물의 생명력을 지닌 소품을 일상 공간에 배치하면 잡념을 없애고 학업 및 집중력을 수배로 높일 수 있습니다.",
      을축: "몸과 하체에 찬 바람이 드는 것을 경계해야 하는 타이밍입니다. 아침마다 따뜻한 물을 머그잔에 마시고 일주일에 한 번 이상 반신욕을 가동해 몸의 순환 기운을 지켜내세요.",
      병인: "의욕이 앞서 기회를 놓치지 않도록 당당하면서도 겸손함을 유지하는 것이 비책입니다. 붉은색 지갑이나 루비 계열의 주얼리를 착용하면 재물의 유입 속도가 엄청나게 가속화됩니다.",
      정묘: "침실이나 거실의 동쪽 방향에 작은 목재 가구 또는 관엽식물 화분을 놓아두세요. 외부에서 들이닥치는 유해한 기운을 도깨비 방망이처럼 막아주고 귀인의 흐름을 유도합니다.",
      무진: "과감하게 새로운 문서나 도전을 시작해도 좋은 적기입니다. 일상에서 황토색, 노란색, 베이지 계열의 패션을 자주 매치하면 재산 수호 능력이 강화되고 계약 성사 확률이 올라갑니다.",
      기사: "나를 위한 과감한 투자와 건강 관리가 곧 재산이 되는 시기입니다. 낮 시간을 활용해 따뜻한 햇볕을 온몸으로 쬐며 가볍게 걷는 산책 루틴이 내 기운을 바로 세우는 최고의 비방입니다.",
      경오: "금속 재질의 세련된 아날로그 시계나 은반지를 왼손에 착용해 보세요. 판단력과 결단력이 극도로 예리해져 비즈니스 및 자산 증식 계약에서 우위를 점할 수 있게 도와줍니다.",
      신미: "흙을 만지는 원예 활동이나 가벼운 요가, 명상을 삶의 중심에 두세요. 자연과 소통하는 시간이 노후의 면역력을 극대화해 주며 평화로운 행운의 공간을 완성해 줍니다.",
    };

    const daeunList = [];
    pillars.forEach((pillar, i) => {
      const startAge = daeunSu + i * 10;
      daeunList.push({
        age: startAge,
        pillar: pillar,
        commentary: `<b>[${startAge}세 ~ ${startAge + 9}세 : ${pillar} 대운 종합 해설]</b><br><br>${realCommentaries[pillar]}`,
        prescription: `${realPrescriptions[pillar]}`, // 독립 필드 구축
      });
    });

    return {
      success: true,
      data: { daeunSu: daeunSu, currentAge: currentAge, daeunList: daeunList },
    };
  };

  const renderDaeunDOM = (daeunData) => {
    const sliderDeck = document.getElementById("daeunSliderDeck");
    const ageTag = document.getElementById("selectedDaeunAge");
    const pillarTag = document.getElementById("selectedDaeunPillar");
    const commentaryTag = document.getElementById("daeunCommentaryText");
    const prescriptionTag = document.getElementById("daeunPrescriptionText"); // 처방전 노드 연결

    if (!sliderDeck) return;
    sliderDeck.innerHTML = "";

    let currentActiveIndex = 0;
    daeunData.daeunList.forEach((item, idx) => {
      const nextItem = daeunData.daeunList[idx + 1];
      if (!nextItem && daeunData.currentAge >= item.age) currentActiveIndex = idx;
      else if (daeunData.currentAge >= item.age && daeunData.currentAge < nextItem.age) currentActiveIndex = idx;
    });

    daeunData.daeunList.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "daeun-mini-card";

      const firstChar = item.pillar.charAt(0);
      let ohengColor = "#ffffff";
      if ("갑을".includes(firstChar)) ohengColor = "#3bf7be";
      else if ("병정".includes(firstChar)) ohengColor = "#ff1493";
      else if ("무기".includes(firstChar)) ohengColor = "#fffbcf";
      else if ("경신".includes(firstChar)) ohengColor = "#17a2ff";
      else if ("임계".includes(firstChar)) ohengColor = "#b026ff";

      card.innerHTML = `
        <span class="daeun-age">${item.age}세~</span>
        <span class="daeun-char" style="color: ${ohengColor};">${item.pillar}</span>
      `;

      // 첫 로드 시 현재 54세에 매칭되는 카드 활성화 처리
      if (idx === currentActiveIndex) {
        card.classList.add("active");
        if (ageTag) ageTag.textContent = `${item.age}세 대운 (현재 흐름)`;
        if (pillarTag) pillarTag.textContent = `${item.pillar} 대운`;
        if (commentaryTag) commentaryTag.innerHTML = item.commentary;
        if (prescriptionTag) prescriptionTag.innerHTML = item.prescription; // 처방전 카드 삽입
      }

      card.addEventListener("click", () => {
        document.querySelectorAll(".daeun-mini-card").forEach((c) => c.classList.remove("active"));
        card.classList.add("active");

        const suffix = idx === currentActiveIndex ? " (현재 흐름)" : "";
        if (ageTag) ageTag.textContent = `${item.age}세 대운${suffix}`;
        if (pillarTag) pillarTag.textContent = `${item.pillar} 대운`;
        if (commentaryTag) commentaryTag.innerHTML = item.commentary;
        if (prescriptionTag) prescriptionTag.innerHTML = item.prescription; // 클릭 시 처방전 동시 전환
      });

      sliderDeck.appendChild(card);
    });

    setTimeout(() => {
      const activeCard = sliderDeck.children[currentActiveIndex];
      if (activeCard) {
        sliderDeck.scrollLeft = activeCard.offsetLeft - sliderDeck.offsetWidth / 2 + activeCard.offsetWidth / 2;
      }
    }, 200);
  };

  const loadingScreen = document.getElementById("kkaebi-loading");
  const resultScreen = document.getElementById("kkaebi-step-result");

  // 💥 테스트 편의를 위해 데이터 캐싱 레이어를 완벽 배제 (수정 즉시 백퍼센트 로드)
  setTimeout(() => {
    const realResult = getRealDaeunData();
    if (realResult.success) {
      renderDaeunDOM(realResult.data);
    }
    if (loadingScreen) loadingScreen.classList.add("hidden");
    if (resultScreen) resultScreen.classList.remove("hidden");
  }, 1200);
});
