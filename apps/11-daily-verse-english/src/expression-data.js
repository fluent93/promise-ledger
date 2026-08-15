export const EXPRESSION_POLICY_VERSION = 3;

const episodeSources = {
  "What's the deal with...?": { season: 8, episode: "The Summer of George" },
  "Yada, yada, yada.": { season: 8, episode: "The Yada Yada" },
  "Not that there's anything wrong with that.": { season: 4, episode: "The Outing" },
  "It's not you, it's me.": { season: 5, episode: "The Lip Reader" },
  "I'm out.": { season: 4, episode: "The Contest" },
  "Serenity now.": { season: 9, episode: "The Serenity Now" },
  "That's a shame.": { season: 5, episode: "The Stall" },
  "Get out!": { season: 2, episode: "The Apartment" },
  "Giddy up!": { season: 2, episode: "The Baby Shower" },
  "We're living in a society.": { season: 2, episode: "The Chinese Restaurant" },
  "Double-dip.": { season: 4, episode: "The Implant" },
  "I can't spare a square.": { season: 5, episode: "The Stall" },
  "No soup for you.": { season: 7, episode: "The Soup Nazi" },
  "These pretzels are making me thirsty.": { season: 3, episode: "The Alternate Side" },
  "I was in the pool!": { season: 5, episode: "The Hamptons" },
  "Master of your domain.": { season: 4, episode: "The Contest" },
  "You are so good-looking.": { season: 3, episode: "The Good Samaritan" },
  "A Festivus for the rest of us.": { season: 9, episode: "The Strike" },
  "They're real, and they're spectacular.": { season: 4, episode: "The Implant" },
  "I don't wanna be a pirate.": { season: 5, episode: "The Puffy Shirt" },
  "The jerk store called.": { season: 8, episode: "The Comeback" },
  "Maybe the dingo ate your baby.": { season: 3, episode: "The Stranded" },
  "You're killing independent George!": { season: 7, episode: "The Pool Guy" },
  "I choose not to run.": { season: 6, episode: "The Race" },
  "That's gold.": { season: 8, episode: "The Fatigues" },
  "They're all Twix!": { season: 9, episode: "The Dealership" },
  "He's a close talker.": { season: 5, episode: "The Raincoats" },
  "It's sponge-worthy.": { season: 7, episode: "The Sponge" },
  "You know how to take it; you just don't know how to hold it.": { season: 3, episode: "The Alternate Side" },
};

export const advancedExpressions = [
  {
    "phrase": "What's the deal with...?",
    "meaning": "도대체 ...은 왜 그런 거야? 일상의 이상한 점을 가볍게 꺼내는 스탠드업 코미디풍 표현.",
    "nuance": "Jerry Seinfeld의 시그니처 오프닝 멘트입니다. 비판이나 화를 내는 것이 아니라, 일상에서 누구나 겪는 황당하거나 불합리한 상황을 위트 있게 대화 화제로 끌어올 때 씁니다. 살짝 어깨를 으쓱하며 의구심 섞인 어조로 말하는 것이 포인트입니다.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "What's the deal with those guys down in the pit?",
        "translation": "저 아래 구덩이에 있는 사람들은 도대체 뭐야?",
        "voice": "alloy"
      },
      {
        "speaker": "Jerry",
        "text": "What are they doing down there?",
        "translation": "저 아래에서 뭘 하는 건데?",
        "voice": "alloy"
      }
    ],
    "modernUsage": [
      {
        "speaker": "Alex",
        "text": "What's the deal with airport Wi-Fi? It always disconnects right when you need it.",
        "translation": "공항 Wi-Fi는 도대체 왜 이러는 거야? 딱 필요할 때 항상 끊기잖아.",
        "voice": "alloy"
      },
      {
        "speaker": "Sam",
        "text": "Tell me about it. It's a universal law.",
        "translation": "내 말이! 그건 우주의 법칙이야.",
        "voice": "nova"
      }
    ]
  },
  {
    "phrase": "Yada, yada, yada.",
    "meaning": "이러쿵저러쿵, (지루하거나 미묘한) 중간 과정은 생략하고.",
    "nuance": "상대방이 구구절절 설명하기 싫거나, 대화의 본론/결론만 빠르게 전달하고 싶을 때 씁니다. 주의할 점은 핵심적인 순간(예: 데이트 후 결과 등)을 슬그머니 뭉뚱그려 넘길 때 상대방이 'You yada yada'd over the best part!'라고 지적하며 웃음을 유발합니다.",
    "example": [
      {
        "speaker": "George",
        "text": "You yada yada'd over the best part.",
        "translation": "제일 중요한 부분을 이러쿵저러쿵으로 넘겼잖아.",
        "voice": "onyx"
      },
      {
        "speaker": "Elaine",
        "text": "No, I mentioned the yada yada.",
        "translation": "아니야, 이러쿵저러쿵은 말했다고.",
        "voice": "nova"
      }
    ],
    "modernUsage": [
      {
        "speaker": "Chris",
        "text": "We went to the interview, discussed the offer, yada yada yada, I start next Monday!",
        "translation": "면접 보고, 제안 연봉 이야기하고, 이러쿵저러쿵해서 다음 주 월요일에 출근해!",
        "voice": "alloy"
      },
      {
        "speaker": "Taylor",
        "text": "Congrats! Don't yada yada your salary though!",
        "translation": "축하해! 그래도 연봉 부분은 이러쿵저러쿵 넘기지 마!",
        "voice": "nova"
      }
    ]
  },
  {
    "phrase": "Not that there's anything wrong with that.",
    "meaning": "그게 잘못됐다는 뜻은 아니야. (자신의 편견이나 오해를 다급히 해명할 때)",
    "nuance": "자신의 발언이 누군가에게 오해나 차별처럼 들릴까 봐 다급하게 정치적 올바름(PC)을 의식하며 덧붙이는 방어적 표현입니다. 상대의 성향이나 취향을 언급한 직후 빠르게 덧붙여야 재미가 살아납니다.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "We're not gay. Not that there's anything wrong with that.",
        "translation": "우린 게이가 아니야. 그게 잘못됐다는 뜻은 아니고.",
        "voice": "alloy"
      },
      {
        "speaker": "George",
        "text": "Not that there's anything wrong with that.",
        "translation": "그게 잘못됐다는 뜻은 아니야.",
        "voice": "onyx"
      }
    ],
    "modernUsage": [
      {
        "speaker": "Jordan",
        "text": "He prefers spending Friday night playing retro games alone. Not that there's anything wrong with that.",
        "translation": "걔는 금요일 밤에 혼자 고전 게임 하는 걸 선호하더라고. 그게 잘못됐다는 건 아니고.",
        "voice": "alloy"
      },
      {
        "speaker": "Morgan",
        "text": "Honestly, that sounds like a peaceful weekend to me.",
        "translation": "솔직히 나한테는 평화로운 주말처럼 들리는데.",
        "voice": "nova"
      }
    ]
  },
  {
    "phrase": "It's not you, it's me.",
    "meaning": "네 문제가 아니라 내 문제야. (전통적인 이별 핑계 멘트)",
    "nuance": "상대방의 상처를 줄이려고 쓰지만, 사실상 영혼 없는 전형적인 이별 핑계로 잘 알려진 클래식 구절입니다. 미국 문화권에서는 이 말을 들으면 '진짜 내 탓이 아니구나'가 아니라 '진부한 핑계를 대는구나'로 받아들이는 유머 포인트가 있습니다.",
    "example": [
      {
        "speaker": "George",
        "text": "It's not you, it's me.",
        "translation": "네 문제가 아니라 내 문제야.",
        "voice": "onyx"
      },
      {
        "speaker": "George",
        "text": "This is the best break-up line ever invented.",
        "translation": "이건 역사상 최고의 이별 멘트야.",
        "voice": "onyx"
      }
    ],
    "modernUsage": [
      {
        "speaker": "David",
        "text": "I'm canceling my gym membership. It's not you, gym, it's me.",
        "translation": "나 헬스장 등록 취소하려고. 헬스장 네 탓이 아니라 내 탓이야.",
        "voice": "alloy"
      },
      {
        "speaker": "Sarah",
        "text": "No, it's definitely your alarm clock's fault.",
        "translation": "아니지, 그건 확실히 네 알람 시계 탓이야.",
        "voice": "nova"
      }
    ]
  },
  {
    "phrase": "I'm out.",
    "meaning": "난 빠질게. (승부나 경쟁에서 즉시 포기 선언할 때)",
    "nuance": "Kramer가 참을성 내기(The Contest)가 시작되자마자 돈을 테이블에 턱 내던지며 '난 포기야!'라고 외치는 장면에 나온 명대사입니다. 유혹이나 조건에 1초도 못 버티고 손을 털 때 과장되게 쓰는 표현입니다.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "I'm out.",
        "translation": "난 빠질게.",
        "voice": "alloy"
      },
      {
        "speaker": "George",
        "text": "What do you mean, you're out?",
        "translation": "빠지겠다는 게 무슨 뜻이야?",
        "voice": "onyx"
      }
    ],
    "modernUsage": [
      {
        "speaker": "Elena",
        "text": "Who wants to refrain from buying coffee for a month?",
        "translation": "한 달 동안 커피 안 사 마시기 도전할 사람?",
        "voice": "nova"
      },
      {
        "speaker": "Marcus",
        "text": "I'm out. I just bought an iced latte.",
        "translation": "난 빠질게. 방금 아아 하나 샀거든.",
        "voice": "echo"
      }
    ]
  },
  {
    "phrase": "These pretzels are making me thirsty.",
    "meaning": "이 프레첼을 먹으니 목이 마르네. (대사에 감정과 억양을 실어 말하는 연습)",
    "nuance": "Seinfeld 최고의 명대사 중 하나로, Kramer가 우디 앨런 영화의 단역 대사를 얻어 친구들에게 여러 가지 억양으로 연기해 보이는 씬입니다. 어조와 강조점(These PRETZELS... vs MAKING me...)에 따라 의미가 달라지는 미국식 억양 연습의 정석입니다.",
    "example": [
      {
        "speaker": "Kramer",
        "text": "Boy, these pretzels are making me thirsty.",
        "translation": "이봐, 이 프레첼을 먹으니 목이 마르네.",
        "voice": "echo"
      },
      {
        "speaker": "George",
        "text": "Is that how you're gonna say it? That's no good.",
        "translation": "그렇게 말할 생각이야? 전혀 아니잖아.",
        "voice": "onyx"
      }
    ],
    "modernUsage": [
      {
        "speaker": "Jake",
        "text": "How should I deliver this line in the presentation?",
        "translation": "발표할 때 이 문장을 어떤 톤으로 전달해야 할까?",
        "voice": "alloy"
      },
      {
        "speaker": "Hannah",
        "text": "Just don't say it like Kramer: 'These pretzels are making me thirsty!'",
        "translation": "크레이머처럼 '이 프레첼 때문에 목마르네!' 하고 과장하지만 마!",
        "voice": "nova"
      }
    ]
  },
  {
    "phrase": "No soup for you.",
    "meaning": "당신에게 줄 수프는 없어! (엄격한 규칙 위반자에게 단호하게 거절할 때)",
    "nuance": "전설적인 'Soup Nazi' 에피소드에서 나온 표현입니다. 대기 줄에서 잡담을 하거나 정해진 절차를 1cm라도 어기면 주인장이 수프 그릇을 뺏으며 내뱉는 멘트입니다. 일상에서 친구가 작은 규칙을 어겼을 때 유머러스한 '거절'의 밈으로 쓰입니다.",
    "example": [
      {
        "speaker": "George",
        "text": "Excuse me, I think you forgot my bread.",
        "translation": "저기요, 제 빵을 빼먹으신 것 같은데요.",
        "voice": "onyx"
      },
      {
        "speaker": "Soup Nazi",
        "text": "You want bread? Three dollars! No soup for you!",
        "translation": "빵을 원해? 3달러! 당신에게 줄 수프는 없어!",
        "voice": "onyx"
      }
    ],
    "modernUsage": [
      {
        "speaker": "Ben",
        "text": "Can I borrow your fries?",
        "translation": "감자튀김 하나만 집어먹어도 돼?",
        "voice": "alloy"
      },
      {
        "speaker": "Chloe",
        "text": "You didn't help me move today. No fries for you!",
        "translation": "오늘 이사 도와주지도 않았잖아. 너한테 줄 감튀는 없어!",
        "voice": "nova"
      }
    ]
  }
].map((expression) => ({
  ...expression,
  source: episodeSources[expression.phrase],
}));
