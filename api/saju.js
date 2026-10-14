import { GoogleGenAI } from "@google/genai";
import { calculateSaju, lunarToSolar } from "@fullstackfamily/manseryeok";

const corsHeaders = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    const birthDate = body.birthDate || "";
    const userName = body.userName || "익명";
    const gender = body.gender || "male";
    const isLunar = body.isLunar || false;

    const genderKorean = gender === "female" ? "여성" : "남성";
    const calendarType = isLunar ? "음력" : "양력";

    let wonGukText = "알 수 없음";
    let ilGanText = "알 수 없음";
    let structureText = "일반 사주 구조";

    let metaData = {
      yearPillar: "??",
      monthPillar: "??",
      dayPillar: "??",
      hourPillar: "??",
      ilGan: "알 수 없음",
    };

    if (birthDate) {
      const cleanDigits = birthDate.replace(/[^0-9]/g, "");
      if (cleanDigits.length >= 8) {
        let year = parseInt(cleanDigits.substring(0, 4), 10);
        let month = parseInt(cleanDigits.substring(4, 6), 10);
        let day = parseInt(cleanDigits.substring(6, 8), 10);
        const hour = cleanDigits.length >= 10 ? parseInt(cleanDigits.substring(8, 10), 10) : 12;
        const minute = cleanDigits.length >= 12 ? parseInt(cleanDigits.substring(10, 12), 10) : 0;

        try {
          if (isLunar) {
            const solarDateConvert = lunarToSolar(year, month, day, false);
            console.log("[깨비 역산 실시간 추적 로그]:", JSON.stringify(solarDateConvert));

            if (solarDateConvert) {
              // 💡 [음력 버그 해결] 라이브러리 반환 스펙 { solar: { year, month, day } } 및 다양한 규격을 방어하는 다중 안전 가드
              const targetSolarObj = solarDateConvert.solar || solarDateConvert;

              const sYear = targetSolarObj.year || solarDateConvert.solarYear || targetSolarObj.solarYear;
              const sMonth = targetSolarObj.month || solarDateConvert.solarMonth || targetSolarObj.solarMonth;
              const sDay = targetSolarObj.day || solarDateConvert.solarDay || targetSolarObj.solarDay;

              if (sYear && sMonth && sDay) {
                year = parseInt(sYear, 10);
                month = parseInt(sMonth, 10);
                day = parseInt(sDay, 10);
              }
            }
          }

          const sajuResult = calculateSaju(year, month, day, hour, minute, {
            longitude: 127,
            applyTimeCorrection: true,
          });

          const yp = sajuResult.yearPillar?.korean || sajuResult.yearPillar || "??";
          const mp = sajuResult.monthPillar?.korean || sajuResult.monthPillar || "??";
          const dp = sajuResult.dayPillar?.korean || sajuResult.dayPillar || "??";
          const hp = sajuResult.hourPillar?.korean || sajuResult.hourPillar || "??";

          wonGukText = `년주: ${yp} / 월주: ${mp} / 일주: ${dp} / 시주: ${hp}`;
          ilGanText = typeof dp === "string" && dp.length > 0 ? dp.charAt(0) : "알 수 없음";
          structureText = `${yp}년에 태어나 ${dp} 성향을 부여받은 사주 원국`;

          metaData = {
            yearPillar: yp,
            monthPillar: mp,
            dayPillar: dp,
            hourPillar: hp,
            ilGan: ilGanText,
            solarBirth: `${year}년 ${month}월 ${day}일`, // 상단 날짜 출력용 메타데이터 추가 유지
          };
        } catch (e) {
          console.error("만세력 변환 또는 연산 엔진 실패 단계:", e);
        }
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "서버 내부 환경설정 오류가 발생했습니다." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = `
      너는 정통 명리학 전문가이며 한국 고유의 신비로운 도깨비이고, 이름은 깨비랑이야. 
      사용자가 제공한 인적사항과 만세력 분석 기문 데이터를 최우선 근거로 삼아 운세를 풀이해줘.
      
      핵심 명리학 분석 가이드라인:
      1. 사용자의 사주 원국인 ${wonGukText}과 본인의 영혼을 뜻하는 일간 ${ilGanText}을 기준으로 삼아야 해.
      2. 다가오는 2027년 정미년의 천간 정화와 지지 미토가 사용자의 일간 및 원국과 어떤 상생상극을 이루는지 명확히 대조하여 신년 운세를 도출해줘.
      
      [핵심 제약 조건 - 글자수 및 문단 나누기]
      - 각 카드(재물운, 인간관계운, 건강운)의 설명 문장은 반드시 공백 포함 '250자 이상 300자 이하'로 정성스럽고 깊이 있게 작성해줘.
      - 가독성을 극대화하기 위해 사주 분석 기운이 끝나는 중간 지점에 반드시 HTML 줄바꿈 태그인 <br /><br /> 기호를 딱 한 번 삽입해서 문단을 위아래 두 덩어리로 깔끔하게 쪼개어 출력해줘야 해.
      - 답변 양식은 지정된 JSON 스키마를 준수하고, 문장 안에는 절대로 이모지, 이모티콘, 마크다운 기호(#, *, - 등)를 포함해서는 안 되며 가독성 높은 순수 한글 및 숫자로만 작성해야 해. 친구처럼 다정한 말투를 유지해줘.
    `;

    const userPrompt = `
      사용자 이름: ${userName}
      성별: ${genderKorean}
      생년월일 및 태어난 시간: ${birthDate} (${calendarType} 입력 -> 만세력 변환 완료)
      계산된 사주 원국 구조: ${structureText} (${wonGukText})
      
      이 정밀 만세력 원국 정보와 2027년 정미년의 오행 기운을 정밀하게 대조해서 재물운, 연애 및 인간관계운, 건강 및 주의점 리포트 3가지를 풀이해줘. 각 풀이 중간에 문단 나누기용 <br /><br /> 태그를 꼭 섞어서 400자 이내의 정성스러운 장문 줄글로 출력해줘.
    `;

    // 💡 [요청 사항 반영] 원본 모델 큐 순서 원상 복구 및 철저히 유지
    const modelQueue = ["gemini-3.5-flash-lite"];
    let responseText = "";
    let successCall = false;
    let finalQuotaExhausted = false;

    for (const currentModel of modelQueue) {
      try {
        console.log(`[깨비 기동] 현재 ${currentModel} 엔진으로 운세 계산을 시도합니다...`);

        const response = await ai.models.generateContent({
          model: currentModel,
          contents: userPrompt,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.35,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                finance: { type: "STRING", description: "중간에 <br /><br /> 태그가 삽입된 400자 이내의 재물운 분석 장문" },
                relation: { type: "STRING", description: "중간에 <br /><br /> 태그가 삽입된 400자 이내의 인간관계운 분석 장문" },
                wellness: { type: "STRING", description: "중간에 <br /><br /> 태그가 삽입된 400자 이내의 건강 주의점 분석 장문" },
              },
              required: ["finance", "relation", "wellness"],
            },
          },
        });

        responseText = response.text;
        successCall = true;
        break;
      } catch (error) {
        if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("EXHAUSTED") || error.message.includes("503") || error.message.includes("UNAVAILABLE")) {
          if (currentModel === modelQueue[modelQueue.length - 1]) {
            finalQuotaExhausted = true;
          }
          await new Promise((resolve) => setTimeout(resolve, 300));
          continue;
        }

        return new Response(JSON.stringify({ error: `AI 연산 호출 중 오류 발생: ${error.message}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    if (finalQuotaExhausted || !successCall) {
      const mockSajuData = {
        finance: `2027년 정미년은 ${userName}님에게 노력한 만큼 정직하게 통장 잔고가 쌓이는 아주 단단한 재물운의 해가 될 거야. 상반기 지출 흐름에 조급해할 필요 전혀 없어.<br /><br />허황된 대박 리스크보다는 적금이나 실물 자산으로 돈을 묶어두는 게 훨씬 이득이란다. 가을바람이 불기 시작하면 금전줄이 묶이며 안정 궤도에 들어설 테니 내 방망이를 믿고 차곡차곡 곳간을 채워봐!`,
        relation: `만세력 원국을 들여다보니 내년에는 내 인연의 물줄기가 맑고 이로운 방향으로 대전환을 이룰 징조가 뚜렷하게 보여. 나를 지치게 하던 낡은 인맥이 정리될 기회야.<br /><br />그 빈자리에 너의 진정한 가치를 알아봐 줄 단단하고 의리 넘치는 귀인이 동료나 파트너로 찾아올 확률이 아주 높단다. 새로운 연결고리가 찾아오면 주저 말고 너의 다정한 매력을 먼저 뽐내봐!`,
        wellness: `2027년은 사주에 뜨거운 불과 흙의 열기가 과다하게 들이닥치는 형국이라 컨디션 관리에 특별히 잔소리를 해야겠어. 몸에 화기가 차오르면 만성 피로나 위장 통증이 오기 딱 좋거든.<br /><br />늦은 밤 야식이나 과음은 불난 위장에 기름을 붓는 격이니 삼가줘. 일주일에 세 번 가벼운 산책으로 몸의 열기를 식혀내 주는 게 나 깨비가 추천하는 최고의 액땜 비책이야.`,
      };
      return new Response(JSON.stringify({ success: true, data: { ...mockSajuData, meta: metaData } }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const sajuData = JSON.parse(responseText);
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          finance: sajuData.finance,
          relation: sajuData.relation,
          wellness: sajuData.wellness,
          meta: metaData,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (globalError) {
    return new Response(JSON.stringify({ error: "서버 내부 연산 중 치명적 오류가 발생했습니다." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
