import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));
app.use(express.json({ limit: '20mb' }));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/api/ocr', async (req, res) => {
  try {
    const { image, mediaType } = req.body;

    if (!image) {
      res.status(400).json({ message: '画像データが必要です' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const resolvedType = allowedTypes.includes(mediaType) ? mediaType : 'image/jpeg';

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: resolvedType,
                data: image,
              },
            },
            {
              type: 'text',
              text: `このレシート画像から購入した商品を読み取ってください。

以下のJSON形式で返してください（JSON以外のテキストは含めないでください）:

{
  "storeName": "店舗名（読み取れない場合はnull）",
  "products": [
    {
      "name": "商品名",
      "category": "カテゴリ",
      "quantity": 数量
    }
  ]
}

categoryは以下のいずれかを使用してください（最も適切なものを選んでください）:
- dairy（乳製品: 牛乳、ヨーグルト、チーズなど）
- meat（肉類: 鶏肉、豚肉、牛肉の切り身・薄切りなど）
- meat_ground（ひき肉: 合挽き、鶏ひき肉など）
- fish（魚介類: 刺身、魚、エビなど）
- egg（卵）
- tofu（豆腐）
- natto（納豆）
- ham_sausage（ハム・ソーセージ・ベーコン）
- vegetable_leaf（葉物野菜: レタス、ほうれん草、キャベツなど）
- vegetable_root（根菜・いも類: にんじん、じゃがいも、玉ねぎなど）
- vegetable_other（その他の野菜: きゅうり、なす、トマトなど）
- fruit（果物: りんご、バナナ、みかんなど）
- bread（パン類: 食パン、菓子パンなど）
- rice（米）
- dry_noodle（乾麺: パスタ、そうめん、うどんなど）
- instant（インスタント食品: カップ麺、即席麺など）
- flour（小麦粉・粉類）
- frozen（冷凍食品: 冷凍の肉、魚、調理済み食品など）
- frozen_vegetable（冷凍野菜）
- canned（缶詰・瓶詰）
- retort（レトルト食品: カレー、パスタソースなど）
- snack（菓子・スナック・ビスケット）
- beverage（飲料: ジュース、お茶、水など）
- seasoning（調味料: 醤油、みそ、みりんなど）
- sugar_salt（砂糖・塩・はちみつ）
- oil_vinegar（油・酢: 食用油、酢など）
- deli（惣菜・サラダ・弁当）
- other（その他・判別不能）

商品名はレシートに記載されている名称をそのまま使い、数量が読み取れない場合は1としてください。`,
            },
          ],
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      res.status(500).json({ message: 'OCRの応答が不正です' });
      return;
    }

    const jsonText = textContent.text.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'OCR処理に失敗しました',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
