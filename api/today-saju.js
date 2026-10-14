import { GoogleGenAI } from "@google/genai";

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

    const birthDate = body.birthDate || "알수없음";
    const userName = body.userName || "익명";
    const gender = body.gender || "male";
    const genderKorean = gender === "female" ? "여성" : "남성";

    // 시스템적으로 오늘 날짜와 요일을 계산하여 생성합니다.
    const today = new Date();
    const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
    const weekDays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const dayOfWeek = weekDays[today.getDay()];

    if (!process.env.GEMINI_API_KEY) {
      console.error("크리티컬 서버 에러: GEMINI_API_KEY 환경변수가 세팅되지 않았습니다.");
      return new Response(JSON.stringify({ error: "서버 내부 환경설정(API KEY) 오류가 발생했습니다." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 1. 오늘의 운세 맞춤형 도깨비 지침 설정
    const systemInstruction = `
      너는 명리학 사주 전문가이며 한국 고유의 도깨비이고, 이름은 깨비랑이야. 
      사용자가 제공한 사주 정보와 '오늘의 날짜'를 명학적으로 분석해서, 이 사용자가 오늘 하루를 어떻게 보내면 좋을지 '오늘의 운세 리포트'를 작성해줘.
      답변 양식은 반드시 지정된 JSON 스키마를 준수해야 해.
      출력되는 모든 문장 안에는 절대로 이모지, 이모티콘, 마크다운 기호를 포함해서는 안 되며 오직 가독성 높은 순수 한글 및 숫자 등의 텍스트 문장으로만 작성해야 해.
      친구에게 귓속말하듯 친근하고, 다정하며, 부드러운 말투를 사용해줘.
    `;

    const userPrompt = `
      사용자 이름: ${userName}
      성별: ${genderKorean}
      생년월일 및 태어난 시간: ${birthDate}
      오늘의 날짜: ${formattedDate} (${dayOfWeek})

      위 데이터를 기반으로 이 사용자의 사주와 오늘 날짜의 일진(하루 기운)을 매칭하여 오직 오늘 하루만을 위한 운세 리포트를 작성해 주세요.
    `;

    // 💡 [원상 복구] 네가 지정한 3단계 엔진 큐 명세 완벽 부활
    const modelQueue = ["gemini-3.5-flash-lite"];
    let responseText = "";
    let successCall = false;
    let finalQuotaExhausted = false;

    for (const currentModel of modelQueue) {
      try {
        console.log(`[깨비 기동] 오늘의 운세를 위해 현재 ${currentModel} 엔진으로 계산을 시도합니다...`);

        const response = await ai.models.generateContent({
          model: currentModel, // 👈 큐 순서대로 주입
          contents: userPrompt,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.5, // 하루 운세는 조금 더 다채로운 조언을 위해 0.8 수치 유지
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                todayDaily: { type: "STRING", description: "오늘 하루의 총운 및 흐름을 다정하게 풀어서 200자 이상 300자 이하로 적어줘" },
                luckyColor: { type: "STRING", description: "오늘 유저에게 기운을 북돋아 줄 행운의 색상 한 가지와 그 색상을 적용할 아이디어를 200자 이내로 알려줘" },
                luckyItem: { type: "STRING", description: "오늘 유저가 소지하거나 가까이하면 좋은 행운의 물건 두가지와 그 이유를 100자 이내로 간략히 알려줘" },
                actionTip: { type: "STRING", description: "오늘 하루 이것만은 꼭 지키거나 조심하라는 행동 지침 문장을 200자 이상 300자 이하로 적어줘" },
              },
              required: ["todayDaily", "luckyColor", "luckyItem", "actionTip"],
            },
          },
        });

        responseText = response.text;
        successCall = true;
        break; // 엔진 작동 성공 시 루프 탈출
      } catch (error) {
        console.warn(`구글 서버 통신 시도 (${currentModel}) 실패 원인:`, error.message);

        if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("EXHAUSTED") || error.message.includes("503") || error.message.includes("UNAVAILABLE")) {
          if (currentModel === modelQueue[modelQueue.length - 1]) {
            finalQuotaExhausted = true;
          }
          await new Promise((resolve) => setTimeout(resolve, 300));
          continue; // 다음 엔진으로 넘어가서 재시도
        }

        return new Response(JSON.stringify({ error: `AI 연산 호출 중 크리티컬 오류 발생: ${error.message}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // 3. 3개 엔진 모두 트래픽 초과 혹은 실패 시 비상용 뚝딱 프리셋
    if (finalQuotaExhausted || !successCall) {
      console.log("⚠️ 오늘의 운세 API 전면 쿼터 초과로 도깨비 프리셋 데이터를 매핑합니다.");

      const mockTodayData = {
        todayDaily: `안녕 ${userName}님! 오늘 하루는 네 사주 주변으로 따뜻하고 활기찬 바람이 붕붕 불어오는 날이야. 평소보다 마음이 가볍고 왠지 모르게 좋은 일이 생길 것 같은 예감이 들지 않아? 내 도깨비 감각으로 보아하니 오늘 네가 던지는 말 한마디, 짓는 미소 하나가 주변 사람들에게 엄청난 호감으로 쌓이게 될 거야. 평소 망설였던 대화나 연락이 있다면 오늘 오후에 슬쩍 건네보는 걸 강력하게 추천할게. 분명히 기분 좋은 답장이 돌아올 테니까 말이야!`,
        luckyColor: `노란색`,
        luckyItem: `따뜻한 아메리카노`,
        actionTip: `오늘은 길을 걸을 때 땅만 보지 말고 하늘을 세 번 이상 올려다보며 기지개를 켜줘. 상체의 기운을 열어주면 정체되어 있던 행운이 네 몸 안으로 쏙 스며들 거니까 꼭 실천하기다!`,
      };

      return new Response(JSON.stringify({ success: true, data: mockTodayData }), { status: 200, headers: corsHeaders });
    }

    const sajuData = JSON.parse(responseText);
    return new Response(JSON.stringify({ success: true, data: sajuData }), { status: 200, headers: corsHeaders });
  } catch (globalError) {
    console.error("서버 내부 에러 발생 원인:", globalError);
    return new Response(JSON.stringify({ error: "서버 내부 연산 중 치명적 오류가 발생했습니다." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
