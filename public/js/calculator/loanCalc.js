/**
 * 대출 상환액, DSR, LTV, 건전성 지표 계산 모듈 (매매/분양/전세대출 공용)
 */
const LoanCalculator = {
  /**
   * 원리금 균등분할상환 월 상환액 산출
   * @param {number} principal 대출 원금 (원)
   * @param {number} annualRate 연이율 (%, 예: 4.2)
   * @param {number} years 대출 기간 (년, 예: 30)
   * @returns {number} 월 원리금 상환액 (원)
   */
  calculateEqualPayment: function(principal, annualRate, years) {
    if (!principal || principal <= 0) return 0;
    if (!annualRate || annualRate <= 0) return Math.floor(principal / (years * 12));
    
    const monthlyRate = (annualRate / 100) / 12;
    const totalMonths = years * 12;
    
    // PMT = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    const monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
    
    return Math.round(monthlyPayment);
  },

  calculateFirstMonthPayment: function(principal, annualRate, years, repayType) {
    if (repayType === 'interest-only') {
      return this.calculateInterestOnly(principal, annualRate);
    }
    if (repayType === 'equal-principal') {
      const principalMonthly = principal / (years * 12);
      const firstMonthInterest = principal * (annualRate / 100) / 12;
      return Math.round(principalMonthly + firstMonthInterest);
    }
    if (repayType === 'graduated') {
      const g = 0.002;
      const rate = (annualRate / 100) / 12;
      const term = years * 12;
      if (rate === g) {
        return Math.round(principal * (1 + rate) / term);
      } else {
        const q = (1 + g) / (1 + rate);
        return Math.round(principal * (1 + rate) * (1 - q) / (1 - Math.pow(q, term)));
      }
    }
    return this.calculateEqualPayment(principal, annualRate, years);
  },

  calculateLastMonthPayment: function(principal, annualRate, years, repayType) {
    if (repayType === 'interest-only') return this.calculateInterestOnly(principal, annualRate);
    if (repayType === 'equal-payment') return this.calculateEqualPayment(principal, annualRate, years);
    
    if (repayType === 'equal-principal') {
      const principalMonthly = principal / (years * 12);
      const lastMonthInterest = principalMonthly * (annualRate / 100) / 12;
      return Math.round(principalMonthly + lastMonthInterest);
    }
    
    if (repayType === 'graduated') {
      const g = 0.002;
      const rate = (annualRate / 100) / 12;
      const term = years * 12;
      let pmt1 = 0;
      if (rate === g) {
        pmt1 = principal * (1 + rate) / term;
      } else {
        const q = (1 + g) / (1 + rate);
        pmt1 = principal * (1 + rate) * (1 - q) / (1 - Math.pow(q, term));
      }
      return Math.round(pmt1 * Math.pow(1 + g, term - 1));
    }
    
    return this.calculateEqualPayment(principal, annualRate, years);
  },

  /**
   * 전세대출/만기일시상환 월 순수 이자 산출
   * @param {number} principal 대출 원금 (원)
   * @param {number} annualRate 연이율 (%, 예: 2.4)
   * @returns {number} 월 이자 납입액 (원)
   */
  calculateInterestOnly: function(principal, annualRate) {
    if (!principal || principal <= 0 || !annualRate || annualRate <= 0) return 0;
    return Math.round(principal * (annualRate / 100) / 12);
  },

  /**
   * 첫 달 원금 및 이자 구성 산출 (원리금균등 기준)
   */
  calculateFirstMonthDetail: function(principal, annualRate, years) {
    const monthlyPayment = this.calculateEqualPayment(principal, annualRate, years);
    const monthlyRate = (annualRate / 100) / 12;
    const firstMonthInterest = Math.round(principal * monthlyRate);
    const firstMonthPrincipal = Math.max(0, monthlyPayment - firstMonthInterest);
    
    return {
      monthlyPayment,
      firstMonthInterest,
      firstMonthPrincipal
    };
  },

  /**
   * LTV (주택담보대출비율 / 전세가 대비 대출비율) 산출
   */
  calculateLTV: function(loanAmount, housePrice) {
    if (!housePrice || housePrice <= 0) return 0;
    return Number(((loanAmount / housePrice) * 100).toFixed(1));
  },

  /**
   * DSR (총부채원리금상환비율) 산출
   */
  calculateDSR: function(annualPrincipalInterest, annualIncome) {
    if (!annualIncome || annualIncome <= 0) return 0;
    return Number(((annualPrincipalInterest / annualIncome) * 100).toFixed(1));
  },

  /**
   * 월 실수령액 대비 주거비 지출 비중 산출
   */
  calculateHousingCostRatio: function(monthlyPayment, monthlyNetIncome) {
    if (!monthlyNetIncome || monthlyNetIncome <= 0) return 0;
    return Number(((monthlyPayment / monthlyNetIncome) * 100).toFixed(1));
  },

  /**
   * 매매/분양 금리 및 만기 조건별 비교 매트릭스 산출
   */
  generateComparisonMatrix: function(loanAmount, monthlyNetIncome, housePrice) {
    const conditions = [
      { rate: 4.8, years: 30, desc: '시중 1금융권 일반 주택담보대출 기본 모델' },
      { rate: 3.8, years: 30, desc: 'HF 한국주택금융공사 일반 보금자리론 또는 우대금리 적용 시' },
      { 
        rate: 3.0, 
        years: 30, 
        desc: housePrice <= 500000000 
          ? '주택가격 5억 이하 생애최초 디딤돌대출 최우선 적격' 
          : '생애최초 디딤돌/신생아 특례 등 정책모기지 최저금리 적용 시' 
      },
      { rate: 4.8, years: 20, desc: '원금 상환 속도를 높여 총 이자 비용을 대폭 절감하는 공격적 상환 모델' },
      { rate: 4.8, years: 35, desc: '만기 연장을 통해 월 고정 지출을 추가 경감하는 모델' }
    ];

    return conditions.map(cond => {
      const monthlyPayment = this.calculateEqualPayment(loanAmount, cond.rate, cond.years);
      const ratio = this.calculateHousingCostRatio(monthlyPayment, monthlyNetIncome);
      return {
        rate: cond.rate,
        years: cond.years,
        label: `연 ${cond.rate.toFixed(1)}% / ${cond.years}년 만기`,
        monthlyPayment: monthlyPayment,
        monthlyPaymentTenThousand: (monthlyPayment / 10000).toFixed(1),
        ratio: ratio,
        desc: cond.desc
      };
    });
  },

  /**
   * 전세자금대출 상품 및 금리별 월 이자 비교 매트릭스 산출
   */
  generateJeonseComparisonMatrix: function(loanAmount, monthlyNetIncome, deposit, repayType = 'interest-only') {
    const conditions = [
      { rate: 2.1, label: '청년 버팀목 전세대출 (연 2.1%)', desc: '만 19~34세 무주택 청년 전용 (보증금 3억 이하, 최대 2억 한도)' },
      { rate: 2.4, label: '신혼부부 버팀목 전세대출 (연 2.4%)', desc: '혼인 7년 이내 무주택 신혼가구 (수도권 최대 3억 한도)' },
      { rate: 2.7, label: '일반 버팀목 전세대출 (연 2.7%)', desc: '무주택 서민 대상 주택도시기금 정부 지원 저리 전세대출' },
      { rate: 3.6, label: 'HUG/HF 안심전세대출 (연 3.6%)', desc: '전세보증금 반환보증 100% 결합형 안심 모기지' },
      { rate: 4.1, label: '시중 1금융권 일반 전세대출 (연 4.1%)', desc: '소득/보증금 제한 없이 최대 5억원(SGI)까지 실행 가능한 표준 상품' }
    ];

    return conditions.map(cond => {
      let monthlyPayment = 0;
      if (repayType === 'equal-payment') {
        monthlyPayment = this.calculateEqualPayment(loanAmount, cond.rate, 2); // 2년 만기 원리금
      } else {
        monthlyPayment = this.calculateInterestOnly(loanAmount, cond.rate); // 만기일시 월 순수 이자
      }
      const ratio = this.calculateHousingCostRatio(monthlyPayment, monthlyNetIncome);
      return {
        rate: cond.rate,
        label: cond.label,
        monthlyPayment: monthlyPayment,
        monthlyPaymentTenThousand: (monthlyPayment / 10000).toFixed(1),
        ratio: ratio,
        desc: cond.desc
      };
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoanCalculator;
}
