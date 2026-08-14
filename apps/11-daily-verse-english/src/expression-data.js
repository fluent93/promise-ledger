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
    "meaning": "도대체 ...은 왜 그런 거야? 일상의 이상한 점을 가볍게 꺼내는 말.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "What's the deal with airline boarding groups?",
        "translation": "비행기 탑승 그룹은 도대체 왜 저런 거야?"
      },
      {
        "speaker": "George",
        "text": "Exactly. Six groups, one line.",
        "translation": "그러게. 그룹은 여섯 개인데 줄은 하나야."
      }
    ]
  },
  {
    "phrase": "Yada, yada, yada.",
    "meaning": "이러쿵저러쿵, 중간 과정은 생략하고.",
    "example": [
      {
        "speaker": "Elaine",
        "text": "We had dinner, yada, yada, yada, and I got home late.",
        "translation": "저녁을 먹고, 이러쿵저러쿵하다가 집에 늦게 왔어."
      },
      {
        "speaker": "Jerry",
        "text": "Sounds like you skipped the important part.",
        "translation": "중요한 부분을 건너뛴 것 같은데."
      }
    ]
  },
  {
    "phrase": "Not that there's anything wrong with that.",
    "meaning": "그게 잘못됐다는 뜻은 아니야.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "He color-codes every shelf. Not that there's anything wrong with that.",
        "translation": "그 사람은 선반마다 색깔로 구분해 둬. 그게 잘못됐다는 뜻은 아니고."
      },
      {
        "speaker": "George",
        "text": "At least it's easy to find everything.",
        "translation": "적어도 물건 찾기는 쉽겠네."
      }
    ]
  },
  {
    "phrase": "It's not you, it's me.",
    "meaning": "네 문제가 아니라 내 문제야.",
    "example": [
      {
        "speaker": "George",
        "text": "I can't join another project right now. It's not you, it's me.",
        "translation": "지금은 다른 프로젝트에 참여할 수 없어. 네 문제가 아니라 내 문제야."
      },
      {
        "speaker": "Jerry",
        "text": "I get it. We can talk when your schedule clears up.",
        "translation": "알겠어. 일정이 정리되면 다시 얘기하자."
      }
    ]
  },
  {
    "phrase": "I'm out.",
    "meaning": "난 빠질게, 더는 참여하지 않을게.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "Another three-hour meeting? I'm out.",
        "translation": "또 세 시간짜리 회의라고? 난 빠질래."
      },
      {
        "speaker": "Kramer",
        "text": "Wait, there will be snacks this time.",
        "translation": "잠깐, 이번에는 간식도 나온대."
      }
    ]
  },
  {
    "phrase": "Serenity now.",
    "meaning": "평온이여, 지금 당장. 진정하려고 외치는 유머러스한 말.",
    "example": [
      {
        "speaker": "Frank",
        "text": "The printer jammed again. Serenity now.",
        "translation": "프린터가 또 걸렸어. 평온이여, 지금 당장."
      },
      {
        "speaker": "George",
        "text": "You don't sound very serene.",
        "translation": "전혀 평온하게 들리지 않는데요."
      }
    ]
  },
  {
    "phrase": "That's a shame.",
    "meaning": "그거 안됐네, 아쉽다.",
    "example": [
      {
        "speaker": "George",
        "text": "The bakery sold the last loaf five minutes ago.",
        "translation": "빵집에서 마지막 빵을 5분 전에 팔았대."
      },
      {
        "speaker": "Jerry",
        "text": "That's a shame. I came across town for it.",
        "translation": "그거 안됐네. 난 그거 사려고 멀리서 왔는데."
      }
    ]
  },
  {
    "phrase": "Get out!",
    "meaning": "말도 안 돼! 정말이야? 놀라움을 강하게 나타내는 말.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "I got upgraded to first class for free.",
        "translation": "무료로 일등석 업그레이드를 받았어."
      },
      {
        "speaker": "Elaine",
        "text": "Get out! How did that happen?",
        "translation": "말도 안 돼! 어떻게 된 거야?"
      }
    ]
  },
  {
    "phrase": "Giddy up!",
    "meaning": "좋아, 가보자! 신나게 동의하거나 출발을 재촉하는 말.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "The tickets are booked and the car is downstairs.",
        "translation": "표도 예매했고 차도 아래에 와 있어."
      },
      {
        "speaker": "Kramer",
        "text": "Giddy up!",
        "translation": "좋아, 가보자!"
      }
    ]
  },
  {
    "phrase": "We're living in a society.",
    "meaning": "우리 사회에는 지켜야 할 기본 예의가 있잖아.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "He took the last seat and put his bag on the one beside it.",
        "translation": "그 사람이 마지막 자리를 차지하고 옆자리에는 가방까지 놨어."
      },
      {
        "speaker": "George",
        "text": "We're living in a society. You can't do that.",
        "translation": "우리는 사회 속에서 살고 있다고. 그러면 안 되지."
      }
    ]
  },
  {
    "phrase": "Double-dip.",
    "meaning": "한 번 베어 문 음식을 소스에 다시 찍는 행동.",
    "example": [
      {
        "speaker": "Timmy",
        "text": "Did you just double-dip that chip?",
        "translation": "방금 그 칩을 소스에 두 번 찍은 거야?"
      },
      {
        "speaker": "George",
        "text": "I turned it around. It's practically a new chip.",
        "translation": "반대쪽으로 돌렸어. 사실상 새 칩이나 마찬가지야."
      }
    ]
  },
  {
    "phrase": "I can't spare a square.",
    "meaning": "한 칸도 나눠줄 여유가 없어.",
    "example": [
      {
        "speaker": "Elaine",
        "text": "Can you spare a square of paper?",
        "translation": "종이 한 칸만 좀 줄 수 있어?"
      },
      {
        "speaker": "Jane",
        "text": "Sorry, this is the last one.",
        "translation": "미안하지만 이게 마지막 한 칸이야."
      }
    ]
  },
  {
    "phrase": "No soup for you.",
    "meaning": "당신에게 줄 수프는 없어. 규칙을 어긴 사람을 단호하게 거절하는 말.",
    "example": [
      {
        "speaker": "George",
        "text": "Two dollars? But everyone in front of me got free bread.",
        "translation": "2달러요? 하지만 제 앞 사람들은 모두 빵을 공짜로 받았잖아요."
      },
      {
        "speaker": "Soup Nazi",
        "text": "You want bread? Three dollars! No soup for you!",
        "translation": "빵을 원해? 3달러! 당신에게 줄 수프는 없어!"
      }
    ]
  },
  {
    "phrase": "These pretzels are making me thirsty.",
    "meaning": "이 프레첼을 먹으니 목이 마르네.",
    "example": [
      {
        "speaker": "Kramer",
        "text": "These crackers are making me thirsty.",
        "translation": "이 크래커를 먹으니 목이 마르네."
      },
      {
        "speaker": "Jerry",
        "text": "There's water in the fridge.",
        "translation": "냉장고에 물 있어."
      }
    ]
  },
  {
    "phrase": "I was in the pool!",
    "meaning": "나 방금 수영장에 있었단 말이야. 민망한 상황을 다급하게 해명하는 말.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "Why is your hair completely flat?",
        "translation": "머리가 왜 그렇게 완전히 납작해졌어?"
      },
      {
        "speaker": "George",
        "text": "I was in the pool!",
        "translation": "나 수영장에 있었단 말이야!"
      }
    ]
  },
  {
    "phrase": "Master of your domain.",
    "meaning": "자기 욕구와 행동을 완전히 통제하는 사람.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "You walked past the dessert table without stopping.",
        "translation": "디저트 테이블 앞을 멈추지 않고 지나갔네."
      },
      {
        "speaker": "George",
        "text": "I'm the master of my domain.",
        "translation": "난 내 욕구를 완벽히 통제하는 사람이야."
      }
    ]
  },
  {
    "phrase": "You are so good-looking.",
    "meaning": "정말 멋져 보여. 외모를 직접 칭찬하는 말.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "I finally found a jacket that fits.",
        "translation": "드디어 나한테 맞는 재킷을 찾았어."
      },
      {
        "speaker": "Elaine",
        "text": "You are so good-looking.",
        "translation": "정말 멋져 보여."
      }
    ]
  },
  {
    "phrase": "A Festivus for the rest of us.",
    "meaning": "우리 같은 평범한 사람들을 위한 축제.",
    "example": [
      {
        "speaker": "George",
        "text": "No fancy dinner this year. Just friends and takeout.",
        "translation": "올해는 근사한 저녁도 없어요. 친구들과 포장 음식만 먹을 거예요."
      },
      {
        "speaker": "Frank",
        "text": "A Festivus for the rest of us.",
        "translation": "우리 같은 사람들을 위한 페스티버스지."
      }
    ]
  },
  {
    "phrase": "They're real, and they're spectacular.",
    "meaning": "진짜고, 게다가 아주 훌륭해.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "Are those photos actually from your trip?",
        "translation": "그 사진들 정말 네 여행에서 찍은 거야?"
      },
      {
        "speaker": "Sidra",
        "text": "They're real, and they're spectacular.",
        "translation": "진짜고, 아주 멋져."
      }
    ]
  },
  {
    "phrase": "I don't wanna be a pirate.",
    "meaning": "난 해적이 되고 싶지 않아. 원치 않는 역할이나 옷을 거부하는 말.",
    "example": [
      {
        "speaker": "Kramer",
        "text": "Everyone has to wear a cape for the photo.",
        "translation": "사진 찍을 때 모두 망토를 입어야 해."
      },
      {
        "speaker": "Jerry",
        "text": "I don't wanna be a pirate.",
        "translation": "난 해적이 되고 싶지 않아."
      }
    ]
  },
  {
    "phrase": "The jerk store called.",
    "meaning": "한참 뒤에 떠올린 유치한 반격을 꺼내는 말.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "I finally thought of the perfect comeback from yesterday.",
        "translation": "어제 그 말에 받아칠 완벽한 대답이 이제야 생각났어."
      },
      {
        "speaker": "George",
        "text": "Let me guess. The jerk store called?",
        "translation": "맞혀볼게. 멍청이 가게에서 전화 왔다고?"
      }
    ]
  },
  {
    "phrase": "Maybe the dingo ate your baby.",
    "meaning": "상대의 걱정을 엉뚱한 추측으로 받아치는 말.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "I can't find my phone anywhere.",
        "translation": "내 휴대폰을 아무리 찾아도 없어."
      },
      {
        "speaker": "Elaine",
        "text": "Maybe the couch ate it.",
        "translation": "소파가 먹어버렸나 보지."
      }
    ]
  },
  {
    "phrase": "You're killing independent George!",
    "meaning": "내 독립적인 자아를 없애고 있어. 서로 다른 인간관계가 섞일 때의 과장된 불평.",
    "example": [
      {
        "speaker": "Susan",
        "text": "My coworkers are joining our weekend game night.",
        "translation": "내 직장 동료들도 이번 주말 게임 모임에 올 거야."
      },
      {
        "speaker": "George",
        "text": "You're killing independent me!",
        "translation": "당신이 독립적인 나를 죽이고 있어!"
      }
    ]
  },
  {
    "phrase": "I choose not to run.",
    "meaning": "난 뛰지 않기로 선택했어. 못하는 일을 의지의 문제처럼 바꿔 말하는 표현.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "Are you worried you can't finish the race?",
        "translation": "경주를 끝까지 못 뛸까 봐 걱정되는 거야?"
      },
      {
        "speaker": "George",
        "text": "No. I choose not to run.",
        "translation": "아니. 난 뛰지 않기로 선택한 거야."
      }
    ]
  },
  {
    "phrase": "That's gold.",
    "meaning": "그거 정말 훌륭한 소재야, 완전 대박이야.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "My neighbor labels leftovers by emotional importance.",
        "translation": "우리 이웃은 남은 음식에 감정적 중요도에 따라 이름표를 붙여."
      },
      {
        "speaker": "Bania",
        "text": "That's gold. Write that down.",
        "translation": "그거 최고다. 적어 둬."
      }
    ]
  },
  {
    "phrase": "They're all Twix!",
    "meaning": "전부 같은 거잖아! 차이가 없다는 걸 흥분해서 지적하는 말.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "The menu lists three versions, but they're all the same sandwich.",
        "translation": "메뉴에는 세 종류라고 적혀 있지만 전부 같은 샌드위치야."
      },
      {
        "speaker": "George",
        "text": "Exactly. They're all the same thing!",
        "translation": "맞아. 전부 똑같은 거라고!"
      }
    ]
  },
  {
    "phrase": "He's a close talker.",
    "meaning": "그는 대화할 때 지나치게 가까이 다가오는 사람이야.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "Why do you keep stepping backward when Dan talks?",
        "translation": "댄과 얘기할 때 왜 계속 뒤로 물러서는 거야?"
      },
      {
        "speaker": "Elaine",
        "text": "He's a close talker.",
        "translation": "그 사람은 지나치게 가까이 붙어서 말해."
      }
    ]
  },
  {
    "phrase": "It's sponge-worthy.",
    "meaning": "아껴둔 것을 쓸 만큼 가치가 있어.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "Is this occasion really candle-worthy?",
        "translation": "정말 이럴 때 아껴둔 초를 쓸 가치가 있어?"
      },
      {
        "speaker": "Elaine",
        "text": "Absolutely. We've been waiting all year.",
        "translation": "당연하지. 일 년 내내 기다렸잖아."
      }
    ]
  },
  {
    "phrase": "You know how to take it; you just don't know how to hold it.",
    "meaning": "받는 법은 알지만 제대로 유지하는 법은 모르는군요.",
    "example": [
      {
        "speaker": "Clerk",
        "text": "They accepted the booking, but they gave our table away.",
        "translation": "예약은 받았지만 저희가 그 테이블을 다른 손님에게 드렸습니다."
      },
      {
        "speaker": "Jerry",
        "text": "So they know how to take a reservation, not how to hold one.",
        "translation": "예약받는 법은 알아도 예약을 지키는 법은 모르는군요."
      }
    ]
  }
].map((expression) => ({ ...expression, source: episodeSources[expression.phrase] }));
