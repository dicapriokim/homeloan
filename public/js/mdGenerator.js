/**
 * 시뮬레이션 결과를 기존 document/ 폴더와 100% 일치하는 완성형 마크다운(.md)으로 변환하는 생성기
 * (매매, 신축 분양, 전세자금대출 지원)
 */
const MarkdownGenerator = {
  /**
   * 일반 매매 마크다운 생성
   */
  generateResaleMarkdown: function(s) {
    const formatWon = ScenarioEngine.formatKoreanMoney;
    const formatTenMan = ScenarioEngine.formatTenThousand;

    const priceWon = formatWon(s.price);
    const equityWon = formatWon(s.equity);
    const loanWon = formatWon(s.requiredLoan);
    const budgetWon = formatWon(s.totalBudget);
    const expenseWon = formatWon(s.totalExpense);
    const downPaymentWon = formatWon(s.downPayment);
    const monthlyNetWon = formatTenMan(s.monthlyNetIncome, false);
    const annualIncomeWon = formatTenMan(s.annualIncome, false);
    const monthlyPayWon = formatTenMan(s.monthlyPayment);
    const didimdolPayWon = formatTenMan(s.didimdolPayment);

    const isCouple = s.householdType === 'couple';
    const incomePrefix = isCouple ? '부부합산 연봉' : '단독 세대주 연봉';
    const netIncomePrefix = isCouple ? '월 실수령액 약' : '월 실수령액 약';
    const loanBorrowerDesc = isCouple ? '본인 또는 배우자 명의의 신용대출 또는 마이너스통장' : '본인 명의의 신용대출 또는 마이너스통장';
    let singleLoanDesc = '시중은행 일반 주택담보대출(생애최초 LTV 80%) 규정';
    if (Math.abs(s.loanRate - 3.8) < 0.05) {
      singleLoanDesc = '한국주택금융공사 보금자리론(연 3.8%·단독신청) 규정';
    } else if (Math.abs(s.loanRate - 3.0) < 0.05) {
      singleLoanDesc = '주택도시기금 디딤돌대출(연 3.0%·단독세대) 규정';
    }
    const dsrAuditDesc = isCouple 
      ? `부부합산 연소득(${annualIncomeWon}) 기준 ${loanWon} 대출 시 단독 DSR은 **약 ${s.dsr}%**에 불과합니다. 정부 정책대출(디딤돌/보금자리론)은 법정 규정상 기혼 시 **'부부합산 소득 심사'가 필수**이며, 계약금 명목으로 기실행된 단기 신용대출(${downPaymentWon})을 보유한 상태로 은행 심사를 받더라도 부부 합산 총 DSR은 약 ${s.combinedDSR}% 내외로 법적 규제 한도(40%) 대비 매우 넉넉하여 즉시 무조건 승인 판정이 납니다.`
      : `단독 연소득(${annualIncomeWon}) 기준 ${loanWon} 대출 시 DSR은 **약 ${s.dsr}%** 수준입니다. 본 시뮬레이션은 차주 본인 소득만으로 심사 가능한 **${singleLoanDesc}**을 적용합니다. 계약금 신용대출(${downPaymentWon}) 포함 총 DSR은 약 ${s.combinedDSR}% 내외로 법적 규제 한도(40%)를 안전하게 충족합니다.`;

    const taxDesc = `생애최초 취득세 감면(약 ${formatTenMan(s.expenseData.taxInfo.finalTax, false)}) + 중개보수(약 ${formatTenMan(s.expenseData.brokerageInfo.totalFee, false)}) + 법무사/등기/채권할인/인지세(약 ${formatTenMan(s.expenseData.regFee, false)})`;
    const optionalDesc = s.expenseData.isMoveinIncluded 
      ? `도배/장판/샷시/기본수리(약 ${formatTenMan(s.expenseData.refurbishCost, false)})${s.expenseData.moveinCost > 0 ? ` + 가구/가전/이사비(약 ${formatTenMan(s.expenseData.moveinCost, false)})` : ''}`
      : '선택 안 함 (0원)';

    let md = `# **기존 구축·기축 아파트 ${priceWon} 매매 자금 조달 및 실전 매수 시나리오**\n\n`;
    const householdDetailStr = isCouple 
      ? `기혼(${s.auditInfo?.marriagePeriod === 'under7' ? '혼인 7년 이내 신혼' : '혼인 7년 이상'}, ${s.auditInfo?.childCount || 0}자녀, ${s.userProfile?.incomeType === 'single-earner' ? '외벌이·배우자무직' : '맞벌이'})`
      : `1인 단독 세대주`;
    md += `본 문서는 ${incomePrefix} ${annualIncomeWon}(${netIncomePrefix} ${monthlyNetWon}), ${householdDetailStr}, 생애최초 무주택자 조건에서 보유 중인 기존 전세보증금(${equityWon})을 활용하여 **${priceWon} 규모의 기존 구축/기축 아파트**를 일반 매매로 취득할 때의 실전 4단계 자금 조달 실행 계획입니다.\n\n`;
    md += `> **※ 소득 심사 기준:** ${s.auditInfo?.householdLabel || (isCouple ? '👫 기혼 부부합산 심사' : '👤 차주 단독 심사')} (${s.auditInfo?.auditMethodName || '부부합산 DSR 심사'})\n`;
    if (s.eligibility) {
      md += `> **※ 가이드 V4 심사 판정:** 디딤돌(${s.eligibility.didimdol.passed ? '⭕ 승인적격' : '❌ 부적격'}) | 보금자리(${s.eligibility.bogeumjari.passed ? '⭕ 승인적격' : '❌ 부적격'}) | 시중은행(${s.eligibility.commercial.passed ? '⭕ 승인적격' : '⚠️ DSR주의'})\n\n`;
    } else {
      md += `\n`;
    }

    // 0. 최종 핵심 요약
    md += `## **0\\. 최종 핵심 요약**\n\n`;
    if (s.expenseData.isMoveinIncluded) {
      md += `> * **순수 취득 필요 자금:** **약 ${formatWon(s.pureTotalBudget)}** (매매가 ${priceWon} \\+ 필수 취득·거래비용 약 ${formatWon(s.mandatoryExpense)})  \n`;
      md += `> * **입주 완비 총 소요 예산:** **약 ${budgetWon}** (순수 취득 자금 \\+ 선택적 입주·정비비용 약 ${formatWon(s.optionalExpense)})  \n`;
    } else {
      md += `> * **총 소요 자금 (순수 취득):** **약 ${formatWon(s.pureTotalBudget)}** (매매가 ${priceWon} \\+ 필수 취득·거래비용 약 ${formatWon(s.mandatoryExpense)})  \n`;
    }
    md += `> * **자기 자본 (순자산):** 기존 전세보증금 ${equityWon} (퇴거 시 전액 회수)  \n`;
    md += `> * **필요 주택담보대출:** **${loanWon}** (LTV 약 ${s.ltv}% / 순수 취득 기준 시 ${formatWon(s.pureRequiredLoan)})  \n`;
    md += `> * **입주 후 월 상환액:** **${monthlyPayWon}** (${s.loanYears}년 만기 원리금균등, 연 ${s.loanRate}% 기준 / 디딤돌 연 3.0% 적용 시 ${didimdolPayWon})  \n`;
    md += `> * **가계 재무 평가:** 월 실수령액(${monthlyNetWon}) 대비 주거비 지출 비중이 **약 ${s.housingRatio}%**에 불과하여, 매월 약 ${Math.floor(s.surplusMin / 10000)}만 원 이상의 순수 잉여 저축 여력을 완벽 확보\n\n`;

    // 1. 일반 매매 자금 조달 구조 및 건전성 지표
    md += `## **1\\. 일반 매매 자금 조달 구조 및 건전성 지표**\n\n`;
    md += `| 구분 | 금액 | 비고 및 산출 근거   |\n`;
    md += `| :---- | ----: | :---- |\n`;
    md += `| **1. 아파트 매매 대금** | ${priceWon} | 기준 실거래 매매 계약가 |\n`;
    md += `| **2. [필수] 취득·거래비용** | 약 ${formatWon(s.mandatoryExpense)} | ${taxDesc} |\n`;
    if (s.expenseData.isMoveinIncluded) {
      md += `| **➔ [소계] 순수 취득 필요 자금** | **${formatWon(s.pureTotalBudget)}** | **매매 대금 \\+ 법정 필수비용 (실제 매수 최소 자금)** |\n`;
      md += `| **3. [선택] 입주·정비비용** | 약 ${formatWon(s.optionalExpense)} | ${optionalDesc} |\n`;
      md += `| **➔ [총계] 입주 완료 총 소요 예산** | **${budgetWon}** | **매매 \\+ 필수취득 \\+ 선택입주 완비 종합 예산** |\n`;
    } else {
      md += `| **➔ [총계] 순수 취득 총 소요 자금** | **${formatWon(s.pureTotalBudget)}** | **매매 대금 \\+ 법정 필수비용 (법정 필수 정산 완비)** |\n`;
    }
    md += `| **보유 순자산 (전세보증금)** | ${equityWon} | 이사 당일 임대인으로부터 전액 반환 |\n`;
    md += `| **필요 주택담보대출** | **${loanWon}** | LTV 약 ${s.ltv}% (순수 취득 기준 ${formatWon(s.pureRequiredLoan)} / 입주 완료 기준 ${formatWon(s.fullRequiredLoan)}) |\n`;
    md += `| **월 원리금 상환액** | ${monthlyPayWon} | ${s.loanYears}년 만기 원리금균등 (금리 연 ${s.loanRate}% 기준) |\n`;
    md += `| **소득 대비 주거비 비중** | 약 ${s.housingRatio}% | 월 실수령액 ${monthlyNetWon} 기준 (최상급 안정권) |\n`;
    md += `| **DSR (총부채원리금상환비율)** | 약 ${s.dsr}% | ${incomePrefix} ${annualIncomeWon} 기준 (규제 한도 40% 대비 초안전) |\n\n`;

    // 2. 대출 금리 및 상환 조건별 월 부담 비교
    md += `## **2\\. 대출 금리 및 상환 조건별 월 부담 비교**\n\n`;
    md += `매매가 ${priceWon} 기준 실행할 주택담보대출 ${loanWon}에 대해 적용 금리 및 상환 기간별 월 납입액을 비교 분석한 표입니다.\n\n`;
    md += `| 적용 대출 조건 | 월 원리금 상환액 | 월 실수령액 대비 비중 | 세부 특징 및 활용 방안   |\n`;
    md += `| :---: | :---: | :---: | :---- |\n`;
    s.comparisonMatrix.forEach(row => {
      md += `| 연 ${row.rate.toFixed(1)}% / ${row.years}년 만기 | 약 ${row.monthlyPaymentTenThousand}만 원 | ${row.ratio}% | ${row.desc} |\n`;
    });
    md += `\n`;

    // 3. 실전 4단계 타임라인 시나리오
    md += `## **3\\. 실전 4단계 타임라인 시나리오**\n\n`;
    md += `일반 매매의 핵심은 **"기존 전셋집 만기(전세보증금 반환일)"**와 **"매수 아파트의 잔금일(이사 및 소유권 이전일)"**을 같은 날짜로 완벽히 일치시키는 것입니다.\n\n`;

    md += `### **1단계: 매수 계약 체결 (D-3개월 전후)**\n\n`;
    md += `> * **필요 자금:** 계약금 10% \\= **${downPaymentWon}**  \n`;
    md += `> * **자금 조달 방식:** 현재 전세보증금(${equityWon})이 묶여 있으므로, ${loanBorrowerDesc}에서 ${downPaymentWon}을 단기 인출하여 매도인 계좌로 송금합니다.  \n`;
    md += `> * **계약 시 필수 확인 및 특약 조항:**  \n`;
    md += `  * 계약서 작성 시 잔금 지급일을 현재 거주 중인 전세 계약 종료일(보증금 수령일)과 동일자로 확정 기재합니다.  \n`;
    md += `  * *"매수인의 잔금 지급 및 입주는 매수인이 현재 임차 중인 주택의 보증금 반환 및 대출 실행과 동시이행 조건으로 진행한다"*는 실무 협의를 사전에 조율합니다.\n\n`;

    md += `### **2단계: 주택담보대출 신청 및 심사 (D-1\\~2개월 전)**\n\n`;
    md += `> * **대출 신청:** 필요 주택담보대출 **${loanWon}** 신청 (주택가격 5억 이하 및 무주택 요건 충족 시 HUG/HF **디딤돌대출** 또는 아낌e-보금자리론 우선 접수 권장).  \n`;
    md += `> * **DSR 적격 심사:** ${dsrAuditDesc}\n\n`;

    md += `### **3단계: 잔금 당일 일괄 정산 및 소유권 이전 (D-Day)**\n\n`;
    md += `잔금일 당일 오전 반나절 동안 자금이 체계적으로 유입·배분되며, 기존 신용대출 상환과 매매대금 완납, 소유권 이전이 원스톱으로 종료됩니다.\n\n`;
    md += `| 시간대 | 자금 이동 및 주요 행정 처리 | 처리 금액 | 비고 및 자금 세부 흐름   |\n`;
    md += `| :---: | :---- | ----: | :---- |\n`;
    md += `| 오전 10:00 | 은행 주택담보대출 실행 → 매도인 계좌로 직송금 | ${formatWon(s.step3.mortgage)} | 1차 잔금 지급 (매매 잔금 중 일부) |\n`;
    md += `| 오전 11:00 | 기존 전셋집 이삿짐 반출 및 임대인으로부터 보증금 수령 | ${formatWon(s.step3.deposit)} | 보유 순자산 통장으로 전액 회수 유입 |\n`;
    md += `| 오전 11:30 | 회수한 보증금 중 매매 잔여 대금을 매도인 계좌로 송금 | ${formatWon(s.step3.remainPrice)} | 기지급 계약금(${downPaymentWon}) \\+ 주담대(${loanWon}) \\+ 잔여금(${formatWon(s.step3.remainPrice)}) \\= **매매가 ${priceWon} 완납** |\n`;
    md += `| 오후 12:00 | 전세금 잔여분으로 계약 시 실행한 신용대출 전액 완납 및 계좌 해지 | ${formatWon(s.step3.creditLoanPayoff)} | 단기 부채 완전 변제 (DSR 및 신용점수 원상 회복) |\n`;
    md += `| 오후 01:00 | 남은 전세금 잔액으로 세금/등기/중개보수 정산 및 키 수령 | 약 ${formatWon(s.step3.expenses)} | 취득세 납부 및 법무사 소유권 이전 등기 접수, 입주 완료 |\n\n`;

    md += `### **4단계: 입주 후 가계 재무 안착**\n\n`;
    md += `> * **남은 최종 부채:** 계약금 신용대출은 잔금 당일 전액 상환되어 해지되었으므로, 오직 **주택담보대출 ${loanWon}(단일 채무)**만 남습니다.  \n`;
    md += `> * **월 원리금 부담:** 매월 **${monthlyPayWon}** 수준 (일반 기준 연 ${s.loanRate}% 시 ${monthlyPayWon} / 디딤돌 연 3.0% 시 ${didimdolPayWon}).  \n`;
    md += `> * **가계 재무 구조의 안정성:**  \n`;
    md += `  * ${isCouple ? '부부합산 월 실수령액' : '월 실수령액'}(${monthlyNetWon}) 대비 고정 주거비 지출은 **약 ${s.housingRatio}%**로 극히 미미합니다.  \n`;
    md += `  * 생활비로 매달 ${s.livingCostDesc}을 여유롭게 사용하더라도 매월 **${Math.floor(s.surplusMin / 10000)}만\\~${Math.floor(s.surplusMax / 10000)}만 원에 달하는 순수 잉여 자금**이 발생하여 공격적인 자산 증식(국내외 배당/성장 ETF, 개인연금, 적금 등)이 가능합니다.\n\n`;

    // 4. 핵심 전략적 이점
    md += `## **4\\. 매매가 ${priceWon} 매수의 핵심 전략적 이점**\n\n`;
    if (s.price <= 500000000) {
      md += `> * **저리 정책모기지(디딤돌대출) 100% 수혜 가능:** 매매가 5억 원 이하 주택이므로 디딤돌대출 신청 조건을 완벽하게 충족하며, 3% 초반 또는 2% 후반대의 초저금리 고정금리 혜택을 온전히 누릴 수 있습니다.  \n`;
    } else {
      md += `> * **한국주택금융공사 보금자리론 활용 가능:** 주택가격 6억 원 이하 구간으로 장기 고정금리 정책모기지 혜택을 검토할 수 있습니다.  \n`;
    }
    md += `> * **공사 대기 및 금융 비용 리스크 '0':** 신축 분양과 달리 2.5\\~3년 동안 소요되는 공사 대기 기간이 없고, 1,500만\\~2,000만 원에 달하는 중도금 후불이자 부담이 원천 차단됩니다.  \n`;
    md += `> * **실물 검증 및 즉시 리모델링 가능:** 일조권, 단지 상태, 주차 환경을 현장에서 직접 확인하고 매수할 수 있으며, 약 ${expenseWon}의 부대정비 예산으로 샷시/도배/바닥을 깔끔하게 정비하여 입주 만족도를 극대화할 수 있습니다.  \n`;
    md += `> * **단순하고 명료한 자금 정산:** 전세보증금 반환금과 주담대만으로 잔금 당일 신용대출까지 100% 털어내는 깔끔한 단일 결산 구조입니다.\n`;
    if (s.strategyComparison && s.strategyComparison.totalInterestSaving > 0) {
      md += `> * **💡 가이드 V4 맞벌이 vs 외벌이 금융비용 정밀 비교 전략:**  \n`;
      md += `  * **맞벌이 유지 시 (연봉 7,700만):** 시중은행 일반 주담대(연 ${s.strategyComparison.commercialRate}%) ➔ 30년 총이자 약 ${formatWon(s.strategyComparison.commercialTotalInterest)}  \n`;
      md += `  * **외벌이 전환 시 (배우자 서류상 무직·단독 5,120만):** 디딤돌대출(연 3.0%) 승인 ➔ 30년 총이자 약 ${formatWon(s.strategyComparison.didimdolTotalInterest)}  \n`;
      md += `  * **➔ 30년 총이자 약 ${formatWon(s.strategyComparison.totalInterestSaving)} 순절감 (매월 약 ${formatTenMan(s.strategyComparison.monthlySaving)} 절약)** 효과 발생\n`;
    }

    return md;
  },

  /**
   * 신축 분양 마크다운 생성
   */
  generatePresaleMarkdown: function(s) {
    const formatWon = ScenarioEngine.formatKoreanMoney;
    const formatTenMan = ScenarioEngine.formatTenThousand;

    const priceWon = formatWon(s.price);
    const equityWon = formatWon(s.equity);
    const loanWon = formatWon(s.requiredLoan);
    const budgetWon = formatWon(s.totalBudget);
    const expenseWon = formatWon(s.totalExpense);
    const downPaymentWon = formatWon(s.downPayment);
    const middlePaymentWon = formatWon(s.middlePayment);
    const finalBalancePaymentWon = formatWon(s.finalBalancePayment);
    const monthlyNetWon = formatTenMan(s.monthlyNetIncome, false);
    const annualIncomeWon = formatTenMan(s.annualIncome, false);
    const monthlyPayWon = formatTenMan(s.monthlyPayment);

    const isCouple = s.householdType === 'couple';
    const incomePrefix = isCouple ? '부부합산 연봉' : '단독 세대주 연봉';
    const netIncomePrefix = isCouple ? '월 실수령액 약' : '월 실수령액 약';
    const loanBorrowerDesc = isCouple ? '본인 또는 배우자 명의의 신용대출 또는 마이너스통장' : '본인 명의의 신용대출 또는 마이너스통장';

    const taxDesc = `생애최초 취득세 감면(약 ${formatTenMan(s.expenseData.taxInfo.finalTax, false)}) + 소유권 이전 등기/인지세/채권할인(약 ${formatTenMan(s.expenseData.regFee, false)})`;
    const optionalDesc = s.expenseData.isMoveinIncluded 
      ? `발코니 확장 및 필수 유상옵션(약 ${formatTenMan(s.expenseData.optionCost, false)})${s.expenseData.moveinCost > 0 ? ` + 가구/가전/이사비(약 ${formatTenMan(s.expenseData.moveinCost, false)})` : ''}`
      : '선택 안 함 (0원)';

    let md = `# **분양가 ${priceWon} 자금 조달 및 전세보증금 회수 4단계 실전 로드맵 V3**\n\n`;
    const householdDetailStr = isCouple 
      ? `기혼(${s.auditInfo?.marriagePeriod === 'under7' ? '혼인 7년 이내 신혼' : '혼인 7년 이상'}, ${s.auditInfo?.childCount || 0}자녀, ${s.userProfile?.incomeType === 'single-earner' ? '외벌이' : '맞벌이'})`
      : `1인 단독 세대주`;
    md += `본 문서는 ${incomePrefix} ${annualIncomeWon}(${netIncomePrefix} ${monthlyNetWon}), ${householdDetailStr}, 생애최초 무주택자 조건에서 보유 중인 기존 전세보증금(${equityWon}) 반환 일정과 목표 **분양가 ${priceWon}**을 연계하여 월 주택담보대출 상환액을 ${monthlyPayWon} 수준(실수령액 대비 약 ${s.housingRatio}%)으로 최적화하고 가계 재무 안정성을 극대화한 실전 4단계 자금 조달 실행 계획(V3)입니다.\n\n`;
    md += `> **※ 소득 심사 기준:** ${s.auditInfo?.householdLabel || (isCouple ? '👫 기혼 부부합산 심사' : '👤 차주 단독 심사')} (${s.auditInfo?.auditMethodName || '부부합산 DSR 심사'})\n`;
    if (s.eligibility) {
      md += `> **※ 가이드 V4 심사 판정:** 디딤돌(${s.eligibility.didimdol.passed ? '⭕ 승인적격' : '❌ 부적격'}) | 보금자리(${s.eligibility.bogeumjari.passed ? '⭕ 승인적격' : '❌ 부적격'}) | 시중은행(${s.eligibility.commercial.passed ? '⭕ 승인적격' : '⚠️ DSR주의'})\n\n`;
    } else {
      md += `\n`;
    }

    // 0. 최종 핵심 요약
    md += `## **0\\. 최종 핵심 요약**\n\n`;
    if (s.expenseData.isMoveinIncluded) {
      md += `> * **순수 취득 필요 자금:** **약 ${formatWon(s.pureTotalBudget)}** (분양가 ${priceWon} \\+ 필수 취득·등기비용 약 ${formatWon(s.mandatoryExpense)})  \n`;
      md += `> * **입주 완비 총 소요 예산:** **약 ${budgetWon}** (순수 취득 자금 \\+ 선택적 발코니/옵션/이사비용 약 ${formatWon(s.optionalExpense)})  \n`;
    } else {
      md += `> * **총 소요 자금 (순수 분양):** **약 ${formatWon(s.pureTotalBudget)}** (분양가 ${priceWon} \\+ 필수 취득·등기비용 약 ${formatWon(s.mandatoryExpense)})  \n`;
    }
    md += `> * **당장 들어가는 계약금:** ${downPaymentWon} (전세보증금이 묶여 있으므로 신용대출/마이너스통장으로 납부 후 입주 잔금일에 전세보증금을 반환받아 전액 일괄 상환 및 해지)  \n`;
    md += `> * **공사 기간(약 2.5년 \\~ 3년):**  \n`;
    md += `  * 중도금(60%, ${middlePaymentWon})은 HUG/시공사 보증 집단대출로 처리되어 매달 들어가는 원금 부담 없음 (DSR 미적용).  \n`;
    md += `  * ${isCouple ? '부부합산 월 실수령액' : '월 실수령액'}(${monthlyNetWon}) 중 매월 저축하여 중도금 후불이자, 옵션 잔금, 비상 자금으로 총 3,000만\\~4,000만 원을 안전하게 축적.  \n`;
    md += `> * **입주 시점 정산:** 전세보증금 회수액(${equityWon}) \\+ 잔금 주택담보대출(${loanWon})으로 기존 중도금 대출, 계약금 신용대출, 분양 잔금, 취득세 및 옵션비를 일괄 정산하여 부채를 단일 장기 주담대로 통합.  \n`;
    md += `> * **입주 후 상환 부담:** ${s.loanYears}년 만기 원리금균등분할상환(금리 ${s.loanRate}% 기준) 시 월 원리금 ${monthlyPayWon}으로, 가계 실수령액의 ${s.housingRatio}% 수준에 불과하여 월 ${Math.floor(s.surplusMin / 10000)}만 원 이상의 여유 저축 여력을 확보.\n\n`;

    // 1. 목표 분양가 및 기본 재무 지표
    md += `## **1\\. 목표 분양가 및 기본 재무 지표**\n\n`;
    md += `| 항목 | 금액 | 산정 내역 및 세부 지표   |\n`;
    md += `| :---- | ----: | :---- |\n`;
    md += `| **1. 목표 분양가** | ${priceWon} | 청약 입주자모집공고 기준 분양 공급가 |\n`;
    md += `| **2. [필수] 취득·등기비용** | 약 ${formatWon(s.mandatoryExpense)} | ${taxDesc} |\n`;
    if (s.expenseData.isMoveinIncluded) {
      md += `| **➔ [소계] 순수 취득 필요 자금** | **${formatWon(s.pureTotalBudget)}** | **분양가 \\+ 법정 취득/등기 필수비용** |\n`;
      md += `| **3. [선택] 발코니·옵션·입주비용** | 약 ${formatWon(s.optionalExpense)} | ${optionalDesc} |\n`;
      md += `| **➔ [총계] 입주 완료 총 소요 예산** | **${budgetWon}** | **분양가 \\+ 필수취득 \\+ 선택옵션/이사 완비 종합 예산** |\n`;
    } else {
      md += `| **➔ [총계] 순수 분양 총 소요 자금** | **${formatWon(s.pureTotalBudget)}** | **분양가 \\+ 필수 취득/등기비용 (법정 필수 정산 완비)** |\n`;
    }
    md += `| **보유 순자산 (전세보증금)** | ${equityWon} | 입주 당일 기존 임대인으로부터 전액 반환 |\n`;
    md += `| **필요 잔금 주택담보대출** | **${loanWon}** | LTV 약 ${s.ltv}% (순수 취득 기준 ${formatWon(s.pureRequiredLoan)} / 입주 완료 기준 ${formatWon(s.fullRequiredLoan)}) |\n`;
    md += `| **월 원리금 상환액** | ${monthlyPayWon} | ${s.loanYears}년 만기 원리금균등 (연 ${s.loanRate}% 기준) |\n`;
    md += `| **가계 소득 대비 주거비 부담율** | 약 ${s.housingRatio}% | 월 실수령액 ${monthlyNetWon} 기준 (초안정 구간) |\n`;
    md += `| **DSR (총부채원리금상환비율)** | 약 ${s.dsr}% | ${incomePrefix} ${annualIncomeWon} 기준 (법정 한도 40% 대비 초안전) |\n\n`;

    // 2. 대출 만기 및 금리별 월 상환액 비교
    md += `## **2\\. 대출 만기 및 금리별 월 상환액 비교 시뮬레이션**\n\n`;
    md += `분양가 ${priceWon} 기준 필요 주택담보대출 원금 ${loanWon}에 대한 금리 및 만기 조건별 월 원리금 상환 부담 비교표입니다.\n\n`;
    md += `| 적용 대출 조건 | 월 원리금 상환액 | 소득 대비 주거비 비중 (월 ${monthlyNetWon} 기준) | 비고 및 추천 정책모기지   |\n`;
    md += `| :---: | :---: | :---: | ----- |\n`;
    s.comparisonMatrix.forEach(row => {
      md += `| 연 ${row.rate.toFixed(1)}% / ${row.years}년 만기 | 약 ${row.monthlyPaymentTenThousand}만 원 | ${row.ratio}% | ${row.desc} |\n`;
    });
    md += `\n`;

    // 3. 실전 4단계 자금 조달 시나리오
    md += `## **3\\. 실전 4단계 자금 조달 시나리오 (분양가 ${priceWon} 단일 모델)**\n\n`;

    md += `### **1단계: 청약 당첨 및 계약 체결 (D-Day \\~ 1개월 내)**\n\n`;
    md += `> * **필요 자금:** 계약금 10% \\= **${downPaymentWon}**  \n`;
    md += `> * **자금 조달 방식:** 기존 전세보증금(${equityWon})이 임대인에게 묶여 있으므로, ${loanBorrowerDesc}을 통해 ${downPaymentWon}을 단기 실행하여 납부합니다.  \n`;
    md += `> * **건전성 검토:** ${incomePrefix} ${annualIncomeWon} 기준으로 ${downPaymentWon} 신용대출은 대출 한도 내에서 즉시 실행 가능하며, 공사 기간 중 발생하는 소액의 월 이자(연 ${INTEREST_RATES_DATA.creditLoan.defaultRate}% 기준 월 약 ${formatTenMan(s.creditLoanMonthlyInterest, false)})는 가계 여유 소득으로 충분히 흡수 가능합니다.\n\n`;

    md += `### **2단계: 공사 기간 중도금 납부 (약 2.5년 \\~ 3년)**\n\n`;
    md += `> * **필요 자금:** 분양가의 60% \\= **${middlePaymentWon}**  \n`;
    md += `> * **자금 조달 방식:** 시공사 및 HUG(주택도시보증공사) 보증 중도금 집단대출(60%)로 전액 실행합니다.  \n`;
    md += `> * **금융 특징:** 중도금 집단대출은 차주의 개인 DSR 규제 적용 대상에서 제외되므로 1단계의 신용대출(${downPaymentWon}) 보유 여부와 상관없이 100% 실행됩니다.  \n`;
    md += `> * **공사 기간 현금 흐름:** 입주 전까지 원금 상환 의무가 없으므로 현금 투입은 0원입니다. 이 기간 동안 가계 실수령액(월 ${monthlyNetWon}) 중 매월 저축하여 3년간 약 4,000만\\~5,000만 원의 입주 비상금(중도금 후불이자, 잔여 옵션비, 취득세 등)을 안정적으로 축적합니다.\n\n`;

    md += `### **3단계: 준공 및 입주 잔금일 (전세보증금 회수 & 대환 일괄 정산)**\n\n`;
    md += `기존 주택에서 퇴거하면서 전세보증금(${equityWon})을 반환받고, 신축 아파트를 담보로 잔금 주택담보대출(${loanWon})을 동시 실행하여 모든 단기 부채를 완전히 털어내는 핵심 결산 단계입니다.\n\n`;
    md += `| 자금 유입 구분 | 금액 | 자금 집행 및 배분 항목 | 처리 금액   |\n`;
    md += `| ----- | ----- | :---- | ----- |\n`;
    md += `| **신축 잔금 주택담보대출 실행** | ${loanWon} | 기존 중도금 집단대출 전액 대환 상환 (60%) | ${middlePaymentWon} |\n`;
    md += `| **기존 전세보증금 회수 (퇴거)** | ${equityWon} | 분양 잔금 완납 (30%) | ${finalBalancePaymentWon} |\n`;
    md += `| — | — | 계약금용 신용대출 전액 상환 및 해지 | ${downPaymentWon} |\n`;
    md += `| — | — | 취득세(생애최초) 및 발코니/옵션/등기 정산 | 약 ${expenseWon} |\n`;
    md += `| **자금 유입 합계** | **${budgetWon}** | **총 정산 지출 합계** | **${budgetWon}** |\n\n`;
    md += `> * **핵심 성과:** 전세보증금 반환금으로 계약 시 활용했던 신용대출(${downPaymentWon})을 입주 당일 즉시 전액 상환하고 한도를 해지합니다. 이로써 단기 고금리 리스크와 DSR 잠식 요인을 100% 제거하고, 저리의 장기 주택담보대출(${loanWon}) 단일 채무 구조로 개편됩니다.\n\n`;

    md += `### **4단계: 입주 후 월 원리금 안착 및 가계 재무 최적화**\n\n`;
    md += `> * **주택담보대출 최종 조건:** 원금 ${loanWon} / ${s.loanYears}년 만기 원리금균등 / 연 ${s.loanRate}% 기준  \n`;
    md += `> * **월 원리금 상환액:** 약 **${monthlyPayWon}** (원금 약 ${formatTenMan(Math.round(s.monthlyPayment * 0.3), false)} \\+ 이자 약 ${formatTenMan(Math.round(s.monthlyPayment * 0.7), false)}으로 시작하여 매월 원금 비중 점증)  \n`;
    md += `> * **가계 재무 구조 변화:**  \n`;
    md += `  * 월 실수령액(${monthlyNetWon}) 중 주거비 원리금 지출은 약 **${s.housingRatio}%** 수준입니다.  \n`;
    md += `  * 생활비로 ${s.livingCostDesc}을 사용하더라도 매월 **${Math.floor(s.surplusMin / 10000)}만\\~${Math.floor(s.surplusMax / 10000)}만 원 이상의 순수 잉여 자금**이 발생하므로, 안정적인 정기적금, 연금저축펀드, 우량 배당주 및 지수 ETF 적립식 투자가 가능합니다.\n\n`;

    // 4. 전세 만기 불일치 시 실전 대응 수칙
    md += `## **4\\. 전세 만기 불일치 시 실전 대응 수칙**\n\n`;
    md += `> * **시나리오 A: 전세 만기가 아파트 입주보다 3\\~6개월 먼저 도래하는 경우**  \n`;
    md += `  * 현 임대인과 사전 협의를 통해 계약 갱신 또는 개월 단위 단기 연장을 최우선으로 협의합니다.  \n`;
    md += `  * 임대인의 사정으로 보증금을 먼저 반환받아야 할 경우, 보증금(${equityWon})을 CMA/파킹통장에 예치하여 무위험 이자 수익을 취하고, 입주일까지 단기 월세 또는 LH 단기 임대 주택을 활용하여 거주 공백을 최소화합니다.  \n`;
    md += `> * **시나리오 B: 아파트 입주 시점보다 전세 만기가 늦게 끝나는 경우**  \n`;
    md += `  * 입주 예정일 6개월 전부터 인근 공인중개사무소 다수에 매물을 등록하고 적극적으로 후속 세입자를 물색합니다.  \n`;
    md += `  * 입주일자에 맞춘 조기 퇴거 확정을 위해 신규 계약 시 발생하는 중개수수료를 임차인이 전액 부담하는 조건을 제시하여 세입자 매칭 속도를 극대화합니다.\n`;

    return md;
  },

  /**
   * 전세자금대출 실전 4단계 로드맵 마크다운 생성 (신규 탑재)
   */
  generateJeonseMarkdown: function(s) {
    const formatWon = ScenarioEngine.formatKoreanMoney;
    const formatTenMan = ScenarioEngine.formatTenThousand;

    const depositWon = formatWon(s.deposit);
    const equityWon = formatWon(s.equity);
    const loanWon = formatWon(s.requiredLoan);
    const budgetWon = formatWon(s.totalBudget);
    const expenseWon = formatWon(s.totalExpense);
    const downPaymentWon = formatWon(s.downPayment);
    const remainDepositWon = formatWon(s.remainDeposit);
    const monthlyNetWon = formatTenMan(s.monthlyNetIncome, false);
    const annualIncomeWon = formatTenMan(s.annualIncome, false);
    const monthlyPayWon = formatTenMan(s.monthlyPayment);

    const isCouple = s.householdType === 'couple';
    const incomePrefix = isCouple ? '부부합산 연봉' : '단독 세대주 연봉';
    const netIncomePrefix = '월 실수령액 약';
    const repayTypeDesc = s.repayType === 'equal-payment' ? '2년 만기 원리금균등분할' : '2년 만기 일시상환 (월 순수 이자 납부)';

    let md = `# **전세보증금 ${depositWon} 자금 조달 및 전세대출 실전 로드맵**\n\n`;
    const householdDetailStr = isCouple 
      ? `기혼(${s.auditInfo?.marriagePeriod === 'under7' ? '혼인 7년 이내 신혼' : '혼인 7년 이상'}, ${s.auditInfo?.childCount || 0}자녀, ${s.userProfile?.incomeType === 'single-earner' ? '외벌이' : '맞벌이'})`
      : `1인 단독 세대주`;
    md += `본 문서는 ${incomePrefix} ${annualIncomeWon}(${netIncomePrefix} ${monthlyNetWon}), ${householdDetailStr}, ${s.isHomeless ? '무주택자' : '1주택자'} 조건에서 보유 순자산(${equityWon})을 기반으로 **전세보증금 ${depositWon}** 규모의 주택 임대차 계약을 체결할 때의 실전 4단계 전세대출 자금 조달 및 안전 실행 로드맵입니다.\n\n`;
    md += `> **※ 소득 심사 기준:** ${s.auditInfo?.householdLabel || (isCouple ? '👫 기혼 부부합산 심사' : '👤 세대주 단독 심사')} (${s.auditInfo?.auditMethodName || '부부합산 심사'})\n`;
    if (s.eligibility) {
      md += `> **※ 가이드 V4 심사 판정:** 버팀목전세(${s.eligibility.beotimmok?.passed ? '⭕ 승인적격' : '❌ 부적격'}) | HUG안심전세(⭕ 소득무관 적격) | 시중은행전세(${s.eligibility.commercial?.passed ? '⭕ 승인적격' : '⚠️ DSR주의'})\n\n`;
    } else {
      md += `\n`;
    }

    // 0. 최종 핵심 요약
    md += `## **0\\. 최종 핵심 요약**\n\n`;
    md += `> * **총 전세 소요 예산:** 약 ${budgetWon} (전세보증금 ${depositWon} \\+ 중개보수, HUG 반환보증보험료 및 인지세 약 ${expenseWon})  \n`;
    md += `> * **자기 자본 (보유 현금):** ${equityWon}  \n`;
    md += `> * **필요 전세자금대출:** **${loanWon}** (보증금 대비 대출비율 약 ${s.loanRatio}%로 법정 안전 한도 80% 이내 충족)  \n`;
    md += `> * **월 주거비 부담액:** **${monthlyPayWon}** (${repayTypeDesc}, 금리 연 ${s.loanRate}% 기준)  \n`;
    md += `> * **가계 재무 건전성:** 월 실수령액(${monthlyNetWon}) 대비 주거비 지출 비중이 **약 ${s.housingRatio}%** 수준으로, 매월 생활비(${s.livingCostDesc}) 지출 후 **약 ${Math.floor(s.surplusMin / 10000)}만\\~${Math.floor(s.surplusMax / 10000)}만 원**의 순수 잉여 저축 여력을 완벽히 확보 가능\n\n`;

    // 1. 전세 자금 조달 구조 및 건전성 지표
    md += `## **1\\. 전세 자금 조달 구조 및 건전성 지표**\n\n`;
    md += `| 구분 | 금액 | 비고 및 산출 근거   |\n`;
    md += `| :---- | ----: | :---- |\n`;
    md += `| **목표 전세보증금** | ${depositWon} | 임대차 계약 기준 보증금 |\n`;
    md += `| **부대비용 합계** | 약 ${expenseWon} | 중개보수(${formatTenMan(s.brokerageFee, false)}) \\+ HUG 반환보증료(${formatTenMan(s.guaranteeFee, false)}) \\+ 인지세(${formatTenMan(s.stampDuty, false)}) |\n`;
    md += `| **총 필요 전세 예산** | 약 ${budgetWon} | 전세보증금 \\+ 부대비용 |\n`;
    md += `| **보유 순자산 (보유 현금)** | ${equityWon} | 본인 보유 가용 자본 |\n`;
    md += `| **필요 전세자금대출** | ${loanWon} | 보증금 대비 대출비율 약 ${s.loanRatio}% (한도 80% 이내 적격) |\n`;
    md += `| **월 주거비 상환액** | ${monthlyPayWon} | ${repayTypeDesc} (금리 연 ${s.loanRate}% 기준) |\n`;
    md += `| **소득 대비 주거비 비중** | 약 ${s.housingRatio}% | 월 실수령액 ${monthlyNetWon} 기준 (가계 재무 안정권) |\n\n`;

    // 2. 전세대출 상품 및 금리 조건별 월 부담 비교
    md += `## **2\\. 전세대출 상품 및 금리 조건별 월 부담 비교**\n\n`;
    md += `전세자금대출 ${loanWon} 실행 시 적용 상품 및 금리별 월 납입 부담액 비교표입니다.\n\n`;
    md += `| 적용 전세대출 상품 | 월 상환액 (이자) | 월 실수령액 대비 비중 | 상품 특징 및 자격 요건   |\n`;
    md += `| :--- | :---: | :---: | :---- |\n`;
    s.comparisonMatrix.forEach(row => {
      md += `| ${row.label} | 약 ${row.monthlyPaymentTenThousand}만 원 | ${row.ratio}% | ${row.desc} |\n`;
    });
    md += `\n`;

    // 3. 실전 4단계 전세 계약 및 대출 실행 타임라인
    md += `## **3\\. 실전 4단계 전세 계약 및 대출 실행 로드맵**\n\n`;

    md += `### **1단계: 매물 탐색 및 임대차 계약 체결 (D-1~2개월 전)**\n\n`;
    md += `> * **필요 자금:** 계약금 10% (또는 5%) \\= **${downPaymentWon}**  \n`;
    md += `> * **자금 조달:** 보유 순자산(${equityWon})에서 계약금 **${downPaymentWon}**을 임대인 계좌로 이체합니다.  \n`;
    md += `> * **필수 확인 및 안전 특약:**  \n`;
    md += `  * 등기부등본 갑구/을구 열람: 선순위 근저당권 및 압류/가압류 여부 확인 (근저당 + 전세금 합산이 매매 시세의 70% 이내여야 안전).  \n`;
    md += `  * *"임대인 및 임차목적물의 하자로 인한 전세자금대출 및 전세보증금 반환보증보험 가입 불가 시 본 계약은 무효로 하며, 임대인은 기지급된 계약금 전액을 즉시 반환한다"*는 특약을 명시합니다.\n\n`;

    md += `### **2단계: 확정일자 부여 및 전세대출 신청 (D-1개월 전)**\n\n`;
    md += `> * **확정일자 발급:** 계약 즉시 주민센터 또는 인터넷등기소를 통해 임대차계약서에 확정일자를 부여받습니다.  \n`;
    md += `> * **대출 신청:** 취급 은행에 방문하여 전세자금대출 **${loanWon}** 신청 접수 (버팀목 전세대출, HUG 안심전세대출, HF 보증서 대출 중 최적 상품 심사).  \n`;
    md += `> * **자격 적격 심사:** 연소득(${annualIncomeWon}) 및 무주택 요건 충족 여부, 보증기관 한도 조회를 거쳐 대출 승인 통보를 수령합니다.\n\n`;

    md += `### **3단계: 잔금 당일 전세대출 실행 및 대항력 확보 (D-Day)**\n\n`;
    md += `> * **대출 실행:** 은행에서 전세대출금 **${loanWon}**을 임대인 계좌로 직접 송금합니다.  \n`;
    md += `> * **잔여 자금 정산:** 보유 잔여 현금으로 전세 잔금 및 중개보수/부대비용을 완납하고 비밀번호/열쇠를 수령합니다.  \n`;
    md += `> * **전입신고 및 점유:** 이사 당일 즉시 주민센터에 전입신고를 완료하여 익일 0시 기준 **대항력 및 우선변제권**을 100% 확보합니다.\n\n`;

    md += `### **4단계: 거주 중 가계부 안착 및 보증금 100% 안전 관리**\n\n`;
    md += `> * **월 주거비 지출:** 매월 **약 ${monthlyPayWon}**의 이자를 성실히 납부합니다.  \n`;
    md += `> * **HUG 전세보증금 반환보증 가입:** 만약 안심전세대출 미가입 시, 입주 후 즉시 HUG/SGI 전세보증금 반환보증보험에 개별 가입하여 만기 시 보증금 미반환 리스크를 원천 차단합니다.  \n`;
    md += `> * **가계 저축 여력:** 고정 주거비 지출이 실수령액의 **${s.housingRatio}%**에 불과하므로, 매월 **약 ${Math.floor(s.surplusMin / 10000)}만\\~${Math.floor(s.surplusMax / 10000)}만 원**의 여유 자금을 주택 매매용 종잣돈(시드머니)으로 집중 저축·투자합니다.\n\n`;

    // 4. 전세 사기 예방 및 필수 특약 수칙
    md += `## **4\\. 전세 사기 예방 및 3대 필수 계약 특약 수칙**\n\n`;
    md += `> * **1. 전세대출 및 보증보험 반환 특약:** "임대인 또는 주택의 귀책으로 전세대출 및 보증보험 가입이 거절될 경우 계약은 즉시 해제되며 계약금은 조건 없이 반환한다."  \n`;
    md += `> * **2. 권리 변동 금지 특약:** "임대인은 잔금 지급일 익일까지 일체의 근저당권, 가등기, 담보 설정 등 권리 제한 행위를 하지 아니하며 위반 시 계약 해제 및 손해를 배상한다."  \n`;
    md += `> * **3. 국세·지방세 완납 증명 확인:** 임대인의 체납 세금으로 인한 공매 리스크를 방지하기 위해 잔금 전 국세/지방세 납세증명서 확인을 필수로 요구합니다.\n`;

    return md;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MarkdownGenerator;
}
