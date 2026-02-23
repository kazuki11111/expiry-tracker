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
app.use(express.json({ limit: '10mb' }));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/api/ocr', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      res.status(400).json({ message: '画像データが必要です' });
      return;
    }

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
                media_type: 'image/jpeg',
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

categoryは以下のいずれかを使用してください:
- dairy（乳製品: 牛乳、ヨーグルト、チーズなど）
- meat（肉類: 鶏肉、豚肉、牛肉、ハムなど）
- fish（魚介類: 刺身、魚、エビなど）
- vegetable（野菜: キャベツ、にんじん、トマトなど）
- fruit（果物: りんご、バナナ、みかんなど）
- bread（パン類）
- frozen（冷凍食品）
- canned（缶詰・瓶詰）
- snack（菓子・スナック）
- beverage（飲料: ジュース、お茶、水など）
- seasoning（調味料: 醤油、塩、砂糖など）
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

    const parsed = JSON.parse(textContent.text);
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
