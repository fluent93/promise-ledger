export const EXPRESSION_POLICY_VERSION = 4;

const episodeSources = {
  "These pretzels are making me thirsty.": { season: 3, episode: "The Alternate Side" },
  "No soup for you.": { season: 7, episode: "The Soup Nazi" },
  "Serenity now.": { season: 9, episode: "The Serenity Now" },
  "Yada, yada, yada.": { season: 8, episode: "The Yada Yada" },
  "Not that there's anything wrong with that.": { season: 4, episode: "The Outing" },
  "It's not you, it's me.": { season: 5, episode: "The Lip Reader" },
  "I'm out.": { season: 4, episode: "The Contest" },
  "Master of your domain.": { season: 4, episode: "The Contest" },
  "We're living in a society.": { season: 2, episode: "The Chinese Restaurant" },
  "Double-dip.": { season: 4, episode: "The Implant" },
  "I can't spare a square.": { season: 5, episode: "The Stall" },
  "The jerk store called.": { season: 8, episode: "The Comeback" },
  "They're real, and they're spectacular.": { season: 4, episode: "The Implant" },
  "The Summer of George!": { season: 8, episode: "The Summer of George" },
};

export const advancedExpressions = [
  {
    phrase: "These pretzels are making me thirsty.",
    meaning: "이 프레첼을 먹으니 목이 마르네. (어조와 강세 연기 연습의 명대사)",
    nuance: "Kramer가 우디 앨런 영화의 단역 대사를 얻어 친구들에게 여러 강세로 연기해 보이는 씬입니다. 영어는 강조하는 단어(These vs Pretzels vs Thirsty)에 따라 전달되는 감정이 완전히 달라지며, 미국식 연기 및 억양 훈련의 표준 예문입니다.",
    example: [
      {
        speaker: "Kramer",
        text: "Boy, these pretzels are making me thirsty.",
        translation: "이봐, 이 프레첼을 먹으니 목이 마르네."
      },
      {
        speaker: "George",
        text: "Is that how you're gonna say it? That's no good.",
        translation: "그렇게 말할 생각이야? 전혀 아니잖아."
      },
      {
        speaker: "Jerry",
        text: "You gotta put the emphasis on 'these': *These* pretzels are making me thirsty!",
        translation: "'These'에 강세를 줘야지: *이* 프레첼 때문에 목마르다고!"
      },
      {
        speaker: "Kramer",
        text: "No, I think I got it. *These pretzels* are making me thirsty!",
        translation: "아니야, 감 잡았어. *이 프레첼들* 때문에 목이 마르네!"
      }
    ],
    modernUsage: [
      {
        speaker: "Jake",
        text: "How should I deliver this pitch to the investors?",
        translation: "투자자들에게 이 발표 멘트를 어떤 톤으로 전달해야 할까?"
      },
      {
        speaker: "Hannah",
        text: "Just stress the key words clearly. Don't over-act like Kramer with his pretzels!",
        translation: "핵심 단어에만 명확히 강세를 줘. 프레첼 연기하는 크레이머처럼 너무 과장하지만 말고!"
      }
    ]
  },
  {
    phrase: "No soup for you.",
    meaning: "당신에게 줄 수프는 없어! (규칙 위반자에게 단호하고 유머러스하게 거절할 때)",
    nuance: "전설적인 'Soup Nazi' 에피소드에서 나온 멘트입니다. 주문 줄에서 잡담을 하거나 정해진 절차를 어기면 단칼에 거절하는 씬으로, 현대 미국에서는 친구나 동료가 규칙을 어기거나 짓궂은 요청을 할 때 쓰는 대표 유머 거절 밈입니다.",
    example: [
      {
        speaker: "George",
        text: "Excuse me, I think you forgot my bread.",
        translation: "저기요, 제 빵을 빼먹으신 것 같은데요."
      },
      {
        speaker: "Soup Nazi",
        text: "Bread — two dollars extra.",
        translation: "빵은 2달러 추가다."
      },
      {
        speaker: "George",
        text: "Two dollars? But everyone in front of me got free bread!",
        translation: "2달러요? 하지만 제 앞 사람들은 다 무료로 받았잖아요!"
      },
      {
        speaker: "Soup Nazi",
        text: "You want bread? Three dollars! No soup for you!",
        translation: "빵을 원해? 3달러! 당신에게 줄 수프는 없어!"
      }
    ],
    modernUsage: [
      {
        speaker: "Ben",
        text: "Can I grab a slice of your pizza?",
        translation: "네 피자 한 조각만 집어먹어도 돼?"
      },
      {
        speaker: "Chloe",
        text: "You didn't help clean up the office today. No pizza for you!",
        translation: "오늘 사무실 청소 안 도와줬잖아. 너한테 줄 피자는 없어!"
      }
    ]
  },
  {
    phrase: "Serenity now.",
    meaning: "평온이여, 지금 당장! (스트레스가 폭발하기 직전 스스로를 가라앉힐 때)",
    nuance: "Frank Costanza가 화 분노 조절 테이프에서 배운 대사입니다. 소리를 지르며 'Serenity now!'를 외치지만 정작 화가 풀리기는커녕 억누르기만 하여 훗날 George가 'Serenity now, insanity later(지금은 평온, 나중엔 미침)'라고 꼬집는 명장면입니다.",
    example: [
      {
        speaker: "Frank",
        text: "Serenity now! Serenity now!",
        translation: "평온이여, 지금! 평온이여, 지금!"
      },
      {
        speaker: "George",
        text: "Pop, you're not supposed to yell it.",
        translation: "아버지, 소리 지르면서 외치는 게 아니에요."
      },
      {
        speaker: "Jerry",
        text: "The doctor said it calms the nervous system.",
        translation: "의사가 신경계를 정돈해 준다고 했대요."
      },
      {
        speaker: "George",
        text: "Yeah, serenity now, insanity later.",
        translation: "그래요, 지금은 평온, 나중엔 미치는 거죠."
      }
    ],
    modernUsage: [
      {
        speaker: "Chris",
        text: "My code broke 5 minutes before demo time...",
        translation: "데모 발표 5분 전에 내 코드가 터졌어..."
      },
      {
        speaker: "Morgan",
        text: "Serenity now! Take a deep breath and revert the last commit.",
        translation: "지금 당장 평온을! 심호흡하고 마지막 커밋 복구해."
      }
    ]
  },
  {
    phrase: "Yada, yada, yada.",
    meaning: "이러쿵저러쿵해서, (미묘하거나 곤란한) 중간 과정은 생략하고.",
    nuance: "대화에서 구구절절 설명하기 싫거나 본론만 빨리 전달하고 싶을 때 씁니다. 주의할 점은 핵심적인 순간(예: 데이트 후 결과 등)을 슬그머니 넘기려 할 때 상대방이 'You yada yada'd over the best part!'라고 지적하는 유머 포인트입니다.",
    example: [
      {
        speaker: "George",
        text: "You yada yada'd over the best part!",
        translation: "제일 중요한 부분을 이러쿵저러쿵으로 넘겼잖아!"
      },
      {
        speaker: "Elaine",
        text: "No, I mentioned the yada yada.",
        translation: "아니야, 이러쿵저러쿵은 말했다고."
      },
      {
        speaker: "Jerry",
        text: "Which yada yada did you mention?",
        translation: "어떤 이러쿵저러쿵을 말했는데?"
      },
      {
        speaker: "Elaine",
        text: "I yada yada'd the lobster bisque.",
        translation: "랍스터 비스크 스프 먹은 걸 이러쿵저러쿵으로 넘겼지."
      }
    ],
    modernUsage: [
      {
        speaker: "David",
        text: "We pitched the client, yada yada yada, we signed the contract!",
        translation: "고객사 발표하고, 이러쿵저러쿵해서 계약서 체결했어!"
      },
      {
        speaker: "Sarah",
        text: "Congrats! Don't yada yada the discount rate though!",
        translation: "축하해! 그래도 할인율 부분은 이러쿵저러쿵 넘기지 마!"
      }
    ]
  },
  {
    phrase: "Not that there's anything wrong with that.",
    meaning: "그게 잘못됐다는 뜻은 아니야. (오해나 편견을 다급히 해명할 때)",
    nuance: "자신의 발언이 오해나 차별처럼 들릴까 봐 정치적 올바름(PC)을 의식하며 다급히 덧붙이는 방어적 표현입니다. 상대의 성향이나 취향을 언급한 직후 빠르게 덧붙여야 유머가 살아납니다.",
    example: [
      {
        speaker: "Jerry",
        text: "We're not gay. Not that there's anything wrong with that.",
        translation: "우린 게이가 아니야. 그게 잘못됐다는 뜻은 아니고."
      },
      {
        speaker: "George",
        text: "No, no! Absolutely not! People can do whatever they want!",
        translation: "그럼, 당연히 아니지! 사람은 자기 원하는 대로 살 수 있는 거지!"
      },
      {
        speaker: "Jerry",
        text: "My father's gay, not that there's anything wrong with that.",
        translation: "우리 아버지도 게이야, 그게 잘못됐다는 뜻은 아니고."
      },
      {
        speaker: "George",
        text: "Not that there's anything wrong with that!",
        translation: "그게 잘못됐다는 뜻은 절대 아니지!"
      }
    ],
    modernUsage: [
      {
        speaker: "Alex",
        text: "He eats cereal for dinner every night. Not that there's anything wrong with that.",
        translation: "걔는 매일 저녁으로 시리얼을 먹더라고. 그게 잘못됐다는 건 아니고."
      },
      {
        speaker: "Jordan",
        text: "Hey, it saves time and dishes!",
        translation: "에이, 시간도 아끼고 설거지도 줄이잖아!"
      }
    ]
  },
  {
    phrase: "It's not you, it's me.",
    meaning: "네 문제가 아니라 내 문제야. (클래식 이별 핑계 멘트)",
    nuance: "상대방의 상처를 줄이려고 쓰지만, 사실상 영혼 없는 전형적인 이별 핑계로 유명한 대사입니다. 미국 문화권에서는 이 말을 들으면 '진짜 내 탓이 아니구나'가 아니라 '진부한 핑계를 대는구나'로 받아들여 지는 유머 포인트입니다.",
    example: [
      {
        speaker: "George",
        text: "It's not you, it's me.",
        translation: "네 문제가 아니라 내 문제야."
      },
      {
        speaker: "Gwen",
        text: "You're giving me the 'It's not you, it's me' routine?",
        translation: "지금 나한테 '네 탓이 아니라 내 탓' 핑계를 대는 거야?"
      },
      {
        speaker: "George",
        text: "Well, it *is* me! I invented 'It's not you, it's me'!",
        translation: "아니, 진짜 *내* 문제라니까! 그 멘트는 내가 개발한 거란 말이야!"
      },
      {
        speaker: "Gwen",
        text: "Nobody tells me it's not them, it's me. If it's anybody, it's me!",
        translation: "아무도 나한테 자기 탓이 아니래. 굳이 누구 탓이라면 내 탓이야!"
      }
    ],
    modernUsage: [
      {
        speaker: "Marcus",
        text: "I'm canceling my gym membership. It's not you, gym, it's me.",
        translation: "나 헬스장 등록 취소하려고. 헬스장 네 탓이 아니라 내 탓이야."
      },
      {
        speaker: "Elena",
        text: "No, it's definitely your snooze button's fault.",
        translation: "아니지, 그건 확실히 네 스누즈 버튼 탓이야."
      }
    ]
  },
  {
    phrase: "I'm out.",
    meaning: "난 포기야, 난 빠질게! (유혹이나 내기에서 즉시 손을 털 때)",
    nuance: "Kramer가 참을성 내기(The Contest)가 시작되자마자 2분 만에 돈을 테이블에 턱 내던지며 포기를 선언하는 장면입니다. 조건이나 유혹에 1초도 못 버티고 항복할 때 과장되게 외치는 표현입니다.",
    example: [
      {
        speaker: "Kramer",
        text: "I'm out!",
        translation: "난 포기야!"
      },
      {
        speaker: "Jerry",
        text: "What do you mean, you're out? It's been two minutes!",
        translation: "포기한다니 무슨 소리야? 시작한 지 2분밖에 안 됐어!"
      },
      {
        speaker: "Kramer",
        text: "I can't do it, Jerry! That woman across the street is driving me crazy!",
        translation: "못 버티겠어, 제리! 길 건너 여자 때문에 미쳐버리겠다고!"
      },
      {
        speaker: "George",
        text: "That's gotta be a record.",
        translation: "이건 신기록임에 틀림없어."
      }
    ],
    modernUsage: [
      {
        speaker: "Liam",
        text: "Who wants to do a sugar-free challenge this week?",
        translation: "이번 주 무설탕 챌린지 할 사람?"
      },
      {
        speaker: "Emma",
        text: "I'm out. I just ordered a bubble tea.",
        translation: "난 포기야. 방금 버블티 주문했거든."
      }
    ]
  },
  {
    phrase: "Master of your domain.",
    meaning: "네 욕구와 자제력의 주인이 되다.",
    nuance: "'The Contest' 에피소드에서 수위 높은 단어 대신 절제력과 자제력을 고급스럽게 비유하며 사용한 표현입니다. 직장이나 일상에서 유혹을 잘 참아낼 때 위트 있게 인용하는 구절입니다.",
    example: [
      {
        speaker: "Jerry",
        text: "Are you still master of your domain?",
        translation: "아직도 네 영역의 주인(자제력)을 유지하고 있어?"
      },
      {
        speaker: "George",
        text: "Lord of the manor, Jerry! King of the county!",
        translation: "영주 급이지, 제리! 이 지역의 왕이다!"
      },
      {
        speaker: "Elaine",
        text: "I'm queen of the castle.",
        translation: "난 이 성의 여왕이야."
      },
      {
        speaker: "Jerry",
        text: "Good. As for me, I am master of my domain.",
        translation: "좋아. 나 역시 내 영역의 주인이다."
      }
    ],
    modernUsage: [
      {
        speaker: "Dan",
        text: "How are you holding up on your 5 AM morning routine?",
        translation: "새벽 5시 미라클 모닝 루틴 잘 유지하고 있어?"
      },
      {
        speaker: "Rachel",
        text: "Still master of my domain! Woke up at 4:55 today.",
        translation: "여전히 내 루틴의 주인이지! 오늘 4시 55분에 일어났어."
      }
    ]
  },
  {
    phrase: "We're living in a society.",
    meaning: "우리는 사회 속에서 살고 있잖아! (기본적인 매너나 질서를 지키라고 호소할 때)",
    nuance: "공중전화 줄을 새치기당한 George가 분통을 터뜨리며 외치는 대사입니다. 대중교통이나 공공장소에서 기본적인 매너를 지키지 않는 행동을 볼 때 약간의 과장된 격분 톤으로 유머러스하게 외치는 문장입니다.",
    example: [
      {
        speaker: "George",
        text: "Excuse me, how much longer are you gonna be on that phone?",
        translation: "저기요, 전화 언제까지 쓰실 생각인가요?"
      },
      {
        speaker: "Man",
        text: "As long as I want!",
        translation: "내가 쓰고 싶은 만큼!"
      },
      {
        speaker: "George",
        text: "We're living in a society! We're supposed to act in a civilized way!",
        translation: "우리는 사회 속에서 살고 있잖아! 문명인답게 행동해야 할 거 아니야!"
      },
      {
        speaker: "Jerry",
        text: "George, calm down. The table is almost ready.",
        translation: "조지, 진정해. 테이블 곧 준비된대."
      }
    ],
    modernUsage: [
      {
        speaker: "Noah",
        text: "Someone played loud TikTok videos without headphones on the bus.",
        translation: "누가 버스에서 이어폰도 안 끼고 틱톡 비디오를 크게 틀더라고."
      },
      {
        speaker: "Sophia",
        text: "We're living in a society! Use headphones, people!",
        translation: "우린 사회 속에서 살고 있다고! 이어폰 좀 씁시다!"
      }
    ]
  },
  {
    phrase: "Double-dip.",
    meaning: "한 번 입으로 문 칩을 소스에 다시 찍다. (위생 규범 위반)",
    nuance: "George가 장례식장에서 칩을 한 입 베어 물고 다시 소스 그릇에 찍다가 걸리는 장면입니다. 미국 문화권에서는 소스 그릇에 두 번 찍는 행동('double-dipping')을 상당한 실례로 여기는 계기가 된 문화적 명장면입니다.",
    example: [
      {
        speaker: "Timmy",
        text: "Did you just double-dip that chip?",
        translation: "방금 그 칩 소스에 두 번 찍은 거야?"
      },
      {
        speaker: "George",
        text: "What? What are you talking about?",
        translation: "뭐? 무슨 소릴 하는 거야?"
      },
      {
        speaker: "Timmy",
        text: "You dipped the chip, took a bite, and dipped again!",
        translation: "칩을 찍고 한 입 먹고 다시 찍었잖아!"
      },
      {
        speaker: "George",
        text: "That's like putting your whole mouth right in the dip!",
        translation: "그건 아예 소스 그릇에 입을 처박는 거나 마찬가지라고!"
      }
    ],
    modernUsage: [
      {
        speaker: "Kevin",
        text: "Hey, take a fresh chip if you want more salsa!",
        translation: "이봐, 살사 소스 더 먹고 싶으면 새 칩으로 집어!"
      },
      {
        speaker: "Justin",
        text: "Don't worry, I know the golden rule: No double-dipping!",
        translation: "걱정 마, 황금률은 잘 알고 있어. 두 번 찍기 금지!"
      }
    ]
  },
  {
    phrase: "I can't spare a square.",
    meaning: "휴지 한 칸도 나눠줄 여유가 없어.",
    nuance: "화장실 칸막이 너머로 휴지를 빌려달라는 Elaine의 요청을 옆 칸 여성이 단호히 거절하는 유머 명장면입니다. 작은 양보조차 딱 잘라 거절할 때 인용되는 유명한 유머 구절입니다.",
    example: [
      {
        speaker: "Elaine",
        text: "Excuse me, can you spare a square?",
        translation: "저기요, 휴지 한 칸만 나눠줄 수 있나요?"
      },
      {
        speaker: "Jane",
        text: "No, I'm sorry, I can't spare a square.",
        translation: "아뇨, 미안하지만 한 칸도 나눠줄 여유가 없네요."
      },
      {
        speaker: "Elaine",
        text: "Not even one ply? One little square?",
        translation: "한 겹도 안 돼요? 그 작은 한 칸도?"
      },
      {
        speaker: "Jane",
        text: "I don't have a square to spare!",
        translation: "나눠줄 휴지 한 칸도 없다니까요!"
      }
    ],
    modernUsage: [
      {
        speaker: "Olivia",
        text: "Can I borrow one sheet of sticker paper?",
        translation: "스티커 용지 한 장만 빌려줄 수 있어?"
      },
      {
        speaker: "Ava",
        text: "I can't spare a square! I have exactly five left for my project.",
        translation: "한 장도 여유가 없어! 제안서 제출용으로 딱 5장 남아있거든."
      }
    ]
  },
  {
    phrase: "The jerk store called.",
    meaning: "멍청이 가게에서 전화 왔는데 너 다 떨어졌대. (뒤늦게 생각해낸 통쾌한 반박 멘트)",
    nuance: "회의에서 놀림을 당한 George가 하루 종일 머리를 쥐어짜며 생각해낸 뒤늦은 반박 멘트입니다. 미국 일상에서는 상대방의 깐족거림에 유머러스하게 응수할 때 쓰는 대명사 멘트입니다.",
    example: [
      {
        speaker: "George",
        text: "The jerk store called, and they're running out of you!",
        translation: "멍청이 가게에서 전화 왔는데, 너 재고가 다 떨어졌대!"
      },
      {
        speaker: "Reilly",
        text: "What's the difference? You're their all-time best seller!",
        translation: "뭐가 달라? 너야말로 그 집 역대 베스트셀러잖아!"
      },
      {
        speaker: "George",
        text: "Oh yeah? Well, I had sex with your wife!",
        translation: "아 그래? 나 네 아내랑 잤거든!"
      },
      {
        speaker: "Jerry",
        text: "His wife is in a coma...",
        translation: "걔 아내 혼수상태인데..."
      }
    ],
    modernUsage: [
      {
        speaker: "Ethan",
        text: "Why did you think of that witty comeback 3 hours after the meeting?",
        translation: "왜 그 재치 있는 반박을 회의 끝나고 3시간 뒤에야 떠올린 거야?"
      },
      {
        speaker: "Mason",
        text: "Classic George Costanza syndrome. The jerk store called!",
        translation: "전형적인 조지 코스탄자 증후군이지. 멍청이 가게에서 전화 왔어!"
      }
    ]
  },
  {
    phrase: "They're real, and they're spectacular.",
    meaning: "진짜고, 게다가 아주 훌륭해.",
    nuance: "오해로 헤어지게 된 여자친구 Sidra가 떠나며 Jerry에게 날리는 명대사입니다. 누군가가 무언가의 진위나 진짜 가치에 의문을 제기할 때 자신감 있게 결론을 내릴 때 인용됩니다.",
    example: [
      {
        speaker: "Sidra",
        text: "You know, Jerry, I was really starting to like you.",
        translation: "있잖아 제리, 나 진짜 당신이 좋아지려고 했었어."
      },
      {
        speaker: "Jerry",
        text: "Sidra, wait! It was all an accident!",
        translation: "시드라, 잠시만! 전부 실수였어!"
      },
      {
        speaker: "Sidra",
        text: "And by the way, they're real... and they're spectacular!",
        translation: "참고로 그거 진짜고... 게다가 아주 훌륭하다고!"
      },
      {
        speaker: "Elaine",
        text: "I told you they were real!",
        translation: "내가 진짜라고 말했잖아!"
      }
    ],
    modernUsage: [
      {
        speaker: "Jack",
        text: "Are those vintage mechanical keyboards actually good?",
        translation: "저 빈티지 기계식 키보드가 실제로 좋아?"
      },
      {
        speaker: "Grace",
        text: "They're real, and they're spectacular. Typing on them is a dream.",
        translation: "진짜고, 게다가 완벽해. 타건감이 예술이라니까."
      }
    ]
  },
  {
    phrase: "The Summer of George!",
    meaning: "나만의 최고의 전성기/휴식기를 선언할 때!",
    nuance: "퇴직금을 받게 된 George가 자신만의 여유로운 휴식과 독서, 치즈 먹기를 선언하며 외치는 구절입니다. 휴가나 방학, 리프레시 기간을 맞이했을 때 'The Summer of [내 이름]!'으로 변형하여 신나게 선언할 때 씁니다.",
    example: [
      {
        speaker: "George",
        text: "I'm getting three months' severance pay! Three months!",
        translation: "나 3개월 치 퇴직금 받는다고! 3개월씩이나!"
      },
      {
        speaker: "Jerry",
        text: "So what are you gonna do with yourself?",
        translation: "그래서 그동안 뭐 할 건데?"
      },
      {
        speaker: "George",
        text: "This is gonna be the Summer of George! I'm gonna read, bite into big cheese blocks!",
        translation: "이번 여름은 조지의 여름이 될 거야! 책도 읽고 거대한 치즈 덩어리도 베어 먹을 거라고!"
      },
      {
        speaker: "Jerry",
        text: "I give him two weeks.",
        translation: "난 2주일 건다."
      }
    ],
    modernUsage: [
      {
        speaker: "Mia",
        text: "I'm taking a 2-week sabbatical from work next month!",
        translation: "나 다음 달에 2주일 안식휴가 떠나!"
      },
      {
        speaker: "Charlotte",
        text: "Yes! Get ready for the Summer of Mia!",
        translation: "나이스! 미아의 여름(전성기)을 즐길 준비나 해!"
      }
    ]
  }
].map((expression) => ({
  ...expression,
  source: episodeSources[expression.phrase],
}));
