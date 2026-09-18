/**
 * 부동산 매매, 분양, 전세자금대출 실전 4단계 타임라인 시나리오 엔진
 */
const ScenarioEngine = {
  /**
   * 숫자를 한국식 억/만 원 포맷으로 변환 (예: 350000000 -> 3억 5,000만 원, 400000000 -> 4억 원, 120000000 -> 1억 2,000만 원)
   */
  formatKoreanMoney: function(amount, roundToTenThousand = true) {
    if (!amount || amount === 0) return '0원';
    let target = Math.abs(amount);
    if (roundToTenThousand) {
      target = Math.round(target / 10000) * 10000;
    }
    const eok = Math.floor(target / 100000000);
    const man = Math.floor((target % 100000000) / 10000);
    const rest = target % 10000;

    let result = '';
    if (eok > 0) {
      result += `${eok}억 `;
    }
    if (man > 0) {
      result += `${man.toLocaleString()}만 `;
    }
    if (rest > 0 && eok === 0 && man === 0) {
      result += `${rest.toLocaleString()} `;
    }
    result = result.trim() + ' 원';
    return amount < 0 ? `-${result}` : result;
  },

  /**
   * 만원 단위 금액 텍스트 변환 (예: 587187 -> 약 58.7만 원, 77000000 -> 7,700만 원)
   */
  formatTenThousand: function(amount, isApprox = true) {
    const rawMan = amount / 10000;
    let manStr = '';
    if (rawMan >= 1000 && Number.isInteger(rawMan)) {
      manStr = rawMan.toLocaleString();
    } else if (Number.isInteger(rawMan)) {
      manStr = rawMan.toString();
    } else {
      manStr = rawMan.toFixed(1);
    }
    const prefix = isApprox ? '약 ' : '';
    return `${prefix}${manStr}만 원`;
  },

  /**
   * 구축/기축 아파트 일반 매매 시나리오 생성
   */
  generateResaleScenario: function(params) {
    const {
      householdType = 'couple', // 'couple' (부부합산) | 'single' (세대주 혼자/1인)
      marriagePeriod = 'over7', // 'over7' (7년 이상) | 'under7' (7년 이내 신혼)
      childCount = 0, // 0 | 1 | 2 | 3
      incomeType = 'double', // 'double' (맞벌이) | 'single-earner' (외벌이) | 'individual' (단독)
      price = 450000000,
      equity = 250000000,
      annualIncome = 77000000,
      monthlyNetIncome = 5300000,
      loanRate = 4.2,
      loanYears = 30,
      repayType = 'equal-payment',
      creditLoanRate = 4.5,
      isFirstHome = true,
      isHomeless = true,
      customRefurbishCost = null
    } = params;

    // 1. 부대비용 및 총 필요 예산 계산 (필수 + 선택 이원화)
    const expenseData = TaxCalculator.calculateTotalResaleExpenses(price, isFirstHome, {
      customRefurbishCost,
      customMoveinCost: params.customMoveinCost ?? null,
      includeMovein: params.includeMovein !== false
    });
    const mandatoryExpense = expenseData.totalMandatory;
    const optionalExpense = expenseData.totalOptional;
    const totalExpense = expenseData.totalExpense;
    const actualMandatory = params.includeMandatory === false ? 0 : mandatoryExpense;

    // 순수 취득 기준 vs 최종 입주 완비 기준 예산
    const pureTotalBudget = price + actualMandatory;
    const fullTotalBudget = price + actualMandatory + (expenseData.isMoveinIncluded ? optionalExpense : 0);
    const totalBudget = fullTotalBudget;

    // 2. 필요 주택담보대출 계산 (매매 희망 금액 - 보유 순자산)
    const requiredLoan = Math.max(0, price - equity);
    const pureRequiredLoan = requiredLoan;
    const fullRequiredLoan = requiredLoan;

    const pureLtv = LoanCalculator.calculateLTV(pureRequiredLoan, price);
    const fullLtv = LoanCalculator.calculateLTV(fullRequiredLoan, price);
    const ltv = fullLtv;

    // 3. 월 원리금 상환액 및 건전성
    const monthlyPayment = LoanCalculator.calculateFirstMonthPayment(requiredLoan, loanRate, loanYears, repayType);
    const pureMonthlyPayment = LoanCalculator.calculateFirstMonthPayment(pureRequiredLoan, loanRate, loanYears, repayType);
    const annualRepayment = monthlyPayment * 12;
    const dsr = LoanCalculator.calculateDSR(annualRepayment, annualIncome);
    const pureDsr = LoanCalculator.calculateDSR(pureMonthlyPayment * 12, annualIncome);
    const housingRatio = LoanCalculator.calculateHousingCostRatio(monthlyPayment, monthlyNetIncome);

    // 정책모기지 (디딤돌 3.0% 기준) 월 상환액
    const didimdolPayment = LoanCalculator.calculateFirstMonthPayment(requiredLoan, 3.0, loanYears, repayType);

    // 3-2. 가이드 V5 맞벌이(시중은행) vs 외벌이/무직(디딤돌) 금융비용 정밀 비교
    const commercial30YrTotalInterest = Math.max(0, (monthlyPayment * loanYears * 12) - requiredLoan);
    const didimdol30YrTotalInterest = Math.max(0, (didimdolPayment * loanYears * 12) - requiredLoan);
    const strategyComparison = {
      loanAmount: requiredLoan,
      commercialRate: loanRate,
      commercialMonthly: monthlyPayment,
      commercialTotalInterest: commercial30YrTotalInterest,
      didimdolRate: 3.0,
      didimdolMonthly: didimdolPayment,
      didimdolTotalInterest: didimdol30YrTotalInterest,
      monthlySaving: Math.max(0, monthlyPayment - didimdolPayment),
      totalInterestSaving: Math.max(0, commercial30YrTotalInterest - didimdol30YrTotalInterest)
    };

    // 4. 4단계 타임라인 세부 수치 계산
    // 1단계: 계약금 10%
    const downPayment = Math.floor(price * 0.1);
    const creditLoanMonthlyInterest = Math.round(downPayment * (creditLoanRate / 100) / 12);
    // 신용대출(10년 상환 가정 또는 원리금) 포함 합산 DSR
    const creditLoanAnnualInterest = downPayment * (creditLoanRate / 100);
    const combinedDSR = LoanCalculator.calculateDSR(annualRepayment + creditLoanAnnualInterest + (downPayment / 10), annualIncome);

    // 3단계: 잔금 당일 정산
    const step3_mortgage = requiredLoan;
    const step3_deposit = equity;
    const step3_remainPrice = price - downPayment - requiredLoan;
    const step3_creditLoanPayoff = downPayment;
    const step3_expenses = totalExpense;

    // 4단계: 입주 후 가계 잉여 자금
    const isCouple = householdType === 'couple';
    const estimatedLivingCostMin = isCouple ? 2000000 : 1200000;
    const estimatedLivingCostMax = isCouple ? 2300000 : 1500000;
    const surplusMin = monthlyNetIncome - monthlyPayment - estimatedLivingCostMax;
    const surplusMax = monthlyNetIncome - monthlyPayment - estimatedLivingCostMin;

    // 금리/만기 비교 매트릭스
    const comparisonMatrix = LoanCalculator.generateComparisonMatrix(requiredLoan, monthlyNetIncome, price);

    // 가이드 V5 심사 팩트 기반 적격성 진단
    const userProfile = {
      householdType,
      marriagePeriod,
      childCount,
      annualIncome,
      monthlyNetIncome,
      isFirstHome,
      isHomeless,
      incomeType
    };
    const eligibility = (typeof INTEREST_RATES_DATA !== 'undefined' && INTEREST_RATES_DATA.evaluateEligibility)
      ? INTEREST_RATES_DATA.evaluateEligibility(userProfile, price, 'resale')
      : null;

    // 심사 규정 및 적격성 정보
    const isCoupleMandatory = (Math.abs(loanRate - 3.0) < 0.05 || Math.abs(loanRate - 3.8) < 0.05);
    const auditInfo = {
      isCouple,
      marriagePeriod,
      childCount,
      householdLabel: isCouple ? (marriagePeriod === 'under7' ? '💍 신혼부부 (혼인 7년 이내)' : '👫 기혼 (혼인 7년 이상)') : '👤 세대주 혼자 (1인 단독)',
      auditMethodName: isCouple ? '기혼 부부합산 심사 (배우자 소득·부채 합산)' : '차주 단독 심사 (본인 단독 DSR 40%)',
      isCoupleMandatory,
      eligibility,
      auditRuleDesc: isCouple
        ? '정부 정책대출(디딤돌·보금자리)의 부부합산 필수 규정을 충족하며, 시중은행 대출 시에도 부부합산 DSR 적용 가능'
        : '보금자리론(연 3.8%·단독신청) 및 시중은행 일반 주택담보대출(생애최초 LTV 80%)의 본인 단독 심사 규정 적용'
    };

    return {
      type: 'resale',
      householdType,
      isCouple,
      auditInfo,
      price,
      equity,
      annualIncome,
      monthlyNetIncome,
      loanRate,
      loanYears,
      isFirstHome,
      expenseData,
      mandatoryExpense,
      optionalExpense,
      totalExpense,
      pureTotalBudget,
      fullTotalBudget,
      totalBudget,
      pureRequiredLoan,
      fullRequiredLoan,
      requiredLoan,
      pureLtv,
      fullLtv,
      ltv,
      pureMonthlyPayment,
      monthlyPayment,
      lastMonthlyPayment: LoanCalculator.calculateLastMonthPayment(requiredLoan, loanRate, loanYears, repayType),
      didimdolPayment,
      pureDsr,
      dsr,
      housingRatio,
      downPayment,
      creditLoanMonthlyInterest,
      combinedDSR,
      isMoveinIncluded: expenseData.isMoveinIncluded,
      step3: {
        mortgage: step3_mortgage,
        deposit: step3_deposit,
        remainPrice: step3_remainPrice,
        creditLoanPayoff: step3_creditLoanPayoff,
        expenses: step3_expenses
      },
      livingCostDesc: isCouple ? '200만~230만 원' : '120만~150만 원',
      surplusMin,
      surplusMax,
      comparisonMatrix,
      userProfile,
      strategyComparison,
      eligibility
    };
  },

  /**
   * 신축 아파트 분양/청약 시나리오 생성
   */
  generatePresaleScenario: function(params) {
    const {
      householdType = 'couple',
      marriagePeriod = 'over7',
      childCount = 0,
      incomeType = 'double',
      price = 450000000,
      equity = 250000000,
      annualIncome = 77000000,
      monthlyNetIncome = 5300000,
      loanRate = 4.2,
      loanYears = 30,
      repayType = 'equal-payment',
      creditLoanRate = 4.5,
      isFirstHome = true,
      isHomeless = true,
      customOptionCost = null
    } = params;

    // 1. 부대비용 (취득세 + 옵션/발코니 + 등기비)
    const expenseData = TaxCalculator.calculateTotalPresaleExpenses(price, isFirstHome, {
      customOptionCost,
      customMoveinCost: params.customMoveinCost ?? null,
      includeMovein: params.includeMovein !== false
    });
    const mandatoryExpense = expenseData.totalMandatory;
    const optionalExpense = expenseData.totalOptional;
    const totalExpense = expenseData.totalExpense;

    const actualMandatory = params.includeMandatory === false ? 0 : mandatoryExpense;
    // 순수 취득 기준 vs 최종 입주 완비 기준 예산
    const fullTotalBudget = price + actualMandatory + (expenseData.isMoveinIncluded ? optionalExpense : 0);
    const pureTotalBudget = price + actualMandatory;
    const totalBudget = fullTotalBudget;

    // 2. 필요 주택담보대출 (잔금 대출) = 매매 희망 금액 - 보유 순자산
    const requiredLoan = Math.max(0, price - equity);
    const pureRequiredLoan = requiredLoan;
    const fullRequiredLoan = requiredLoan;

    const pureLtv = LoanCalculator.calculateLTV(pureRequiredLoan, price);
    const fullLtv = LoanCalculator.calculateLTV(fullRequiredLoan, price);
    const ltv = fullLtv;

    // 3. 월 상환액 및 DSR
    const monthlyPayment = LoanCalculator.calculateFirstMonthPayment(requiredLoan, loanRate, loanYears, repayType);
    const pureMonthlyPayment = LoanCalculator.calculateFirstMonthPayment(pureRequiredLoan, loanRate, loanYears, repayType);
    const annualRepayment = monthlyPayment * 12;
    const dsr = LoanCalculator.calculateDSR(annualRepayment, annualIncome);
    const pureDsr = LoanCalculator.calculateDSR(pureMonthlyPayment * 12, annualIncome);
    const housingRatio = LoanCalculator.calculateHousingCostRatio(monthlyPayment, monthlyNetIncome);

    const didimdolPayment = LoanCalculator.calculateFirstMonthPayment(requiredLoan, 3.0, loanYears, repayType);
    // 4. 4단계 타임라인
    const downPayment = Math.floor(price * 0.1);
    const creditLoanMonthlyInterest = Math.round(downPayment * (creditLoanRate / 100) / 12);
    const middlePayment = Math.floor(price * 0.6);
    const finalBalancePayment = Math.floor(price * 0.3);

    // 3단계 일괄 정산표
    const inflowTotal = requiredLoan + equity;
    const outflowMiddle = middlePayment;
    const outflowRemain = finalBalancePayment;
    const outflowCreditLoan = downPayment;
    const outflowExpense = totalExpense;
    const outflowTotal = outflowMiddle + outflowRemain + outflowCreditLoan + outflowExpense;

    // 4단계 잉여 자금
    const isCouple = householdType === 'couple';
    const estimatedLivingCostMin = isCouple ? 2000000 : 1200000;
    const estimatedLivingCostMax = isCouple ? 2300000 : 1500000;
    const surplusMin = monthlyNetIncome - monthlyPayment - estimatedLivingCostMax;
    const surplusMax = monthlyNetIncome - monthlyPayment - estimatedLivingCostMin;

    // 금리/만기 비교 매트릭스
    const comparisonMatrix = LoanCalculator.generateComparisonMatrix(requiredLoan, monthlyNetIncome, price);

    // 가이드 V5 심사 팩트 기반 적격성 진단
    const userProfile = {
      householdType,
      marriagePeriod,
      childCount,
      annualIncome,
      monthlyNetIncome,
      isFirstHome,
      isHomeless,
      incomeType
    };
    const eligibility = (typeof INTEREST_RATES_DATA !== 'undefined' && INTEREST_RATES_DATA.evaluateEligibility)
      ? INTEREST_RATES_DATA.evaluateEligibility(userProfile, price, 'presale')
      : null;

    // 심사 규정 및 적격성 정보
    const isCoupleMandatory = (Math.abs(loanRate - 3.0) < 0.05 || Math.abs(loanRate - 3.8) < 0.05);
    const auditInfo = {
      isCouple,
      marriagePeriod,
      childCount,
      householdLabel: isCouple ? (marriagePeriod === 'under7' ? '💍 신혼부부 (혼인 7년 이내)' : '👫 기혼 (혼인 7년 이상)') : '👤 세대주 혼자 (1인 단독)',
      auditMethodName: isCouple ? '기혼 부부합산 심사 (배우자 소득·부채 합산)' : '차주 단독 심사 (본인 단독 DSR 40%)',
      isCoupleMandatory,
      eligibility,
      auditRuleDesc: isCouple
        ? '정부 정책대출(디딤돌·보금자리)의 부부합산 필수 규정을 충족하며, 시중은행 신축 잔금대출 시에도 부부합산 DSR 적용 가능'
        : '보금자리론(연 3.8%·단독신청) 및 시중은행 신축 잔금대출(생애최초 LTV 80%)의 본인 단독 심사 규정 적용'
    };

    return {
      type: 'presale',
      householdType,
      isCouple,
      auditInfo,
      price,
      equity,
      annualIncome,
      monthlyNetIncome,
      loanRate,
      loanYears,
      isFirstHome,
      expenseData,
      mandatoryExpense,
      optionalExpense,
      totalExpense,
      pureTotalBudget,
      fullTotalBudget,
      totalBudget,
      pureRequiredLoan,
      fullRequiredLoan,
      requiredLoan,
      pureLtv,
      fullLtv,
      ltv,
      pureMonthlyPayment,
      monthlyPayment,
      lastMonthlyPayment: LoanCalculator.calculateLastMonthPayment(requiredLoan, loanRate, loanYears, repayType),
      pureDsr,
      dsr,
      housingRatio,
      downPayment,
      middlePayment,
      finalBalancePayment,
      creditLoanMonthlyInterest,
      isMoveinIncluded: expenseData.isMoveinIncluded,
      step3: {
        inflowMortgage: requiredLoan,
        inflowDeposit: equity,
        inflowTotal: inflowTotal,
        outflowMiddle: outflowMiddle,
        outflowRemain: outflowRemain,
        outflowCreditLoan: outflowCreditLoan,
        outflowExpense: outflowExpense,
        outflowTotal: outflowTotal
      },
      livingCostDesc: isCouple ? '200만~230만 원' : '120만~150만 원',
      surplusMin,
      surplusMax,
      comparisonMatrix,
      userProfile,
      eligibility
    };
  },

  /**
   * 전세자금대출 실전 4단계 로드맵 시나리오 생성 (신규 탑재)
   */
  generateJeonseScenario: function(params) {
    const {
      householdType = 'couple',
      marriagePeriod = 'over7',
      childCount = 0,
      incomeType = 'double',
      deposit = 250000000, // 전세보증금 (원)
      equity = 50000000, // 보유 자기자본/현금 (원)
      annualIncome = 77000000,
      monthlyNetIncome = 5300000,
      loanRate = 2.4, // 전세대출 적용 금리 (%)
      repayType = 'interest-only', // 'interest-only' (만기일시-월이자만) | 'equal-payment' (원리금균등)
      isHomeless = true,
      isNewlywed = false,
      isYouth = false,
      customMoveinCost = null,
      includeMovein = true
    } = params;

    // 1. 필요 전세자금대출 계산 (전세보증금 - 보유 현금)
    const requiredLoan = Math.max(0, deposit - equity);
    const loanRatio = Number(((requiredLoan / deposit) * 100).toFixed(1));

    // 2. 부대비용 산출 (필수 + 선택 이원화)
    // 필수: 중개보수
    const brokerageInfo = STATUTORY_RATES.getJeonseBrokerageRate(deposit);
    let brokerageFee = Math.floor(deposit * brokerageInfo.maxRate);
    if (brokerageInfo.limit && brokerageFee > brokerageInfo.limit) {
      brokerageFee = brokerageInfo.limit;
    }
    const brokerageVat = Math.floor(brokerageFee * 0.1);
    const totalBrokerage = brokerageFee + brokerageVat;

    // 필수: HUG 전세보증금 반환보증료 (2년 전세 기준 약 0.256%)
    const guaranteeFee = Math.round(deposit * 0.00256);
    // 필수: 인지세 (1억원 초과 75,000원의 고객 분담분 50% = 37,500원)
    const stampDuty = requiredLoan > 100000000 ? 37500 : 0;
    
    const mandatoryExpense = totalBrokerage + guaranteeFee + stampDuty;
    const optionalExpense = (includeMovein && customMoveinCost) ? customMoveinCost : 0;
    const totalExpense = mandatoryExpense + optionalExpense;
    
    const actualMandatory = params.includeMandatory === false ? 0 : mandatoryExpense;
    const pureTotalBudget = deposit + actualMandatory;
    const fullTotalBudget = deposit + actualMandatory + optionalExpense;
    const totalBudget = fullTotalBudget;

    // 3. 월 상환 부담금 산출
    let monthlyPayment = 0;
    if (repayType === 'equal-payment') {
      monthlyPayment = LoanCalculator.calculateEqualPayment(requiredLoan, loanRate, 2); // 2년 원리금
    } else {
      monthlyPayment = LoanCalculator.calculateInterestOnly(requiredLoan, loanRate); // 만기일시 월 순수 이자
    }
    const housingRatio = LoanCalculator.calculateHousingCostRatio(monthlyPayment, monthlyNetIncome);

    // 4. 계약금 (보증금의 10% 또는 5%)
    const downPayment = Math.floor(deposit * 0.1);
    const remainDeposit = deposit - downPayment;

    // 5. 가계 잉여 자금 산정
    const isCouple = householdType === 'couple';
    const estimatedLivingCostMin = isCouple ? 2000000 : 1200000;
    const estimatedLivingCostMax = isCouple ? 2300000 : 1500000;
    const surplusMin = monthlyNetIncome - monthlyPayment - estimatedLivingCostMax;
    const surplusMax = monthlyNetIncome - monthlyPayment - estimatedLivingCostMin;

    // 금리별 비교 매트릭스
    const comparisonMatrix = LoanCalculator.generateJeonseComparisonMatrix(requiredLoan, monthlyNetIncome, deposit, repayType);

    // 가이드 V5 심사 팩트 기반 적격성 진단
    const userProfile = {
      householdType,
      marriagePeriod,
      childCount,
      annualIncome,
      monthlyNetIncome,
      isFirstHome: false,
      isHomeless,
      incomeType
    };
    const eligibility = (typeof INTEREST_RATES_DATA !== 'undefined' && INTEREST_RATES_DATA.evaluateEligibility)
      ? INTEREST_RATES_DATA.evaluateEligibility(userProfile, deposit, 'jeonse')
      : null;

    // 심사 규정 및 적격성 정보
    const isCoupleMandatory = (Math.abs(loanRate - 2.4) < 0.05);
    const auditInfo = {
      isCouple,
      marriagePeriod,
      childCount,
      householdLabel: isCouple ? (marriagePeriod === 'under7' ? '💍 신혼부부 (혼인 7년 이내)' : '👫 기혼 (혼인 7년 이상)') : '👤 세대주 혼자 (1인 단독)',
      auditMethodName: isCouple ? '기혼 부부합산 심사' : '단독 세대주 심사',
      isCoupleMandatory,
      eligibility,
      auditRuleDesc: isCouple
        ? '신혼 버팀목(부부합산 7.5천만 이하) 및 HUG 안심전세/시중은행 전세대출 적격'
        : 'HUG 안심전세(소득 무관) 및 시중은행 전세대출(단독 DSR), 청년 버팀목(5천만 이하) 적격'
    };

    return {
      type: 'jeonse',
      householdType,
      isCouple,
      auditInfo,
      deposit,
      equity,
      annualIncome,
      monthlyNetIncome,
      loanRate,
      repayType,
      isHomeless,
      isNewlywed,
      isYouth,
      expenseData: {
        brokerageInfo,
        totalBrokerage,
        guaranteeFee,
        stampDuty,
        totalMandatory: mandatoryExpense,
        totalOptional: optionalExpense,
        totalExpense
      },
      mandatoryExpense,
      optionalExpense,
      pureTotalBudget,
      fullTotalBudget,
      brokerageFee: totalBrokerage,
      guaranteeFee,
      stampDuty,
      totalExpense,
      totalBudget,
      requiredLoan,
      pureRequiredLoan: Math.max(0, pureTotalBudget - equity),
      fullRequiredLoan: Math.max(0, fullTotalBudget - equity),
      loanRatio,
      monthlyPayment,
      housingRatio,
      downPayment,
      remainDeposit,
      isMoveinIncluded: includeMovein,
      livingCostDesc: isCouple ? '200만~230만 원' : '120만~150만 원',
      surplusMin,
      surplusMax,
      comparisonMatrix,
      userProfile,
      eligibility
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScenarioEngine;
}
