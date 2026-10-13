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

      // result.js 내부 fetch response 수신 성공 분기점 처리부
      if (resData.success && resData.data) {
        // 1. 기존 삼재 운세 텍스트 바인딩
        if (financeParagraph) financeParagraph.textContent = resData.data.finance;
        if (relationParagraph) relationParagraph.textContent = resData.data.relation;
        if (wellnessParagraph) wellnessParagraph.textContent = resData.data.wellness;

        // 2. 💡 [신규] 백엔드가 만세력 라이브러리로 계산해 준 명리학 메타데이터 추출
        // result.js 내부 resData.success 성공 분기 속 meta 처리부 교체
        const meta = resData.data.meta;
        if (meta) {
          // 1. 오행별 색상 클래스를 매핑하는 내부 헬퍼 함수 정의
          const getOhengClass = (char) => {
            if (!char) return "";
            // 목(木) : 푸른 나무
            if ("갑을인묘".includes(char)) return "oheng-wood";
            // 화(火) : 뜨거운 불
            if ("병정사오".includes(char)) return "oheng-fire";
            // 토(土) : 단단한 흙
            if ("무기진술축미".includes(char)) return "oheng-earth";
            // 금(金) : 빛나는 보석/바위
            if ("경신신유".includes(char)) return "oheng-metal";
            // 수(水) : 깊은 물
            if ("임계해자".includes(char)) return "oheng-water";
            return "";
          };

          // 2. 글자 쪼개기 헬퍼 (예: "임자" -> ['임', '자'])
          const splitPillar = (pillarStr) => {
            if (typeof pillarStr === "string" && pillarStr.length >= 2) {
              return [pillarStr.charAt(0), pillarStr.charAt(1)];
            }
            return ["?", "?"];
          };

          const pYear = splitPillar(meta.yearPillar);
          const pMonth = splitPillar(meta.monthPillar);
          const pDay = splitPillar(meta.dayPillar);
          const pHour = splitPillar(meta.hourPillar);

          // 3. 네 기둥 마크업 동적 조립 (각 글자에 오행 클래스 부여 + 일주에만 강조용 'is-me' 클래스 삽입)
          document.getElementById("saju-yp").innerHTML = `<span class="${getOhengClass(pYear[0])}">${pYear[0]}</span><span class="${getOhengClass(pYear[1])}">${pYear[1]}</span>`;
          document.getElementById("saju-mp").innerHTML = `<span class="${getOhengClass(pMonth[0])}">${pMonth[0]}</span><span class="${getOhengClass(pMonth[1])}">${pMonth[1]}</span>`;
          document.getElementById("saju-dp").innerHTML = `<span class="${getOhengClass(pDay[0])}">${pDay[0]}</span><span class="${getOhengClass(pDay[1])}">${pDay[1]}</span>`;
          document.getElementById("saju-hp").innerHTML = `<span class="${getOhengClass(pHour[0])}">${pHour[0]}</span><span class="${getOhengClass(pHour[1])}">${pHour[1]}</span>`;

          // 일주 카드 엘리먼트에 '주인공 부적' 효과를 위한 태그(is-me) 추가
          document.getElementById("saju-dp").parentElement.classList.add("is-me");

          // 숨겨져 있던 만세력 부적 박스 스무스하게 오픈
          const pillarBox = document.getElementById("kkaebi-saju-pillar-box");
          if (pillarBox) pillarBox.style.display = "flex";

          // 4. 일간 오행별 2배 확장 멘트 출력부 (앞서 연동한 코드 그대로 하단에 위치)
          const ilGan = meta.ilGan;
          const commentaryText = document.getElementById("saju-commentary-text");
          if (commentaryText) {
            let ohengComment = "";
            if (ilGan === "갑" || ilGan === "을") {
              ohengComment = `하늘을 향해 뻗어 나가는 푸른 나무(木)의 성장 기운을 타고나셨네! 기본적으로 인정이 많고 명예를 소중히 여기며, 아무리 힘들어도 다시 일어나는 대단한 회복력을 가진 사람이야. 다가오는 2027년 정미년은 뜨거운 불(火)의 해라서, 네가 가슴속에만 품고 있던 기막힌 재능과 아이디어를 세상에 화려하게 피워내고 인정받는 최고의 무대가 열릴 거야. 다만 의욕이 너무 앞서면 몸이 먼저 지칠 수 있으니, 상반기에는 속도를 조절하면서 네 페이스를 지키는 게 무엇보다 중요해, 알았지?`;
            } else if (ilGan === "병" || ilGan === "정") {
              ohengComment = `세상을 환하게 밝히는 뜨거운 불(火)의 열정과 다정한 에너지를 가득 품고 태어나셨구나! 행동력이 뛰어나고 불의를 보면 참지 못하며, 주변 사람들을 따뜻하게 챙겨주는 매력적인 리더 스타일이야. 2027년 정미년은 너와 같은 강력한 불의 기운이 한 번 더 중첩되어 들어오는 시기야. 내 주관과 추진력이 강해져서 밀어붙이는 힘은 최고조에 달하겠지만, 나도 모르게 말이 뾰족하게 나가거나 독단적인 선택으로 주변과 마찰이 생길 수 있으니 올해만큼은 '한 템포 쉬어가는 미덕'을 꼭 발휘해 줘!`;
            } else if (ilGan === "무" || ilGan === "기") {
              ohengComment = `모든 것을 품어주는 넓은 대지와 황금빛 흙(土)의 포용력을 아주 단단하게 타고난 사주야! 책임감이 강하고 신용을 목숨처럼 지키며, 주변 사람들이 언제든 찾아와 기댈 수 있는 든든한 바위 같은 성향을 가지고 있어. 2027년 정미년은 메마른 대지 위에 따뜻한 태양이 내리쬐어 흙을 더욱 기름지게 만드는 형국이란다. 그동안 공들였던 노력들이 단단한 문서운이나 귀인의 도움으로 돌아와 네 권리 지분이 크게 상승할 징조니까, 스스로를 믿고 당당하게 전진해 봐!`;
            } else if (ilGan === "경" || ilGan === "신") {
              ohengComment = `단단한 바위나 정밀하게 세공된 빛나는 보석(金)의 기운을 가지고 태어난 굳건한 사주네! 결단력이 대단하고 시시비비를 명확히 가려내며, 한 번 목표를 정하면 칼을 뽑아 드는 날카로운 통찰력과 의리가 강력한 매력이야. 2027년 정미년은 뜨거운 용광로의 불길이 너라는 원석을 혹독하게 제련하는 해가 될 거야. 과정 자체는 신경 쓸 일도 많고 조금 고될 수 있지만, 이 시기를 거치고 나면 네 몸값과 가치가 비교할 수 없을 정도로 아름답게 빛나게 되니 겁먹지 말고 맞서봐!`;
            } else if (ilGan === "임" || ilGan === "계") {
              ohengComment = `깊은 밤바다와 지혜로운 시냇물(水)의 성향을 품어 대단히 총명하고 생각이 깊은 사람이구나! 유연성이 뛰어나 어디든 잘 적응하지만, 사주 온 사방에 차가운 물기운이 가득해 남모를 외로움이나 생각의 늪에 빠지기 쉬운 면모가 있어. 다가오는 2027년 정미년은 네 얼어붙은 물바다 사주를 따뜻하게 녹여줄 뜨거운 불(火)과 마른 흙(土)이 구원투수처럼 들어오는 해란다. 꽉 막혔던 답답함이 시원하게 풀리면서 얼어붙었던 돈줄과 얼어붙은 마음이 사르르 녹아내리는 대길한 흐름이 시작될 거야!`;
            } else {
              ohengComment = `타고난 만세력의 정밀한 오행 기운과 밸런스를 바탕으로, 깨비랑이 당신만을 위한 2027년 정미년 맞춤형 운명 처방 풀이를 완벽하게 끝마쳤어! 차근차근 아래 카드들을 읽어보며 다가올 행운의 타이밍을 잡아봐!`;
            }
            commentaryText.textContent = ohengComment;
          }
        }
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
