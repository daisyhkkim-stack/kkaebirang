// PARSE PARAMS AND INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("user") || "이름 없음";
  const idolName = urlParams.get("idol") || "최애";

  const userNameDisplay = document.getElementById("userNameDisplay");
  const idolNameDisplay = document.getElementById("idolNameDisplay");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const resultTitle = document.getElementById("resultTitle");
  const resultDesc = document.getElementById("resultDesc");

  userNameDisplay.innerText = userName;
  idolNameDisplay.innerText = idolName;

  // COMPUTE ALGORITHM
  // COMPUTE ALGORITHM
  function getStrokeCount(char) {
    const code = char.charCodeAt(0) - 44032;
    if (code < 0 || code > 11171) return 4;

    // 초성 19자 획수 데이터
    const initialStrokes = [1, 2, 2, 3, 6, 5, 4, 4, 8, 2, 4, 1, 3, 6, 4, 3, 4, 4, 3];

    // 중성 21자 획수 데이터
    const medialStrokes = [2, 3, 3, 4, 2, 3, 3, 4, 2, 4, 5, 3, 3, 2, 4, 5, 3, 3, 1, 2, 1];

    // 종성 28자 획수 데이터
    const finalStrokes = [0, 1, 2, 3, 2, 4, 5, 3, 5, 6, 9, 9, 7, 9, 9, 8, 4, 4, 6, 2, 4, 1, 3, 4, 3, 4, 4, 3];

    const initialIdx = Math.floor(code / 588);
    const medialIdx = Math.floor((code % 588) / 28);
    const finalIdx = code % 28;

    return initialStrokes[initialIdx] + medialStrokes[medialIdx] + finalStrokes[finalIdx];
  }

  // COMPUTE ALGORITHM
  function calculateCompatibility(name1, name2) {
    if (!name1 || !name2) return 40;

    const maxLength = Math.max(name1.length, name2.length);
    const combinedStrokes = [];

    for (let i = 0; i < maxLength; i++) {
      if (i < name1.length) combinedStrokes.push(getStrokeCount(name1[i]));
      if (i < name2.length) combinedStrokes.push(getStrokeCount(name2[i]));
    }

    let currentArray = combinedStrokes;
    while (currentArray.length > 2) {
      const nextArray = [];
      for (let i = 0; i < currentArray.length - 1; i++) {
        nextArray.push((currentArray[i] + currentArray[i + 1]) % 10);
      }
      currentArray = nextArray;
    }

    // 인덱스를 명시하여 두 숫자를 십의 자리와 일의 자리로 정상 연산 조립
    const rawScore = currentArray[0] * 10 + currentArray[1];
    // 4단계 수정: 최하 보정치를 완전히 없애고 0점부터 100점까지 넓게 분포
    const finalScore = Math.floor((rawScore / 99) * 100);

    // 1. 딸과 친구들이 장난으로 상대방 이름에 '시한폭탄'이나 '상극'을 적으면 0점 폭탄 발령
    if (name2 === "시한폭탄" || name2 === "상극" || name2 === "파멸") {
      return 0;
    }

    return finalScore;
  }

  const resultScore = calculateCompatibility(userName, idolName);

  // SCORE COUNTER ANIMATION
  let currentScore = 0;
  const duration = 1200;
  const startTime = performance.now();

  function animateScore(timestamp) {
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    currentScore = Math.floor(progress * resultScore);
    scoreDisplay.innerText = `${currentScore}%`;

    if (progress < 1) {
      requestAnimationFrame(animateScore);
    } else {
      if (resultScore === 100) {
        document.getElementById("resultCard").classList.add("is-perfect");
      } else if (resultScore === 0) {
        // 0점일 때 다크 모드 클래스 추가
        document.getElementById("resultCard").classList.add("is-doom");
      }
      setResultText(resultScore);
    }
  }
  requestAnimationFrame(animateScore);

  // SET TEXT BY DETAILED SCORE
  function setResultText(score) {
    const tens = Math.floor(score / 10);
    const ones = score % 10;

    let title = "";
    let desc = "";

    // 1단계: 5점 단위에 따른 핵심 관계성 빌드
    if (score === 100) {
      title = "우주가 점지한 100% 전생의 동반자";
      desc = `${userName}님과 ${idolName}님은 전생에서부터 이어져 온 완벽한 실타래 같은 인연입니다. 어떤 장소, 어떤 시간 속에서도 결국 서로를 찾아내고야 마는 기적적인 호흡을 자랑합니다. `;
    } else if (score >= 95) {
      title = "기적에 가까운 완벽한 천생연분";
      desc = `두 사람은 태어날 때부터 서로를 위해 맞춰진 듯한 착각을 불러일으킵니다. 생각의 흐름과 행동 패턴이 완벽하게 일치하여 주변의 부러움을 한 몸에 받습니다. `;
    } else if (score >= 90) {
      title = "소울메이트 이상의 운명적 주파수";
      desc = `두 사람은 주파수가 완벽히 동기화된 상태입니다. ${userName}님의 작은 감정 변화도 ${idolName}님이 즉각적으로 감지하며, 굳이 말로 표현하지 않아도 마음이 통하는 깊은 유대감을 형성합니다. `;
    } else if (score >= 85) {
      title = "눈빛만 봐도 통하는 찰떡호흡 시너지";
      desc = `서로 마주보는 것만으로도 긍정적인 에너지가 샘솟는 관계입니다. 갈등이 생기더라도 특유의 유연함으로 부드럽게 넘어가며 항상 유쾌한 웃음이 끊이지 않습니다. `;
    } else if (score >= 80) {
      title = "설렘과 편안함이 공존하는 이상적 밸런스";
      desc = `만날 때마다 기분 좋은 스파크가 튀면서도, 동시에 오랜 친구처럼 깊은 안정감을 주는 가장 이상적인 관계입니다. ${userName}님과 ${idolName}님이 함께 있으면 긍정적인 시너지가 발생합니다. `;
    } else if (score >= 75) {
      title = "따스한 온기가 스며드는 힐링 조합";
      desc = `지치고 힘든 일상 속에서 서로에게 완벽한 안식처가 되어주는 궁합입니다. 격렬한 불꽃보다는 은은하게 타오르는 모닥불처럼 서로를 포근하게 감싸줍니다. `;
    } else if (score >= 70) {
      title = "서로에게 긍정적 자극을 주는 성장형 콤비";
      desc = `두 사람은 서로의 부족한 점을 채워주고 장점을 극대화하는 상호보완적 궁합입니다. ${userName}님의 열정과 ${idolName}님의 세심함이 만나 서로에게 닮아가고 싶은 좋은 롤모델이 되어줍니다. `;
    } else if (score >= 65) {
      title = "예상치 못한 매력에 중독되는 관계";
      desc = `알면 알수록 새로운 매력 화수분이 터지는 조합입니다. 처음에는 미처 몰랐던 깊은 내면의 가치관과 취향들을 공유하면서 서서히, 그러나 단단하게 감정이 스며듭니다. `;
    } else if (score >= 64) {
      title = "알아갈수록 묘하게 빠져드는 블랙홀 관계";
      desc = `첫인상보다 대화를 나눌수록 매력이 배가되는 조합입니다. 처음에는 평범해 보였을지라도, 시간이 지날수록 서로의 독특한 개성과 가치관에 깊게 매료되는 은근한 중독성을 가집니다. `;
    } else if (score >= 55) {
      title = "새콤달콤 핑퐁이 오가는 밀당주의보";
      desc = `한 치 앞을 알 수 없는 팽팽한 긴장감이 오히려 매력으로 다가옵니다. 서로 서툴게 감정을 표현하지만 그 안에는 서로를 향한 진심이 가득 차 있습니다. `;
    } else if (score >= 50) {
      title = "달콤살벌한 밀당주의보 발령 관계";
      desc = `생각의 타이밍이 엇갈려 가끔씩 귀여운 오해가 싹트기도 하지만, 오히려 그 사소한 밀고 당기기가 서로에 대한 긴장감과 호기심을 유지시키는 강력한 촉매제로 작용합니다. `;
    } else if (score >= 45) {
      title = "호기심을 자극하는 미지의 영역";
      desc = `나와는 전혀 다른 세계의 사람을 만난 듯한 신선한 충격을 줍니다. 나와 다른 상대방의 매력에 본능적으로 이끌려 자꾸만 시선이 머무는 재미있는 궁합입니다. `;
    } else if (score >= 40) {
      title = "서로 다른 극이 만나 끌리는 자석 관계";
      desc = `MBTI 성향부터 취향까지 정반대일 확률이 높습니다. 하지만 완전히 다른 세상에 살고 있기에 서로의 새로운 모습에 강하게 이끌리며, 함께할 때 전혀 지루할 틈이 없는 다이내믹한 조합입니다. `;
    } else if (score >= 35) {
      title = "스치기만 해도 찌릿한 아슬아슬 팩폭 조합";
      desc = `두 사람이 대화할 때 묘한 긴장감이 흐릅니다. 서로 필터링 없는 솔직한 팩트 폭행이 오가며 툭하면 투닥거리지만, 이상하게 뒤돌아서면 자꾸 생각나는 묘한 중독성이 있습니다. `;
    } else if (score >= 25) {
      title = "양보 없는 팽팽한 불꽃 밀당 전선";
      desc = `한 치의 양보도 없는 불꽃 튀는 자존심 싸움이 예상되는 관계입니다. 서로 주도권을 잡으려고 밀고 당기기를 무한 반복하다 보니, 하루에도 기분이 천국과 지옥을 오가는 롤러코스터 궁합입니다. `;
    } else if (score >= 15) {
      title = "가깝이 가기엔 너무 먼 평행선 로맨스";
      desc = `마치 마주 보고 달리는 기차처럼, 아무리 다가가려 해도 접점을 찾기가 쉽지 않은 독특한 상성입니다. 서로의 대화 타이밍이 자꾸만 어긋나 영혼의 엇갈림을 경험할 수 있습니다. `;
    } else if (score >= 5) {
      title = "우주 대폭발 직전의 시한폭탄 상극 관계";
      desc = `만나기만 하면 오해와 사건 사고가 끊이지 않는 시한폭탄 같은 조합입니다. 서로 이해할 수 없는 미스터리한 행동에 머리를 쥐어뜯게 되니, 만날 때는 마음의 평화와 인내심을 장착해야 합니다. `;
    } else {
      // 정확히 0점인 경우
      title = "🚨 절대 만나서는 안 되는 파멸적 디스토피아";
      desc = `우주 역사상 전무후무한 대파란의 조합! 두 사람이 얽히는 순간 주변의 모든 전자기기가 일시 정지될 것 같은 지독한 상극입니다. 이름 궁합계의 절대 금기이자 영혼의 완벽한 섀도우 복싱 파트너입니다. `;
    }

    // 2단계: 일의 자리에 따른 서브 메시지 조합 (100점이나 0점이 아닐 때만 적용)
    if (score !== 100 && score !== 0) {
      // 50점 미만일 때는 '그렇지만', 50점 이상일 때는 기존처럼 공백으로 시작
      const prefix = score < 50 ? "그렇지만 " : "";

      if (ones === 9) {
        desc += `${prefix}두 분은 대화의 코드가 잘 맞아 밤새 이야기해도 시간이 부족할 만큼 최고의 소통 능력을 보여줍니다.`;
      } else if (ones === 8) {
        desc += `${prefix}서로의 사소한 습관이나 가치관을 깊이 이해하고 있어, 함께 있을 때 가장 나다운 모습이 될 수 있도록 돕습니다.`;
      } else if (ones === 7 || ones === 6) {
        desc += `${prefix}눈빛 교환만으로도 서로의 컨디션을 파악할 만큼 뛰어난 공감 능력이 두 사람의 관계를 더욱 단단하게 지탱합니다.`;
      } else if (ones === 5) {
        desc += `${prefix}상대방이 좋아하는 음악이나 음식을 조용히 챙겨주는 사소하고 다정한 배려가 관계의 큰 원동력입니다.`;
      } else if (ones === 4) {
        desc += `${prefix}주변 사람들도 부러워할 만큼 특유의 신뢰감과 편안함이 돋보이며, 시간이 흐를수록 마음의 깊이가 깊어집니다.`;
      } else if (ones === 3) {
        desc += `${prefix}함께 새로운 장소에 가거나 특별한 경험을 할 때 시너지가 배가되며, 매 순간을 특별한 기억으로 만들어 줍니다.`;
      } else if (ones === 2) {
        desc += `${prefix}무심한 듯 툭 던지는 한마디 속에 서로를 향한 진심어린 걱정과 애정이 듬뿍 묻어나는 따뜻한 매력이 있습니다.`;
      } else if (ones === 1) {
        desc += `${prefix}함께 있을 때 유독 웃음 타율이 높아지며, 사소한 장난 하나로도 주변 분위기를 밝게 만드는 유쾌한 에너지가 있습니다.`;
      } else {
        // ones === 0
        desc += `${prefix}서로에게 은은하게 스며드는 편안한 호흡을 가졌으며, 안정적이고 흔들림 없는 감정의 교류를 이어 나갑니다.`;
      }
    } else if (score === 0) {
      // 완전 빵점(0점) 전용 서브 메시지
      desc += "이 지독한 상성을 뒤집고 인연을 만들어낸다면, 그것이야말로 인류 역사상 가장 위대한 기적이 될 것입니다.";
    }

    resultTitle.innerText = title;
    resultDesc.innerText = desc;
  }

  // NAVIGATION ACTIONS
  // document.getElementById("backBtn").addEventListener("click", () => history.back());
  document.getElementById("retryBtn").addEventListener("click", () => (window.location.href = "./myFavor.html"));

  // CAPTURE ACTION
  document.getElementById("saveBtn").addEventListener("click", () => {
    alert("화면을 캡처하여 이미지를 저장해 주세요.");
  });

  // SHARE ACTION
  document.getElementById("shareBtn").addEventListener("click", () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        alert("결과 링크가 복사되었습니다.");
      })
      .catch(() => {
        alert("링크 복사에 실패했습니다.");
      });
  });
});
