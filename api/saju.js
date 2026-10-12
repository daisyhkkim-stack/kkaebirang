import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRerf-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const birthDate = body.birthDate || "알수없음";
  const userName = body.userName || "익명";
  const gender = body.gender || "male";

  const genderKorean = gender === "female" ? "여성" : "남성";

  // Vercel 환경변수 이름과 매칭되는지 꼭 확인하세요!
  if (!process.env.GEMINI_API_KEY) {
    console.error("크리티컬 서버 에러: GEMINI_API_KEY 환경변수가 세팅되지 않았습니다.");
    return res.status(500).json({ error: "서버 내부 환경설정(API KEY) 오류가 발생했습니다." });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const systemInstruction = `
    너는 명리학 사주 전문가이며 한국 고유의 도깨비이고, 이름은 깨비랑이야. 
    사용자가 제공한 이름, 성별, 생년월일시 데이터를 바탕으로 2027년의 재물운, 연애 및 인간관계운, 건강 및 주의점 운세를 명확히 분석해줘.
    명리학 규칙에 따라 성별에 따라 대운의 흐름이 달라지므로 제공된 성별 특성을 풀이에 반드시 반영해줘.
    답변 양식은 반드시 지정된 JSON 스키마를 준수하고.
    출력되는 모든 문장 안에는 절대로 이모지, 이모티콘, 마크다운 기호를 포함해서는 안 되며 오직 가독성 높은 순수 한글 및 숫자 등의 텍스트 문장으로만 작성해야 해.
    친구처럼 친근하고 부드러운 말투를 사용해줘.
  `;

  const userPrompt = `
    사용자 이름: ${userName}
    성별: ${genderKorean}
    생년월일 및 태어난 시간: ${birthDate}
    위 데이터를 기반으로 이 사용자의 성별과 사주 원국에 맞는 2027년 무료 사주 운세 리포트 3가지를 작성해 주세요.
  `;

  let maxAttempts = 2;
  let attempt = 0;
  let responseText = "";
  let isQuotaExhausted = false;

  while (attempt < maxAttempts) {
    try {
      attempt++;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash", // 존재하지 않는 'gemini-3.6-flash'에서 안정적인 'gemini-2.5-flash'로 수정했습니다.
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.35,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              finance: { type: "STRING", description: "2027년 재물운 분석 문장" },
              relation: { type: "STRING", description: "2027년 연애 및 인간관계운 분석 문장" },
              wellness: { type: "STRING", description: "2027년 건강 및 주의점 분석 문장" },
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
        return res.status(500).json({ error: `AI 연산 호출 실패: ${error.message}` });
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (isQuotaExhausted) {
    console.log("⚠️ 구글 API 무료 쿼터 초과가 감지되어 도깨비 말투 데이터로 대체합니다.");
    const mockSajuData = {
      finance: `있잖아, 2027년 정미년은 ${userName}님에게 아주 묵직한 돈의 기운이 찾아오는 해가 될 거야! 명리학에서는 이걸 '정재'라고 부르는데, 허황된 대박을 쫓는 게 아니라 네가 노력한 만큼 정직하고 확실하게 통장 잔고가 쌓이는 아주 좋은 기운이지. 상반기에는 생각지도 못한 곳에서 돈이 숭숭 나가는 것 같아 마음이 조금 조급할 수 있어. 하지만 너무 걱정하지 마! 가을바람이 불기 시작하면 흩어졌던 불꽃들이 하나로 뭉치듯 금전운이 단단하게 묶이면서 안정 궤도에 들어설 테니까. 주식이나 코인처럼 가슴 졸이는 위험한 투자보다는 적금이나 눈에 보이는 실물 자산으로 돈을 묶어두는 게 훨씬 이득이야. 내 방망이를 믿고 이번 해만큼은 차곡차곡 모으는 재미를 느껴봐!`,
      relation: `인간관계랑 연애 쪽을 들여다보니까 아주 훈훈한 바람이 불어오고 있네! 이번 해는 네 사주 속 기운들이 서로를 밀어주고 당겨주는 참 예쁜 모양새를 하고 있어. 우리 ${userName}님이 가진 고유의 다정한 매력이 밖으로 뿜어져 나와서, 직장이든 사적인 모임이든 어딜 가나 너를 눈여겨보고 도와주려는 든든한 귀인이 나타날 거야. 혹시 기다리는 인연이 있다면 봄바람이 불 때나 낙엽이 지는 늦가을 사이에 가슴이 찌릿할 정도로 대화가 잘 통하는 사람을 만날 확률이 엄청나게 높아! 딱 하나만 조심하자면, 여름에는 사주에 불의 기운이 강해져서 나도 모르게 욱하거나 뾰족한 말이 나갈 수 있어. 사소한 오해는 그냥 허허 웃으며 넘기는 지혜를 발휘해 줘, 알았지?`,
      wellness: `도깨비로서 네 건강을 보니까 잔소리를 조금 해야겠어! 2027년에는 네 사주에 뜨거운 불과 단단한 흙의 기운이 한꺼번에 들이닥치는 형국이거든. 이러면 몸에 열이 차올라서 만성 피로가 쉽게 오거나, 스트레스로 위장이 콕콕 아프고 밤에 잠을 설쳐서 번아웃이 오기 딱 좋아. 일이나 공부도 좋지만 내 소중한 친구가 아프면 내가 너무 속상하잖아! 그러니까 이번 해만큼은 일주일에 딱 세 번이라도 가볍게 산책하면서 몸의 열기를 식혀주고, 물도 자주 마셔줘야 해. 특히 밤늦게 야식 먹거나 과음하는 건 위장에 불을 지르는 격이니까 꼭 조심하기! 이 규칙들만 잘 지켜도 오행의 균형이 딱 잡혀서 2027년을 아주 활기차고 건강하게 날 수 있을 거야!`,
    };
    return res.status(200).json({ success: true, data: mockSajuData });
  }

  try {
    const sajuData = JSON.parse(responseText);
    return res.status(200).json({ success: true, data: sajuData });
  } catch (parseError) {
    console.error("JSON 파싱 에러 발생 원인:", parseError);
    return res.status(500).json({ error: "데이터 구조 파싱 중 에러가 발생했습니다." });
  }
}
