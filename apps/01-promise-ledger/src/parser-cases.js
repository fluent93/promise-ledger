export const parserCases = [
  {
    id: "KO-01",
    input: "민수에게 금요일까지 견적서 보내주기로 함.",
    expected: { person: "민수", direction: "mine", dueDate: "2026-06-12" },
  },
  {
    id: "KO-02",
    input: "지은이는 다음 주 월요일에 디자인 초안 공유해준다고 했다.",
    expected: { person: "지은", direction: "theirs", dueDate: "2026-06-15" },
  },
  {
    id: "KO-03",
    input: "대표님께 오늘 오후에 회의 장소 다시 확인해드리기.",
    expected: { person: "대표", direction: "mine", dueDate: "2026-06-09" },
  },
  {
    id: "KO-04",
    input: "현우가 내일까지 결제 링크 보내주기로 했음.",
    expected: { person: "현우", direction: "theirs", dueDate: "2026-06-10" },
  },
  {
    id: "KO-06",
    input: "엄마에게 내일 병원 예약 시간 확인해드리기.",
    expected: { person: "엄마", direction: "mine", dueDate: "2026-06-10" },
  },
  {
    id: "KO-08",
    input: "선영님께 다음 주 수요일까지 발표 자료 공유.",
    expected: { person: "선영", direction: "mine", dueDate: "2026-06-17" },
  },
  {
    id: "KO-10",
    input: "유리에게 생일 선물 링크 나중에 보내기.",
    expected: { person: "유리", direction: "mine", dueDate: "" },
  },
  {
    id: "KO-17-KNOWN-GAP",
    input: "예린은 수요일까지 로고 후보 3개 보내준대.",
    expected: { person: "예린", direction: "theirs", dueDate: "2026-06-10" },
  },
  {
    id: "EN-01",
    input: "I promised Alex I would send the invoice by Friday.",
    expected: { person: "Alex", direction: "mine", dueDate: "2026-06-12" },
  },
  {
    id: "EN-02",
    input: "Sarah said she will share the draft next Monday.",
    expected: { person: "Sarah", direction: "theirs", dueDate: "2026-06-15" },
  },
  {
    id: "EN-03",
    input: "Remind Daniel today about the dinner booking.",
    expected: { person: "Daniel", direction: "mine", dueDate: "2026-06-09" },
  },
  {
    id: "EN-04",
    input: "Jamie will send me the payment link tomorrow.",
    expected: { person: "Jamie", direction: "theirs", dueDate: "2026-06-10" },
  },
  {
    id: "EN-05",
    input: "Tell Priya I will review her slides by Wednesday.",
    expected: { person: "Priya", direction: "mine", dueDate: "2026-06-10" },
  },
  {
    id: "EN-08",
    input: "From Noah: he will send the receipt next Tuesday.",
    expected: { person: "Noah", direction: "theirs", dueDate: "2026-06-16" },
  },
  {
    id: "EN-11-KNOWN-GAP",
    input: "I owe Ben a quick summary by Thu.",
    expected: { person: "Ben", direction: "mine", dueDate: "2026-06-11" },
  },
  {
    id: "EN-15-KNOWN-GAP",
    input: "I told Ethan I would send the Zoom link today.",
    expected: { person: "Ethan", direction: "mine", dueDate: "2026-06-09" },
  },
];
