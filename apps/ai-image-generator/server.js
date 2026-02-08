/**
 * AI 이미지 생성 서비스
 * DALL-E API를 사용하여 이미지 생성
 */

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const openai = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// OpenAI 클라이언트 초기화
const openaiClient = new openai.OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 이미지 저장 디렉토리
const fs = require('fs');
const path = require('path');
const IMAGES_DIR = path.join(__dirname, 'images');

// 이미지 디렉토리 생성
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Multer 설정 (파일 업로드용)
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// 미들웨어
app.use(express.json());
app.use(express.static('public'));

// 로깅 미들웨어
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  req.requestId = requestId;

  console.log(`[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] [${requestId}] ${res.statusCode} - ${duration}ms`);
  });

  next();
});

/**
 * 헬스 체크 엔드포인트
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-image-generator',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: [
      'DALL-E 3 이미지 생성',
      '이미지 변환',
      '이미지 크기 조정'
    ],
    api: {
      openai_configured: !!process.env.OPENAI_API_KEY
    }
  });
});

/**
 * 이미지 생성 엔드포인트 (DALL-E)
 */
app.post('/api/generate', async (req, res) => {
  try {
    const {
      prompt,
      n = 1,
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid'
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'prompt is required'
      });
    }

    console.log(`[${req.requestId}] Generating image with prompt: ${prompt}`);

    // DALL-E 3 API 호출
    const response = await openaiClient.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: parseInt(n),
      size: size,
      quality: quality,
      style: style,
      response_format: 'url'
    });

    const images = response.data.map(img => ({
      url: img.url,
      revised_prompt: img.revised_prompt
    }));

    res.json({
      success: true,
      request_id: req.requestId,
      images: images
    });

  } catch (error) {
    console.error(`[${req.requestId}] Error generating image:`, error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      request_id: req.requestId
    });
  }
});

/**
 * 이미지 생성 및 저장 엔드포인트
 */
app.post('/api/generate-and-save', async (req, res) => {
  try {
    const {
      prompt,
      filename = `generated-${Date.now()}.png`
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'prompt is required'
      });
    }

    console.log(`[${req.requestId}] Generating and saving image with prompt: ${prompt}`);

    // DALL-E 3 API 호출 (b64_json 형식)
    const response = await openaiClient.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
      response_format: 'b64_json'
    });

    const imageData = response.data[0].b64_json;
    const filePath = path.join(IMAGES_DIR, filename);

    // 이미지 저장
    const buffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(filePath, buffer);

    console.log(`[${req.requestId}] Image saved to: ${filePath}`);

    res.json({
      success: true,
      request_id: req.requestId,
      filename: filename,
      path: filePath,
      size: buffer.length
    });

  } catch (error) {
    console.error(`[${req.requestId}] Error generating and saving image:`, error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      request_id: req.requestId
    });
  }
});

/**
 * 이미지 다운로드 및 저장 엔드포인트
 */
app.post('/api/download', upload.single('url'), async (req, res) => {
  try {
    const { url, filename } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'url is required'
      });
    }

    const fileName = filename || `downloaded-${Date.now()}.png`;
    const filePath = path.join(IMAGES_DIR, fileName);

    // 이미지 다운로드
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());

    // 이미지 저장
    fs.writeFileSync(filePath, buffer);

    console.log(`[${req.requestId}] Image downloaded and saved to: ${filePath}`);

    res.json({
      success: true,
      request_id: req.requestId,
      filename: fileName,
      path: filePath,
      size: buffer.length
    });

  } catch (error) {
    console.error(`[${req.requestId}] Error downloading image:`, error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      request_id: req.requestId
    });
  }
});

/**
 * 이미지 변환 엔드포인트 (크기 조정, 포맷 변환)
 */
app.post('/api/transform', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'image file is required'
      });
    }

    const { width, height, format = 'png' } = req.body;

    let transform = sharp(req.file.path);

    if (width || height) {
      transform = transform.resize(
        width ? parseInt(width) : null,
        height ? parseInt(height) : null,
        { fit: 'inside' }
      );
    }

    // 포맷 변환
    if (format === 'jpeg' || format === 'jpg') {
      transform = transform.jpeg({ quality: 80 });
    } else if (format === 'webp') {
      transform = transform.webp({ quality: 80 });
    } else {
      transform = transform.png();
    }

    const outputFileName = `transformed-${Date.now()}.${format}`;
    const outputPath = path.join(IMAGES_DIR, outputFileName);

    await transform.toFile(outputPath);

    // 원본 파일 삭제
    fs.unlinkSync(req.file.path);

    console.log(`[${req.requestId}] Image transformed and saved to: ${outputPath}`);

    res.json({
      success: true,
      request_id: req.requestId,
      filename: outputFileName,
      path: outputPath
    });

  } catch (error) {
    console.error(`[${req.requestId}] Error transforming image:`, error);

    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      request_id: req.requestId
    });
  }
});

/**
 * 저장된 이미지 목록 엔드포인트
 */
app.get('/api/images', (req, res) => {
  try {
    const files = fs.readdirSync(IMAGES_DIR);
    const images = files.map(filename => {
      const filePath = path.join(IMAGES_DIR, filename);
      const stats = fs.statSync(filePath);

      return {
        filename: filename,
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    });

    res.json({
      success: true,
      count: images.length,
      images: images
    });

  } catch (error) {
    console.error(`[${req.requestId}] Error listing images:`, error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      request_id: req.requestId
    });
  }
});

/**
 * 이미지 삭제 엔드포인트
 */
app.delete('/api/images/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(IMAGES_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Image not found'
      });
    }

    fs.unlinkSync(filePath);

    console.log(`[${req.requestId}] Image deleted: ${filePath}`);

    res.json({
      success: true,
      request_id: req.requestId,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error(`[${req.requestId}] Error deleting image:`, error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      request_id: req.requestId
    });
  }
});

/**
 * 정적 파일 제공 (생성된 이미지)
 */
app.use('/images', express.static(IMAGES_DIR));

/**
 * 404 처리
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    available_endpoints: [
      { method: 'GET', path: '/health', description: '헬스 체크' },
      { method: 'POST', path: '/api/generate', description: '이미지 생성 (DALL-E)' },
      { method: 'POST', path: '/api/generate-and-save', description: '이미지 생성 및 저장' },
      { method: 'POST', path: '/api/download', description: '이미지 다운로드 및 저장' },
      { method: 'POST', path: '/api/transform', description: '이미지 변환' },
      { method: 'GET', path: '/api/images', description: '저장된 이미지 목록' },
      { method: 'DELETE', path: '/api/images/:filename', description: '이미지 삭제' },
      { method: 'GET', path: '/images/:filename', description: '이미지 파일 제공' }
    ]
  });
});

/**
 * 에러 핸들러
 */
app.use((err, req, res, next) => {
  console.error(`[${req.requestId}] Unhandled error:`, err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    request_id: req.requestId
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`AI 이미지 생성 서비스가 시작되었습니다.`);
  console.log('='.repeat(60));
  console.log(`포트: ${PORT}`);
  console.log(`이미지 저장 디렉토리: ${IMAGES_DIR}`);
  console.log(`OpenAI API 설정됨: ${!!process.env.OPENAI_API_KEY}`);
  console.log('='.repeat(60));
});
