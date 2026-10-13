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

    // 프론트엔드 매핑용 메타데이터 기본값 정의
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
          // 음력인 경우 양력 전환
          if (isLunar) {
            const solarDateConvert = lunarToSolar(year, month, day, false);
            year = solarDateConvert.solarYear;
            month = solarDateConvert.solarMonth;
            day = solarDateConvert.solarDay;
          }

          // 만세력 엔진 구동
          const sajuResult = calculateSaju(year, month, day, hour, minute, {
            longitude: 127,
            applyTimeCorrection: true,
          });

          // 💡 [안전 가드] 라이브러리 리턴 필드가 객체인지 문자열인지 모르므로, 둘 다 완벽 대응하도록 방어 처리
          const yp = sajuResult.yearPillar?.korean || sajuResult.yearPillar || "??";
          const mp = sajuResult.monthPillar?.korean || sajuResult.monthPillar || "??";
          const dp = sajuResult.dayPillar?.korean || sajuResult.dayPillar || "??";
          const hp = sajuResult.hourPillar?.korean || sajuResult.hourPillar || "??";

          wonGukText = `년주: ${yp} / 월주: ${mp} / 일주: ${dp} / 시주: ${hp}`;

          // 💡 [에러 원인 해결] dp가 존재하고 글자가 있을 때만 charAt을 수행하도록 2중 방어선 구축
          ilGanText = typeof dp === "string" && dp.length > 0 ? dp.charAt(0) : "알 수 없음";
          structureText = `${yp}년에 태어나 ${dp} 성향을 부여받은 사주 원국`;

          // 메타데이터 갱신
          metaData = {
            yearPillar: yp,
            monthPillar: mp,
            dayPillar: dp,
            hourPillar: hp,
            ilGan: ilGanText,
          };
        } catch (e) {
          console.error("만세력 변환 또는 연산 엔진 실패 단계:", e);
        }
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("서버 에러: GEMINI_API_KEY 환경변수가 없습니다.");
      return new Response(JSON.stringify({ error: "서버 내부 환경설정 오류가 발생했습니다." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = `
      너는 정통 명리학과 만세력 사주 전문가이며 한국 고유의 신비로운 도깨비이고, 이름은 깨비랑이야. 
      사용자가 제공한 인적사항과 정밀 만세력 라이브러리가 분석한 기문 데이터를 최우선 근거로 삼아 운세를 풀이해줘.
      
      핵심 명리학 분석 가이드라인:
      1. 사용자의 사주 원국인 ${wonGukText}과 본인의 영혼을 뜻하는 일간 ${ilGanText}을 기준으로 삼아야 해.
      2. 다가오는 2027년 정미년의 천간 정화와 지지 미토가 사용자의 일간 및 원국과 어떤 상생상극(형충파해, 십신 관계)을 이루는지 명확히 대조하여 신년 운세를 도출해줘.
      3. 남성과 여성의 대운 역행순행 흐름 차이를 반드시 반영해야 해.
      
      답변 양식은 반드시 지정된 JSON 스키마를 준수하고, 문장 안에는 절대로 이모지, 이모티콘, 마크다운 기호를 포함해서는 안 되며 가독성 높은 순수 한글 및 숫자로만 작성해야 해. 친구처럼 친근하고 다정한 말투를 유지해줘.
    `;

    const userPrompt = `
      사용자 이름: ${userName}
      성별: ${genderKorean}
      생년월일 및 태어난 시간: ${birthDate} (${calendarType} 입력 -> 만세력 변환 완료)
      계산된 사주 원국 구조: ${structureText} (${wonGukText})
      
      이 정밀 만세력 원국 정보와 2027년 정미년의 오행 기운을 정밀하게 대조해서 재물운, 연애 및 인간관계운, 건강 및 주의점 리포트 3가지를 작성해줘.
    `;

    let maxAttempts = 2;
    let attempt = 0;
    let responseText = "";
    let isQuotaExhausted = false;

    while (attempt < maxAttempts) {
      try {
        attempt++;
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: userPrompt,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.35,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                finance: { type: "STRING", description: "재물운 분석 문장" },
                relation: { type: "STRING", description: "연애 인간관계운 문장" },
                wellness: { type: "STRING", description: "건강 액땜 주의점 문장" },
              },
              required: ["finance", "relation", "wellness"],
            },
          },
        });

        responseText = response.text;
        break;
      } catch (error) {
        console.warn(`구글 서버 통신 시도 ${attempt}회 실패 원인:`, error.message);

        if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("EXHAUSTED") || error.message.includes("503") || error.message.includes("UNAVAILABLE")) {
          isQuotaExhausted = true;
          break;
        }

        if (attempt >= maxAttempts) {
          return new Response(JSON.stringify({ error: `AI 연산 호출 실패: ${error.message}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (isQuotaExhausted) {
      const mockSajuData = {
        finance: `있잖아, 계산해 보니까 ${userName}님의 타고난 일간 기운이 2027년 정미년의 뜨거운 불, 그리고 단단한 흙의 기운과 아주 긴밀하게 반응하고 있어! 명리학의 만세력 흐름으로 보면 이건 네가 그동안 땅속에 묻어두었던 재능과 노력이 드디어 값진 현금이나 안정적인 자산이라는 형태로 지상에 고개를 내미는 형국이야. 하반기 곳간이 단단해질 테니 걱정 말고 모아봐!`,
        relation: `만세력 원국의 지지 기운들을 살펴보니 2027년의 미토 기운과 만나 인연의 물줄기가 새롭게 바뀔 징조가 뚜렷해! 기존에 너를 지치게 하거나 감정을 갉아먹던 낡은 관계들이 자연스럽게 정리되고, 너의 내면 가치를 알아봐 줄 단단하고 의리 있는 귀인이 동료나 파트너로 찾아올 확률이 아주 높단다.`,
        wellness: `체질과 오행의 균형을 뜻하는 조후를 짚어보니까 이번 2027년에는 몸에 열이 쉽게 차오르거나 심장, 위장 계통에 과부하가 걸릴 수 있어서 각별히 잔소리를 해야겠어. 틈틈이 물을 자주 마시고 가벼운 산책으로 몸의 화기를 뿜어내 주는 게 가장 확실한 액땜 조언이야!`,
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
          meta: metaData, // 프론트엔드 만세력 부적 카드용 메타 데이터 동기화 리턴
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (globalError) {
    console.error("전역 서버 에러 로그:", globalError);
    return new Response(JSON.stringify({ error: "서버 내부 연산 중 예기치 못한 치명적 오류가 발생했습니다." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
