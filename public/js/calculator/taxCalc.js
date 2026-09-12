/**
 * 부동산 취득세, 중개보수, 등기비, 부대비용 정밀 계산기
 * [필수 취득·거래비용] vs [선택적 입주·정비비용] 이원화 산정 지원
 */
const TaxCalculator = {
  /**
   * 1. 취득세 및 지방교육세 산출
   * @param {number} price 매매가 또는 분양가 (원)
   * @param {boolean} isFirstHome 생애최초 여부 (기본 true)
   * @returns {object} 취득세 상세 내역
   */
  calculateAcquisitionTax: function(price, isFirstHome = true) {
    const rateInfo = STATUTORY_RATES.getAcquisitionTaxRate(price);
    
    // 기본 취득세 및 지방교육세
    const baseTax = Math.floor(price * rateInfo.baseRate);
    const eduTax = Math.floor(price * rateInfo.eduRate);
    const totalRawTax = baseTax + eduTax;
    
    let deduction = 0;
    // 생애최초 주택 구입 감면: 12억원 이하 주택 최대 200만원 한도
    if (isFirstHome && price <= 1200000000) {
      deduction = Math.min(totalRawTax, STATUTORY_RATES.firstHomeTaxDeductionLimit);
    }
    
    const finalTax = Math.max(0, totalRawTax - deduction);

    return {
      baseTax,
      eduTax,
      totalRawTax,
      deduction,
      finalTax,
      rateDesc: rateInfo.desc,
      isFirstHomeDeducted: deduction > 0
    };
  },

  /**
   * 2. 공인중개사 중개보수 산출
   * @param {number} price 매매가 (원)
   * @param {boolean} includeVat 부가세 10% 포함 여부 (기본 true)
   * @returns {object} 중개보수 상세 내역
   */
  calculateBrokerageFee: function(price, includeVat = true) {
    const rateInfo = STATUTORY_RATES.getBrokerageRate(price);
    let fee = Math.floor(price * rateInfo.maxRate);
    
    if (rateInfo.limit && fee > rateInfo.limit) {
      fee = rateInfo.limit;
    }
    
    const vat = includeVat ? Math.floor(fee * 0.1) : 0;
    const totalFee = fee + vat;

    return {
      fee,
      vat,
      totalFee,
      rateDesc: rateInfo.desc
    };
  },

  /**
   * 3. 등기비용, 국민주택채권 할인, 법무사 보수, 인지세 상세 내역 산출
   * @param {number} price 매매가 또는 분양가 (원)
   * @returns {object} 등기 관련 세부 항목
   */
  calculateRegistrationDetails: function(price) {
    // 1) 법무사 기본보수 및 소유권이전 등기 대행료 (약 40~60만원)
    const legalFee = 550000;
    // 2) 국민주택채권 즉시매도 할인액 (매매가의 약 0.25% 추정)
    const bondDiscount = Math.floor(price * 0.0025);
    // 3) 수입인지세 (정부 수입인지)
    const stampDuty = price > 1000000000 ? 350000 : (price > 100000000 ? 150000 : 70000);
    // 4) 등기신청수수료(증지대)
    const applicationFee = 15000;
    
    const totalRegFee = legalFee + bondDiscount + stampDuty + applicationFee;

    return {
      legalFee,
      bondDiscount,
      stampDuty,
      applicationFee,
      totalRegFee
    };
  },

  /**
   * 등기비용 총액 (하위 호환)
   */
  calculateRegistrationFee: function(price) {
    return this.calculateRegistrationDetails(price).totalRegFee;
  },

  /**
   * 4. 필수 취득·거래비용 종합 집계 (법정 필수)
   */
  calculateMandatoryResaleExpenses: function(price, isFirstHome = true) {
    const taxInfo = this.calculateAcquisitionTax(price, isFirstHome);
    const brokerageInfo = this.calculateBrokerageFee(price, true);
    const regDetails = this.calculateRegistrationDetails(price);
    
    const totalMandatory = taxInfo.finalTax + brokerageInfo.totalFee + regDetails.totalRegFee;

    return {
      taxInfo,
      brokerageInfo,
      regDetails,
      totalMandatory,
      totalMandatoryTenThousand: Math.round(totalMandatory / 10000)
    };
  },

  /**
   * 5. 선택적 입주·정비비용 종합 집계 (선택 옵션)
   */
  calculateOptionalMoveinExpenses: function(price, customRefurbishCost = null, customMoveinCost = null, isIncluded = true) {
    if (!isIncluded) {
      return {
        isIncluded: false,
        refurbishCost: 0,
        moveinCost: 0,
        totalOptional: 0,
        totalOptionalTenThousand: 0
      };
    }

    // 도배/장판/샷시/기본수리 예산 (기본 표준값)
    let refurbishCost = customRefurbishCost;
    if (refurbishCost === null || refurbishCost === undefined) {
      if (price <= 350000000) {
        refurbishCost = 15110000;
      } else if (price <= 500000000) {
        refurbishCost = 17500000;
      } else {
        refurbishCost = 20000000;
      }
    }

    // 가구/가전/이사비 예산
    let moveinCost = customMoveinCost;
    if (moveinCost === null || moveinCost === undefined) {
      moveinCost = 0; // 기본은 0원 (사용자가 원할 때 추가)
    }

    const totalOptional = refurbishCost + moveinCost;

    return {
      isIncluded: true,
      refurbishCost,
      moveinCost,
      totalOptional,
      totalOptionalTenThousand: Math.round(totalOptional / 10000)
    };
  },

  /**
   * 6. 일반 매매 총 부대비용 종합 계산 (필수 + 선택 이원화)
   * @param {number} price 매매가 (원)
   * @param {boolean} isFirstHome 생애최초 여부
   * @param {object|number} options 또는 customRefurbishCost
   * @returns {object} 총 부대비용 및 항목별 세부내역
   */
  calculateTotalResaleExpenses: function(price, isFirstHome = true, options = {}) {
    let customRefurbish = null;
    let customMovein = null;
    let includeMovein = true;

    if (typeof options === 'number') {
      customRefurbish = options;
    } else if (typeof options === 'object' && options !== null) {
      customRefurbish = options.customRefurbishCost ?? null;
      customMovein = options.customMoveinCost ?? null;
      includeMovein = options.includeMovein !== false;
    }

    const mandatory = this.calculateMandatoryResaleExpenses(price, isFirstHome);
    const optional = this.calculateOptionalMoveinExpenses(price, customRefurbish, customMovein, includeMovein);

    const totalExpensePure = mandatory.totalMandatory;
    const totalExpenseFull = mandatory.totalMandatory + (optional.isIncluded ? optional.totalOptional : 0);
    const totalExpense = totalExpenseFull;

    return {
      mandatory,
      optional,
      isMoveinIncluded: optional.isIncluded,
      taxInfo: mandatory.taxInfo,
      brokerageInfo: mandatory.brokerageInfo,
      regFee: mandatory.regDetails.totalRegFee,
      regDetails: mandatory.regDetails,
      refurbishCost: optional.refurbishCost,
      moveinCost: optional.moveinCost,
      totalMandatory: mandatory.totalMandatory,
      totalOptional: optional.totalOptional,
      totalExpensePure,
      totalExpenseFull,
      totalExpense,
      totalExpenseTenThousand: Math.round(totalExpense / 10000)
    };
  },

  /**
   * 7. 신축 분양 총 부대비용 종합 계산 (발코니 확장 + 필수 옵션 + 등기 + 취득세)
   * @param {number} price 분양가 (원)
   * @param {boolean} isFirstHome 생애최초 여부
   * @param {object|number} options 옵션/발코니비
   * @returns {object} 총 부대비용 및 항목별 세부내역
   */
  calculateTotalPresaleExpenses: function(price, isFirstHome = true, options = {}) {
    let customOption = null;
    let customMovein = null;
    let includeMovein = true;

    if (typeof options === 'number') {
      customOption = options;
    } else if (typeof options === 'object' && options !== null) {
      customOption = options.customOptionCost ?? null;
      customMovein = options.customMoveinCost ?? null;
      includeMovein = options.includeMovein !== false;
    }

    const taxInfo = this.calculateAcquisitionTax(price, isFirstHome);
    const regDetails = this.calculateRegistrationDetails(price);
    const totalMandatory = taxInfo.finalTax + regDetails.totalRegFee;

    // 발코니 확장 및 필수 시스템 에어컨/옵션 비용 (기본 약 3,000만 ~ 3,500만원)
    let optionCost = customOption;
    if (optionCost === null || optionCost === undefined) {
      if (price <= 450000000) {
        optionCost = 30000000;
      } else if (price <= 520000000) {
        optionCost = 30000000;
      } else {
        optionCost = 33000000;
      }
    }

    let moveinCost = customMovein || 0;
    const totalOptional = (includeMovein ? (optionCost + moveinCost) : 0);
    const totalExpensePure = totalMandatory;
    const totalExpenseFull = totalMandatory + optionCost + moveinCost;
    const totalExpense = includeMovein ? totalExpenseFull : totalExpensePure;

    return {
      mandatory: {
        taxInfo,
        regDetails,
        totalMandatory
      },
      optional: {
        isIncluded: includeMovein,
        optionCost: includeMovein ? optionCost : 0,
        moveinCost: includeMovein ? moveinCost : 0,
        totalOptional
      },
      isMoveinIncluded: includeMovein,
      taxInfo,
      regFee: regDetails.totalRegFee,
      regDetails,
      optionCost: includeMovein ? optionCost : 0,
      moveinCost: includeMovein ? moveinCost : 0,
      totalMandatory,
      totalOptional,
      totalExpensePure,
      totalExpenseFull,
      totalExpense,
      totalExpenseTenThousand: Math.round(totalExpense / 10000)
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TaxCalculator;
}
