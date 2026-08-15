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
        "text": "What's the deal with those guys down in the pit?",
        "translation": "저 아래 구덩이에 있는 사람들은 도대체 뭐야?"
      },
      {
        "speaker": "Jerry",
        "text": "What are they doing down there?",
        "translation": "저 아래에서 뭘 하는 건데?"
      }
    ]
  },
  {
    "phrase": "Yada, yada, yada.",
    "meaning": "이러쿵저러쿵, 중간 과정은 생략하고.",
    "example": [
      {
        "speaker": "George",
        "text": "You yada yada'd over the best part.",
        "translation": "제일 중요한 부분을 이러쿵저러쿵으로 넘겼잖아."
      },
      {
        "speaker": "Elaine",
        "text": "No, I mentioned the yada yada.",
        "translation": "아니야, 이러쿵저러쿵은 말했다고."
      }
    ]
  },
  {
    "phrase": "Not that there's anything wrong with that.",
    "meaning": "그게 잘못됐다는 뜻은 아니야.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "We're not gay. Not that there's anything wrong with that.",
        "translation": "우린 게이가 아니야. 그게 잘못됐다는 뜻은 아니고."
      },
      {
        "speaker": "George",
        "text": "Not that there's anything wrong with that.",
        "translation": "그게 잘못됐다는 뜻은 아니야."
      }
    ]
  },
  {
    "phrase": "It's not you, it's me.",
    "meaning": "네 문제가 아니라 내 문제야.",
    "example": [
      {
        "speaker": "George",
        "text": "It's not you, it's me.",
        "translation": "네 문제가 아니라 내 문제야."
      },
      {
        "speaker": "George",
        "text": "This is the best break-up line ever invented.",
        "translation": "이건 역사상 최고의 이별 멘트야."
      }
    ]
  },
  {
    "phrase": "I'm out.",
    "meaning": "난 빠질게, 더는 참여하지 않을게.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "I'm out.",
        "translation": "난 빠질게."
      },
      {
        "speaker": "George",
        "text": "What do you mean, you're out?",
        "translation": "빠지겠다는 게 무슨 뜻이야?"
      }
    ]
  },
  {
    "phrase": "Serenity now.",
    "meaning": "평온이여, 지금 당장. 진정하려고 외치는 유머러스한 말.",
    "example": [
      {
        "speaker": "Frank",
        "text": "Serenity now! Serenity now!",
        "translation": "평온이여, 지금! 평온이여, 지금!"
      },
      {
        "speaker": "George",
        "text": "What the hell is serenity now?",
        "translation": "평온이여 지금이 대체 뭐야?"
      }
    ]
  },
  {
    "phrase": "That's a shame.",
    "meaning": "그거 안됐네, 아쉽다.",
    "example": [
      {
        "speaker": "Elaine",
        "text": "She's got a girlfriend.",
        "translation": "그 여자한테 여자친구가 있대."
      },
      {
        "speaker": "Jerry",
        "text": "What a shame.",
        "translation": "참 안됐네."
      }
    ]
  },
  {
    "phrase": "Get out!",
    "meaning": "말도 안 돼! 정말이야? 놀라움을 강하게 나타내는 말.",
    "example": [
      {
        "speaker": "Elaine",
        "text": "Get out!",
        "translation": "말도 안 돼!"
      },
      {
        "speaker": "Jerry",
        "text": "I'm serious.",
        "translation": "진짜라니까."
      }
    ]
  },
  {
    "phrase": "Giddy up!",
    "meaning": "좋아, 가보자! 신나게 동의하거나 출발을 재촉하는 말.",
    "example": [
      {
        "speaker": "Kramer",
        "text": "Giddy up!",
        "translation": "좋아, 가보자!"
      },
      {
        "speaker": "Jerry",
        "text": "All right, let's go.",
        "translation": "좋아, 가자."
      }
    ]
  },
  {
    "phrase": "We're living in a society.",
    "meaning": "우리 사회에는 지켜야 할 기본 예의가 있잖아.",
    "example": [
      {
        "speaker": "George",
        "text": "We're living in a society!",
        "translation": "우리는 사회 속에서 살고 있다고!"
      },
      {
        "speaker": "George",
        "text": "We're supposed to act in a civilized way.",
        "translation": "문명인답게 행동해야지."
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
        "text": "What?",
        "translation": "뭐?"
      }
    ]
  },
  {
    "phrase": "I can't spare a square.",
    "meaning": "한 칸도 나눠줄 여유가 없어.",
    "example": [
      {
        "speaker": "Elaine",
        "text": "Can you spare a square?",
        "translation": "한 칸만 좀 나눠줄 수 있어?"
      },
      {
        "speaker": "Jane",
        "text": "I can't spare a square.",
        "translation": "한 칸도 나눠줄 여유가 없어."
      }
    ]
  },
  {
    "phrase": "No soup for you.",
    "meaning": "당신에게 줄 수프는 없어. 규칙을 어긴 사람을 단호하게 거절하는 말.",
    "example": [
      {
        "speaker": "George",
        "text": "Excuse me, I think you forgot my bread.",
        "translation": "저기요, 제 빵을 빼먹으신 것 같은데요."
      },
      {
        "speaker": "Soup Nazi",
        "text": "Bread — two dollars extra.",
        "translation": "빵은 2달러 추가."
      },
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
        "text": "Boy, these pretzels are making me thirsty.",
        "translation": "이봐, 이 프레첼을 먹으니 목이 마르네."
      },
      {
        "speaker": "George",
        "text": "Is that how you're gonna say it?",
        "translation": "그렇게 말할 생각이야?"
      }
    ]
  },
  {
    "phrase": "I was in the pool!",
    "meaning": "나 방금 수영장에 있었단 말이야. 민망한 상황을 다급하게 해명하는 말.",
    "example": [
      {
        "speaker": "George",
        "text": "I was in the pool!",
        "translation": "나 수영장에 있었단 말이야!"
      },
      {
        "speaker": "George",
        "text": "I was in the pool!",
        "translation": "수영장에 있었다고!"
      }
    ]
  },
  {
    "phrase": "Master of your domain.",
    "meaning": "자기 욕구와 행동을 완전히 통제하는 사람.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "Are you still master of your domain?",
        "translation": "아직도 네 욕구의 주인이야?"
      },
      {
        "speaker": "George",
        "text": "I'm king of the county.",
        "translation": "난 그 지역의 왕이야."
      }
    ]
  },
  {
    "phrase": "You are so good-looking.",
    "meaning": "정말 멋져 보여. 외모를 직접 칭찬하는 말.",
    "example": [
      {
        "speaker": "Woman",
        "text": "You are so good-looking.",
        "translation": "정말 멋져 보여."
      },
      {
        "speaker": "Jerry",
        "text": "Thank you.",
        "translation": "고마워."
      }
    ]
  },
  {
    "phrase": "A Festivus for the rest of us.",
    "meaning": "우리 같은 평범한 사람들을 위한 축제.",
    "example": [
      {
        "speaker": "Frank",
        "text": "A Festivus for the rest of us!",
        "translation": "우리 같은 사람들을 위한 페스티버스다!"
      },
      {
        "speaker": "Frank",
        "text": "Welcome, newcomers.",
        "translation": "새로 온 사람들, 환영한다."
      }
    ]
  },
  {
    "phrase": "They're real, and they're spectacular.",
    "meaning": "진짜고, 게다가 아주 훌륭해.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "And they're real?",
        "translation": "그리고 진짜야?"
      },
      {
        "speaker": "Sidra",
        "text": "They're real, and they're spectacular.",
        "translation": "진짜고, 게다가 아주 훌륭해."
      }
    ]
  },
  {
    "phrase": "I don't wanna be a pirate.",
    "meaning": "난 해적이 되고 싶지 않아. 원치 않는 역할이나 옷을 거부하는 말.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "I don't wanna be a pirate.",
        "translation": "난 해적이 되고 싶지 않아."
      },
      {
        "speaker": "Kramer",
        "text": "You look like a pirate.",
        "translation": "너 해적처럼 보여."
      }
    ]
  },
  {
    "phrase": "The jerk store called.",
    "meaning": "한참 뒤에 떠올린 유치한 반격을 꺼내는 말.",
    "example": [
      {
        "speaker": "George",
        "text": "The jerk store called.",
        "translation": "멍청이 가게에서 전화 왔어."
      },
      {
        "speaker": "George",
        "text": "They're running out of you.",
        "translation": "네가 다 떨어졌대."
      }
    ]
  },
  {
    "phrase": "Maybe the dingo ate your baby.",
    "meaning": "상대의 걱정을 엉뚱한 추측으로 받아치는 말.",
    "example": [
      {
        "speaker": "Kramer",
        "text": "Maybe the dingo ate your baby.",
        "translation": "딩고가 네 아기를 잡아먹었을지도 모르지."
      },
      {
        "speaker": "Jerry",
        "text": "What?",
        "translation": "뭐?"
      }
    ]
  },
  {
    "phrase": "You're killing independent George!",
    "meaning": "내 독립적인 자아를 없애고 있어. 서로 다른 인간관계가 섞일 때의 과장된 불평.",
    "example": [
      {
        "speaker": "George",
        "text": "You're killing independent George!",
        "translation": "당신이 독립적인 조지를 죽이고 있어!"
      },
      {
        "speaker": "Susan",
        "text": "Who?",
        "translation": "누구?"
      }
    ]
  },
  {
    "phrase": "I choose not to run.",
    "meaning": "난 뛰지 않기로 선택했어. 못하는 일을 의지의 문제처럼 바꿔 말하는 표현.",
    "example": [
      {
        "speaker": "George",
        "text": "I choose not to run.",
        "translation": "난 뛰지 않기로 선택했어."
      },
      {
        "speaker": "Jerry",
        "text": "You choose not to run?",
        "translation": "뛰지 않기로 선택했다고?"
      }
    ]
  },
  {
    "phrase": "That's gold.",
    "meaning": "그거 정말 훌륭한 소재야, 완전 대박이야.",
    "example": [
      {
        "speaker": "Bania",
        "text": "That's gold, Jerry! Gold!",
        "translation": "그거 황금이야, 제리! 황금!"
      },
      {
        "speaker": "Jerry",
        "text": "Will you stop saying that?",
        "translation": "그 말 좀 그만할래?"
      }
    ]
  },
  {
    "phrase": "They're all Twix!",
    "meaning": "전부 같은 거잖아! 차이가 없다는 걸 흥분해서 지적하는 말.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "They're all Twix!",
        "translation": "전부 트윅스잖아!"
      },
      {
        "speaker": "Jerry",
        "text": "Left Twix, right Twix — it's the same candy!",
        "translation": "왼쪽 트윅스, 오른쪽 트윅스 — 같은 사탕이라고!"
      }
    ]
  },
  {
    "phrase": "He's a close talker.",
    "meaning": "그는 대화할 때 지나치게 가까이 다가오는 사람이야.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "He's a close talker.",
        "translation": "그 사람은 가까이 붙어서 말해."
      },
      {
        "speaker": "Elaine",
        "text": "A little too close.",
        "translation": "조금만 너무 가깝지."
      }
    ]
  },
  {
    "phrase": "It's sponge-worthy.",
    "meaning": "아껴둔 것을 쓸 만큼 가치가 있어.",
    "example": [
      {
        "speaker": "Elaine",
        "text": "Is he sponge-worthy?",
        "translation": "그 사람은 스펀지 쓸 가치가 있어?"
      },
      {
        "speaker": "Jerry",
        "text": "He might be sponge-worthy.",
        "translation": "스펀지 쓸 만할지도 모르지."
      }
    ]
  },
  {
    "phrase": "You know how to take it; you just don't know how to hold it.",
    "meaning": "받는 법은 알지만 제대로 유지하는 법은 모르는군요.",
    "example": [
      {
        "speaker": "Jerry",
        "text": "You know how to take the reservation.",
        "translation": "예약 받는 법은 아시잖아요."
      },
      {
        "speaker": "Jerry",
        "text": "You just don't know how to hold the reservation.",
        "translation": "예약을 지키는 법을 모를 뿐이죠."
      }
    ]
  }
].map((expression) => ({
  ...expression,
  source: episodeSources[expression.phrase],
}));
