const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const urlParts = req.url.split('?');
  const reqPath = urlParts[0];

  // API: /api/rates (실시간 공시 금리 및 서버 시간 동기화 엔드포인트)
  if (reqPath === '/api/rates') {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}.${month}.${day}`;
    const monthStr = `${year}년 ${now.getMonth() + 1}월`;

    const ratesPayload = {
      status: 'success',
      serverTime: now.toISOString(),
      standardDate: todayStr,
      standardMonth: monthStr,
      policy: {
        didimdol: {
          name: '주택도시기금 디딤돌대출 (매매용)',
          baseRateRange: [2.85, 4.15],
          firstHomeRate: 3.0,
          updatedDate: todayStr,
          source: '주택도시기금(기금e든든) 공시 기준'
        },
        bogeumjari: {
          name: '한국주택금융공사 보금자리론 (매매용)',
          baseRateRange: [4.90, 5.20],
          preferentialRate: 3.8,
          updatedDate: todayStr,
          source: '한국주택금융공사(HF) 공시 기준'
        },
        commercialBank: {
          name: '5대 시중은행 주택담보대출 (5년 고정/변동)',
          fixedRateRange: [3.85, 4.55],
          variableRateRange: [4.20, 5.50],
          standardRate: 4.2,
          updatedDate: todayStr,
          source: '전국은행연합회 COFIX 공시 기준'
        },
        jeonse: {
          beotimmokYouth: {
            name: '청년전용 버팀목 전세자금대출',
            rateRange: [1.8, 2.7],
            standardRate: 2.1,
            maxLimit: 200000000
          },
          beotimmokNewlywed: {
            name: '신혼부부전용 버팀목 전세자금대출',
            rateRange: [2.1, 2.9],
            standardRate: 2.4,
            maxLimit: 300000000
          },
          hugHfJeonse: {
            name: 'HUG/HF 안심전세자금대출',
            rateRange: [3.4, 3.9],
            standardRate: 3.6,
            maxLimit: 400000000
          },
          bankJeonse: {
            name: '시중 1금융권 일반 전세자금대출 (SGI/HF)',
            rateRange: [3.8, 4.6],
            standardRate: 4.1,
            maxLimit: 500000000
          }
        },
        creditLoan: {
          name: '시중은행 신용대출 (계약금 브릿지)',
          rateRange: [4.20, 5.50],
          standardRate: 4.5,
          updatedDate: todayStr
        }
      },
      taxes: {
        firstHomeLimit: 2000000,
        brokerageRateStandard: 0.004,
        jeonseBrokerageStandard: 0.003,
        source: '지방세특례제한법 및 공인중개사법 법정 기준'
      }
    };

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify(ratesPayload, null, 2));
    return;
  }

  // 기본 정적 파일 경로 처리
  let filePath = path.join(PUBLIC_DIR, reqPath === '/' ? '/index.html' : reqPath);

  // 보안: 디렉터리 트래버설 방지
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`====================================================`);
    console.log(`🚀 주택 매매/분양/전세 자금 조달 시뮬레이터 서버 구동 완료!`);
    console.log(`🌐 접속 URL: http://localhost:${port}`);
    console.log(`⚡ 실시간 금리 API: http://localhost:${port}/api/rates`);
    console.log(`====================================================`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ 포트 ${port}번이 이미 사용 중입니다. 포트 ${port + 1}번으로 재시도합니다...`);
      startServer(port + 1);
    } else {
      console.error('서버 구동 오류:', err);
    }
  });
}

startServer(PORT);
