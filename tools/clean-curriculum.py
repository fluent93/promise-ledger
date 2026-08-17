import json
import re
from pathlib import Path

EXPRESSION_DATA_PATH = Path("apps/11-daily-verse-english/src/expression-data.js")
MANIFEST_PATH = Path("apps/11-daily-verse-english/audio/clip-manifest.json")

# Clean, unified curriculum of 14 iconic Seinfeld expressions
CURRICULUM = [
    {
        "phrase": "These pretzels are making me thirsty.",
        "meaning": "이 프레첼을 먹으니 목이 마르네. (강세와 톤 연기 연습의 명대사)",
        "nuance": "Kramer가 우디 앨런 영화의 단역 대사를 받아 친구들에게 강조점을 다르게 하여 연기해 보이는 대표적 명장면 전체입니다.",
        "example": [
            {"speaker": "Kramer", "text": "Woody Allen wants me to say: 'These pretzels are making me thirsty.'", "translation": "우디 앨런 감독이 나보고 말하래: '이 프레첼 때문에 목이 마르네.'"},
            {"speaker": "George", "text": "Is that how you're gonna say it? That's no good.", "translation": "그렇게 말할 생각이야? 전혀 아니잖아."},
            {"speaker": "Jerry", "text": "You gotta put the emphasis on 'these': *These* pretzels are making me thirsty!", "translation": "'These'에 강세를 줘야지: *이* 프레첼 때문에 목마르다고!"},
            {"speaker": "George", "text": "No, no: These pretzels are making me *thirsty*!", "translation": "아니지: 이 프레첼을 먹으니 *목이 마르네*!"},
            {"speaker": "Elaine", "text": "See, I'd say: These *pretzels* are making me thirsty.", "translation": "나 같으면: 이 *프레첼* 때문에 목이 마르네 하고 말하겠다."},
            {"speaker": "Kramer", "text": "No, I think I got it. *These pretzels* are making me thirsty!", "translation": "아니야, 감 잡았어. *이 프레첼들* 때문에 목이 마르네!"}
        ],
        "modernUsage": [
            {"speaker": "Jake", "text": "How should I deliver this pitch to the investors?", "translation": "투자자들에게 이 발표 멘트를 어떤 톤으로 전달해야 할까?"},
            {"speaker": "Hannah", "text": "Just stress the key words clearly. Don't over-act like Kramer with his pretzels!", "translation": "핵심 단어에만 명확히 강세를 줘. 프레첼 연기하는 크레이머처럼 너무 과장하지만 말고!"}
        ]
    },
    {
        "phrase": "No soup for you.",
        "meaning": "당신에게 줄 수프는 없어! (단호하고 유머러스하게 거절할 때)",
        "nuance": "전설적인 'Soup Nazi' 씬입니다. 대기 줄에서 잡담을 하거나 정해진 규칙을 어기면 수프 그릇을 뺏고 쫓아내는 미국 문화 최고의 거절 밈입니다.",
        "example": [
            {"speaker": "George", "text": "Excuse me, I think you forgot my bread.", "translation": "저기요, 제 빵을 빼먹으신 것 같은데요."},
            {"speaker": "Soup Nazi", "text": "Bread — two dollars extra.", "translation": "빵은 2달러 추가다."},
            {"speaker": "George", "text": "Two dollars? But everyone in front of me got free bread!", "translation": "2달러요? 하지만 제 앞 사람들은 다 무료로 받았잖아요!"},
            {"speaker": "Soup Nazi", "text": "You want bread? Three dollars! No soup for you!", "translation": "빵을 원해? 3달러! 당신에게 줄 수프는 없어!"},
            {"speaker": "George", "text": "Wait, what about my soup?!", "translation": "잠깐만요, 제 수프는요?!"},
            {"speaker": "Soup Nazi", "text": "Next!", "translation": "다음 분!"}
        ],
        "modernUsage": [
            {"speaker": "Ben", "text": "Can I grab a slice of your pizza?", "translation": "네 피자 한 조각만 집어먹어도 돼?"},
            {"speaker": "Chloe", "text": "You didn't help clean up the office today. No pizza for you!", "translation": "오늘 사무실 청소 안 도와줬잖아. 너한테 줄 피자는 없어!"}
        ]
    },
    {
        "phrase": "Serenity now.",
        "meaning": "평온이여, 지금 당장! (스트레스가 폭발하기 직전 가라앉힐 때)",
        "nuance": "Frank Costanza가 분노 조절 테이프에서 배운 대사를 소리 지르며 외치자, George와 Jerry가 태클을 거는 명장면 전체입니다.",
        "example": [
            {"speaker": "Frank", "text": "Serenity now! Serenity now!", "translation": "평온이여, 지금! 평온이여, 지금!"},
            {"speaker": "George", "text": "Pop, you're not supposed to yell it. You're supposed to say it calmly.", "translation": "아버지, 소리 지르면서 외치는 게 아니라 차분하게 말해야죠."},
            {"speaker": "Frank", "text": "The tape said to yell it! Serenity now!", "translation": "테이프에서 소리 지르라 그랬어! 평온이여, 지금!"},
            {"speaker": "Jerry", "text": "You know, Lloyd Braun used that phrase for years.", "translation": "있잖아, 로이드 브라운도 그 구절을 몇 년 동안 썼대."},
            {"speaker": "George", "text": "And where is Lloyd Braun now? In a mental institution! Serenity now, insanity later!", "translation": "그래서 지금 로이드 브라운이 어디 있는데? 정신병원에 있지! 지금은 평온, 나중엔 미치는 거라고요!"}
        ],
        "modernUsage": [
            {"speaker": "Chris", "text": "My code broke 5 minutes before demo time...", "translation": "데모 발표 5분 전에 내 코드가 터졌어..."},
            {"speaker": "Morgan", "text": "Serenity now! Take a deep breath and revert the last commit.", "translation": "지금 당장 평온을! 심호흡하고 마지막 커밋 복구해."}
        ]
    },
    {
        "phrase": "Yada, yada, yada.",
        "meaning": "이러쿵저러쿵해서, (중요하거나 미묘한) 중간 과정은 생략하고.",
        "nuance": "Elaine이 데이트 핵심 과정이나 상황을 'yada yada'로 뭉뚱그려 넘기려 하자 George와 Jerry가 어이없어하는 명장면 전체입니다.",
        "example": [
            {"speaker": "Elaine", "text": "I met this lawyer, we went out to dinner, had lobster bisque, yada yada yada, I never heard from him again.", "translation": "변호사를 만나서 저녁 먹으러 가고 랍스터 비스크를 먹고 이러쿵저러쿵해서 그 뒤로 연락이 없었어."},
            {"speaker": "George", "text": "You yada yada'd over the best part!", "translation": "제일 중요한 부분을 이러쿵저러쿵으로 넘겼잖아!"},
            {"speaker": "Elaine", "text": "No, I mentioned the yada yada.", "translation": "아니야, 이러쿵저러쿵은 말했다고."},
            {"speaker": "Jerry", "text": "Which yada yada did you mention?", "translation": "어떤 이러쿵저러쿵을 말했는데?"},
            {"speaker": "George", "text": "You can't yada yada sex!", "translation": "그런 중요한 상황을 이러쿵저러쿵으로 퉁칠 순 없다고!"}
        ],
        "modernUsage": [
            {"speaker": "David", "text": "We pitched the client, yada yada yada, we signed the contract!", "translation": "고객사 발표하고, 이러쿵저러쿵해서 계약 체결했어!"},
            {"speaker": "Sarah", "text": "Wait, don't yada yada the details! How did you convince them?", "translation": "잠깐, 세부 조항을 구렁이 담 넘듯 넘기지 마! 어떻게 설득한 건데?"}
        ]
    },
    {
        "phrase": "Not that there's anything wrong with that.",
        "meaning": "그게 잘못됐다는 뜻은 절대 아니지만. (오해를 피하며 조심스럽게 언급할 때)",
        "nuance": "Jerry와 George가 여기자에게 게이로 오해받자 다급하게 해명하며 덧붙이는 사인펠트 역사상 가장 유명한 유머 구절 중 하나입니다.",
        "example": [
            {"speaker": "Jerry", "text": "There's been a big misunderstanding here.", "translation": "여기 큰 오해가 있었어요."},
            {"speaker": "George", "text": "We knew you were eavesdropping! All that was on purpose!", "translation": "당신이 도청하는 걸 알고 일부러 연기한 거란 말이에요!"},
            {"speaker": "Jerry", "text": "We're not gay... not that there's anything wrong with that.", "translation": "우린 게이가 아니에요... 그게 잘못됐다는 뜻은 절대 아니지만."},
            {"speaker": "Journalist", "text": "Oh, of course not. I mean, it's fine if that's who you are.", "translation": "아, 당연히 아니죠. 당신들이 누구든 전 다 괜찮아요."},
            {"speaker": "George", "text": "Absolutely! I mean, I have many gay friends. My father's gay!", "translation": "그럼요! 게이 친구도 많고요, 우리 아버지도 게이에요!"},
            {"speaker": "Jerry", "text": "Not that there's anything wrong with that!", "translation": "그게 잘못됐다는 뜻은 절대 아니죠!"},
            {"speaker": "Jerry", "text": "It was a joke! Do you want to have sex with me right now? Let's go!", "translation": "농담이었다고요! 지금 나랑 잘래요? 나랑 잘 거냐고요? 갑시다!"}
        ],
        "modernUsage": [
            {"speaker": "Alex", "text": "He enjoys playing video games for 10 hours on weekends.", "translation": "걔는 주말마다 10시간씩 비디오 게임하는 걸 즐기더라."},
            {"speaker": "Sam", "text": "Hey, not that there's anything wrong with that! Everyone has their own hobby.", "translation": "이봐, 그게 나쁘다는 건 절대 아니지! 사람마다 취향이 있는 법이야."}
        ]
    },
    {
        "phrase": "It's not you, it's me.",
        "meaning": "네 문제가 아니라 내 문제야. (이별 시 핑계를 댈 때 쓰는 고전적 멘트)",
        "nuance": "George가 이별 핑계로 'It's not you, it's me'를 시전하자 상대방이 역으로 자기가 쓴다고 해서 억울해하는 명장면입니다.",
        "example": [
            {"speaker": "George", "text": "It's not you, it's me.", "translation": "네 문제가 아니라 내 문제야."},
            {"speaker": "Gwen", "text": "You're giving me the 'It's not you, it's me' routine?", "translation": "지금 나한테 '네 탓이 아니라 내 탓' 핑계를 대는 거야?"},
            {"speaker": "George", "text": "I invented 'It's not you, it's me'!", "translation": "그 멘트는 내가 개발한 거란 말이야!"},
            {"speaker": "Gwen", "text": "Nobody tells me it's them, not me. If it's anybody, it's me!", "translation": "아무도 나한테 자기 탓이 아니래. 굳이 누구 탓이라면 내 탓이야!"},
            {"speaker": "George", "text": "You're damn right it's me!", "translation": "그럼, 존나 내 탓이지!"}
        ],
        "modernUsage": [
            {"speaker": "Mark", "text": "Did she give you the 'It's not you, it's me' speech?", "translation": "그녀가 너한테 '네 탓이 아니라 내 탓'이라고 말했어?"},
            {"speaker": "Paul", "text": "Yeah, classic George Costanza move.", "translation": "응, 전형적인 조지 코스탄자 식 이별 멘트였어."}
        ]
    },
    {
        "phrase": "I'm out.",
        "meaning": "난 빠질게/포기야! (더 이상 견디지 못하고 기권할 때)",
        "nuance": "전설적인 'The Contest' 에피소드에서 Kramer가 길 건너 여성을 보고 3분 만에 주머니에서 돈을 툭 던지며 기권하는 명장면입니다.",
        "example": [
            {"speaker": "Kramer", "text": "I'm out! I'm out of the contest!", "translation": "난 포기야! 내기에서 빠질게!"},
            {"speaker": "Jerry", "text": "You're out? Wow. That was fast.", "translation": "포기한다고? 와, 진짜 빠르네."},
            {"speaker": "Kramer", "text": "Well, that woman across the street is driving me crazy!", "translation": "길 건너 그 여자가 날 미치게 만든다고!"},
            {"speaker": "George", "text": "That's gotta be a record.", "translation": "방금 건 최고 기록일 거야."}
        ],
        "modernUsage": [
            {"speaker": "Leo", "text": "Who wants to stay overtime tonight to clean up the code?", "translation": "오늘 밤 야근하면서 코드 정리할 사람?"},
            {"speaker": "Maya", "text": "I'm out! I already worked 60 hours this week.", "translation": "난 빠질게! 이번 주에 벌써 60시간이나 일했어."}
        ]
    },
    {
        "phrase": "Master of your domain.",
        "meaning": "네 영역의 주인 (자제력과 자기 통제권을 완벽히 유지하는 상태)",
        "nuance": "친구들이 서로 자제력을 잃지 않고 누가 가장 오래 참는지 내기할 때 사용하는 은유적 표현 전체입니다.",
        "example": [
            {"speaker": "Jerry", "text": "Are you still master of your domain?", "translation": "아직도 네 영역의 주인(자제력)을 유지하고 있어?"},
            {"speaker": "George", "text": "Lord of the manor, Jerry! King of the county!", "translation": "영주 급이지, 제리! 이 지역의 왕이다!"},
            {"speaker": "Elaine", "text": "I'm queen of the castle.", "translation": "난 이 성의 여왕이야."},
            {"speaker": "Jerry", "text": "Good. As for me, I am master of my domain.", "translation": "좋아. 나 역시 내 영역의 주인이다."}
        ],
        "modernUsage": [
            {"speaker": "Kevin", "text": "Are you sticking to your diet during the holidays?", "translation": "연휴 동안 다이어트 잘 지키고 있어?"},
            {"speaker": "Rachel", "text": "Still master of my domain! Haven't touched sugar in 3 weeks.", "translation": "여전히 내 영역의 주인이란다! 3주 동안 설탕에 손도 안 댔어."}
        ]
    },
    {
        "phrase": "We're living in a society.",
        "meaning": "우린 엄연히 사회 속에서 살고 있잖아! (공공질서나 매너를 안 지키는 사람에게 울분을 토할 때)",
        "nuance": "공중전화를 오래 독점하는 사람 앞에서 George가 분통을 터뜨리며 문명인답게 행동하라고 외치는 명장면 전체입니다.",
        "example": [
            {"speaker": "George", "text": "You know we're living in a society! We're supposed to act in a civilized way!", "translation": "우리가 사회 속에서 살고 있다는 걸 알잖아! 문명인답게 행동해야지!"},
            {"speaker": "Man", "text": "Does anyone ever display the slightest sensitivity?!", "translation": "누가 타인의 문제에 아주 적은 세심함이라도 보여주기나 합니까?!"}
        ],
        "modernUsage": [
            {"speaker": "Daniel", "text": "Someone cut in line at the coffee shop and didn't even say sorry.", "translation": "누가 커피숍 줄을 새치기하고 사과도 안 하더라."},
            {"speaker": "Sophia", "text": "We're living in a society! People need to follow basic etiquette.", "translation": "우린 사회 속에서 살고 있잖아! 기본적인 예의는 지켜야지."}
        ]
    },
    {
        "phrase": "Double-dip.",
        "meaning": "소스에 두 번 찍어 먹기 (위생 매너 위반 행위)",
        "nuance": "파티장에서 George가 칩을 한 입 먹고 소스 그릇에 다시 찍자 Timmy가 기겁하며 대립하는 명장면 전체입니다.",
        "example": [
            {"speaker": "Timmy", "text": "Did you just double-dip that chip?", "translation": "방금 그 칩 소스에 두 번 찍은 거야?"},
            {"speaker": "George", "text": "Excuse me?", "translation": "네?"},
            {"speaker": "Timmy", "text": "You double-dipped the chip! You dipped the chip, took a bite, and you dipped again!", "translation": "칩을 두 번 찍었잖아! 칩을 찍고 한 입 먹고 다시 찍었잖아!"},
            {"speaker": "Timmy", "text": "That's like putting your whole mouth right in the dip!", "translation": "그건 아예 소스 그릇에 입을 처박는 거나 마찬가지라고!"}
        ],
        "modernUsage": [
            {"speaker": "James", "text": "Hey, don't double-dip into the salsa bowl!", "translation": "이봐, 살사 소스 그릇에 두 번 찍어 먹지 마!"},
            {"speaker": "Lily", "text": "Oops, sorry! I'll use a clean spoon next time.", "translation": "앗 미안! 다음엔 깨끗한 스푼을 쓸게."}
        ]
    },
    {
        "phrase": "I can't spare a square.",
        "meaning": "휴지 한 칸도 나눠줄 수 없어! (아주 인색하게 구는 상황을 비유할 때)",
        "nuance": "화장실 칸에서 휴지가 떨어진 Elaine이 옆 칸 사람에게 휴지 몇 칸만 달라고 사정하지만 단칼에 거절당하는 명장면 전체입니다.",
        "example": [
            {"speaker": "Elaine", "text": "Just three squares will do it.", "translation": "휴지 딱 세 칸만 주시면 돼요."},
            {"speaker": "Jane", "text": "I'm sorry, I don't have three squares.", "translation": "미안하지만 세 칸은 안 돼요."},
            {"speaker": "Elaine", "text": "Three squares? You can't spare three squares?", "translation": "세 칸이요? 휴지 세 칸도 못 나눠줘요?"},
            {"speaker": "Jane", "text": "No, I don't have a square to spare! I can't spare a square!", "translation": "나눠줄 휴지 한 칸도 없다니까요! 못 나눠줘요!"}
        ],
        "modernUsage": [
            {"speaker": "Tom", "text": "Can I borrow a sheet of paper for the meeting?", "translation": "회의 때 쓸 종이 한 장만 빌릴 수 있을까?"},
            {"speaker": "Anna", "text": "Sorry, I can't spare a square! It's my last notepad.", "translation": "미안, 한 장도 나눠줄 수 없어! 내 마지막 메모장이거든."}
        ]
    },
    {
        "phrase": "The jerk store called.",
        "meaning": "멍청이 가게에서 전화 왔는데, 너 재고가 다 떨어졌대! (말싸움 통쾌한 반격 멘트)",
        "nuance": "George가 자신을 놀린 동료에게 뒤늦게 완벽한 반격 멘트를 생각해내서 외치는 명장면 전체입니다.",
        "example": [
            {"speaker": "George", "text": "The jerk store called, and they're running out of you!", "translation": "멍청이 가게에서 전화 왔는데, 너 재고가 다 떨어졌대!"},
            {"speaker": "Reilly", "text": "What's the difference? You're their all-time best seller!", "translation": "뭐가 달라? 너야말로 그 집 역대 베스트셀러잖아!"},
            {"speaker": "George", "text": "Oh yeah? Well, I had sex with your wife!", "translation": "아 그래? 나 네 아내랑 잤거든!"},
            {"speaker": "Jerry", "text": "His wife is in a coma...", "translation": "걔 아내 혼수상태인데..."}
        ],
        "modernUsage": [
            {"speaker": "Eric", "text": "That was a terrible comeback to the manager.", "translation": "매니저한테 한 거 치고는 진짜 별로인 반격이었어."},
            {"speaker": "Lisa", "text": "Yeah, he sounded just like George with his jerk store line!", "translation": "맞아, 멍청이 가게 멘트 치는 조지 같았어!"}
        ]
    },
    {
        "phrase": "They're real, and they're spectacular.",
        "meaning": "진짜고, 게다가 아주 훌륭하지.",
        "nuance": "Sidra가 Jerry와 헤어지며 문을 열고 나가며 명대사 'And by the way, they're real... and they're spectacular!'를 날리는 명장면 전체입니다.",
        "example": [
            {"speaker": "Jerry", "text": "So, where were we?", "translation": "그럼 우린 어디까지 얘기했었지?"},
            {"speaker": "Sidra", "text": "I was just leaving.", "translation": "전 이제 나가려던 참이었어요."},
            {"speaker": "Jerry", "text": "Right, you were leaving.", "translation": "맞아, 떠나려던 참이었지."},
            {"speaker": "Sidra", "text": "I can't believe you sent a woman into the sauna! I think you're both mentally ill!", "translation": "나를 조사하겠다고 사우나에 여자를 들여보내다니! 두 사람 다 제정신이 아니에요!"},
            {"speaker": "Sidra", "text": "And by the way, they're real... and they're spectacular!", "translation": "참고로 그거 진짜고... 게다가 아주 훌륭하다고!"},
            {"speaker": "Elaine", "text": "Get out! Get out!", "translation": "나가! 나가!"}
        ],
        "modernUsage": [
            {"speaker": "Jack", "text": "Are those vintage mechanical keyboards actually good?", "translation": "저 빈티지 기계식 키보드가 실제로 좋아?"},
            {"speaker": "Grace", "text": "They're real, and they're spectacular. Typing on them is a dream.", "translation": "진짜고, 게다가 완벽해. 타건감이 예술이라니까."}
        ]
    },
    {
        "phrase": "The Summer of George!",
        "meaning": "조지의 여름! (모든 일을 뒤로하고 완벽한 휴식과 자기만을 위한 시간을 보낼 때)",
        "nuance": "George가 3개월 치 퇴직금을 받고 일생일대의 완벽한 휴가를 선포하며 친구들에게 호언장담하는 명장면 전체입니다.",
        "example": [
            {"speaker": "George", "text": "I'm getting three months' severance pay! Three months!", "translation": "나 3개월 치 퇴직금 받는다고! 3개월씩이나!"},
            {"speaker": "Jerry", "text": "So what are you gonna do with yourself?", "translation": "그래서 그동안 뭐 할 건데?"},
            {"speaker": "George", "text": "This is gonna be the Summer of George! I'm gonna read, bite into big cheese blocks like apples!", "translation": "이번 여름은 조지의 여름이 될 거야! 책도 읽고 사과처럼 거대한 치즈 덩어리도 베어 먹을 거라고!"},
            {"speaker": "Jerry", "text": "Are you gonna get up before noon?", "translation": "정오 전에는 일어날 거냐?"},
            {"speaker": "George", "text": "Jerry, I may never put on pants again!", "translation": "제리, 나 앞으로 다시는 바지를 안 입을지도 몰라!"},
            {"speaker": "Jerry", "text": "I give him two weeks.", "translation": "난 2주일 건다."}
        ],
        "modernUsage": [
            {"speaker": "Sam", "text": "I finally finished my thesis. This is going to be the Summer of Sam!", "translation": "드디어 논문 끝냈어. 이번 여름은 샘의 여름이 될 거야!"},
            {"speaker": "Leo", "text": "Enjoy it! You definitely earned a break from everything.", "translation": "즐겨! 모든 거에서 떠나 쉴 자격 충분해."}
        ]
    }
]

def clean_up():
    print(f"🧹 Cleaning curriculum to exactly {len(CURRICULUM)} unique iconic episodes...")
    
    code = f"""export const EXPRESSION_POLICY_VERSION = 5;

export const advancedExpressions = {json.dumps(CURRICULUM, ensure_ascii=False, indent=2)};
"""
    with open(EXPRESSION_DATA_PATH, "w", encoding="utf8") as f:
        f.write(code)

    print("✅ Successfully updated expression-data.js with clean 14-episode curriculum!")

if __name__ == "__main__":
    clean_up()
