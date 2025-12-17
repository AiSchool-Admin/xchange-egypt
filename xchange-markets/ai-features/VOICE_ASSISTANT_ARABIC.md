# 🎤 المساعد الصوتي الذكي بالعربية - Arabic Voice Assistant
## Xchange AI Voice-Powered Shopping Assistant

**الأولوية:** ⭐ متوسطة (ميزة فريدة)
**التأثير:** +20% accessibility, +15% engagement
**صعوبة التطوير:** عالية
**الوقت المقدر:** 10-12 أسبوع

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Use Cases](#use-cases)
3. [Technical Architecture](#architecture)
4. [Voice Recognition (ASR)](#asr)
5. [Natural Language Understanding](#nlu)
6. [Text-to-Speech](#tts)
7. [Conversation Flow](#conversation)
8. [Implementation Guide](#implementation)
9. [Accessibility Features](#accessibility)

---

## 1. Overview {#overview}

### 1.1 المشكلة

**تحديات تجربة المستخدم الحالية:**

```
📱 38% من المصريين يفضلون الصوت على الكتابة
🔤 25% يجدون صعوبة في الكتابة بالعربية على الموبايل
👁️ 15% يعانون من صعوبات بصرية
⏱️ البحث الكتابي يأخذ وقت أطول 3x من الصوتي
📶 الكتابة صعبة أثناء التنقل
```

### 1.2 الحل

```
┌──────────────────────────────────────────────────────┐
│       المساعد الصوتي الذكي - القدرات              │
├──────────────────────────────────────────────────────┤
│                                                       │
│  🎤 فهم اللهجة المصرية                             │
│     • تعرف على الكلام المصري العامي               │
│     • فهم التعبيرات المحلية                         │
│     • دعم اللهجات الإقليمية                         │
│                                                       │
│  🔍 بحث صوتي ذكي                                   │
│     • "دور لي موبايل سامسونج رخيص"                 │
│     • "عايز عربية تويوتا موديل 2020"               │
│     • "فيه ذهب عيار 21 كام؟"                       │
│                                                       │
│  💬 محادثة طبيعية                                   │
│     • أسئلة متابعة ذكية                            │
│     • فهم السياق                                    │
│     • ردود طبيعية بالصوت                           │
│                                                       │
│  🛒 إتمام العمليات بالصوت                          │
│     • إضافة إعلان كامل بالصوت                      │
│     • التفاوض الصوتي                                │
│     • تأكيد الطلبات                                 │
│                                                       │
│  ♿ accessibility كاملة                             │
│     • للمكفوفين وضعاف البصر                        │
│     • للأميين                                       │
│     • لكبار السن                                    │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 2. Use Cases {#use-cases}

### 2.1 البحث الصوتي

```
👤 User: "يا سلام، دور لي موبايل سامسونج أقل من 5000 جنيه"

🤖 Assistant: "حاضر، لقيت لك 12 موبايل سامسونج أقل من 5000 جنيه.
              أحسن نتيجة: Samsung A54 بـ 4,800 جنيه في الجيزة.
              عايز تشوف الباقي؟"

👤 User: "آه أريني الباقي"

🤖 Assistant: "تمام، هعرضهم لك دلوقتي..."
              [يعرض القائمة]
```

### 2.2 إضافة إعلان بالصوت

```
👤 User: "عايز أبيع موبايلي"

🤖 Assistant: "تمام! أيه نوع الموبايل؟"

👤 User: "آيفون 14 برو"

🤖 Assistant: "ممتاز. كام جيجا الذاكرة؟"

👤 User: "256"

🤖 Assistant: "تمام. حالته إيه؟"

👤 User: "زي الجديد، استعمال خفيف"

🤖 Assistant: "حلو. عايز تبيعه بكام؟"

👤 User: "30 ألف"

🤖 Assistant: "بناءً على السوق، السعر ده كويس جداً.
              معاك العلبة والشاحن؟"

👤 User: "آه معايا كل حاجة"

🤖 Assistant: "ممتاز! هاخد منك كام صورة للموبايل ونخلص الإعلان؟"
```

### 2.3 التفاوض الصوتي

```
👤 Buyer: "اتصل بالبائع"

🤖 Assistant: "حاضر، هوصلك بالبائع دلوقتي...
              [يتصل]
              البائع معاك على الخط"

👤 Buyer: "السلام عليكم، الموبايل لسه موجود؟"

👤 Seller: "أيوه موجود"

👤 Buyer: "ممكن تنزل الس��ر شوية؟"

🤖 Assistant [يتدخل]: "بناءً على السوق، السعر الحالي 9000 ج.م
                        عادل جداً. المشتري ممكن يعرض 8500 ج.م
                        والبائع يقبل. رأيكوا إيه؟"
```

### 2.4 الاستفسارات والدعم

```
👤 User: "إزاي أضيف إعلان؟"

🤖 Assistant: "سهلة! اضغط على زر '+' تحت،
              أو قول لي 'عايز أبيع' وأنا هساعدك خطوة بخطوة"

👤 User: "طيب إزاي أعرف الإعلان بتاعي ظهر؟"

🤖 Assistant: "تقدر تشوفه في 'إعلاناتي' من القائمة الرئيسية،
              أو قول لي 'ورّني إعلاناتي' وأنا هفتحهالك"
```

---

## 3. Technical Architecture {#architecture}

```
┌──────────────────────────────────────────────────────┐
│              VOICE ASSISTANT PIPELINE                 │
├──────────────────────────────────────────────────────┤
│                                                       │
│  🎤 User speaks in Arabic                           │
│         │                                             │
│         ▼                                             │
│  ┌──────────────────────┐                            │
│  │  Audio Capture       │                            │
│  │  • React Native      │                            │
│  │  • 16kHz, Mono       │                            │
│  └─────────┬────────────┘                            │
│            │                                          │
│            ▼                                          │
│  ┌──────────────────────────┐                        │
│  │  Speech-to-Text (ASR)    │                        │
│  │  ┌────────────────────┐  │                        │
│  │  │ Primary: Whisper   │  │                        │
│  │  │ (OpenAI)           │  │                        │
│  │  │ Accuracy: 96%      │  │                        │
│  │  └────────────────────┘  │                        │
│  │  ┌────────────────────┐  │                        │
│  │  │ Fallback: Xina AI  │  │                        │
│  │  │ (Egyptian dialect) │  │                        │
│  │  └────────────────────┘  │                        │
│  └─────────┬────────────────┘                        │
│            │                                          │
│            ▼                                          │
│  ┌──────────────────────────────┐                    │
│  │  NLU (Understanding)         │                    │
│  │  ┌────────────────────────┐  │                    │
│  │  │ Intent Detection       │  │                    │
│  │  │ (GPT-4)                │  │                    │
│  │  └────────────────────────┘  │                    │
│  │  ┌────────────────────────┐  │                    │
│  │  │ Entity Extraction      │  │                    │
│  │  │ (brand, price, etc.)   │  │                    │
│  │  └────────────────────────┘  │                    │
│  └─────────┬────────────────────┘                    │
│            │                                          │
│            ▼                                          │
│  ┌──────────────────────────────┐                    │
│  │  Action Handler              │                    │
│  │  • Search products           │                    │
│  │  • Create listing            │                    │
│  │  • Start negotiation         │                    │
│  │  • Answer questions          │                    │
│  └─────────┬────────────────────┘                    │
│            │                                          │
│            ▼                                          │
│  ┌──────────────────────────────┐                    │
│  │  Response Generation         │                    │
│  │  (GPT-4 + Context)           │                    │
│  └─────────┬────────────────────┘                    │
│            │                                          │
│            ▼                                          │
│  ┌──────────────────────────────┐                    │
│  │  Text-to-Speech (TTS)        │                    │
│  │  ┌────────────────────────┐  │                    │
│  │  │ ElevenLabs             │  │                    │
│  │  │ (Arabic voice)         │  │                    │
│  │  │ Natural, expressive    │  │                    │
│  │  └────────────────────────┘  │                    │
│  └─────────┬────────────────────┘                    │
│            │                                          │
│            ▼                                          │
│  🔊 User hears response                              │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **ASR** | OpenAI Whisper v3 | Arabic speech recognition |
| **ASR Fallback** | Xina AI | Egyptian dialect specialist |
| **NLU** | GPT-4 Turbo | Intent & entity extraction |
| **TTS** | ElevenLabs Multilingual | Natural Arabic voice |
| **TTS Fallback** | Google Cloud TTS | Backup voice |
| **Audio** | React Native Voice | Mobile mic access |
| **Streaming** | WebSockets | Real-time communication |
| **Cache** | Redis | Session & context storage |

---

## 4. Voice Recognition (ASR) {#asr}

### 4.1 Whisper Integration

```typescript
// services/speech-recognition.service.ts

import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class SpeechRecognitionService {

  /**
   * تحويل الصوت لنص باستخدام Whisper
   */
  async transcribe(audioFilePath: string): Promise<{
    text: string;
    language: string;
    confidence: number;
  }> {

    try {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-1',
        language: 'ar',  // Arabic
        response_format: 'verbose_json',
        temperature: 0.2  // للدقة
      });

      return {
        text: transcription.text,
        language: transcription.language || 'ar',
        confidence: this.estimateConfidence(transcription)
      };

    } catch (error) {
      console.error('Whisper transcription failed:', error);

      // Fallback to Xina AI
      return this.transcribeWithXina(audioFilePath);
    }
  }

  /**
   * Fallback: Xina AI للهجة المصرية
   */
  private async transcribeWithXina(audioFilePath: string): Promise<any> {
    // TODO: Integrate Xina AI API
    // https://xina.ai/

    const xinaApiUrl = process.env.XINA_API_URL;
    const apiKey = process.env.XINA_API_KEY;

    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioFilePath));
    formData.append('dialect', 'egyptian');

    const response = await fetch(xinaApiUrl!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    const result = await response.json();

    return {
      text: result.transcript,
      language: 'ar-EG',
      confidence: result.confidence
    };
  }

  /**
   * تقدير مستوى الثقة من النص
   */
  private estimateConfidence(transcription: any): number {
    // Whisper لا يعطي confidence score مباشرة
    // نقدره بناءً على:

    const text = transcription.text;

    let confidence = 100;

    // خصم للنصوص القصيرة جداً
    if (text.length < 10) {
      confidence -= 20;
    }

    // خصم للرموز الغريبة
    const weirdChars = (text.match(/[^\u0600-\u06FF\s\d]/g) || []).length;
    confidence -= weirdChars * 5;

    // خصم للكلمات غير المفهومة
    const arabicWords = text.split(/\s+/).filter(w => /[\u0600-\u06FF]/.test(w));
    if (arabicWords.length < 2) {
      confidence -= 30;
    }

    return Math.max(0, Math.min(100, confidence));
  }
}
```

### 4.2 Real-time Streaming

```typescript
// services/streaming-asr.service.ts

import { WebSocket } from 'ws';

export class StreamingASRService {

  private ws: WebSocket | null = null;
  private audioBuffer: Buffer[] = [];

  /**
   * بدء جلسة تعرف صوتي مستمر
   */
  async startStream(
    onTranscript: (text: string, isFinal: boolean) => void
  ): Promise<void> {

    this.ws = new WebSocket(process.env.WHISPER_STREAMING_URL!);

    this.ws.on('open', () => {
      console.log('Streaming ASR connected');

      // إرسال إعدادات
      this.ws!.send(JSON.stringify({
        type: 'config',
        language: 'ar',
        sampleRate: 16000,
        interim_results: true
      }));
    });

    this.ws.on('message', (data) => {
      const result = JSON.parse(data.toString());

      if (result.type === 'transcript') {
        onTranscript(result.text, result.is_final);
      }
    });

    this.ws.on('error', (error) => {
      console.error('Streaming ASR error:', error);
    });
  }

  /**
   * إرسال audio chunk
   */
  sendAudioChunk(audioChunk: Buffer): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(audioChunk);
    } else {
      this.audioBuffer.push(audioChunk);
    }
  }

  /**
   * إنهاء الجلسة
   */
  stopStream(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.audioBuffer = [];
  }
}
```

---

## 5. Natural Language Understanding {#nlu}

### 5.1 Intent Detection

```typescript
// services/nlu.service.ts

import OpenAI from 'openai';

const openai = new OpenAI();

export enum Intent {
  SEARCH_PRODUCT = 'search_product',
  CREATE_LISTING = 'create_listing',
  NEGOTIATE = 'negotiate',
  ASK_QUESTION = 'ask_question',
  NAVIGATE = 'navigate',
  CANCEL = 'cancel',
  CONFIRM = 'confirm',
  UNKNOWN = 'unknown'
}

export class NLUService {

  /**
   * استخراج Intent والمعلومات من النص
   */
  async understand(text: string, context?: ConversationContext): Promise<{
    intent: Intent;
    entities: Record<string, any>;
    confidence: number;
  }> {

    const systemPrompt = `
أنت نظام فهم لغة طبيعية لمنصة Xchange المصرية.
مهمتك تحليل كلام المستخدم وتحديد:
1. Intent (النية)
2. Entities (المعلومات المهمة)

الـ Intents المتاحة:
- search_product: البحث عن منتج
- create_listing: إضافة إعلان
- negotiate: التفاوض على السعر
- ask_question: سؤال عام
- navigate: التنقل في التطبيق
- confirm: تأكيد
- cancel: إلغاء

رد بـ JSON فقط:
{
  "intent": "...",
  "entities": {...},
  "confidence": 0-100
}
    `.trim();

    const userPrompt = `
${context ? `السياق السابق: ${JSON.stringify(context)}` : ''}

كلام المستخدم: "${text}"

حلل واستخرج الـ intent والـ entities.
    `.trim();

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      intent: result.intent as Intent,
      entities: result.entities || {},
      confidence: result.confidence || 80
    };
  }

  /**
   * استخراج entities محددة
   */
  extractEntities(text: string): {
    brand?: string;
    model?: string;
    price?: number;
    priceRange?: { min: number; max: number };
    category?: string;
    condition?: string;
    location?: string;
  } {

    const entities: any = {};

    // Brand extraction
    const brands = ['سامسونج', 'آيفون', 'تويوتا', 'هوندا', 'ذهب', 'فضة'];
    for (const brand of brands) {
      if (text.includes(brand)) {
        entities.brand = brand;
        break;
      }
    }

    // Price extraction
    const priceMatch = text.match(/(\d+)\s*(ألف|آلاف|جنيه)/);
    if (priceMatch) {
      let price = parseInt(priceMatch[1]);
      if (priceMatch[2] === 'ألف' || priceMatch[2] === 'آلاف') {
        price *= 1000;
      }
      entities.price = price;
    }

    // Price range
    const rangeMatch = text.match(/من\s*(\d+)\s*لـ?\s*(\d+)/);
    if (rangeMatch) {
      entities.priceRange = {
        min: parseInt(rangeMatch[1]) * 1000,
        max: parseInt(rangeMatch[2]) * 1000
      };
    }

    // Location
    const governorates = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الشرقية'];
    for (const gov of governorates) {
      if (text.includes(gov)) {
        entities.location = gov;
        break;
      }
    }

    return entities;
  }
}
```

---

## 6. Text-to-Speech {#tts}

### 6.1 ElevenLabs Integration

```typescript
// services/text-to-speech.service.ts

import axios from 'axios';
import fs from 'fs';

export class TextToSpeechService {

  private apiKey: string;
  private voiceId: string;  // Arabic voice

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY!;
    this.voiceId = process.env.ELEVENLABS_VOICE_ID!; // Arabic male/female
  }

  /**
   * تحويل النص لصوت
   */
  async synthesize(
    text: string,
    options?: {
      voice?: 'male' | 'female';
      speed?: number;
      emotion?: 'neutral' | 'friendly' | 'professional';
    }
  ): Promise<Buffer> {

    const voiceSettings = {
      stability: 0.75,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    };

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
        {
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      return Buffer.from(response.data);

    } catch (error) {
      console.error('ElevenLabs TTS failed:', error);

      // Fallback to Google TTS
      return this.synthesizeWithGoogle(text);
    }
  }

  /**
   * Fallback: Google Cloud TTS
   */
  private async synthesizeWithGoogle(text: string): Promise<Buffer> {
    const textToSpeech = require('@google-cloud/text-to-speech');
    const client = new textToSpeech.TextToSpeechClient();

    const request = {
      input: { text: text },
      voice: {
        languageCode: 'ar-XA',
        name: 'ar-XA-Wavenet-A',  // Male voice
        ssmlGender: 'MALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0
      }
    };

    const [response] = await client.synthesizeSpeech(request);
    return Buffer.from(response.audioContent as Uint8Array);
  }

  /**
   * تشغيل الصوت مباشرة على الموبايل
   */
  async speak(text: string): Promise<string> {
    const audioBuffer = await this.synthesize(text);

    // حفظ مؤقت
    const tempPath = `/tmp/tts-${Date.now()}.mp3`;
    fs.writeFileSync(tempPath, audioBuffer);

    // رفع لـ CDN
    const audioUrl = await this.uploadToCDN(tempPath);

    return audioUrl;
  }

  private async uploadToCDN(filePath: string): Promise<string> {
    // TODO: Upload to S3/CloudFront
    return 'https://cdn.xchange.com/audio/...';
  }
}
```

---

## 7. Conversation Flow {#conversation}

### 7.1 Conversation Manager

```typescript
// services/conversation.service.ts

export interface ConversationContext {
  sessionId: string;
  userId: string;
  currentIntent?: Intent;
  currentStep?: string;
  collectedData: Record<string, any>;
  history: Message[];
}

export class ConversationService {

  /**
   * معالجة رسالة صوتية
   */
  async handleVoiceMessage(
    audio: Buffer,
    context: ConversationContext
  ): Promise<{
    responseText: string;
    responseAudio: string;
    action?: string;
    data?: any;
  }> {

    // 1. Speech to Text
    const asr = new SpeechRecognitionService();
    const { text, confidence } = await asr.transcribe(audio);

    if (confidence < 60) {
      return {
        responseText: 'معلش، مسمعتش كويس. ممكن تعيد تاني؟',
        responseAudio: await this.textToSpeech('معلش، مسمعتش كويس. ممكن تعيد تاني؟')
      };
    }

    // 2. Understand Intent
    const nlu = new NLUService();
    const { intent, entities } = await nlu.understand(text, context);

    // 3. Update Context
    context.currentIntent = intent;
    context.collectedData = { ...context.collectedData, ...entities };
    context.history.push({
      role: 'user',
      content: text,
      timestamp: new Date()
    });

    // 4. Handle Intent
    const response = await this.handleIntent(intent, entities, context);

    // 5. Text to Speech
    const audioUrl = await this.textToSpeech(response.text);

    // 6. Save to history
    context.history.push({
      role: 'assistant',
      content: response.text,
      timestamp: new Date()
    });

    return {
      responseText: response.text,
      responseAudio: audioUrl,
      action: response.action,
      data: response.data
    };
  }

  /**
   * معالجة Intent
   */
  private async handleIntent(
    intent: Intent,
    entities: any,
    context: ConversationContext
  ): Promise<{ text: string; action?: string; data?: any }> {

    switch (intent) {

      case Intent.SEARCH_PRODUCT:
        return this.handleSearch(entities, context);

      case Intent.CREATE_LISTING:
        return this.handleCreateListing(entities, context);

      case Intent.NEGOTIATE:
        return this.handleNegotiate(entities, context);

      case Intent.ASK_QUESTION:
        return this.handleQuestion(entities, context);

      default:
        return {
          text: 'معلش، مفهمتش. ممكن توضح أكتر؟'
        };
    }
  }

  /**
   * التعامل مع البحث
   */
  private async handleSearch(
    entities: any,
    context: ConversationContext
  ): Promise<any> {

    // بناء query البحث
    const query: any = {};

    if (entities.brand) query.brand = entities.brand;
    if (entities.category) query.category = entities.category;
    if (entities.priceRange) {
      query.price = {
        gte: entities.priceRange.min,
        lte: entities.priceRange.max
      };
    }
    if (entities.location) query.governorate = entities.location;

    // البحث
    const results = await prisma.listing.findMany({
      where: query,
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    if (results.length === 0) {
      return {
        text: 'للأسف مفيش نتائج. عايز تجرب بحث تاني؟'
      };
    }

    const topResult = results[0];

    const response = `
لقيت لك ${results.length} نتيجة.
أحسن عرض: ${topResult.title} بـ ${topResult.price.toLocaleString()} جنيه
في ${topResult.governorate}.
عايز تشوف التفاصيل؟
    `.trim();

    return {
      text: response,
      action: 'show_search_results',
      data: { results }
    };
  }

  /**
   * التعامل مع إضافة إعلان
   */
  private async handleCreateListing(
    entities: any,
    context: ConversationContext
  ): Promise<any> {

    // Multi-turn conversation لجمع كل المعلومات
    const collected = context.collectedData;

    // تحديد الخطوة الحالية
    if (!collected.category) {
      return {
        text: 'تمام! أيه نوع المنتج اللي عايز تبيعه؟ (موبايل، عربية، ذهب، إلخ)',
        action: 'await_category'
      };
    }

    if (!collected.brand) {
      return {
        text: `تمام. أيه الماركة؟`,
        action: 'await_brand'
      };
    }

    if (!collected.price) {
      return {
        text: `عايز تبيعه بكام؟`,
        action: 'await_price'
      };
    }

    if (!collected.condition) {
      return {
        text: `حالته إيه؟ (جديد، ممتاز، جيد، مقبول)`,
        action: 'await_condition'
      };
    }

    // كل المعلومات متوفرة - إنشاء الإعلان
    const listing = await prisma.listing.create({
      data: {
        userId: context.userId,
        category: collected.category,
        brand: collected.brand,
        price: collected.price,
        condition: collected.condition,
        title: `${collected.brand} ${collected.model || ''}`,
        status: 'draft'
      }
    });

    return {
      text: `تمام خلاص! الإعلان اتعمل. دلوقتي هاخد منك كام صورة للمنتج عشان نخلص`,
      action: 'request_photos',
      data: { listingId: listing.id }
    };
  }

  /**
   * تحويل النص لصوت
   */
  private async textToSpeech(text: string): Promise<string> {
    const tts = new TextToSpeechService();
    return tts.speak(text);
  }
}
```

---

## 8. Implementation Guide {#implementation}

### Phase 1: Basic Voice Recognition (Week 1-3)
```bash
- Whisper integration
- Basic Arabic ASR
- Simple command recognition
```

### Phase 2: NLU & Conversation (Week 4-6)
```bash
- GPT-4 intent detection
- Entity extraction
- Multi-turn conversation
- Context management
```

### Phase 3: TTS & Full Loop (Week 7-9)
```bash
- ElevenLabs integration
- Natural Arabic voices
- End-to-end voice loop
```

### Phase 4: Mobile Integration (Week 10-12)
```bash
- React Native Voice
- Real-time streaming
- UI/UX للمحادثة الصوتية
- Testing & optimization
```

---

## 9. Accessibility Features {#accessibility}

### 9.1 للمكفوفين وضعاف البصر

```typescript
const ACCESSIBILITY_FEATURES = {

  // Screen Reader Integration
  screenReader: {
    enabled: true,
    verbosity: 'detailed',  // وصف مفصل لكل عنصر
    hapticFeedback: true    // اهتزاز عند الأزرار
  },

  // Voice-Only Mode
  voiceOnly: {
    enabled: true,
    autoPlay: true,         // تشغيل الردود تلقائياً
    skipVisuals: true       // تخطي العناصر المرئية
  },

  // Large Text
  textSize: {
    min: 20,                // حجم خط كبير
    adjustable: true
  }
};
```

### 9.2 للأميين

```typescript
const ILLITERATE_MODE = {
  // Visual Icons Only
  icons: {
    size: 'large',
    labels: 'voice',        // شرح صوتي للأيقونات
    confirmation: 'voice'   // تأكيد صوتي قبل الإجراءات
  },

  // Simplified Navigation
  navigation: {
    maxOptions: 4,          // خيارات محدودة
    guided: true,           // إرشاد خطوة بخطوة
    voiceHelp: 'always'     // مساعدة صوتية دائماً
  }
};
```

---

**تاريخ الإنشاء:** ديسمبر 2024
**الإصدار:** 1.0
**المطور:** Xchange Egypt Platform Team
