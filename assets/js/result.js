document.addEventListener("DOMContentLoaded", async () => {
  // 브라우저 로컬 저장소에서 전 페이지가 심어둔 인적 사항 데이터 가로채기
  const userName = localStorage.getItem("kkaebiUserName") || "사용자";
  const selectedGender = localStorage.getItem("kkaebiUserGender") || "male";
  const birthDate = localStorage.getItem("kkaebiUserBirth") || "";
  const isLunar = localStorage.getItem("kkaebiUserIsLunar") === "true";

  // DOM 노드 엘리먼트 객체 추출
  const userPlaceholder = document.getElementById("user-placeholder");
  const financeParagraph = document.getElementById("fortune-finance");
  const relationParagraph = document.getElementById("fortune-relation");
  const wellnessParagraph = document.getElementById("fortune-wellness");

  const finalCtaBtn = document.getElementById("finalCtaBtn");
  const todayFortuneBtn = document.getElementById("todayFortuneBtn");

  const kkaebiPaymentModal = document.getElementById("kkaebiPaymentModal");
  const payModalCloseBtn = document.getElementById("payModalCloseBtn");
  const payModalCancelBtn = document.getElementById("payModalCancelBtn");
  const realPayStartBtn = document.getElementById("realPayStartBtn");

  if (userPlaceholder) userPlaceholder.textContent = userName;

  const loadingPhrases = [
    "깨비가 방망이를 휘둘러<br />당신의 2027년 운명을 계산하고 있습니다...",
    "한국천문연구원 정본 만세력을 기반으로<br />당신의 타고난 사주 원국 기둥을 조립하는 중...",
    "당신의 영혼을 뜻하는 '일간' 기운과<br />2027년 정미년 오행의 상생·상극 대조 중...",
    "재물운의 물줄기를 트고<br />인간관계 속 스쳐 갈 귀인의 타이밍을 유추하는 중...",
    "뜨거운 정화(火)의 화기를 다스릴<br />맞춤형 액땜 건강 처방전을 봉인하는 중...",
    "아이고 머리야.. <br />해석하는데 예상보다 시간이 많이 걸리고 있어... <br /> 조금만 더 기다려줘,, 깨비!",
  ];

  let phraseIndex = 0;
  let loadingInterval = null;

  const startKkaebiTextAnimation = () => {
    const textNode = document.getElementById("dynamic-loading-text");
    if (!textNode) return;

    loadingInterval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
      textNode.innerHTML = loadingPhrases[phraseIndex];
    }, 4000);
  };

  // 화면에 데이터를 최종 렌더링하는 공통 함수
  // 화면에 데이터를 최종 렌더링하는 공통 함수 (기문 파싱 에러 완벽 복구 버전)
  const renderSajuData = (resData) => {
    if (!resData || !resData.success || !resData.data) return;

    if (financeParagraph) financeParagraph.innerHTML = resData.data.finance;
    if (relationParagraph) relationParagraph.innerHTML = resData.data.relation;
    if (wellnessParagraph) wellnessParagraph.innerHTML = resData.data.wellness;

    const calcBirthText = document.getElementById("calc-birth-text");
    if (calcBirthText && resData.data.meta) {
      const meta = resData.data.meta;
      const isLunarCheck = localStorage.getItem("kkaebiUserIsLunar") === "true";

      if (isLunarCheck && meta.solarBirth) {
        calcBirthText.textContent = `${meta.solarBirth}생 (양력 변환)`;
      } else {
        const clean = birthDate.replace(/[^0-9]/g, "");
        const sYear = clean.substring(0, 4);
        const sMonth = parseInt(clean.substring(4, 6), 10);
        const sDay = parseInt(clean.substring(6, 8), 10);
        calcBirthText.textContent = `${sYear}년 ${sMonth}월 ${sDay}일생 (양력)`;
      }
    }

    const meta = resData.data.meta;
    if (meta) {
      const getOhengClass = (char) => {
        if (!char) return "";
        if ("갑을인묘".includes(char)) return "oheng-wood";
        if ("병정사오".includes(char)) return "oheng-fire";
        if ("무기진술축미".includes(char)) return "oheng-earth";
        if ("경신신유".includes(char)) return "oheng-metal";
        if ("임계해자".includes(char)) return "oheng-water";
        return "";
      };

      const splitPillar = (pillarStr) => {
        if (typeof pillarStr === "string" && pillarStr.length >= 2) {
          return [pillarStr.charAt(0), pillarStr.charAt(1)];
        }
        return ["?", "?"];
      };

      // 1. 연, 월, 일, 시 기둥 글자 분리 (천간, 지지)
      const pYear = splitPillar(meta.yearPillar);
      const pMonth = splitPillar(meta.monthPillar);
      const pDay = splitPillar(meta.dayPillar);
      const pHour = splitPillar(meta.hourPillar);

      // 2. 💡 [복구 완료] 각 글자에 알맞은 인덱스를 부여하고 오행 클래스를 매핑하여 마크업을 재생성합니다.
      document.getElementById("saju-yp").innerHTML = `<span class="${getOhengClass(pYear[0])}">${pYear[0]}</span><span class="${getOhengClass(pYear[1])}">${pYear[1]}</span>`;
      document.getElementById("saju-mp").innerHTML = `<span class="${getOhengClass(pMonth[0])}">${pMonth[0]}</span><span class="${getOhengClass(pMonth[1])}">${pMonth[1]}</span>`;
      document.getElementById("saju-dp").innerHTML = `<span class="${getOhengClass(pDay[0])}">${pDay[0]}</span><span class="${getOhengClass(pDay[1])}">${pDay[1]}</span>`;
      document.getElementById("saju-hp").innerHTML = `<span class="${getOhengClass(pHour[0])}">${pHour[0]}</span><span class="${getOhengClass(pHour[1])}">${pHour[1]}</span>`;

      document.getElementById("saju-dp").parentElement.classList.add("is-me");

      const pillarBox = document.getElementById("kkaebi-saju-pillar-box");
      if (pillarBox) pillarBox.style.display = "flex";

      const commentaryText = document.getElementById("saju-commentary-text");
      if (commentaryText) {
        const rawDay = meta.dayPillar || "";
        const rawYear = meta.yearPillar || "";
        const myIlGan = typeof rawDay === "string" && rawDay.length > 0 ? rawDay.charAt(0) : meta.ilGan || "갑";
        const myYearJi = typeof rawYear === "string" && rawYear.length > 1 ? rawYear.charAt(1) : "인";

        const sipsanCommentary = {
          갑: "하늘을 향해 곧게 뻗어 나가는 거대한 소나무(甲木)의 강력한 추진력을 품고 태어났구나! 책임감이 강하고 우두머리 기질이 있어 어떤 역경도 꿋꿋이 이겨내는 회복력이 네 최고의 무기야. 다가오는 2027년 정미년은 뜨거운 불(火)의 해라서, 네가 가슴속에 꽁꽁 숨겨두었던 천재적인 재능과 기막힌 아이디어가 용광로처럼 화려하게 피어오르는 최고의 무대가 열릴 거야. 의욕이 앞서 건강을 해치지 않게 페이스 조절만 잘해봐!",
          을: "바위 틈에서도 기어코 꽃을 피워내는 부드럽고 강인한 넝쿨식물(乙木)의 생명력을 타고나셨네! 환경 적응력이 뛰어나고 처세술이 좋으며, 주변 사람들을 편안하게 해주는 다정한 매력가야. 2027년 정미년은 따뜻한 태양 빛 아래 네가 품은 모든 잠재력이 화려한 꽃밭을 이루는 대길한 흐름이란다. 뿌린 대로 거두는 해이니 주저 말고 네 능력을 세상에 과감하게 뽐내어 실속 있는 결실을 움켜쥐어 봐!",
          정: "밤하늘을 은은하게 밝히는 따뜻한 모닥불이자 별빛(丁火)처럼 사려 깊은 마음씨를 가득 품고 있네! 내면이 대단히 섬세하고 직관력이 뛰어나며, 주변 사람들을 조용히 챙겨주는 든든한 조력자 스타일이야. 2027년 정미년은 너와 같은 천간 '정화'가 중첩되어 찾아오는 해로, 네 자존감과 뚝심이 단단해지는 해란다. 내 안의 불꽃이 너무 뜨거워져 스스로를 태우는 만성 피로나 감정 기복이 올 수 있으니 고집을 내려놓는 게 액땜 비책이야.",
          무: "수많은 생명을 품어주는 거대하고 웅장한 대산(戊土)의 단단한 무게감과 신용을 타고난 사주야! 한 번 마음먹은 일은 흔들림 없이 밀어붙이는 묵직한 뚝심이 있고, 누구나 와서 기댈 수 있는 든든한 바위 같은 사람이지. 2027년 정미년은 메마른 대지 위에 따뜻한 화기가 스며들어 흙을 더욱 기름지고 풍요롭게 제련해 주는 형국이야. 그동안 공들였던 노력들이 단단한 문서운이나 권리로 돌아와 네 지분이 크게 상승하니 당당하게 전진해 봐!",
          기: "모든 씨앗을 싹틔우는 기름진 황금빛 논밭과 정원(己土)의 포용력을 아주 조화롭게 타고나셨네! 어머니처럼 부드러운 심성에 남을 배려하는 능력이 탁월하고, 계획한 일을 꼼꼼하게 완성해 내는 실속파야. 2027년 정미년은 대지 위에 따뜻한 가뭄 끝 단비 같은 화기가 찾아와 네가 가진 재능의 싹을 무섭게 키워내 줄 거야. 보이지 않는 귀인의 도움으로 골치 아픈 계약이나 인간관계가 시원하게 해결될 대길할 흐름이란다.",
          경: "가공되지 않은 단단한 무쇠 바위나 거대한 칼(庚金)처럼 굳건하고 강인한 결단력을 가졌구나! 시시비비를 명확히 가려내는 날카로운 통찰력이 있고, 의리를 목숨처럼 소중히 여기는 멋진 대장부 스타일이야. 2027년 정미년은 뜨거운 용광로의 불길이 거친 무쇠 원석인 너를 혹독하고 정밀하게 제련하는 해가 될 거야. 과정 자체는 신경 쓸 일도 많고 조금 고될 수 있지만, 이 시기를 거치고 나면 네 몸값과 가치가 비교할 수 없이 귀하게 변하니 겁먹지 마!",
          신: "은은하게 빛을 내뿜는 정밀하게 세공된 보석이자 날카로운 메스(辛金)의 섬세한 기운을 가졌네! 자존심이 강하고 매사 완벽을 추구하며, 한눈에 핵심을 짚어내는 남다른 미적 감각과 천재성을 품은 사람이야. 2027년 정미년은 뜨거운 불길이 너라는 보석을 비추어 화려하게 스포트라이트를 받게 해주는 격이란다. 내 가치가 세상에 널리 알려져 스카우트 제의나 승진 기회가 찾아오지만, 예민해져 건강을 해칠 수 있으니 멘탈 관리에 신경 써줘!",
          임: "모든 것을 포용하며 흘러가는 넓은 밤바다와 거대한 강물(壬水)의 총명함을 품고 태어나셨네! 유연성이 뛰어나 어디든 잘 적응하고 지혜가 깊지만, 내면의 고독감이나 복잡한 생각의 늪에 빠지기 쉬운 면모가 있어. 다가오는 2027년 정미년은 차가운 네 물바다를 따뜻하게 녹여줄 구원투수 같은 뜨거운 불(火)과 단단한 문서(土)가 들어오는 해란다. 꽉 막혔던 답답함이 시원하게 풀리며 얼어붙었던 돈줄과 인맥이 스르륵 녹아내릴 거야!",
          계: "대지를 촉촉하게 적시는 맑은 이슬비와 지혜로운 시냇물(癸水)처럼 영리하고 다정한 성향이야! 감수성이 풍부하고 눈치가 빠rm며, 주변 상황에 맞춰 유연하게 대처하는 최고의 전략가 스타일이지. 2027년 정미년은 마른하늘에 따뜻한 열기가 가득 차올라 네 맑은 물기운이 귀중한 증기로 변해 하늘 높이 도약하는 형국이란다. 그동안 억울했던 일들이 명백히 풀리고, 네 지혜를 구하러 찾아오는 사람들이 늘어나 권위가 크게 바로 서는 대길한 흐름이야.",
        };

        let dokkaebiBonus = "";
        if ("인오술".includes(myYearJi)) {
          dokkaebiBonus = ` <br /><br /><b>여기에 더해, 너에겐 '불 도깨비'의 붉은 방망이 기운이 깃들었어!</b><br /> 내년 정미년의 뜨거운 화기가 네 띠의 열정과 결합하면서 시너지 효과가 폭발하게 돼. 망설이던 일이 있다면 당장 저질러봐! 불 도깨비가 판을 깔아줄 테니 과감하게 전진하면 통장과 명예가 동시에 두둑해질 거야!`;
        } else if ("신자진".includes(myYearJi)) {
          dokkaebiBonus = ` <br /><br /><b>여기에 더해, 너에겐 '물 도깨비'의 푸른 처방전 기운이 합쳐졌단다!</b><br /> 내년에 들이닥치는 정미년의 뜨거운 열기를 네가 가진 맑은 지혜의 물길로 유연하게 다스리는 형국이야. 주변 사람들이 우왕좌왕할 때 너 혼자 중심을 딱 잡고 위기를 기회로 바꿔 큰 이득을 챙길 귀인 역할을 톡톡히 해낼 거야!`;
        } else if ("사유축".includes(myYearJi)) {
          dokkaebiBonus = ` <br /><br /><b>여기에 더해, 너에겐 '쇠 도깨비'의 황금 부적 기운이 장착되었어!</b><br /> 정미년의 뜨거운 불길이 네 단단한 결단력을 용광로처럼 단련시켜 주는 최고의 해가 될 거야. 귀찮고 복잡한 일들이 단번에 정리되고, 네 권리나 지분, 문서 자산이 황금처럼 단단하게 굳어 굳건한 안정을 누리게 되니 뚝심 있게 밀고 나가봐!`;
        } else {
          dokkaebiBonus = ` <br /><br /><b>여기에 더해, 너에겐 '나무 도깨비'의 초록 약초 기운이 더해졌단다!</b><br /> 정미년의 흙(土) 속에 네 굳건한 뿌리를 깊숙이 내리는 안정적인 해가 될 거야. 그동안 이리저리 흔들리던 주거, 직장, 계약 문제가 든든한 버팀목을 만나 정착하게 되고, 건강과 마음의 평화를 동시에 되찾아 줄 도깨비 약초가 덤으로 굴러 들어올 징조야!`;
        }

        const baseText = sipsanCommentary[myIlGan] || sipsanCommentary["갑"];
        commentaryText.innerHTML = baseText + dokkaebiBonus;
      }
    }
  };

  // API 통신 및 가동 제어부
  if (birthDate) {
    const cachedDataStr = localStorage.getItem("kkaebiCachedSajuData");
    const cachedBirth = localStorage.getItem("kkaebiCachedBirth");

    if (cachedDataStr && cachedBirth === birthDate) {
      try {
        const cachedRes = JSON.parse(cachedDataStr);
        renderSajuData(cachedRes);
        // 💡 중요: 여기서 return;을 해버리면 하단의 이벤트 리스너 등록 코드가 실행되지 않는 버그가 발생함
        // 버그 해결을 위해 return 대신 하단 API 통신을 실행하지 않도록 분기를 나눕니다.
      } catch (e) {
        console.error("캐시 파싱 에러, API 재통신 시도", e);
        await fetchSajuFromServer();
      }
    } else {
      await fetchSajuFromServer();
    }
  } else {
    setAllFortuneText("입력된 사주 정보가 없습니다. 첫 화면에서 다시 입력해 주세요.");
  }

  // 💡 서버에서 데이터를 가져오는 독립 함수 분리
  async function fetchSajuFromServer() {
    const loadingOverlay = document.getElementById("kkaebi-loading");
    if (loadingOverlay) {
      loadingOverlay.classList.remove("hidden");
      startKkaebiTextAnimation();
    }

    try {
      const response = await fetch("/api/saju", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, userName, gender: selectedGender, isLunar: isLunar }),
      });

      if (!response.ok) throw new Error(`Server status ${response.status}`);
      const resData = await response.json();

      if (resData.success && resData.data) {
        renderSajuData(resData);
        localStorage.setItem("kkaebiCachedSajuData", JSON.stringify(resData));
        localStorage.setItem("kkaebiCachedBirth", birthDate);
      } else {
        setAllFortuneText("운세 데이터를 파싱하지 못했습니다. 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error("통신 에러 로그:", error);
      setAllFortuneText("깨비의 사주 계산기에 일시적 에러가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      if (loadingOverlay) loadingOverlay.classList.add("hidden");
    }
  }

  function setAllFortuneText(msg) {
    if (financeParagraph) financeParagraph.textContent = msg;
    if (relationParagraph) relationParagraph.textContent = msg;
    if (wellnessParagraph) wellnessParagraph.textContent = msg;
  }

  // 캐시 상태와 상관없이 항상 정상 등록되는 이벤트 리스너 영역
  if (todayFortuneBtn) {
    todayFortuneBtn.addEventListener("click", () => {
      window.location.href = "./today";
    });
  }

  if (finalCtaBtn) {
    finalCtaBtn.addEventListener("click", () => {
      if (kkaebiPaymentModal) {
        kkaebiPaymentModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      }
    });
  }

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

  if (realPayStartBtn) {
    realPayStartBtn.addEventListener("click", () => {
      closePayModal();
      window.location.href = "./premium-result";
    });
  }

  const goSajuAnalysisBtn = document.getElementById("goSajuAnalysisBtn");
  if (goSajuAnalysisBtn) {
    goSajuAnalysisBtn.addEventListener("click", () => {
      window.location.href = "./saju-manse";
    });
  }
});
