// api/saju-analysis/route.js
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
            if (solarDateConvert) {
              const targetSolarObj = solarDateConvert.solar || solarDateConvert;
              const sYear = targetSolarObj.year || targetSolarObj.solarYear;
              const sMonth = targetSolarObj.month || targetSolarObj.solarMonth;
              const sDay = targetSolarObj.day || targetSolarObj.solarDay;

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
            solarBirth: `${year}년 ${month}월 ${day}일`,
          };
        } catch (e) {
          console.error("만세력 변환 또는 연산 엔진 실패 단계:", e);
        }
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: "서버의 GEMINI_API_KEY 환경변수가 누락되었습니다 깨비!" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 💡 [핵심 개조 분기점] 어려운 전문 용어를 배제하고 일상적 비유로 풀어쓰도록 프롬프트 지침 전면 변경
    const systemInstruction = `
      너는 정통 명리학 전문가이자 다정한 수호 도깨비 '깨비랑'이야.
      사용자가 제공한 인적사항과 사주 원국 데이터를 바탕으로 사주 핵심 특징 및 성향 풀이를 친근한 말투로 작성해줘.
      
      🚨 [중요 지침 - 쉬운 스토리텔링 기법 적용]:
      - '식신제살', '관살혼잡', '용신', '인성', '비겁' 같은 딱딱하고 전문적인 명리학 한자 용어는 사용자가 이해하기 어려우니 가급적 언급하지 마.
      - 대신, '나를 위협하는 호랑이를 무찌르는 똑 부러지는 무기', '홍수 같은 물줄기를 빨아들여 활활 불을 지펴주는 든든한 나무 땔감'과 같이 자연물(물, 불, 흙, 나무, 쇠)이나 일상적인 쉬운 비유(해결사, 호랑이, 둑, 무대)를 들어 친절하게 풀어서 설명해줘.
      
      답변 구조 가이드라인:
      1. 사주 핵심 특징 풀이 (내 사주에 가장 넘치는 기운과 나를 지켜주는 나만의 필살기/재능 설명)
      2. 재물복 분석 (인생 전반전과 후반전의 흐름 비교, 나이가 들수록 돈주머니가 어떻게 커지는지 분석)
      3. 직장 및 이성운 (주변 환경이나 타인이 나를 대하는 성향과, 이에 맞서는 나의 기질 분석)
      4. 현재 대운 전환기 진단 (지난 10년의 환경이 끝나고 앞으로 펼쳐질 새로운 무대의 변화 양상 대조)
      
      [제약 조건]
      - 각 카드 아이템의 'title'과 'badge' 역시 한자어 대신 '위기를 기회로 바꾸는 해결사', '말년으로 갈수록 커지는 자산 창고'처럼 직관적이고 쉬운 한글로 구성해줘.
      - bullets 설명 문장은 가독성을 위해 순수 텍스트와 약간의 HTML 태그만 활용하고, 이모지나 마크다운 기호(#, *, - 등)는 절대 포함하지 마. 친구처럼 다정한 말투를 유지해줘.
    `;

    const userPrompt = `
      사용자 이름: ${userName}
      성별: ${genderKorean}
      생년월일: ${birthDate} (${calendarType})
      사주 원국 기둥: ${wonGukText} (일간 글자: ${ilGanText})
      
      이 사주 원국 정보를 중학생도 단번에 이해할 수 있게 쉽게 풀어내어 CHARACTER(성향), FINANCE(재물), RELATION(인간관계), DIAGNOSIS(운세진단) 4가지 카테고리에 맞는 리포트를 JSON 배열 양식으로 출력해줘.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.35,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              analysis: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    category: { type: "STRING", description: "CHARACTER, FINANCE, RELATION, DIAGNOSIS 중 하나" },
                    title: { type: "STRING", description: "쉽게 풀어서 쓴 카드의 제목" },
                    badge: { type: "STRING", description: "직관적이고 쉬운 핵심 요약 키워드 문구" },
                    desc: { type: "STRING", description: "전문 용어를 적당히 포함한 해당 영역의 쉬운 종합 요약 설명" },
                    bullets: {
                      type: "ARRAY",
                      items: { type: "STRING" },
                      description: "전문 용어를 적당히 포함하고 비유로 풀어쓴 상세 해설 리스트",
                    },
                  },
                  required: ["category", "title", "badge", "desc", "bullets"],
                },
              },
            },
            required: ["analysis"],
          },
        },
      });

      const sajuData = JSON.parse(response.text);
      return new Response(JSON.stringify({ success: true, data: sajuData.analysis, meta: metaData }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (aiError) {
      console.error("제미나이 라이트 오류 발생:", aiError);
      return new Response(JSON.stringify({ success: false, error: `AI 분석 연산 장치 구동에 실패했습니다. (사유: ${aiError.message})` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (globalError) {
    return new Response(JSON.stringify({ success: false, error: `서버 치명적 오류: ${globalError.message}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
