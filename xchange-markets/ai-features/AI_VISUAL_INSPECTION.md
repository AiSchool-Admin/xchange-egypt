# 📸 نظام التقييم الذكي بالكاميرا - AI Visual Inspection
## Xchange AI-Powered Product Grading & Condition Assessment

**الأولوية:** 🔥 عالية جداً
**التأثير:** +40% trust, -60% disputes
**صعوبة التطوير:** عالية
**الوقت المقدر:** 10-12 أسبوع

---

## 📋 جدول المحتويات

1. [نظرة عامة](#overview)
2. [المواصفات التقنية](#technical-specs)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [AI Models & Algorithms](#ai-models)
6. [Mobile SDK Integration](#mobile-sdk)
7. [User Stories](#user-stories)
8. [Implementation Guide](#implementation)
9. [Model Training](#training)

---

## 1. نظرة عامة {#overview}

### 1.1 المشكلة

**التحديات الحالية:**
- **70%** من النزاعات بسبب "المنتج لا يطابق الوصف"
- البائعون يبالغون في وصف الحالة
- المشترون لا يثقون في الصور
- لا يوجد معيار موحد للتقييم
- تقييم الحالة شخصي ومتحيز

### 1.2 الحل

**نظام ذكي متكامل يستخدم Computer Vision لـ:**
```
┌──────────────────────────────────────────────────────┐
│              قدرات النظام الذكي                      │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ✅ تقييم تلقائي للحالة (A/B/C/D)                   │
│  ✅ كشف العيوب والخدوش                              │
│  ✅ قياس نسبة التلف                                 │
│  ✅ مقارنة مع معايير الصناعة                        │
│  ✅ إنشاء تقرير مصور تفصيلي                         │
│  ✅ تقدير السعر بناءً على الحالة                   │
│  ✅ ضمان الشفافية والثقة                            │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### 1.3 فئات المنتجات المدعومة

| الفئة | النموذج | الدقة المتوقعة |
|------|---------|----------------|
| **📱 Mobiles** | Custom YOLOv8 | 92% |
| **🚗 Vehicles** | ResNet-50 | 88% |
| **💎 Luxury Items** | EfficientNet | 90% |
| **⚙️ Electronics** | MobileNetV3 | 85% |
| **🪙 Gold/Silver** | Custom CNN | 94% |

### 1.4 معايير التقييم

```typescript
enum ConditionGrade {
  A = 'EXCELLENT',      // ممتاز: 95-100% جديد
  B = 'VERY_GOOD',      // جيد جداً: 80-94%
  C = 'GOOD',           // جيد: 60-79%
  D = 'FAIR',           // مقبول: 40-59%
  E = 'POOR'            // سيء: < 40%
}

interface DefectType {
  SCRATCH: 'خدش';        // Severity: 1-10
  CRACK: 'شرخ/كسر';
  DENT: 'انبعاج';
  DISCOLORATION: 'تغير لون';
  WEAR: 'تآكل';
  DAMAGE: 'تلف';
}
```

---

## 2. المواصفات التقنية {#technical-specs}

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   ARCHITECTURE                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📱 Mobile App                                          │
│  ┌──────────────┐                                       │
│  │  Camera UI   │                                       │
│  │  + Guides    │──────┐                                │
│  └──────────────┘      │                                │
│                        ▼                                 │
│  ┌──────────────────────────────┐                       │
│  │   On-Device Processing       │                       │
│  │   • Image Quality Check      │                       │
│  │   • Auto-crop & Enhance      │                       │
│  │   • Compression               │                       │
│  └─────────────┬────────────────┘                       │
│                │                                         │
│                ▼                                         │
│  ┌──────────────────────────────┐                       │
│  │      Upload to Cloud         │                       │
│  │   (AWS S3 + CloudFront)      │                       │
│  └─────────────┬────────────────┘                       │
│                │                                         │
│                ▼                                         │
│  ┌──────────────────────────────────────┐               │
│  │         AI Processing Pipeline       │               │
│  ├──────────────────────────────────────┤               │
│  │  1. Object Detection (YOLOv8)        │               │
│  │  2. Defect Detection                 │               │
│  │  3. Condition Classification         │               │
│  │  4. Quality Scoring                  │               │
│  │  5. Report Generation                │               │
│  └─────────────┬────────────────────────┘               │
│                │                                         │
│                ▼                                         │
│  ┌──────────────────────────────┐                       │
│  │      PostgreSQL DB           │                       │
│  │  + Inspection Results        │                       │
│  └──────────────────────────────┘                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Mobile** | React Native + Vision Camera | صور عالية الجودة |
| **Image Processing** | Sharp.js, ImageMagick | معالجة وتحسين |
| **AI/ML Framework** | PyTorch, ONNX Runtime | تشغيل النماذج |
| **Object Detection** | YOLOv8, Faster R-CNN | كشف المنتجات |
| **Defect Detection** | Custom CNN, Detectron2 | كشف العيوب |
| **Cloud ML** | AWS SageMaker, Lambda | Inference |
| **Storage** | AWS S3, CloudFront CDN | تخزين الصور |
| **Database** | PostgreSQL + JSONB | النتائج |

### 2.3 Hardware Requirements

**Server:**
- GPU: NVIDIA T4 أو أفضل (للـ Inference)
- RAM: 16GB+
- Storage: 500GB SSD

**Mobile:**
- Camera: 12MP+
- RAM: 4GB+
- OS: iOS 13+ / Android 10+

---

## 3. Database Schema {#database-schema}

```prisma
// ============================================
// AI VISUAL INSPECTION SCHEMA
// ============================================

enum InspectionStatus {
  PENDING          // في الانتظار
  PROCESSING       // جاري المعالجة
  COMPLETED        // مكتمل
  FAILED           // فشل
  REVIEW_NEEDED    // يحتاج مراجعة بشرية
}

enum ConditionGrade {
  A  // Excellent: 95-100%
  B  // Very Good: 80-94%
  C  // Good: 60-79%
  D  // Fair: 40-59%
  E  // Poor: < 40%
}

enum DefectSeverity {
  MINOR      // بسيط: لا يؤثر على الوظيفة
  MODERATE   // متوسط: يؤثر قليلاً
  MAJOR      // كبير: يؤثر على الاستخدام
  CRITICAL   // حرج: غير قابل للاستخدام
}

model VisualInspection {
  id                  String              @id @default(uuid())

  // Reference
  listingId           String              @unique
  listing             Listing             @relation(fields: [listingId], references: [id])
  userId              String
  user                User                @relation(fields: [userId], references: [id])

  // Status
  status              InspectionStatus    @default(PENDING)

  // Images Uploaded
  images              InspectionImage[]
  totalImages         Int                 @default(0)
  requiredImages      Int                 // عدد الصور المطلوبة حسب الفئة

  // AI Results
  overallGrade        ConditionGrade?
  overallScore        Float?              // 0-100
  confidence          Float?              // 0-100

  // Defects Summary
  totalDefects        Int                 @default(0)
  minorDefects        Int                 @default(0)
  moderateDefects     Int                 @default(0)
  majorDefects        Int                 @default(0)
  criticalDefects     Int                 @default(0)

  // Detailed Analysis
  defects             Defect[]
  qualityMetrics      Json?               // {clarity, lighting, completeness}

  // Price Impact
  originalPrice       Float?              // السعر قبل التقييم
  suggestedPrice      Float?              // السعر المقترح بعد التقييم
  priceAdjustment     Float?              // التعديل (%)

  // Report
  reportUrl           String?             // PDF report
  reportGenerated     Boolean             @default(false)

  // Human Review
  needsReview         Boolean             @default(false)
  reviewReason        String?
  reviewedBy          String?
  reviewedAt          DateTime?
  humanGrade          ConditionGrade?

  // Processing Info
  processingStarted   DateTime?
  processingCompleted DateTime?
  processingDuration  Int?                // milliseconds
  aiModel             String?             // yolov8-mobile-v1
  aiVersion           String?

  // Metadata
  metadata            Json?

  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  @@index([listingId])
  @@index([userId])
  @@index([status])
  @@index([overallGrade])
}

model InspectionImage {
  id                  String              @id @default(uuid())

  inspectionId        String
  inspection          VisualInspection    @relation(fields: [inspectionId], references: [id], onDelete: Cascade)

  // Image Details
  imageUrl            String              // S3 URL
  thumbnailUrl        String?
  imageType           String              // front, back, top, bottom, screen, etc.
  sequenceNumber      Int                 // ترتيب الصورة
  isRequired          Boolean             @default(true)

  // Quality Metrics
  resolution          String?             // 1920x1080
  fileSize            Int?                // bytes
  format              String?             // jpg, png
  qualityScore        Float?              // 0-100

  // Quality Issues
  isBlurry            Boolean             @default(false)
  isDark              Boolean             @default(false)
  hasGlare            Boolean             @default(false)
  isCropped           Boolean             @default(false)

  // AI Processing
  processed           Boolean             @default(false)
  processingError     String?
  aiAnnotations       Json?               // Bounding boxes, labels

  // Defects found in this image
  defectsFound        Defect[]

  uploadedAt          DateTime            @default(now())

  @@index([inspectionId])
  @@index([imageType])
}

model Defect {
  id                  String              @id @default(uuid())

  inspectionId        String
  inspection          VisualInspection    @relation(fields: [inspectionId], references: [id], onDelete: Cascade)

  imageId             String
  image               InspectionImage     @relation(fields: [imageId], references: [id])

  // Defect Details
  type                String              // scratch, crack, dent, etc.
  typeAr              String              // خدش، شرخ، انبعاج
  severity            DefectSeverity
  location            String              // front_top_left, screen, etc.

  // Bounding Box (normalized 0-1)
  boundingBox         Json                // {x, y, width, height}

  // Measurements
  area                Float?              // mm² or pixels²
  length              Float?              // mm
  depth               Float?              // mm

  // Impact
  affectsFunctionality Boolean           @default(false)
  affectsAesthetics    Boolean           @default(true)
  priceImpact         Float?              // % reduction

  // AI Confidence
  confidence          Float               // 0-100
  aiModel             String

  // Description
  description         String?
  descriptionAr       String?

  detectedAt          DateTime            @default(now())

  @@index([inspectionId])
  @@index([severity])
  @@index([type])
}

// Pre-defined inspection templates
model InspectionTemplate {
  id                  String              @id @default(uuid())

  category            String              // mobiles, vehicles, etc.
  name                String
  nameAr              String

  // Required Images
  requiredImages      Json                // [{type, angle, description}]
  minImages           Int
  maxImages           Int

  // Inspection Points
  checkpoints         Json                // [{area, whatToCheck, weight}]

  // AI Model to use
  modelName           String
  modelVersion        String

  // Grading Criteria
  gradingCriteria     Json                // {A: {min, max}, B: {...}}

  isActive            Boolean             @default(true)

  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  @@unique([category, name])
}

// Analytics
model InspectionAnalytics {
  id                  String              @id @default(uuid())

  inspectionId        String              @unique

  // Performance Metrics
  totalProcessingTime Int                 // ms
  imageProcessingTime Int                 // ms
  modelInferenceTime  Int                 // ms

  // Accuracy (if human review available)
  humanGrade          ConditionGrade?
  aiGrade             ConditionGrade
  wasAccurate         Boolean?

  // User Feedback
  userAccepted        Boolean?
  userDisputed        Boolean?
  disputeReason       String?

  createdAt           DateTime            @default(now())

  @@index([wasAccurate])
  @@index([userAccepted])
}
```

---

## 4. API Endpoints {#api-endpoints}

### 4.1 Start Inspection

```typescript
POST /api/inspections/start

Request:
{
  "listingId": "uuid",
  "category": "mobiles",
  "brand": "iPhone",
  "model": "14 Pro"
}

Response:
{
  "success": true,
  "data": {
    "inspectionId": "uuid",
    "requiredImages": [
      {
        "type": "front",
        "description": "صورة الجهاز من الأمام",
        "example": "https://cdn.../example-front.jpg",
        "tips": ["تأكد من وضوح الشاشة", "إضاءة جيدة"]
      },
      {
        "type": "back",
        "description": "صورة من الخلف",
        "tips": ["أظهر الكاميرا بوضوح", "أي خدوش مرئية"]
      },
      {
        "type": "screen_on",
        "description": "الشاشة مفتوحة (شاشة بيضاء)",
        "tips": ["افتح صورة بيضاء كاملة", "للكشف عن البقع"]
      },
      {
        "type": "edges",
        "description": "الحواف والجوانب",
        "tips": ["صور قريبة للحواف"]
      },
      {
        "type": "ports",
        "description": "المنافذ (شحن، سماعات)",
        "tips": ["قرب الكاميرا", "تأكد من الوضوح"]
      }
    ],
    "minImages": 5,
    "maxImages": 10,
    "uploadUrl": "https://s3.../upload",
    "expiresAt": "2024-12-17T12:00:00Z"
  }
}
```

### 4.2 Upload Image

```typescript
POST /api/inspections/:id/images

Headers:
Content-Type: multipart/form-data

Body:
{
  "image": <File>,
  "imageType": "front",
  "sequenceNumber": 1
}

Response:
{
  "success": true,
  "data": {
    "imageId": "uuid",
    "imageUrl": "https://cdn.../image.jpg",
    "qualityCheck": {
      "passed": true,
      "score": 92,
      "issues": [],
      "warnings": ["الإضاءة يمكن أن تكون أفضل"]
    }
  }
}

// إذا الصورة رديئة:
{
  "success": false,
  "error": {
    "code": "POOR_QUALITY",
    "message": "جودة الصورة غير كافية",
    "issues": [
      {
        "type": "BLURRY",
        "severity": "high",
        "message": "الصورة غير واضحة. حاول التثبيت أكثر"
      },
      {
        "type": "DARK",
        "severity": "medium",
        "message": "الإضاءة ضعيفة. استخدم ضوء أفضل"
      }
    ],
    "suggestions": [
      "امسح عدسة الكاميرا",
      "استخدم كلا اليدين للتثبيت",
      "اقترب من مصدر ضوء"
    ]
  }
}
```

### 4.3 Process Inspection

```typescript
POST /api/inspections/:id/process

Response:
{
  "success": true,
  "data": {
    "status": "PROCESSING",
    "estimatedTime": 45,  // seconds
    "message": "جاري تحليل الصور بالذكاء الاصطناعي..."
  }
}
```

### 4.4 Get Results

```typescript
GET /api/inspections/:id/results

Response:
{
  "success": true,
  "data": {
    "inspectionId": "uuid",
    "status": "COMPLETED",

    // Overall Assessment
    "assessment": {
      "grade": "B",
      "gradeAr": "جيد جداً",
      "score": 87.5,
      "confidence": 94.2,
      "summary": "الجهاز في حالة جيدة جداً مع بعض علامات الاستخدام الخفيف"
    },

    // Defects Found
    "defects": [
      {
        "id": "def-1",
        "type": "SCRATCH",
        "typeAr": "خدش",
        "severity": "MINOR",
        "location": "back_bottom_right",
        "locationAr": "الخلف - أسفل اليمين",
        "description": "خدش سطحي طفيف",
        "imageUrl": "https://cdn.../annotated-1.jpg",
        "boundingBox": { /* ... */ },
        "measurements": {
          "length": "5mm",
          "depth": "surface"
        },
        "impact": {
          "functionality": false,
          "aesthetics": true,
          "priceReduction": 1.5  // %
        }
      },
      {
        "id": "def-2",
        "type": "WEAR",
        "typeAr": "تآكل",
        "severity": "MINOR",
        "location": "edges",
        "description": "تآكل طفيف في الحواف (طبيعي للاستخدام)",
        "impact": {
          "priceReduction": 0.5
        }
      }
    ],

    // Quality Breakdown
    "qualityMetrics": {
      "screen": {
        "score": 95,
        "status": "ممتاز",
        "issues": []
      },
      "body": {
        "score": 85,
        "status": "جيد جداً",
        "issues": ["خدوش سطحية طفيفة"]
      },
      "functionality": {
        "score": 100,
        "status": "كل الوظائف تعمل"
      },
      "cleanliness": {
        "score": 90,
        "status": "نظيف"
      }
    },

    // Price Impact
    "pricing": {
      "originalEstimate": 9000,
      "revisedEstimate": 8730,
      "adjustment": -3.0,  // %
      "reason": "خصم بسيط بسبب الخدوش السطحية",
      "marketComparison": {
        "avgPriceForGradeB": 8650,
        "yourPriceVsMarket": "+0.9%"  // أعلى قليلاً
      }
    },

    // Recommendations
    "recommendations": {
      "forSeller": [
        "السعر المقترح عادل وتنافسي",
        "اذكر أن الجهاز في حالة ممتازة",
        "التقرير يزيد الثقة ويسرع البيع"
      ],
      "forBuyer": [
        "الحالة كما موضحة في التقييم",
        "خدوش طفيفة فقط - لا تؤثر على الاستخدام",
        "سعر عادل للحالة"
      ]
    },

    // Report
    "report": {
      "pdfUrl": "https://cdn.../report.pdf",
      "shareUrl": "https://xchange.com/inspection/share/xxx",
      "validUntil": "2025-01-17T00:00:00Z"
    },

    "processedAt": "2024-12-17T10:30:00Z",
    "processingTime": 42  // seconds
  }
}
```

### 4.5 Request Human Review

```typescript
POST /api/inspections/:id/request-review

Body:
{
  "reason": "أعتقد أن التقييم غير دقيق",
  "details": "الخدش ليس بهذا الوضوح"
}

Response:
{
  "success": true,
  "data": {
    "reviewId": "uuid",
    "status": "REVIEW_PENDING",
    "estimatedTime": "24 hours",
    "message": "تم إرسال طلب المراجعة. سيتم الرد خلال 24 ساعة"
  }
}
```

---

## 5. AI Models & Algorithms {#ai-models}

### 5.1 Object Detection (YOLOv8)

```python
# models/object_detector.py

import torch
from ultralytics import YOLO
import cv2
import numpy as np

class ProductDetector:
    def __init__(self, model_path: str):
        self.model = YOLO(model_path)
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model.to(self.device)

    def detect(self, image_path: str) -> dict:
        """
        كشف المنتج في الصورة
        Returns: {bbox, confidence, class}
        """

        # Read image
        img = cv2.imread(image_path)

        # Run inference
        results = self.model(img)

        # Parse results
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                detection = {
                    'bbox': box.xyxy[0].tolist(),  # [x1, y1, x2, y2]
                    'confidence': float(box.conf[0]),
                    'class': int(box.cls[0]),
                    'class_name': self.model.names[int(box.cls[0])]
                }
                detections.append(detection)

        return {
            'detections': detections,
            'image_size': img.shape[:2]
        }

    def crop_product(self, image_path: str, output_path: str) -> str:
        """
        قص الصورة للمنتج فقط (إزالة الخلفية)
        """

        result = self.detect(image_path)
        if not result['detections']:
            return image_path  # لم يتم العثور على منتج

        # أخذ أكبر detection
        main_detection = max(
            result['detections'],
            key=lambda x: x['confidence']
        )

        # قص الصورة
        img = cv2.imread(image_path)
        x1, y1, x2, y2 = map(int, main_detection['bbox'])

        # إضافة padding
        padding = 20
        x1 = max(0, x1 - padding)
        y1 = max(0, y1 - padding)
        x2 = min(img.shape[1], x2 + padding)
        y2 = min(img.shape[0], y2 + padding)

        cropped = img[y1:y2, x1:x2]
        cv2.imwrite(output_path, cropped)

        return output_path
```

### 5.2 Defect Detection

```python
# models/defect_detector.py

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

class DefectDetector:
    """
    كشف العيوب (خدوش، شروخ، تآكل، إلخ)
    باستخدام Faster R-CNN
    """

    def __init__(self, model_path: str, num_classes: int = 10):
        # Load pre-trained Faster R-CNN
        self.model = models.detection.fasterrcnn_resnet50_fpn(
            pretrained=False,
            num_classes=num_classes
        )

        # Load fine-tuned weights
        checkpoint = torch.load(model_path)
        self.model.load_state_dict(checkpoint['model_state_dict'])

        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        self.model.eval()

        # Class names
        self.classes = [
            'background',
            'scratch',
            'crack',
            'dent',
            'discoloration',
            'wear',
            'chip',
            'stain',
            'corrosion',
            'deformation'
        ]

        self.classes_ar = {
            'scratch': 'خدش',
            'crack': 'شرخ',
            'dent': 'انبعاج',
            'discoloration': 'تغير لون',
            'wear': 'تآكل',
            'chip': 'قشرة',
            'stain': 'بقعة',
            'corrosion': 'صدأ',
            'deformation': 'تشوه'
        }

        # Transform
        self.transform = transforms.Compose([
            transforms.ToTensor(),
        ])

    def detect_defects(
        self,
        image_path: str,
        confidence_threshold: float = 0.6
    ) -> list:
        """
        كشف جميع العيوب في الصورة
        """

        # Load image
        img = Image.open(image_path).convert('RGB')
        img_tensor = self.transform(img).unsqueeze(0).to(self.device)

        # Inference
        with torch.no_grad():
            predictions = self.model(img_tensor)

        # Parse predictions
        pred = predictions[0]
        boxes = pred['boxes'].cpu().numpy()
        labels = pred['labels'].cpu().numpy()
        scores = pred['scores'].cpu().numpy()

        defects = []

        for box, label, score in zip(boxes, labels, scores):
            if score < confidence_threshold:
                continue

            class_name = self.classes[label]
            if class_name == 'background':
                continue

            # حساب المساحة
            area = (box[2] - box[0]) * (box[3] - box[1])

            # تحديد الشدة بناءً على الحجم والنوع
            severity = self._calculate_severity(class_name, area, score)

            defect = {
                'type': class_name,
                'typeAr': self.classes_ar.get(class_name, class_name),
                'bbox': box.tolist(),
                'confidence': float(score),
                'area': float(area),
                'severity': severity,
                'location': self._determine_location(box, img.size)
            }

            defects.append(defect)

        return defects

    def _calculate_severity(
        self,
        defect_type: str,
        area: float,
        confidence: float
    ) -> str:
        """
        حساب شدة العيب
        """

        # عيوب حرجة دائماً
        critical_defects = ['crack', 'deformation', 'corrosion']
        if defect_type in critical_defects:
            return 'CRITICAL' if area > 1000 else 'MAJOR'

        # بناءً على المساحة
        if area > 2000:
            return 'MAJOR'
        elif area > 500:
            return 'MODERATE'
        else:
            return 'MINOR'

    def _determine_location(self, bbox, image_size) -> str:
        """
        تحديد موقع العيب في الصورة
        """

        width, height = image_size
        x_center = (bbox[0] + bbox[2]) / 2
        y_center = (bbox[1] + bbox[3]) / 2

        # تقسيم الصورة لـ 9 أقسام
        x_third = width / 3
        y_third = height / 3

        x_pos = 'left' if x_center < x_third else 'center' if x_center < 2 * x_third else 'right'
        y_pos = 'top' if y_center < y_third else 'middle' if y_center < 2 * y_third else 'bottom'

        return f"{y_pos}_{x_pos}"
```

### 5.3 Condition Grading

```python
# models/condition_grader.py

import numpy as np
from typing import Dict, List

class ConditionGrader:
    """
    تقييم الحالة العامة بناءً على العيوب المكتشفة
    """

    def __init__(self):
        # أوزان الشدة
        self.severity_weights = {
            'MINOR': 1,
            'MODERATE': 3,
            'MAJOR': 8,
            'CRITICAL': 20
        }

        # أوزان أنواع العيوب
        self.defect_weights = {
            'scratch': 1.0,
            'wear': 0.8,
            'stain': 0.7,
            'discoloration': 1.2,
            'dent': 1.5,
            'chip': 1.8,
            'crack': 3.0,
            'corrosion': 2.5,
            'deformation': 3.0
        }

    def calculate_grade(
        self,
        defects: List[Dict],
        category: str = 'general'
    ) -> Dict:
        """
        حساب الدرجة النهائية
        """

        if not defects:
            return {
                'grade': 'A',
                'score': 100,
                'confidence': 100,
                'summary': 'ممتاز - لا توجد عيوب ملحوظة'
            }

        # حساب النقاط المخصومة
        total_deduction = 0

        for defect in defects:
            severity_weight = self.severity_weights.get(
                defect['severity'],
                1
            )
            defect_weight = self.defect_weights.get(
                defect['type'],
                1.0
            )

            # المساحة كعامل
            area_factor = min(defect.get('area', 100) / 1000, 2.0)

            # الخصم
            deduction = severity_weight * defect_weight * area_factor
            total_deduction += deduction

        # النتيجة النهائية
        final_score = max(0, 100 - total_deduction)

        # تحديد الدرجة
        if final_score >= 95:
            grade = 'A'
            grade_text = 'ممتاز'
        elif final_score >= 80:
            grade = 'B'
            grade_text = 'جيد جداً'
        elif final_score >= 60:
            grade = 'C'
            grade_text = 'جيد'
        elif final_score >= 40:
            grade = 'D'
            grade_text = 'مقبول'
        else:
            grade = 'E'
            grade_text = 'سيء'

        # ملخص
        defect_counts = self._count_by_severity(defects)
        summary = self._generate_summary(grade, defect_counts)

        # الثقة
        confidence = self._calculate_confidence(defects)

        return {
            'grade': grade,
            'gradeText': grade_text,
            'score': round(final_score, 1),
            'confidence': round(confidence, 1),
            'summary': summary,
            'defectCounts': defect_counts
        }

    def _count_by_severity(self, defects: List[Dict]) -> Dict:
        counts = {
            'MINOR': 0,
            'MODERATE': 0,
            'MAJOR': 0,
            'CRITICAL': 0
        }

        for defect in defects:
            severity = defect.get('severity', 'MINOR')
            counts[severity] += 1

        return counts

    def _generate_summary(self, grade: str, counts: Dict) -> str:
        if grade == 'A':
            return "ممتاز - لا توجد عيوب ملحوظة"
        elif grade == 'B':
            if counts['MINOR'] > 0:
                return f"جيد جداً - بعض علامات الاستخدام الطفيفة ({counts['MINOR']} عيوب بسيطة)"
            else:
                return "جيد جداً - حالة ممتازة مع استخدام خفيف"
        elif grade == 'C':
            return f"جيد - علامات استخدام واضحة ({counts['MODERATE']} عيوب متوسطة)"
        elif grade == 'D':
            return f"مقبول - يحتاج عناية ({counts['MAJOR']} عيوب كبيرة)"
        else:
            return "سيء - عيوب كثيرة تؤثر على الاستخدام"

    def _calculate_confidence(self, defects: List[Dict]) -> float:
        """
        حساب مستوى الثقة في التقييم
        """

        if not defects:
            return 100.0

        # متوسط ثقة كشف العيوب
        avg_confidence = np.mean([d['confidence'] for d in defects]) * 100

        # عدد الصور المستخدمة (من metadata)
        # كلما زاد عدد الصور، زادت الثقة

        return min(avg_confidence, 100.0)
```

### 5.4 Image Quality Check

```python
# utils/image_quality.py

import cv2
import numpy as np
from PIL import Image

class ImageQualityChecker:
    """
    فحص جودة الصورة قبل المعالجة
    """

    def __init__(self):
        self.min_resolution = (800, 600)
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.min_brightness = 50
        self.max_brightness = 230

    def check_quality(self, image_path: str) -> Dict:
        """
        فحص شامل للصورة
        """

        issues = []
        warnings = []
        score = 100

        # 1. فحص الحجم
        img = Image.open(image_path)
        width, height = img.size

        if width < self.min_resolution[0] or height < self.min_resolution[1]:
            issues.append({
                'type': 'LOW_RESOLUTION',
                'severity': 'high',
                'message': f'الصورة صغيرة جداً ({width}x{height}). يجب أن تكون على الأقل {self.min_resolution[0]}x{self.min_resolution[1]}'
            })
            score -= 30

        # 2. فحص الوضوح (Blurriness)
        img_cv = cv2.imread(image_path)
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        if laplacian_var < 100:
            issues.append({
                'type': 'BLURRY',
                'severity': 'high',
                'message': 'الصورة غير واضحة. ثبت الكاميرا جيداً'
            })
            score -= 25
        elif laplacian_var < 200:
            warnings.append('الصورة يمكن أن تكون أوضح قليلاً')
            score -= 5

        # 3. فحص الإضاءة
        brightness = np.mean(gray)

        if brightness < self.min_brightness:
            issues.append({
                'type': 'DARK',
                'severity': 'medium',
                'message': 'الإضاءة ضعيفة جداً. استخدم إضاءة أفضل'
            })
            score -= 20
        elif brightness > self.max_brightness:
            issues.append({
                'type': 'OVEREXPOSED',
                'severity': 'medium',
                'message': 'إضاءة زائدة. قلل الإضاءة قليلاً'
            })
            score -= 15

        # 4. فحص الوهج (Glare)
        hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
        v_channel = hsv[:, :, 2]
        bright_pixels = np.sum(v_channel > 250)
        bright_ratio = bright_pixels / (width * height)

        if bright_ratio > 0.1:
            warnings.append('يوجد وهج في الصورة. تجنب الانعكاسات')
            score -= 10

        # 5. فحص الألوان
        if img.mode != 'RGB':
            issues.append({
                'type': 'COLOR_MODE',
                'severity': 'low',
                'message': 'تنسيق الألوان غير مثالي'
            })
            score -= 5

        # النتيجة
        passed = len([i for i in issues if i['severity'] == 'high']) == 0

        return {
            'passed': passed,
            'score': max(0, score),
            'issues': issues,
            'warnings': warnings,
            'metrics': {
                'resolution': f'{width}x{height}',
                'brightness': round(brightness, 1),
                'sharpness': round(laplacian_var, 1)
            }
        }
```

---

## 6. Mobile SDK Integration {#mobile-sdk}

### 6.1 React Native Camera Component

```typescript
// components/InspectionCamera.tsx

import React, { useState, useRef } from 'react';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface InspectionCameraProps {
  imageType: string;
  description: string;
  tips: string[];
  onCapture: (uri: string) => void;
}

export function InspectionCamera({
  imageType,
  description,
  tips,
  onCapture
}: InspectionCameraProps) {

  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const capturePhoto = async () => {
    if (!camera.current) return;

    setIsCapturing(true);

    try {
      const photo = await camera.current.takePhoto({
        flash: 'off',
        qualityPrioritization: 'quality',
        enableShutterSound: true
      });

      // معالجة محلية سريعة
      const processedUri = await processImageLocally(photo.path);

      onCapture(processedUri);

    } catch (error) {
      console.error('Capture failed:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!device) {
    return <Text>Loading camera...</Text>;
  }

  return (
    <View style={styles.container}>

      {/* Camera View */}
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Overlay Guide */}
      <View style={styles.overlay}>

        {/* Top Instructions */}
        <View style={styles.topBar}>
          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Framing Guide */}
        <View style={styles.frameGuide}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        {/* Bottom Tips & Capture Button */}
        <View style={styles.bottomBar}>

          {/* Tips */}
          <View style={styles.tips}>
            {tips.map((tip, index) => (
              <Text key={index} style={styles.tipText}>
                💡 {tip}
              </Text>
            ))}
          </View>

          {/* Capture Button */}
          <TouchableOpacity
            style={styles.captureButton}
            onPress={capturePhoto}
            disabled={isCapturing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

        </View>

      </View>

    </View>
  );
}

async function processImageLocally(uri: string): Promise<string> {
  // معالجة بسيطة على الجهاز:
  // - تصحيح التوجيه
  // - ضغط خفيف
  // - تحسين الألوان

  // TODO: استخدام مكتبة مثل react-native-image-manipulator

  return uri;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  description: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  frameGuide: {
    flex: 1,
    margin: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00ff00',
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: -2,
    left: -2,
  },
  topRight: {
    left: undefined,
    right: -2,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomLeft: {
    top: undefined,
    bottom: -2,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    top: undefined,
    bottom: -2,
    left: undefined,
    right: -2,
    borderTopWidth: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomBar: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
  },
  tips: {
    marginBottom: 20,
  },
  tipText: {
    color: '#ffeb3b',
    fontSize: 14,
    marginBottom: 5,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196f3',
  },
});
```

---

## 7. User Stories {#user-stories}

### Story 1: البائع يلتقط صور المنتج

```
كـ بائع
أريد تصوير منتجي بسهولة
حتى أحصل على تقييم دقيق وموثوق

معايير القبول:
✅ تطبيق يرشدني لأنواع الصور المطلوبة
✅ دلائل مرئية لوضع الكاميرا
✅ فحص جودة فوري للصورة
✅ نصائح لتحسين الصور

المثال:
1. البائع يضغط "ابدأ التقييم"
2. التطبيق يطلب 5 صور (أمام، خلف، شاشة، حواف، منافذ)
3. عند كل صورة، إطار يوضح كيف يضع الكاميرا
4. بعد التقاط، فحص فوري: "ممتاز!" أو "غير واضحة، أعد المحاولة"
5. عند إكمال كل الصور، "جاري التحليل..."
```

### Story 2: استلام التقرير

```
كـ بائع
أريد رؤية تقرير واضح لحالة منتجي
حتى أفهم التقييم وأضبط السعر

معايير القبول:
✅ درجة واضحة (A/B/C/D/E) مع تفسير
✅ قائمة بالعيوب مع صور موضحة
✅ سعر مقترح بناءً على الحالة
✅ إمكانية الاعتراض والطلب مراجعة

المثال:
- "درجة B - جيد جداً (87.5%)"
- "عيبان صغيران: خدش سطحي، تآكل في الحواف"
- صور مع أسهم توضح العيوب
- "السعر المقترح: 8,730 ج.م (بدلاً من 9,000)"
- زر "اعتراض على التقييم" إذا غير مقتنع
```

### Story 3: المشتري يثق في التقرير

```
كـ مشتري
أريد رؤية تقييم موثوق قبل الشراء
حتى أتأكد من حالة المنتج

معايير القبول:
✅ عرض الدرجة والعيوب
✅ مقارنة بالسوق
✅ توصية واضحة
✅ ضمان المطابقة

المثال:
- عند فتح الإعلان: شارة "✓ تم التقييم بالذكاء الاصطناعي"
- "درجة B مع خدوش طفيفة"
- "السعر عادل مقارنة بالسوق"
- "إذا استلمت المنتج ووجدت عيوب إضافية، يمكنك الإرجاع"
```

---

## 8. Implementation Guide {#implementation}

### Phase 1: Infrastructure (Week 1-2)
```bash
# Setup
- AWS S3 buckets للصور
- CloudFront CDN
- Lambda للـ image processing
- SageMaker endpoint للـ ML models
- Database migrations
```

### Phase 2: Base Models (Week 3-5)
```bash
# Train models
- YOLOv8 للـ object detection
- Faster R-CNN للـ defect detection
- Custom classifier للـ condition grading
- Test على 10k+ صورة
```

### Phase 3: Backend API (Week 6-8)
```bash
# Develop
- Inspection endpoints
- Image upload/processing pipeline
- AI inference service
- Report generation
```

### Phase 4: Mobile Integration (Week 9-11)
```bash
# Mobile
- Camera component
- Upload UI
- Results display
- Offline caching
```

### Phase 5: Testing & Launch (Week 12)
```bash
# QA
- Beta testing with 100 users
- Model accuracy validation
- Performance optimization
- Public launch
```

---

## 9. Model Training {#training}

### Dataset Requirements

```
Total Images Needed: 50,000+

Breakdown:
- Mobiles: 15,000 images
  - iPhone: 5,000
  - Samsung: 5,000
  - Other: 5,000

- Vehicles: 20,000 images
  - Exterior: 10,000
  - Interior: 10,000

- Electronics: 10,000

- Luxury: 5,000

Annotations:
- Bounding boxes لكل عيب
- Labels (scratch, crack, etc.)
- Severity ratings
- Human-verified grades
```

### Training Pipeline

```python
# training/train_defect_detector.py

import torch
from torch.utils.data import DataLoader
import wandb

# Initialize W&B
wandb.init(project='xchange-visual-inspection')

# Load dataset
train_dataset = DefectDataset('data/train')
val_dataset = DefectDataset('data/val')

train_loader = DataLoader(train_dataset, batch_size=8, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=8)

# Model
model = FasterRCNN(num_classes=10)
model.to(device)

# Optimizer
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# Training loop
for epoch in range(50):
    train_loss = train_epoch(model, train_loader, optimizer)
    val_loss, val_map = validate(model, val_loader)

    wandb.log({
        'train_loss': train_loss,
        'val_loss': val_loss,
        'val_mAP': val_map
    })

    # Save best model
    if val_map > best_map:
        torch.save(model.state_dict(), 'models/best_model.pth')
```

---

**تاريخ الإنشاء:** ديسمبر 2024
**الإصدار:** 1.0
**المطور:** Xchange Egypt Platform
