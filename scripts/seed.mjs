// 개발용 예시 데이터. 사용법:
//   npm run db:seed -- <clerk_user_id>           추가 (여러 번 실행해도 중복 없음)
//   npm run db:seed -- <clerk_user_id> --clean   예시 데이터 삭제
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const [userId, flag] = process.argv.slice(2);
if (!userId?.startsWith("user_")) {
  console.error("사용법: npm run db:seed -- <clerk_user_id> [--clean]");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const SEED_URL = "https://example.com/seed/";

if (flag === "--clean") {
  await sql`DELETE FROM articles WHERE user_id = ${userId} AND url LIKE ${SEED_URL + "%"}`;
  console.log("예시 기사를 삭제했어요. (카테고리는 그대로 둡니다)");
  process.exit(0);
}

const categoryNames = ["LLM", "로봇", "규제", "반도체"];
for (const name of categoryNames) {
  await sql`INSERT INTO categories (user_id, name) VALUES (${userId}, ${name})
            ON CONFLICT ON CONSTRAINT categories_user_name_unique DO NOTHING`;
}
const rows = await sql`SELECT id, name FROM categories WHERE user_id = ${userId}`;
const cat = Object.fromEntries(rows.map((r) => [r.name, r.id]));

const day = (n) => new Date(Date.now() - n * 86400000).toISOString();
const articles = [
  ["techcrunch", "OpenAI launches a new reasoning model", "OpenAI, 추론 성능을 높인 새 모델 공개", "OpenAI가 복잡한 수학·코딩 문제에서 이전 모델보다 정확도를 크게 끌어올린 새 추론 모델을 공개했다. 개발자용 API로도 바로 제공되며, 응답 속도와 비용도 함께 개선됐다고 밝혔다.", "LLM", 0],
  ["theverge", "Humanoid robots head to the factory floor", "휴머노이드 로봇, 공장 현장에 투입", "자동차 부품 공장에서 휴머노이드 로봇이 상자를 옮기고 부품을 분류하는 시범 운영이 시작됐다. 업체는 6개월간 안전성과 작업 효율을 검증한 뒤 도입 규모를 정할 계획이다.", "로봇", 1],
  ["techcrunch", "EU finalizes AI Act guidance for general-purpose models", "EU, 범용 AI 모델 대상 AI법 지침 확정", "유럽연합이 범용 AI 모델 제공자에게 학습 데이터 요약 공개와 저작권 준수 의무를 부과하는 지침을 확정했다. 위반 시 전 세계 매출의 일정 비율까지 과징금이 부과될 수 있다.", "규제", 2],
  ["theverge", "Chipmakers race to supply AI data centers", "반도체 업체들, AI 데이터센터 물량 확보 경쟁", "AI 데이터센터 수요가 급증하면서 주요 반도체 업체들이 고대역폭 메모리와 가속기 생산 능력을 앞다퉈 늘리고 있다. 공급 부족은 내년까지 이어질 것이라는 전망이 나온다.", "반도체", 3],
  ["techcrunch", "Startup raises $200M to build open-weight language models", "스타트업, 오픈 웨이트 언어모델 개발에 2억 달러 투자 유치", "오픈 웨이트 언어모델을 개발하는 스타트업이 2억 달러 규모의 투자를 유치했다. 투자금은 연산 인프라 확충과 연구 인력 채용에 쓰일 예정이며, 첫 모델은 올해 안에 공개된다.", "LLM", 4],
  ["theverge", "An AI feature nobody asked for ships in every app", "아무도 요청하지 않은 AI 기능이 모든 앱에 들어간다", "메신저, 메모, 사진 앱까지 AI 요약·생성 기능이 기본으로 탑재되고 있다. 사용자 반응은 엇갈리며, 끄는 설정을 찾기 어렵다는 불만도 늘고 있다.", null, 5],
  ["techcrunch", "Long-form: how a small lab trains frontier models on a budget", "소규모 연구소가 적은 예산으로 최상위 모델을 학습하는 방법", "데이터 선별, 합성 데이터 활용, 학습 일정 최적화를 조합해 연산 비용을 크게 줄인 한 연구소의 사례를 소개한다. 연구진은 모델 크기를 키우는 것보다 데이터 품질에 투자하는 편이 효율적이었다고 설명한다. 다만 같은 방식이 더 큰 규모에서도 통할지는 아직 검증되지 않았고, 일부 전문가는 벤치마크 점수만으로 성능을 판단하기는 어렵다고 지적한다.", "LLM", 6],
  ["theverge", "Delivery robots get city permits", "배달 로봇, 도심 운행 허가 획득", "배달 로봇 업체가 시 당국으로부터 보도 운행 허가를 받았다. 우선 대학가 인근에서 시작해 점차 운행 지역을 넓힐 예정이다.", "로봇", 7],
];

for (const [i, [source, titleEn, titleKo, summaryKo, category, ago]] of articles.entries()) {
  await sql`INSERT INTO articles (user_id, url, source, title_en, title_ko, summary_ko, category_id, published_at)
            VALUES (${userId}, ${SEED_URL + (i + 1)}, ${source === "techcrunch" ? "TechCrunch" : "The Verge"},
                    ${titleEn}, ${titleKo}, ${summaryKo}, ${category ? cat[category] : null}, ${day(ago)})
            ON CONFLICT ON CONSTRAINT articles_user_url_unique DO NOTHING`;
}
console.log(`예시 데이터를 넣었어요. 카테고리 ${categoryNames.length}개, 기사 ${articles.length}개`);
