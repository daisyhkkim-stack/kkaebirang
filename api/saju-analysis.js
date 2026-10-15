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

    // 💡 [글자수 압박 가이드라인 보강] 시스템 지침에 무조건 120자 이상 150자 이하를 맞추도록 강제성 부여
    const systemInstruction = `
      너는 정통 명리학 전문가이자 다정한 수호 도깨비 '깨비랑'이야.
      사용자가 제공한 인적사항과 사주 원국 데이터를 바탕으로 사주 핵심 특징 및 성향 풀이를 친근한 말투로 작성해줘.
      
      🚨 [중요 지침 - 전문 용어와 쉬운 비유의 황금 밸런스 융합]:
      - '식신제살', '사유축 삼합', '관성', '식신', '대운' 등 핵심이 되는 사주 명리학 전문 한자 용어를 반드시 문장의 핵심 키워드로 자연스럽게 포함해줘.
      - 다만 사용자가 한자어 자체만 보면 이해하기 어려우니, 전문 용어를 먼저 명시한 뒤 바로 이어서 일상적인 쉬운 비유를 매끄럽게 덧붙여 풀이해주는 방식으로 스토리텔링을 전개해야 해.
      
      🚨 [글자 수 사수 명령]:
      - 각 카드의 'desc' 요약문 필드는 반드시 공백을 포함하여 최소 120자 이상, 최대 150자 이하의 범위를 칼같이 지켜서 채워줘. 120자 미만으로 짧게 요약해서 끝내지 말고 정성스럽게 살을 붙여서 길이를 무조건 맞춰야 해.
      
      답변 구조 가이드라인:
      1. 사주 핵심 특징 풀이 (내 사주의 뼈대가 되는 격국과 십신 특징을 짚어주고, 나를 지켜주는 나만의 필살기 설명)
      2. 재물복 분석 (인생 원국 속의 삼합이나 자산 형성 흐름을 명리 용어로 짚은 후, 나이가 들수록 돈주머니가 어떻게 커지는지 비유로 풀이)
      3. 직장 및 이성운 (관성의 동태를 명확히 진단하고, 이에 마주하는 나의 커리어 우먼 기질과 독립성 분석)
      4. 현재 대운 전환기 진단 (지나온 대운과 앞으로 맞이할 새로운 대운의 글자를 명시하고 환경 변화 양상 대조)
      
      [제약 조건]
      - 각 카드 아이템의 'badge'는 한자어 전문 용어와 쉬운 설명이 결합된 형태(예: '식신제살과 위기돌파력')로 구성해줘.
      - bullets 설명 문장은 가독성을 위해 순수 텍스트와 약간의 HTML 태그만 활용하고, 이모지나 마크다운 기호(#, *, - 등)는 절대 포함하지 마. 친구처럼 다정한 말투를 유지해줘.
    `;

    // 💡 프롬프트 하단에도 desc 길이에 대한 요구를 직관적으로 추가
    const userPrompt = `
      사용자 이름: ${userName}
      성별: ${genderKorean}
      생년월일: ${birthDate} (${calendarType})
      사주 원국 기둥: ${wonGukText} (일간 글자: ${ilGanText})
      
      이 사주 원국 정보를 바탕으로, 사주 명리학의 '전문 용어'를 핵심 문맥에 반드시 뚜렷하게 등장시키면서 쉽게 풀어내어 CHARACTER(성향), FINANCE(재물), RELATION(인간관계), DIAGNOSIS(운세진단) 4가지 카테고리에 맞는 리포트를 JSON 배열 양식으로 출력해줘. 각 카드의 'desc' 내용은 반드시 공백 포함 120자~150자 사이의 꽉 찬 문장으로 작성해줘야 해.
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
                    title: { type: "STRING", description: "전문 명리 용어가 포함된 카드의 제목" },
                    badge: { type: "STRING", description: "전문 한자 용어와 쉬운 키워드가 결합된 핵심 요약 뱃지 문구" },
                    // 스키마 명세에도 한 번 더 고정
                    desc: { type: "STRING", description: "전문 용어를 반드시 포함하여 해당 영역의 쉬운 종합 요약 설명을 '공백 포함 최소 120자 이상 150자 이하'로 가득 채워서 말해줘" },
                    bullets: {
                      type: "ARRAY",
                      items: { type: "STRING" },
                      description: "사주 전문 용어(식신, 관성, 삼합 등)를 문장에 명확히 기입하고 이를 일상적인 자연물 비유로 풀어쓴 상세 해설 리스트",
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
      console.error("제미나이  오류 발생:", aiError);
      return new Response(JSON.stringify({ success: false, error: `AI 분석 연산 장치 구동에 실패했습니다. (사유: ${aiError.message})` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (globalError) {
    return new Response(JSON.stringify({ success: false, error: `서버 치명적 오류: ${globalError.message}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
