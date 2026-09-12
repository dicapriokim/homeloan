/**
 * 최신 공시 금리 데이터 및 정책 기준 (매매, 분양, 전세자금대출 및 법정 세제)
 */
const INTEREST_RATES_DATA = {
  getLiveDateString: function() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  },

  getLiveMonthString: function() {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
  },
  
  // 1. 주택도시기금 내집마련 디딤돌대출 (매매용)
  didimdol: {
    name: '주택도시기금 디딤돌대출',
    description: '무주택 서민을 위한 정부 지원 초저금리 정책 모기지',
    source: '주택도시기금 기금e든든 최신 공시',
    auditType: 'couple-mandatory', // 기혼 시 부부합산 심사 필수 (단독 심사 불가)
    auditRuleDescription: '정부 정책대출 규정: 기혼자는 무조건 부부합산 소득·자산 심사 필수 (배우자 소득 생략 불가)',
    eligibility: {
      incomeLimit: 60000000,
      firstHomeIncomeLimit: 70000000, // 생애최초 일반가구 7천만원 이하
      newlywedIncomeLimit: 85000000, // 신혼가구 8.5천만원 이하
      housePriceLimit: 500000000, // 일반 및 생애최초 일반가구 5억원 이하
      newlywedPriceLimit: 600000000, // 신혼가구 및 2자녀 이상 다자녀 6억원 이하
      maxLoanAmount: 200000000, // 일반 2.0억원
      firstHomeMaxLoan: 240000000, // 생애최초 2.4억원 (수도권 방공제 5,500만 차감 시 최대 1.85억)
      newlywedMaxLoan: 320000000, // 신혼 및 2자녀 이상 다자녀 3.2억원
      maxLTV: 70 // 수도권 70% (비수도권 비규제 생애최초 최대 80%)
    },
    rates: {
      tier1: { label: '소득 2천만원 이하', rate10: 2.85, rate15: 2.95, rate20: 3.05, rate30: 3.15 },
      tier2: { label: '소득 2천만원 ~ 4천만원 이하', rate10: 3.20, rate15: 3.30, rate20: 3.40, rate30: 3.50 },
      tier3: { label: '소득 4천만원 ~ 6천만원 이하', rate10: 3.55, rate15: 3.65, rate20: 3.75, rate30: 3.85 },
      tier4: { label: '소득 6천만원 ~ 8.5천만원 이하', rate10: 3.85, rate15: 3.95, rate20: 4.05, rate30: 4.15 }
    },
    defaultRate: 3.0,
    badge: '정부 정책 (최우선 추천)'
  },

  // 2. 한국주택금융공사 (HF) 보금자리론 (매매용)
  bogeumjari: {
    name: '한국주택금융공사 보금자리론',
    description: '최장 50년 고정금리 정책 모기지 (주택가격 6억원 이하)',
    source: '한국주택금융공사(HF) 최신 공시',
    auditType: 'couple-mandatory', // 기혼 시 부부합산 심사 필수
    auditRuleDescription: '공사 정책대출 규정: 기혼자는 부부합산 소득 7천만원(신혼 8.5천만원) 이하 필수 심사',
    eligibility: {
      incomeLimit: 70000000,
      newlywedIncomeLimit: 85000000,
      housePriceLimit: 600000000,
      maxLoanAmount: 360000000,
      firstHomeMaxLoan: 420000000,
      maxLTV: 70
    },
    rates: {
      m10: 4.90, m15: 5.00, m20: 5.05, m30: 5.10, m40: 5.15, m50: 5.20
    },
    preferentialRate: 3.8,
    defaultRate: 3.8,
    badge: '공사 정책'
  },

  // 3. 5대 시중은행 주택담보대출 (매매용)
  commercialBank: {
    name: '시중 1금융권 주택담보대출 (5년 고정 혼합형/주기형)',
    description: '주택 가격 및 소득 제한 없이 LTV/DSR 기준에 맞춰 실행 가능한 은행권 표준 상품',
    source: '전국은행연합회 COFIX 기준 최신 공시',
    auditType: 'flexible', // 차주 단독 신청(단독 DSR) 또는 부부합산 신청 자유 선택 가능
    auditRuleDescription: '은행권 일반 대출: 차주 본인 단독 소득 심사(단독 DSR 40%) 또는 부부합산 심사 중 선택 가능',
    eligibility: {
      incomeLimit: Infinity,
      housePriceLimit: Infinity,
      maxLTV: 70,
      firstHomeMaxLTV: 80
    },
    rateRange: { min: 3.85, max: 4.55 },
    defaultRate: 4.2,
    badge: '1금융권 일반'
  },

  // 4. 전세자금대출 상품군 (전세 전용 신규 탑재)
  jeonse: {
    // 4-1. 주택도시기금 버팀목 전세자금대출 (청년/신혼/일반)
    beotimmok: {
      name: '주택도시기금 버팀목 전세대출',
      description: '무주택 청년·신혼부부 및 서민 대상 정부 초저금리 전세자금대출',
      source: '주택도시기금 공시',
      auditType: 'couple-mandatory', // 신혼/일반은 부부합산 필수, 청년은 단독 전용
      auditRuleDescription: '신혼버팀목은 부부합산(7.5천만 이하/혼인 7년 이내) 필수, 청년버팀목은 단독(5천만 이하) 전용',
      eligibility: {
        incomeLimitGeneral: 50000000, // 일반 5천만원 이하
        incomeLimitNewlywed: 75000000, // 신혼 7.5천만원 이하
        incomeLimitMultiChild: 60000000, // 2자녀 이상 6천만원 이하
        maxDepositCapital: 300000000, // 수도권 보증금 3억 이하 (신혼 4억 이하)
        maxLoanCapital: 120000000, // 일반 수도권 1.2억 (지방 8천만)
        maxLoanNewlywed: 300000000, // 신혼가구 수도권 최대 3.0억 (지방 2억)
        maxLoanYouth: 200000000, // 청년 전용 최대 2.0억 (보증금 3억 이하)
        maxRatio: 80 // 보증금의 최대 80%
      },
      rates: {
        youth: 2.1, // 청년 전용 (연 1.8% ~ 2.7%)
        newlywed: 2.4, // 신혼부부 (연 2.1% ~ 2.9%)
        general: 2.7 // 일반 (연 2.4% ~ 3.1%)
      },
      defaultRate: 2.4,
      badge: '정부 초저리 지원'
    },

    // 4-2. 한국주택금융공사(HF) / HUG 안심전세대출 (생애최초/우대)
    hugHfJeonse: {
      name: 'HUG/HF 안심전세자금대출 (반환보증 결합)',
      description: '전세대출금과 전세보증금 반환보증을 동시 가입하여 보증금을 100% 안전하게 보호하는 상품',
      source: 'HUG 주택도시보증공사 / HF 최신 공시',
      auditType: 'flexible', // 소득 제한 없음, 단독/부부합산 무관
      auditRuleDescription: '소득 심사 무관: 차주 단독 또는 부부합산 제한 없이 누구나 보증금 100% 안전 보호 가입 가능',
      eligibility: {
        incomeLimit: Infinity,
        maxDeposit: 700000000, // 수도권 보증금 7억 이하 (지방 5억 이하)
        maxLoanAmount: 400000000, // 최대 4억원 (보증금의 80%, 청년/신혼 최대 90%)
        maxRatio: 80
      },
      defaultRate: 3.6,
      rateRange: { min: 3.4, max: 3.9 },
      badge: '보증금 보호 결합'
    },

    // 4-3. 5대 시중은행 일반 전세자금대출 (SGI / HF)
    bankJeonse: {
      name: '시중 1금융권 일반 전세자금대출 (SGI 서울보증/HF)',
      description: '소득 및 보증금 제한 없이 최대 5억원 한도로 실행 가능한 1금융권 표준 전세대출',
      source: '5대 시중은행(KB·신한·하나·우리·NH) 공시',
      auditType: 'flexible', // 단독/합산 선택 가능
      auditRuleDescription: '1금융권 일반 전세: 차주 본인 단독 신청 또는 부부합산 신청 중 자유 선택 가능',
      eligibility: {
        incomeLimit: Infinity,
        maxDeposit: Infinity, // SGI 기준 보증금 제한 없음
        maxLoanAmount: 500000000, // SGI 최대 5억 (HF 최대 4억)
        oneHouseMaxLoan: 200000000, // 1주택자는 최대 2억 한도 제한
        multiHouseEligible: false, // 2주택 이상 대출 불가
        maxRatio: 80
      },
      defaultRate: 4.1,
      rateRange: { min: 3.8, max: 4.6 },
      badge: '1금융권 일반'
    }
  },

  // 5. 시중은행 신용대출 (계약금 조달용)
  creditLoan: {
    name: '시중은행 신용대출 (계약금 단기 브릿지론)',
    description: '전세보증금이 묶여 있는 동안 매매/분양 계약금(10%)을 선납하기 위한 단기 대출',
    source: '1금융권 신용대출 평균 금리',
    defaultRate: 4.5,
    rateRange: { min: 4.2, max: 5.5 }
  },

  // 6. 가이드 V4 심사 팩트 기반 대출 적격성 종합 평가 엔진
  evaluateEligibility: function(profile, price, mode = 'resale') {
    const isCouple = profile.householdType === 'couple';
    const isUnder7 = profile.marriagePeriod === 'under7';
    const childCount = Number(profile.childCount) || 0;
    const income = Number(profile.annualIncome) || 0;
    const isHomeless = profile.isHomeless !== false;
    const isFirstHome = profile.isFirstHome !== false;
    const currentPrice = Number(price) || 450000000;

    // 1) 디딤돌대출 판정
    // - 무주택 세대주 필수
    // - 주택가격: 일반 및 생애최초 일반가구 5억 이하 (6억 원 이하는 신혼가구 또는 2자녀 이상 가구에 한정)
    // - 소득 기준:
    //   * 신혼(under7): 부부합산 8,500만 이하
    //   * 기혼 7년 이상(over7) 생애최초 일반가구: 7,000만 원 이하 고정 (자녀 완화 없음!)
    //   * 단독 세대주: 만 30세 이상, 3억 이하/60㎡ 이하, 연소득 6천만 이하
    let didimdolEligible = false;
    let didimdolReason = '';
    let didimdolIncomeLimit = 70000000;
    const didimdolPriceLimit = (isUnder7 || childCount >= 2) ? 600000000 : 500000000;

    if (!isHomeless) {
      didimdolReason = '무주택 세대주 요건 미충족 (유주택자 불가)';
    } else if (currentPrice > didimdolPriceLimit) {
      didimdolReason = `주택가격 한도(${didimdolPriceLimit === 600000000 ? '6억' : '5억'} 이하) 초과 (신혼·2자녀 이상만 6억 적용)`;
    } else if (isCouple) {
      if (isUnder7) {
        didimdolIncomeLimit = 85000000;
        if (income <= didimdolIncomeLimit) {
          didimdolEligible = true;
          didimdolReason = '신혼부부 특례 적격 (부부합산 8,500만 이하 충족)';
        } else {
          didimdolReason = `소득 기준 초과 (신혼 상한 8,500만 원 대비 ${Math.round((income - didimdolIncomeLimit) / 10000)}만 원 초과)`;
        }
      } else {
        // 결혼 7년 초과 가구
        didimdolIncomeLimit = (isFirstHome || childCount >= 2) ? 70000000 : 60000000;
        if (income <= didimdolIncomeLimit) {
          didimdolEligible = true;
          didimdolReason = childCount >= 2
            ? '2자녀 이상 다자녀가구 적격 (부부합산 7,000만 이하 충족)'
            : (isFirstHome ? '생애최초 일반가구 적격 (부부합산 7,000만 이하 충족)' : '일반 무주택가구 적격 (부부합산 6,000만 이하 충족)');
        } else {
          didimdolReason = `소득 기준 초과 (${childCount >= 2 ? '다자녀' : (isFirstHome ? '생애최초' : '일반')} 상한 ${Math.round(didimdolIncomeLimit / 10000)}만 원 대비 ${Math.round((income - didimdolIncomeLimit) / 10000)}만 원 초과)`;
        }
      }
    } else {
      // 단독 세대주
      didimdolIncomeLimit = 60000000;
      if (currentPrice > 300000000) {
        didimdolReason = '단독세대주 주택가격 한도(3억 이하) 초과';
      } else if (income <= didimdolIncomeLimit) {
        didimdolEligible = true;
        didimdolReason = '단독세대주 디딤돌 적격 (6천만 이하, 3억 이하 주택)';
      } else {
        didimdolReason = '단독세대주 소득 기준(6천만 이하) 초과';
      }
    }

    // 2) 보금자리론 판정 (HF 공식 현행 기준)
    // - 주택가격 6억 이하
    // - 소득 기준:
    //   * 다자녀(2자녀 이상): 1억 원 이하
    //   * 1자녀: 9,000만 원 이하
    //   * 신혼(under7, 무자녀): 8,500만 원 이하
    //   * 일반(over7, 무자녀): 7,000만 원 이하
    let bogeumjariEligible = false;
    let bogeumjariReason = '';
    let bogeumjariIncomeLimit = 70000000;

    if (currentPrice > 600000000) {
      bogeumjariReason = '주택가격 6억 원 초과 (취급 불가)';
    } else {
      if (childCount >= 2) {
        bogeumjariIncomeLimit = 100000000;
      } else if (childCount === 1) {
        bogeumjariIncomeLimit = 90000000;
      } else if (isUnder7) {
        bogeumjariIncomeLimit = 85000000;
      } else {
        bogeumjariIncomeLimit = 70000000;
      }

      if (income <= bogeumjariIncomeLimit) {
        bogeumjariEligible = true;
        if (childCount >= 2) {
          bogeumjariReason = `미성년 다자녀 완화 특례 통과 (${childCount}자녀 / 1억 원 이하 충족)`;
        } else if (childCount === 1) {
          bogeumjariReason = '미성년 1자녀 완화 특례 통과 (9,000만 원 이하 충족)';
        } else if (isUnder7) {
          bogeumjariReason = '신혼부부 소득 기준(8,500만 이하) 충족';
        } else {
          bogeumjariReason = isCouple 
            ? '기혼 무자녀 부부합산 소득 기준(7,000만 이하) 충족' 
            : '1인 단독(미혼) 소득 기준(7,000만 이하) 충족';
        }
      } else {
        bogeumjariReason = `소득 상한(${Math.round(bogeumjariIncomeLimit / 10000)}만 원) 초과 (${Math.round((income - bogeumjariIncomeLimit) / 10000)}만 원 초과)`;
      }
    }

    // 3) 시중은행 주택담보대출 판정
    // - 소득/가격 상한선 없음
    // - 생애최초 LTV 80%, 일반 70%, DSR 40% 적용
    const commercialEligible = true;
    const commercialReason = isFirstHome 
      ? '생애최초 LTV 80% 적격 (DSR 40% 한도 내 승인)' 
      : '일반 주택담보대출 LTV 70% 적격 (DSR 40% 적용)';

    // 4) 버팀목 전세대출 판정 (전세용)
    let beotimmokEligible = false;
    let beotimmokReason = '';
    let beotimmokIncomeLimit = 50000000;
    const beotimmokDepositLimit = (isUnder7 || childCount >= 2) ? 400000000 : 300000000;

    if (!isHomeless) {
      beotimmokReason = '무주택 세대주만 신청 가능';
    } else if (mode === 'jeonse' && currentPrice > beotimmokDepositLimit) {
      beotimmokReason = `보증금 한도(${beotimmokDepositLimit === 400000000 ? '4억' : '3억'} 이하) 초과 (신혼·다자녀만 4억 적용)`;
    } else if (isUnder7) {
      beotimmokIncomeLimit = 75000000;
      if (income <= beotimmokIncomeLimit) {
        beotimmokEligible = true;
        beotimmokReason = '신혼부부 버팀목 전세 적격 (부부합산 7,500만 이하)';
      } else {
        beotimmokReason = `신혼 버팀목 소득 상한(7,500만 원) 초과 (${Math.round((income - beotimmokIncomeLimit) / 10000)}만 원 초과)`;
      }
    } else if (!isCouple) {
      // 청년/일반 단독
      beotimmokIncomeLimit = 50000000;
      if (income <= beotimmokIncomeLimit) {
        beotimmokEligible = true;
        beotimmokReason = '청년/일반 단독 버팀목 적격 (5,000만 이하)';
      } else {
        beotimmokReason = `단독 버팀목 소득 상한(5,000만 원) 초과 (${Math.round((income - beotimmokIncomeLimit) / 10000)}만 원 초과)`;
      }
    } else {
      beotimmokIncomeLimit = childCount >= 2 ? 60000000 : 50000000;
      if (income <= beotimmokIncomeLimit) {
        beotimmokEligible = true;
        beotimmokReason = `일반 버팀목 적격 (${Math.round(beotimmokIncomeLimit / 10000)}만 이하 충족)`;
      } else {
        beotimmokReason = `일반 버팀목 소득 상한(${Math.round(beotimmokIncomeLimit / 10000)}만 원) 초과 (${Math.round((income - beotimmokIncomeLimit) / 10000)}만 원 초과)`;
      }
    }

    return {
      didimdol: {
        eligible: didimdolEligible,
        passed: didimdolEligible,
        reason: didimdolReason,
        failReasons: didimdolReason ? [didimdolReason] : [],
        incomeLimit: didimdolIncomeLimit,
        recommendedRate: 3.0,
        badge: didimdolEligible ? '✅ 신청 가능' : '❌ 소득/조건 초과'
      },
      bogeumjari: {
        eligible: bogeumjariEligible,
        passed: bogeumjariEligible,
        reason: bogeumjariReason,
        failReasons: bogeumjariReason ? [bogeumjariReason] : [],
        incomeLimit: bogeumjariIncomeLimit,
        childCount: childCount,
        recommendedRate: 3.8,
        badge: bogeumjariEligible ? '✅ 신청 가능' : '❌ 소득/조건 초과'
      },
      commercial: {
        eligible: commercialEligible,
        passed: commercialEligible,
        reason: commercialReason,
        failReasons: commercialReason ? [commercialReason] : [],
        auditType: isCouple ? 'couple' : 'single',
        recommendedRate: 4.2,
        badge: '✅ 신청 가능 (표준)'
      },
      beotimmok: {
        eligible: beotimmokEligible,
        passed: beotimmokEligible,
        reason: beotimmokReason,
        failReasons: beotimmokReason ? [beotimmokReason] : [],
        incomeLimit: beotimmokIncomeLimit,
        title: isUnder7 ? '신혼 버팀목 전세대출' : (!isCouple ? '청년 버팀목 전세대출' : '일반 버팀목 전세대출'),
        recommendedRate: isUnder7 ? 2.4 : (!isCouple ? 2.1 : 2.4),
        optimalJeonseRate: beotimmokEligible ? (isUnder7 ? 2.4 : (!isCouple ? 2.1 : 2.4)) : 3.6,
        optimalJeonseName: beotimmokEligible ? (isUnder7 ? '신혼 버팀목' : (!isCouple ? '청년 버팀목' : '기금 버팀목')) : 'HUG 안심전세',
        badge: beotimmokEligible
          ? (isUnder7 ? '⭕ 신혼 적격' : (!isCouple ? '⭕ 청년 적격' : '⭕ 일반 적격'))
          : '❌ 버팀목 조건 초과'
      }
    };
  }
};

// 5대 핵심 가구 프로필 사전 설정 (가이드 V4/V5 완벽 매핑)
const HOUSEHOLD_PROFILES = {
  'couple-over7-nochild': {
    id: 'couple-over7-nochild',
    name: '맞벌이 7.7천 (기본)',
    label: '기본형: 맞벌이 7년차·무자녀',
    badge: '👫 맞벌이 7.7천만',
    description: '결혼 7년 이상 생애최초 무주택, 맞벌이 합산 7,700만 원 (디딤돌/보금자리 7천만 초과로 시중은행 주담대 4.2% 적격)',
    householdType: 'couple',
    marriagePeriod: 'over7',
    childCount: 0,
    annualIncome: 77000000,
    monthlyNetIncome: 5300000,
    isFirstHome: true,
    isHomeless: true,
    incomeType: 'double',
    recommendedRate: 4.2,
    recommendedLoanType: 'commercial',
    recommendedJeonseRate: 3.6,
    recommendedJeonseType: 'hug',
    recommendedJeonseName: 'HUG 안심전세'
  },
  'single-earner-strategy': {
    id: 'single-earner-strategy',
    name: '외벌이 전략 (5.12천)',
    label: '전략형: 외벌이 전환·무자녀',
    badge: '⚡ 외벌이 5.12천만 (디딤돌)',
    description: '배우자 서류상 무직 전환 시 단독 5,120만 원 인정 ➔ 디딤돌 3.0% 전격 합격 (30년 총이자 약 5,100만 원 순절감)',
    householdType: 'couple',
    marriagePeriod: 'over7',
    childCount: 0,
    annualIncome: 51200000,
    monthlyNetIncome: 3700000,
    isFirstHome: true,
    isHomeless: true,
    incomeType: 'single-earner',
    recommendedRate: 3.0,
    recommendedLoanType: 'didimdol',
    recommendedJeonseRate: 3.6,
    recommendedJeonseType: 'hug',
    recommendedJeonseName: 'HUG 안심전세'
  },
  'couple-with-child': {
    id: 'couple-with-child',
    name: '1자녀 보금자리 (7.7천)',
    label: '유자녀형: 1자녀 이상·맞벌이',
    badge: '👨‍👩‍👧 1자녀 맞벌이 7.7천만 (보금자리)',
    description: '결혼 7년 이상이라도 미성년 1자녀 시 보금자리론 소득 9,000만 원 이하 완화 특례 통과 (연 3.8% 장기 고정금리 적격)',
    householdType: 'couple',
    marriagePeriod: 'over7',
    childCount: 1,
    annualIncome: 77000000,
    monthlyNetIncome: 5300000,
    isFirstHome: true,
    isHomeless: true,
    incomeType: 'double',
    recommendedRate: 3.8,
    recommendedLoanType: 'bogeumjari',
    recommendedJeonseRate: 3.6,
    recommendedJeonseType: 'hug',
    recommendedJeonseName: 'HUG 안심전세'
  },
  'newlywed-couple': {
    id: 'newlywed-couple',
    name: '신혼부부 7년이내',
    label: '신혼형: 혼인 7년 이내·신혼부부',
    badge: '💍 신혼 7년이내 7.5천만',
    description: '혼인 7년 이내 신혼 특례 적용: 디딤돌 부부합산 8,500만 이하 & 신혼 버팀목 7,500만 이하 초저금리 정책 수혜',
    householdType: 'couple',
    marriagePeriod: 'under7',
    childCount: 0,
    annualIncome: 75000000,
    monthlyNetIncome: 5180000,
    isFirstHome: true,
    isHomeless: true,
    incomeType: 'double',
    recommendedRate: 3.0,
    recommendedLoanType: 'didimdol',
    recommendedJeonseRate: 2.4,
    recommendedJeonseType: 'beotimmok-newlywed',
    recommendedJeonseName: '신혼 버팀목'
  },
  'single-household': {
    id: 'single-household',
    name: '1인 단독 세대주',
    label: '단독형: 1인 단독 세대주',
    badge: '👤 1인 세대주 5천만',
    description: '차주 본인 단독 심사: 보금자리론(연 3.8%·6억이하 단독신청) 및 생애최초 시중 주담대(연 4.2%), 청년 전용 버팀목 전세대출(연 2.1%) 적격',
    householdType: 'single',
    marriagePeriod: 'single',
    childCount: 0,
    annualIncome: 50000000,
    monthlyNetIncome: 3600000,
    isFirstHome: true,
    isHomeless: true,
    incomeType: 'individual',
    recommendedRate: 3.8,
    recommendedLoanType: 'bogeumjari',
    recommendedJeonseRate: 2.1,
    recommendedJeonseType: 'beotimmok-youth',
    recommendedJeonseName: '청년 버팀목'
  }
};

// UI 프리셋 ID 매핑 별칭 (Alias)
HOUSEHOLD_PROFILES['couple-double'] = HOUSEHOLD_PROFILES['couple-over7-nochild'];
HOUSEHOLD_PROFILES['couple-single-earner'] = HOUSEHOLD_PROFILES['single-earner-strategy'];
HOUSEHOLD_PROFILES['couple-child1'] = HOUSEHOLD_PROFILES['couple-with-child'];
HOUSEHOLD_PROFILES['newlywed'] = HOUSEHOLD_PROFILES['newlywed-couple'];
HOUSEHOLD_PROFILES['single'] = HOUSEHOLD_PROFILES['single-household'];

// 전역 INTEREST_RATES_DATA 네임스페이스에 명시적 연결
if (typeof INTEREST_RATES_DATA !== 'undefined') {
  INTEREST_RATES_DATA.HOUSEHOLD_PROFILES = HOUSEHOLD_PROFILES;
}

// 세제 및 중개보수 법정 기준
const STATUTORY_RATES = {
  // 생애최초 주택 취득세 감면 한도 (지방세특례제한법 제36조의3)
  firstHomeTaxDeductionLimit: 2000000,
  
  // 주택 취득세율 (1주택/무주택자)
  getAcquisitionTaxRate: function(price) {
    if (price <= 600000000) {
      return { baseRate: 0.01, eduRate: 0.001, totalRate: 0.011, desc: '1.0% (지방교육세 0.1% 별도)' };
    } else if (price <= 900000000) {
      const ratePercent = (price * (2 / 300000000) - 3);
      const baseRate = ratePercent / 100;
      const eduRate = baseRate * 0.1;
      return { baseRate: baseRate, eduRate: eduRate, totalRate: baseRate + eduRate, desc: `${ratePercent.toFixed(2)}% (비례 누진세율)` };
    } else {
      return { baseRate: 0.03, eduRate: 0.003, totalRate: 0.033, desc: '3.0% (지방교육세 0.3% 별도)' };
    }
  },

  // 공인중개사 중개보수 법정 상한 요율 (매매·교환)
  getBrokerageRate: function(price) {
    if (price < 50000000) {
      return { maxRate: 0.006, limit: 250000, desc: '0.6% (한도 25만원)' };
    } else if (price < 200000000) {
      return { maxRate: 0.005, limit: 800000, desc: '0.5% (한도 80만원)' };
    } else if (price < 900000000) {
      return { maxRate: 0.004, limit: null, desc: '0.4% (상한 없음)' };
    } else if (price < 1200000000) {
      return { maxRate: 0.005, limit: null, desc: '0.5% (상한 없음)' };
    } else if (price < 1500000000) {
      return { maxRate: 0.006, limit: null, desc: '0.6% (상한 없음)' };
    } else {
      return { maxRate: 0.007, limit: null, desc: '0.7% (상한 없음)' };
    }
  },

  // 공인중개사 전세·임대차 중개보수 법정 상한 요율
  getJeonseBrokerageRate: function(deposit) {
    if (deposit < 50000000) {
      return { maxRate: 0.005, limit: 200000, desc: '0.5% (한도 20만원)' };
    } else if (deposit < 100000000) {
      return { maxRate: 0.004, limit: 300000, desc: '0.4% (한도 30만원)' };
    } else if (deposit < 600000000) {
      return { maxRate: 0.003, limit: null, desc: '0.3% (상한 없음)' };
    } else if (deposit < 1200000000) {
      return { maxRate: 0.004, limit: null, desc: '0.4% (상한 없음)' };
    } else if (deposit < 1500000000) {
      return { maxRate: 0.005, limit: null, desc: '0.5% (상한 없음)' };
    } else {
      return { maxRate: 0.006, limit: null, desc: '0.6% (상한 없음)' };
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INTEREST_RATES_DATA, HOUSEHOLD_PROFILES, STATUTORY_RATES };
}
