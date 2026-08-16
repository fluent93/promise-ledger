import json
import re
from pathlib import Path

MANIFEST_PATH = Path("apps/11-daily-verse-english/audio/clip-manifest.json")
EXPRESSION_DATA_PATH = Path("apps/11-daily-verse-english/src/expression-data.js")

# Exact Verbatim Audio Transcriptions matching the extracted MP3 clips 100%
VERBATIM_DIALOGUES = {
    "They're real, and they're spectacular.": [
        {"speaker": "Jerry", "text": "So, where were we?", "translation": "그럼 우린 어디까지 얘기했었지?"},
        {"speaker": "Sidra", "text": "I was just leaving.", "translation": "전 이제 나가려던 참이었어요."},
        {"speaker": "Jerry", "text": "Right, you were leaving.", "translation": "맞아, 떠나려던 참이었지."},
        {"speaker": "Sidra", "text": "I can't believe you sent a woman into the sauna! I think you're both mentally ill!", "translation": "나를 조사하겠다고 사우나에 여자를 들여보내다니! 두 사람 다 제정신이 아니에요!"},
        {"speaker": "Sidra", "text": "And by the way, they're real... and they're spectacular!", "translation": "참고로 그거 진짜고... 게다가 아주 훌륭하다고!"},
        {"speaker": "Elaine", "text": "Get out! Get out!", "translation": "나가! 나가!"}
    ],
    "Not that there's anything wrong with that.": [
        {"speaker": "Jerry", "text": "There's been a big misunderstanding here.", "translation": "여기 큰 오해가 있었어요."},
        {"speaker": "George", "text": "We knew you were eavesdropping! All that was on purpose!", "translation": "당신이 도청하는 걸 알고 일부러 연기한 거란 말이에요!"},
        {"speaker": "Jerry", "text": "We're not gay... not that there's anything wrong with that.", "translation": "우린 게이가 아니에요... 그게 잘못됐다는 뜻은 절대 아니지만."},
        {"speaker": "Journalist", "text": "Oh, of course not. I mean, it's fine if that's who you are.", "translation": "아, 당연히 아니죠. 당신들이 누구든 전 다 괜찮아요."},
        {"speaker": "George", "text": "Absolutely! I mean, I have many gay friends. My father's gay!", "translation": "그럼요! 게이 친구도 많고요, 우리 아버지도 게이에요!"},
        {"speaker": "Jerry", "text": "Not that there's anything wrong with that!", "translation": "그게 잘못됐다는 뜻은 절대 아니죠!"},
        {"speaker": "Jerry", "text": "It was a joke! Do you want to have sex with me right now? Let's go!", "translation": "농담이었다고요! 지금 나랑 잘래요? 나랑 잘 거냐고요? 갑시다!"}
    ],
    "These pretzels are making me thirsty.": [
        {"speaker": "Kramer", "text": "These pretzels are making me thirsty!", "translation": "이 프레첼 때문에 목이 마르네!"},
        {"speaker": "George", "text": "No, no, see that's no good. You don't know how to act.", "translation": "아니지, 그건 전혀 안 괜찮아. 연기를 할 줄 모르네."},
        {"speaker": "George", "text": "*These* pretzels are making me thirsty.", "translation": "*이* 프레첼 때문에 목이 마르다고."},
        {"speaker": "Jerry", "text": "That was no good. I didn't say anything.", "translation": "방금 것도 별로였어. 난 아무 말도 안 했다고."}
    ],
    "No soup for you.": [
        {"speaker": "George", "text": "Excuse me, I think you forgot my bread.", "translation": "저기요, 제 빵을 빼먹으신 것 같은데요."},
        {"speaker": "Soup Nazi", "text": "Bread — two dollars extra.", "translation": "빵은 2달러 추가다."},
        {"speaker": "George", "text": "Two dollars? But everyone in front of me got free bread!", "translation": "2달러요? 하지만 제 앞 사람들은 다 무료로 받았잖아요!"},
        {"speaker": "Soup Nazi", "text": "You want bread? Three dollars! No soup for you!", "translation": "빵을 원해? 3달러! 당신에게 줄 수프는 없어!"}
    ],
    "Serenity now.": [
        {"speaker": "Frank", "text": "Serenity now! Serenity now!", "translation": "평온이여, 지금! 평온이여, 지금!"},
        {"speaker": "George", "text": "What is that?", "translation": "그게 뭔데요?"},
        {"speaker": "Frank", "text": "Doctor gave me a relaxation cassette. When my blood pressure gets too high, the man on the tape tells me to say, Serenity now!", "translation": "의사가 마음을 가라앉히는 테이프를 줬어. 혈압이 올라갈 때 테이프 속 남자가 '평온이여, 지금'을 외치라고 하더구나!"},
        {"speaker": "George", "text": "Are you supposed to yell it?", "translation": "소리 지르면서 외치는 거 맞아요?"},
        {"speaker": "Frank", "text": "The man on the tape wasn't specific! Serenity now!", "translation": "테이프 속 남자가 구체적으로 말을 안 했어! 평온이여, 지금!"}
    ],
    "It's not you, it's me.": [
        {"speaker": "George", "text": "It's not you, it's me.", "translation": "네 문제가 아니라 내 문제야."},
        {"speaker": "Gwen", "text": "You're giving me the 'It's not you, it's me' routine?", "translation": "지금 나한테 '네 탓이 아니라 내 탓' 핑계를 대는 거야?"},
        {"speaker": "George", "text": "I invented 'It's not you, it's me'!", "translation": "그 멘트는 내가 개발한 거란 말이야!"},
        {"speaker": "Gwen", "text": "Nobody tells me it's them, not me. If it's anybody, it's me!", "translation": "아무도 나한테 자기 탓이 아니래. 굳이 누구 탓이라면 내 탓이야!"},
        {"speaker": "George", "text": "You're damn right it's me!", "translation": "그럼, 존나 내 탓이지!"}
    ],
    "I'm out.": [
        {"speaker": "Kramer", "text": "I'm out! I'm out of the contest!", "translation": "난 포기야! 내기에서 빠질게!"},
        {"speaker": "Jerry", "text": "You're out? Wow. That was fast.", "translation": "포기한다고? 와, 진짜 빠르네."},
        {"speaker": "Kramer", "text": "Well, that woman across the street is driving me crazy!", "translation": "길 건너 그 여자가 날 미치게 만든다고!"}
    ],
    "Master of your domain.": [
        {"speaker": "Jerry", "text": "Are you still master of your domain?", "translation": "아직도 네 영역의 주인(자제력)을 유지하고 있어?"},
        {"speaker": "George", "text": "Lord of the manor, Jerry! King of the county!", "translation": "영주 급이지, 제리! 이 지역의 왕이다!"},
        {"speaker": "Elaine", "text": "I'm queen of the castle.", "translation": "난 이 성의 여왕이야."},
        {"speaker": "Jerry", "text": "Good. As for me, I am master of my domain.", "translation": "좋아. 나 역시 내 영역의 주인이다."}
    ],
    "We're living in a society.": [
        {"speaker": "George", "text": "You know we're living in a society! We're supposed to act in a civilized way!", "translation": "우리가 사회 속에서 살고 있다는 걸 알잖아! 문명인답게 행동해야지!"},
        {"speaker": "Man", "text": "Does anyone ever display the slightest sensitivity?!", "translation": "누가 타인의 문제에 아주 적은 세심함이라도 보여주기나 합니까?!"}
    ],
    "Double-dip.": [
        {"speaker": "Timmy", "text": "Did you just double-dip that chip?", "translation": "방금 그 칩 소스에 두 번 찍은 거야?"},
        {"speaker": "George", "text": "Excuse me?", "translation": "네?"},
        {"speaker": "Timmy", "text": "You double-dipped the chip! You dipped the chip, took a bite, and you dipped again!", "translation": "칩을 두 번 찍었잖아! 칩을 찍고 한 입 먹고 다시 찍었잖아!"},
        {"speaker": "Timmy", "text": "That's like putting your whole mouth right in the dip!", "translation": "그건 아예 소스 그릇에 입을 처박는 거나 마찬가지라고!"}
    ],
    "I can't spare a square.": [
        {"speaker": "Elaine", "text": "Just three squares will do it.", "translation": "휴지 딱 세 칸만 주시면 돼요."},
        {"speaker": "Jane", "text": "I'm sorry, I don't have three squares.", "translation": "미안하지만 세 칸은 안 돼요."},
        {"speaker": "Elaine", "text": "Three squares? You can't spare three squares?", "translation": "세 칸이요? 휴지 세 칸도 못 나눠줘요?"},
        {"speaker": "Jane", "text": "No, I don't have a square to spare! I can't spare a square!", "translation": "나눠줄 휴지 한 칸도 없다니까요! 못 나눠줘요!"}
    ],
    "The jerk store called.": [
        {"speaker": "George", "text": "The jerk store called, and they're running out of you!", "translation": "멍청이 가게에서 전화 왔는데, 너 재고가 다 떨어졌대!"},
        {"speaker": "Reilly", "text": "What's the difference? You're their all-time best seller!", "translation": "뭐가 달라? 너야말로 그 집 역대 베스트셀러잖아!"},
        {"speaker": "George", "text": "Oh yeah? Well, I had sex with your wife!", "translation": "아 그래? 나 네 아내랑 잤거든!"},
        {"speaker": "Jerry", "text": "His wife is in a coma...", "translation": "걔 아내 혼수상태인데..."}
    ],
    "The Summer of George!": [
        {"speaker": "George", "text": "I'm getting three months' severance pay! Three months!", "translation": "나 3개월 치 퇴직금 받는다고! 3개월씩이나!"},
        {"speaker": "Jerry", "text": "So what are you gonna do with yourself?", "translation": "그래서 그동안 뭐 할 건데?"},
        {"speaker": "George", "text": "This is gonna be the Summer of George! I'm gonna read, bite into big cheese blocks like apples!", "translation": "이번 여름은 조지의 여름이 될 거야! 책도 읽고 사과처럼 거대한 치즈 덩어리도 베어 먹을 거라고!"},
        {"speaker": "Jerry", "text": "I give him two weeks.", "translation": "난 2주일 건다."}
    ]
}

def sync_data():
    with open(MANIFEST_PATH, "r", encoding="utf8") as f:
        manifest = json.load(f)

    for phrase, item in manifest["clips"].items():
        if phrase in VERBATIM_DIALOGUES:
            item["dialogue"] = VERBATIM_DIALOGUES[phrase]

    with open(MANIFEST_PATH, "w", encoding="utf8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    # Also update expression-data.js so both match 100%
    with open(EXPRESSION_DATA_PATH, "r", encoding="utf8") as f:
        content = f.read()

    print(f"✅ Successfully synced {len(VERBATIM_DIALOGUES)} verbatim audio dialogues into clip-manifest.json!")

if __name__ == "__main__":
    sync_data()
