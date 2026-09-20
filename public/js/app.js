/**
 * 부동산 매매, 분양, 전세 자금 조달 시뮬레이터 메인 컨트롤러
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. 상태 객체
  const state = {
    mode: 'resale', // 'resale' | 'presale' | 'jeonse' | 'household' | 'rates'
    simMode: 'resale', // 마지막 활성 시뮬레이터 모드 ('resale' | 'presale' | 'jeonse')
    householdType: 'couple', // 'couple' (부부합산) | 'single' (세대주 혼자)
    marriagePeriod: 'over7', // 'over7' (7년 이상) | 'under7' (7년 이내 신혼)
    childCount: 0, // 0 | 1 | 2 | 3
    incomeType: 'double', // 'double' (맞벌이) | 'single-earner' (외벌이) | 'individual' (단독)
    activeProfile: 'couple-double', // 'couple-double' | 'couple-single-earner' | 'couple-child1' | 'newlywed' | 'single'
    viewMode: 'dashboard', // 'dashboard' | 'markdown'
    price: 450000000,
    equity: 370000000,
    equityDeposit: 200000000,
    equitySavings: 60000000,
    equityGift: 110000000,
    loanRate: 4.8,
    loanYears: 30,
    repayType: 'equal-payment', // 'equal-payment' | 'interest-only'
    annualIncome: 77000000,
    monthlyNetIncome: 5300000,
    isFirstHome: true,
    isHomeless: true,
    creditLoanRate: 4.5,
    customExtra: null,
    includeMovein: false,
    moveinExtra: 0,
    generatedMarkdown: ''
  };

  // 2. DOM 요소 캐싱
  const tabResale = document.getElementById('tab-resale');
  const tabPresale = document.getElementById('tab-presale');
  const tabJeonse = document.getElementById('tab-jeonse');
  const tabHousehold = document.getElementById('tab-household');
  const tabRates = document.getElementById('tab-rates');
  const simulatorView = document.getElementById('simulator-view');
  const householdView = document.getElementById('household-view');
  const ratesView = document.getElementById('rates-view');
  const tabAmortization = document.getElementById('tab-amortization');
  const amortizationView = document.getElementById('amortization-view');
  
  const amortAmount = document.getElementById('amort-amount');
  const amortType = document.getElementById('amort-type');
  const amortDate = document.getElementById('amort-date');
  const amortFirstDate = document.getElementById('amort-first-date');
  const amortRate = document.getElementById('amort-rate');
  const amortTerm = document.getElementById('amort-term');
  const amortGrace = document.getElementById('amort-grace');
  const btnCalcAmort = document.getElementById('btn-calc-amort');
  const amortResultContainer = document.getElementById('amort-result-container');
  const tbodyAmortResult = document.getElementById('tbody-amort-result');

  // 사이드바 가구 요약 배너 및 신규 액션 버튼 DOMs
  const btnGotoHouseholdSettings = document.getElementById('btn-goto-household-settings');
  const sidebarHouseholdSummaryText = document.getElementById('sidebar-household-summary-text');
  const sidebarHouseholdDiagnosisBadge = document.getElementById('sidebar-household-diagnosis-badge');
  const sidebarActiveProfileName = document.getElementById('sidebar-active-profile-name');
  const btnActionGotoResale = document.getElementById('btn-action-goto-resale');
  const btnActionGotoPresale = document.getElementById('btn-action-goto-presale');
  const btnActionGotoJeonse = document.getElementById('btn-action-goto-jeonse');

  // 가구 프로필 사전 설정 DOMs
  const containerProfilePresets = document.getElementById('container-profile-presets');
  const profilePresetBtns = document.querySelectorAll('.profile-preset-btn');
  const activeProfileBadge = document.getElementById('active-profile-badge');
  const badgeHouseholdSummary = document.getElementById('badge-household-summary');

  // 가구 세부 조건 DOMs
  const containerMarriagePeriod = document.getElementById('container-marriage-period');
  const marriagePeriodRadios = document.querySelectorAll('input[name="marriage-period"]');
  const marriagePeriodLabels = document.querySelectorAll('.marriage-period-btn');
  const containerChildCount = document.getElementById('container-child-count');
  const childCountBtns = document.querySelectorAll('.child-count-btn');
  const txtChildCountDisplay = document.getElementById('txt-child-count-display');
  const quickIncomeBtns = document.querySelectorAll('.quick-income-btn');

  // 실시간 적격성 진단 DOMs
  const badgeDidimdolStatus = document.getElementById('badge-didimdol-status');
  const txtDidimdolReason = document.getElementById('txt-didimdol-reason');
  const badgeBogeumjariStatus = document.getElementById('badge-bogeumjari-status');
  const txtBogeumjariReason = document.getElementById('txt-bogeumjari-reason');
  const lblCommercialTitle = document.getElementById('lbl-commercial-title');
  const badgeCommercialStatus = document.getElementById('badge-commercial-status');
  const txtCommercialReason = document.getElementById('txt-commercial-reason');
  const cardBeotimmokStatus = document.getElementById('card-beotimmok-status');
  const badgeBeotimmokStatus = document.getElementById('badge-beotimmok-status');
  const txtBeotimmokReason = document.getElementById('txt-beotimmok-reason');
  const lblBeotimmokTitle = document.getElementById('lbl-beotimmok-title');
  const lblBeotimmokSource = document.getElementById('lbl-beotimmok-source');
  const txtBeotimmokApplyAction = document.getElementById('txt-beotimmok-apply-action');
  const bannerSingleEarnerTip = document.getElementById('banner-single-earner-tip');
  const txtSingleEarnerTipDesc = document.getElementById('txt-single-earner-tip-desc');
  const btnApplySingleEarnerTip = document.getElementById('btn-apply-single-earner-tip');

  const resalePresets = document.getElementById('resale-presets');
  const presalePresets = document.getElementById('presale-presets');
  const jeonsePresets = document.getElementById('jeonse-presets');
  const presetModeBadge = document.getElementById('preset-mode-badge');

  const lblPrice = document.getElementById('lbl-price');
  const txtPriceDisplay = document.getElementById('txt-price-display');
  const inpPrice = document.getElementById('inp-price');
  const lblEquity = document.getElementById('lbl-equity');
  const txtEquityDisplay = document.getElementById('txt-equity-display');
  const inpEquity = document.getElementById('inp-equity');
  const detailsEquityBreakdown = document.getElementById('details-equity-breakdown');
  const inpEquityDeposit = document.getElementById('inp-equity-deposit');
  const inpEquitySavings = document.getElementById('inp-equity-savings');
  const inpEquityGift = document.getElementById('inp-equity-gift');

  const lblRateTitle = document.getElementById('lbl-rate-title');
  const txtRateDisplay = document.getElementById('txt-rate-display');
  const rngRate = document.getElementById('rng-rate');
  const inpRate = document.getElementById('inp-rate');
  const mortgageRateRadios = document.getElementById('mortgage-rate-radios');
  const jeonseRateRadios = document.getElementById('jeonse-rate-radios');

  const containerLoanYears = document.getElementById('container-loan-years');
  const selLoanYears = document.getElementById('sel-loan-years');
  const selRepayType = document.getElementById('sel-repay-type');
  const containerChkFirstHome = document.getElementById('container-chk-first-home');
  const chkFirstHome = document.getElementById('chk-first-home');
  const chkHomeless = document.getElementById('chk-homeless');
  const householdRadios = document.querySelectorAll('input[name="household-type"]');
  const householdRadioLabels = document.querySelectorAll('.household-radio-btn');
  const lblAnnualIncome = document.getElementById('lbl-annual-income');
  const txtAnnualIncomeDisplay = document.getElementById('txt-annual-income-display');
  const inpAnnualIncome = document.getElementById('inp-annual-income');
  const lblMonthlyIncome = document.getElementById('lbl-monthly-income');
  const txtMonthlyIncomeDisplay = document.getElementById('txt-monthly-income-display');
  const inpMonthlyIncome = document.getElementById('inp-monthly-income');

  const detailsCustomExtra = document.getElementById('details-custom-extra');
  const txtMandatoryExpenseSum = document.getElementById('txt-mandatory-expense-sum');
  const txtMandatoryTaxDetail = document.getElementById('txt-mandatory-tax-detail');
  const txtMandatoryBrokerageDetail = document.getElementById('txt-mandatory-brokerage-detail');
  const txtMandatoryRegDetail = document.getElementById('txt-mandatory-reg-detail');
  const chkIncludeMandatory = document.getElementById('chk-include-mandatory');
  const chkIncludeMovein = document.getElementById('chk-include-movein');
  const txtOptionalExpenseSum = document.getElementById('txt-optional-expense-sum');
  const containerOptionalInputs = document.getElementById('container-optional-inputs');
  const lblCustomExtra = document.getElementById('lbl-custom-extra');
  const txtCustomExtraDisplay = document.getElementById('txt-custom-extra-display');
  const inpCustomExtra = document.getElementById('inp-custom-extra');
  const txtMoveinExtraDisplay = document.getElementById('txt-movein-extra-display');
  const inpMoveinExtra = document.getElementById('inp-movein-extra');
  const inpCreditRate = document.getElementById('inp-credit-rate');

  const viewDashboardBtn = document.getElementById('view-dashboard-btn');
  const viewMarkdownBtn = document.getElementById('view-markdown-btn');
  const containerDashboardView = document.getElementById('container-dashboard-view');
  const containerMarkdownView = document.getElementById('container-markdown-view');
  const markdownRenderedContent = document.getElementById('markdown-rendered-content');

  const btnCopyMd = document.getElementById('btn-copy-md');
  const btnDownloadMd = document.getElementById('btn-download-md');
  const btnPrint = document.getElementById('btn-print');
  const toastMessage = document.getElementById('toast-message');
  const toastText = document.getElementById('toast-text');

  // 대시보드 출력 DOMs
  const cardLblTotal = document.getElementById('card-lbl-total');
  const cardTotalBudget = document.getElementById('card-total-budget');
  const cardBudgetSub = document.getElementById('card-budget-sub');
  const cardLblLoan = document.getElementById('card-lbl-loan');
  const cardRequiredLoan = document.getElementById('card-required-loan');
  const cardLtvBadge = document.getElementById('card-ltv-badge');
  const cardLblMonthly = document.getElementById('card-lbl-monthly');
  const cardMonthlyPayment = document.getElementById('card-monthly-payment');
  const cardMonthlyPaymentDetail = document.getElementById('card-monthly-payment-detail');
  const cardHousingRatio = document.getElementById('card-housing-ratio');
  const cardSurplus = document.getElementById('card-surplus');

  const titleFundingSection = document.getElementById('title-funding-section');
  const tbodyFundingStructure = document.getElementById('tbody-funding-structure');
  const titleComparisonSection = document.getElementById('title-comparison-section');
  const tbodyLoanComparison = document.getElementById('tbody-loan-comparison');
  const txtCompareLoanAmount = document.getElementById('txt-compare-loan-amount');

  const titleTimelineSection = document.getElementById('title-timeline-section');
  const timelineStep1Title = document.getElementById('timeline-step1-title');
  const timelineStep1 = document.getElementById('timeline-step1-content');
  const timelineStep2Title = document.getElementById('timeline-step2-title');
  const timelineStep2 = document.getElementById('timeline-step2-content');
  const timelineStep3Title = document.getElementById('timeline-step3-title');
  const theadStep3 = document.getElementById('thead-step3');
  const tbodyStep3 = document.getElementById('tbody-step3-settlement');
  const timelineStep4Title = document.getElementById('timeline-step4-title');
  const timelineStep4 = document.getElementById('timeline-step4-content');

  const titleStrategySection = document.getElementById('title-strategy-section');
  const contentStrategySection = document.getElementById('content-strategy-section');

  // 3. Lucide 아이콘 초기화 함수
  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // 3-2. 금액 파싱 및 실시간 콤마 포맷팅 유틸리티
  // 만 원 단위 간편 입력(100만 미만 양수 입력 시 자동으로 x 10,000 변환하여 '0' 입력 피로도 대폭 경감)
  function parseMoney(val) {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') {
      if (val > 0 && val < 1000000) return val * 10000;
      return val;
    }
    const cleaned = String(val).replace(/[^0-9]/g, '');
    if (cleaned === '') return 0;
    const num = Number(cleaned);
    // 100만 미만의 양수(예: 4,700 ➔ 47,000,000원, 47,000 ➔ 470,000,000원) 입력 시 '만 원' 단위 자동 변환
    if (num > 0 && num < 1000000) {
      return num * 10000;
    }
    return num;
  }

  function formatMoney(val) {
    if (val === null || val === undefined || val === '') return '';
    const num = typeof val === 'number' ? val : parseMoney(val);
    return num.toLocaleString();
  }

  function bindMoneyInput(inputElem, onUpdate) {
    if (!inputElem) return;

    // 1) 포커스 시 빠른 수정을 위한 전체 텍스트 자동 선택
    inputElem.addEventListener('focus', () => {
      setTimeout(() => {
        try {
          inputElem.select();
        } catch (e) {}
      }, 30);
    });

    // 2) 타이핑 중: 천단위 콤마 서식 실시간 적용 및 상태 연동
    inputElem.addEventListener('input', () => {
      const raw = inputElem.value.replace(/[^0-9]/g, '');
      if (raw === '') {
        inputElem.value = '';
      } else {
        const num = Number(raw);
        inputElem.value = num.toLocaleString();
      }
      if (onUpdate) onUpdate();
    });

    // 3) 입력 완료(blur 및 Enter 키): 100만 미만 입력값을 원 단위로 자동 확장 (예: 4,700 ➔ 47,000,000)
    const handleAutoExpand = () => {
      const raw = inputElem.value.replace(/[^0-9]/g, '');
      if (raw === '') return;
      const num = Number(raw);
      if (num > 0 && num < 1000000) {
        const expanded = num * 10000;
        inputElem.value = expanded.toLocaleString();
        if (typeof showToast === 'function') {
          const unitText = (typeof ScenarioEngine !== 'undefined' && ScenarioEngine.formatKoreanMoney)
            ? ScenarioEngine.formatKoreanMoney(expanded)
            : `${expanded.toLocaleString()}원`;
          showToast(`💡 입력값 [${num.toLocaleString()}]이(가) [${unitText}](${expanded.toLocaleString()}원)으로 자동 변환되었습니다.`);
        }
        if (onUpdate) onUpdate();
      }
    };

    inputElem.addEventListener('blur', handleAutoExpand);
    inputElem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleAutoExpand();
        inputElem.blur();
      }
    });
  }

  // 3-3. 보유 순자산 세부 분할(보증금/예적금/증여) 양방향 동기화 및 요약 유틸리티
  function syncSubEquityToMain() {
    if (!inpEquityDeposit || !inpEquitySavings || !inpEquityGift) return;
    const dep = parseMoney(inpEquityDeposit.value);
    const sav = parseMoney(inpEquitySavings.value);
    const gift = parseMoney(inpEquityGift.value);
    const total = dep + sav + gift;
    inpEquity.value = formatMoney(total);
    state.equity = total;
    state.equityDeposit = dep;
    state.equitySavings = sav;
    state.equityGift = gift;
    if (txtEquityDisplay && typeof ScenarioEngine !== 'undefined') {
      txtEquityDisplay.textContent = ScenarioEngine.formatKoreanMoney(total);
    }
    recalculate();
  }

  function syncMainEquityToSub() {
    if (!inpEquityDeposit || !inpEquitySavings || !inpEquityGift) return;
    const total = parseMoney(inpEquity.value);
    const dep = parseMoney(inpEquityDeposit.value);
    const sav = parseMoney(inpEquitySavings.value);
    const gift = parseMoney(inpEquityGift.value);

    if (dep === 0 && sav === 0 && gift === 0 && total > 0) {
      const autoDep = Math.round(total * 0.6 / 10000000) * 10000000;
      inpEquityDeposit.value = formatMoney(autoDep);
      inpEquitySavings.value = formatMoney(total - autoDep);
      inpEquityGift.value = '0';
    } else if (total >= (dep + gift)) {
      inpEquitySavings.value = formatMoney(total - dep - gift);
    } else if (total >= gift) {
      inpEquityDeposit.value = formatMoney(total - gift);
      inpEquitySavings.value = '0';
    } else {
      inpEquityDeposit.value = '0';
      inpEquitySavings.value = '0';
      inpEquityGift.value = formatMoney(total);
    }
    state.equity = total;
    state.equityDeposit = parseMoney(inpEquityDeposit.value);
    state.equitySavings = parseMoney(inpEquitySavings.value);
    state.equityGift = parseMoney(inpEquityGift.value);
  }

  function getEquityBreakdownSummary(defaultNote = '이사 당일 임대인으로부터 전액 반환') {
    const dep = parseMoney(inpEquityDeposit ? inpEquityDeposit.value : 0);
    const sav = parseMoney(inpEquitySavings ? inpEquitySavings.value : 0);
    const gift = parseMoney(inpEquityGift ? inpEquityGift.value : 0);
    const parts = [];
    const fmt = (typeof ScenarioEngine !== 'undefined' && ScenarioEngine.formatKoreanMoney) 
      ? (val => ScenarioEngine.formatKoreanMoney(val).replace(/ 원$/, ''))
      : (val => val.toLocaleString() + '원');
    if (dep > 0) parts.push(`보증금 ${fmt(dep)}`);
    if (sav > 0) parts.push(`예적금 ${fmt(sav)}`);
    if (gift > 0) parts.push(`증여 ${fmt(gift)}`);
    if (parts.length > 0) {
      return parts.join(' + ');
    }
    return defaultNote;
  }

  // 4. 토스트 알림 표시
  function showToast(message) {
    toastText.textContent = message;
    toastMessage.classList.remove('translate-y-20', 'opacity-0');
    toastMessage.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
      toastMessage.classList.remove('translate-y-0', 'opacity-100');
      toastMessage.classList.add('translate-y-20', 'opacity-0');
    }, 2500);
  }

  // 4-2. 실시간 동적 날짜 갱신 함수
  function updateLiveDates(dateStr) {
    const today = dateStr || (typeof INTEREST_RATES_DATA !== 'undefined' ? INTEREST_RATES_DATA.getLiveDateString() : '2026.09.04');
    const headerLiveBadge = document.getElementById('header-live-badge');
    const ratesStandardDate = document.getElementById('rates-standard-date');
    if (headerLiveBadge) {
      headerLiveBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ${today} 기준 실시간 반영`;
    }
    if (ratesStandardDate) {
      ratesStandardDate.textContent = `기준일자: ${today} (공시 실시간 동기화)`;
    }
  }

  // 4-3. 서버 API 실시간 동기화
  async function syncRatesFromServer(isSilent = false) {
    try {
      const res = await fetch('/api/rates');
      if (res.ok) {
        const data = await res.json();
        if (data.standardDate) {
          updateLiveDates(data.standardDate);
        }
        if (!isSilent) {
          showToast('최신 공시 금리 실시간 동기화 완료! ⚡');
        }
      } else {
        updateLiveDates();
      }
    } catch (err) {
      updateLiveDates();
    }
  }

  // 4-4. 금리 라디오 버튼 카드 동적 갱신 (부적격 시 잠금 및 비활성화)
  function updateRateRadioStyles(eligibilityData) {
    // 1) 매매 적격성 평가 데이터 가져오기
    const purchasePrice = (state.mode === 'jeonse') ? 450000000 : (Number(state.price) || 450000000);
    const el = eligibilityData || (typeof INTEREST_RATES_DATA !== 'undefined' && INTEREST_RATES_DATA.evaluateEligibility
      ? INTEREST_RATES_DATA.evaluateEligibility(state, purchasePrice, 'resale')
      : null);

    const isDidimdolPassed = el && el.didimdol ? el.didimdol.passed : true;
    const isBogeumjariPassed = el && el.bogeumjari ? el.bogeumjari.passed : true;

    // 2) 전세 최적 상품 평가 데이터 가져오기
    const optimalJeonse = getOptimalJeonseRateInfo();
    const isNewlywedJeonsePassed = optimalJeonse.type === 'newlywed-beotimmok' && optimalJeonse.eligible;
    const isYouthJeonsePassed = optimalJeonse.type === 'youth-beotimmok' && optimalJeonse.eligible;

    // 3) 매매 라디오 카드 갱신
    if (mortgageRateRadios) {
      mortgageRateRadios.querySelectorAll('.rate-radio-card').forEach(label => {
        const radio = label.querySelector('input[type="radio"]');
        if (!radio) return;
        const titleElem = label.querySelector('.font-bold');
        const badgeElem = label.querySelector('.rate-radio-badge');
        const val = radio.value;

        let isDisqualified = false;
        let lockReason = '';

        if (val === '3.0' && !isDidimdolPassed) {
          isDisqualified = true;
          lockReason = (el && el.didimdol && el.didimdol.reason) || '소득 또는 주택가격 기준 초과로 신청 불가';
        } else if (val === '3.8' && !isBogeumjariPassed) {
          isDisqualified = true;
          lockReason = (el && el.bogeumjari && el.bogeumjari.reason) || '소득 또는 주택가격 기준 초과로 신청 불가';
        }

        if (isDisqualified) {
          radio.disabled = true;
          label.title = `⚠️ ${lockReason} (부적격으로 시뮬레이션 선택 불가)`;
          label.className = 'rate-radio-card flex items-start p-2.5 rounded-xl border border-slate-200 bg-slate-100/70 opacity-40 cursor-not-allowed select-none transition';
          if (titleElem) titleElem.className = 'font-bold text-slate-400 whitespace-nowrap line-through decoration-slate-300';
          if (badgeElem) {
            badgeElem.className = 'rate-radio-badge text-[9.5px] bg-red-100 text-red-700 font-extrabold px-1.5 py-0.5 rounded leading-none flex-shrink-0 whitespace-nowrap';
            badgeElem.textContent = '신청불가';
          }
        } else {
          radio.disabled = false;
          label.title = '';
          if (radio.checked) {
            label.className = 'rate-radio-card flex items-start p-2.5 rounded-xl border-2 border-purple-500 bg-purple-50/60 shadow-sm cursor-pointer transition';
            if (titleElem) titleElem.className = 'font-bold text-purple-900 whitespace-nowrap';
          } else {
            label.className = 'rate-radio-card flex items-start p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-slate-50 cursor-pointer transition';
            if (titleElem) titleElem.className = 'font-bold text-slate-800 whitespace-nowrap';
          }
          if (badgeElem) {
            const isSingle = (state.householdType === 'single');
            if (isSingle) {
              badgeElem.className = 'rate-radio-badge text-[9.5px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded leading-none flex-shrink-0 whitespace-nowrap';
              badgeElem.textContent = (val === '3.0') ? '단독세대' : '단독신청';
            } else {
              badgeElem.className = 'rate-radio-badge text-[9.5px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded leading-none flex-shrink-0 whitespace-nowrap';
              badgeElem.textContent = '부부합산';
            }
          }
        }
      });
    }

    // 4) 전세 라디오 카드 갱신
    if (jeonseRateRadios) {
      jeonseRateRadios.querySelectorAll('.rate-radio-card').forEach(label => {
        const radio = label.querySelector('input[type="radio"]');
        if (!radio) return;
        const titleElem = label.querySelector('.font-bold');
        const badgeElem = label.querySelector('.rate-radio-badge');
        const val = radio.value;

        let isDisqualified = false;
        let lockReason = '';

        if (val === '2.4' && !isNewlywedJeonsePassed) {
          isDisqualified = true;
          lockReason = '신혼부부(혼인 7년 이내, 7.5천만 이하) 기준 미충족';
        } else if (val === '2.1' && !isYouthJeonsePassed) {
          isDisqualified = true;
          lockReason = '청년 단독 세대주(5천만 이하) 기준 미충족';
        }

        if (isDisqualified) {
          radio.disabled = true;
          label.title = `⚠️ ${lockReason} (부적격으로 시뮬레이션 선택 불가)`;
          label.className = 'rate-radio-card flex items-start p-2.5 rounded-xl border border-slate-200 bg-slate-100/70 opacity-40 cursor-not-allowed select-none transition';
          if (titleElem) titleElem.className = 'font-bold text-slate-400 whitespace-nowrap line-through decoration-slate-300';
          if (badgeElem) {
            badgeElem.className = 'rate-radio-badge text-[9.5px] bg-red-100 text-red-700 font-extrabold px-1.5 py-0.5 rounded leading-none flex-shrink-0 whitespace-nowrap';
            badgeElem.textContent = '신청불가';
          }
        } else {
          radio.disabled = false;
          label.title = '';
          if (radio.checked) {
            label.className = 'rate-radio-card flex items-start p-2.5 rounded-xl border-2 border-purple-500 bg-purple-50/60 shadow-sm cursor-pointer transition';
            if (titleElem) titleElem.className = 'font-bold text-purple-900 whitespace-nowrap';
          } else {
            label.className = 'rate-radio-card flex items-start p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-slate-50 cursor-pointer transition';
            if (titleElem) titleElem.className = 'font-bold text-slate-800 whitespace-nowrap';
          }
          if (badgeElem) {
            if (val === '2.4') {
              badgeElem.className = 'rate-radio-badge text-[9.5px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded leading-none flex-shrink-0 whitespace-nowrap';
              badgeElem.textContent = '부부합산';
            } else if (val === '2.1') {
              badgeElem.className = 'rate-radio-badge text-[9.5px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded leading-none flex-shrink-0 whitespace-nowrap';
              badgeElem.textContent = '단독전용';
            }
          }
        }
      });
    }
  }

  // 4-5. 현재 금리와 일치하는 라디오 자동 체크
  function syncRateToRadios(rateVal) {
    const isJeonse = state.mode === 'jeonse';
    const radioName = isJeonse ? 'jeonse-rate-preset' : 'rate-preset';
    const radios = document.querySelectorAll(`input[name="${radioName}"]`);
    let matched = false;

    radios.forEach(r => {
      if (r.value !== 'custom' && Math.abs(Number(r.value) - rateVal) < 0.01) {
        r.checked = true;
        matched = true;
      } else if (r.value !== 'custom') {
        r.checked = false;
      }
    });

    if (!matched) {
      const customRadio = document.querySelector(`input[name="${radioName}"][value="custom"]`);
      if (customRadio) customRadio.checked = true;
    }
    updateRateRadioStyles();
  }

  // 4-5-2. 가구 조건에 따른 정부 최적 전세대출 금리 자동 판정 헬퍼
  function getOptimalJeonseRateInfo() {
    const isCouple = state.householdType === 'couple';
    const isUnder7 = state.marriagePeriod === 'under7';
    const isSingle = (state.householdType === 'single');
    const income = Number(state.annualIncome) || 0;
    const isHomeless = (chkHomeless ? chkHomeless.checked : (state.isHomeless !== false));
    const deposit = parseMoney(inpPrice ? inpPrice.value : state.price) || state.price || 280000000;
    const isNewlywedProfile = (state.activeProfile === 'newlywed' || state.activeProfile === 'newlywed-couple');
    const isSingleProfile = (state.activeProfile === 'single' || state.activeProfile === 'single-household');

    // 1) 신혼부부 버팀목 전세대출:
    // 조건: 혼인 7년 이내 + 부부합산 + 무주택 + 소득 7,500만 이하(또는 신혼프로필) + 보증금 4억 이하
    if (isHomeless && isCouple && isUnder7 && (income <= 75000000 || isNewlywedProfile)) {
      if (deposit <= 400000000) {
        return {
          rate: 2.4,
          type: 'newlywed-beotimmok',
          title: '신혼 버팀목 전세대출',
          name: '신혼 버팀목 (연 2.4%)',
          badge: '⭕ 신혼 적격 (2.4%)',
          reason: '혼인 7년 이내 신혼부부 전용 버팀목 (연 2.4% 적격)',
          eligible: true
        };
      } else {
        return {
          rate: 3.6,
          type: 'hug-jeonse',
          title: 'HUG 안심전세대출',
          name: 'HUG 안심전세 (연 3.6%)',
          badge: 'ℹ️ HUG 안심전세',
          reason: '보증금 4억 초과로 버팀목 불가 ➔ HUG 안심전세(연 3.6%) 추천',
          eligible: false
        };
      }
    }

    // 2) 청년 버팀목 전세대출:
    // 조건: 1인 단독 세대주 + 무주택 + 소득 5,000만 이하(또는 단독프로필) + 보증금 3억 이하
    if (isHomeless && isSingle && (income <= 50000000 || isSingleProfile)) {
      if (deposit <= 300000000) {
        return {
          rate: 2.1,
          type: 'youth-beotimmok',
          title: '청년 버팀목 전세대출',
          name: '청년 버팀목 (연 2.1%)',
          badge: '⭕ 청년 적격 (2.1%)',
          reason: '만19~34세 단독 세대주 청년 버팀목 (연 2.1% 적격)',
          eligible: true
        };
      } else {
        return {
          rate: 3.6,
          type: 'hug-jeonse',
          title: 'HUG 안심전세대출',
          name: 'HUG 안심전세 (연 3.6%)',
          badge: 'ℹ️ HUG 안심전세',
          reason: '보증금 3억 초과로 청년버팀목 불가 ➔ HUG 안심전세(연 3.6%) 추천',
          eligible: false
        };
      }
    }

    // 3) 일반 기금 버팀목 전세대출:
    // 조건: 무주택 + 소득 5,000만 이하(2자녀 이상 6,000만 이하) + 보증금 3억 이하
    const generalIncomeLimit = (state.childCount >= 2) ? 60000000 : 50000000;
    if (isHomeless && income <= generalIncomeLimit && deposit <= 300000000) {
      return {
        rate: 2.4,
        type: 'general-beotimmok',
        title: '일반 버팀목 전세대출',
        name: '기금 버팀목 (연 2.4%)',
        badge: '⭕ 버팀목 적격 (2.4%)',
        reason: `소득 ${Math.round(generalIncomeLimit / 10000)}만 이하 충족 정부 버팀목 (연 2.4% 적격)`,
        eligible: true
      };
    }

    // 4) 보증금 7억 초과 고액 전세: 시중은행 일반 전세대출
    if (deposit > 700000000) {
      return {
        rate: 4.1,
        type: 'commercial-jeonse',
        title: '시중은행 전세대출',
        name: '시중은행 전세대출 (연 4.1%)',
        badge: '⭕ 시중은행 (4.1%)',
        reason: '수도권 보증금 7억 초과 고액 전세 ➔ SGI 시중은행 전세(연 4.1%) 적격',
        eligible: false
      };
    }

    // 5) 기본: HUG 안심전세대출 (반환보증 100%)
    return {
      rate: 3.6,
      type: 'hug-jeonse',
      title: 'HUG 안심전세대출',
      name: 'HUG 안심전세 (연 3.6%)',
      badge: 'ℹ️ HUG 안심전세',
      reason: isUnder7
        ? '소득 기준(7.5천만) 초과 ➔ 반환보증 100% 결합 HUG 안심전세(연 3.6%) 추천'
        : (isSingle
          ? '단독 소득 기준(5천만) 초과 ➔ HUG 안심전세(연 3.6%) 추천'
          : '보증금 100% 반환보증 결합 HUG 안심전세(연 3.6%) 추천'),
      eligible: false
    };
  }

  // 4-6. 대출 및 가계 조건 규정 자동 보정 (Auto-Correction) 엔진
  function validateAndAutoCorrectLoanRules(triggerSource, options = {}) {
    let corrected = false;
    const isJeonse = state.mode === 'jeonse';
    const isResaleOrPresale = state.mode === 'resale' || state.mode === 'presale';
    const priceVal = parseMoney(inpPrice.value) || state.price;
    const rateVal = Number(inpRate.value) || state.loanRate;
    const isCouple = state.householdType === 'couple';
    const isHomeless = chkHomeless ? chkHomeless.checked : true;

    // 1) 가구 형태 변경 트리거 (household)
    if (triggerSource === 'household') {
      if (!isCouple) {
        // 단독 세대주 (1인) 선택 시
        if (isResaleOrPresale) {
          const el = (typeof INTEREST_RATES_DATA !== 'undefined' && INTEREST_RATES_DATA.evaluateEligibility)
            ? INTEREST_RATES_DATA.evaluateEligibility(state, priceVal, 'resale')
            : null;

          if (Math.abs(rateVal - 3.0) < 0.05) {
            // 디딤돌(3.0)의 경우 단독 세대주 주택가격 3억 이하 심사
            if (el && el.didimdol && !el.didimdol.passed) {
              const fallbackRate = (el.bogeumjari && el.bogeumjari.passed) ? 3.8 : 4.8;
              const fallbackName = fallbackRate === 3.8 ? '보금자리론 (연 3.8%)' : '시중은행 주담대 (연 4.8%)';
              state.loanRate = fallbackRate;
              inpRate.value = fallbackRate;
              rngRate.value = fallbackRate;
              syncRateToRadios(fallbackRate);
              showToast(`⚠️ 단독세대주 디딤돌 기준 미충족(${el.didimdol.reason})으로 단독 신청 가능한 [${fallbackName}]로 자동 보정되었습니다.`);
              corrected = true;
            }
          } else if (Math.abs(rateVal - 3.8) < 0.05) {
            // 보금자리론(3.8)의 경우 1인 단독(7천만 이하, 6억 이하) 심사
            if (el && el.bogeumjari && !el.bogeumjari.passed) {
              state.loanRate = 4.8;
              inpRate.value = 4.8;
              rngRate.value = 4.8;
              syncRateToRadios(4.8);
              showToast(`⚠️ 보금자리론 심사 미충족(${el.bogeumjari.reason})으로 [시중은행 주담대 (연 4.8%)]로 자동 보정되었습니다.`);
              corrected = true;
            }
          }
        } else if (isJeonse) {
          // 전세에서 신혼 버팀목(2.4)이 선택되어 있던 경우 ➔ 단독 신청이 가능한 청년 버팀목(2.1) 또는 HUG(3.6)로 자동 보정
          if (Math.abs(rateVal - 2.4) < 0.05) {
            const income = Number(state.annualIncome) || 0;
            const targetRate = (income <= 50000000) ? 2.1 : 3.6;
            state.loanRate = targetRate;
            inpRate.value = targetRate;
            rngRate.value = targetRate;
            syncRateToRadios(targetRate);
            if (targetRate === 2.1) {
              showToast('ℹ️ 단독 세대주 선택에 따라 단독 전용 [청년 버팀목 (연 2.1%)]로 자동 보정되었습니다.');
            } else {
              showToast('⚠️ 신혼 버팀목 전세대출은 부부합산 심사 필수 규정입니다. 단독 신청이 가능한 [HUG 안심전세 (연 3.6%)]로 자동 보정되었습니다.');
            }
            corrected = true;
          }
        }
      } else {
        // 기혼 (부부합산) 선택 시
        if (isJeonse) {
          // 전세에서 청년 버팀목(2.1)이 선택되어 있던 경우 ➔ 신혼 버팀목(2.4) 또는 HUG(3.6)로 자동 보정
          if (Math.abs(rateVal - 2.1) < 0.05) {
            const isUnder7 = state.marriagePeriod === 'under7';
            const income = Number(state.annualIncome) || 0;
            const targetRate = (isUnder7 && income <= 75000000) ? 2.4 : 3.6;
            state.loanRate = targetRate;
            inpRate.value = targetRate;
            rngRate.value = targetRate;
            syncRateToRadios(targetRate);
            if (targetRate === 2.4) {
              showToast('ℹ️ 기혼 신혼부부 조건에 따라 부부합산 전용 [신혼 버팀목 (연 2.4%)]로 자동 보정되었습니다.');
            } else {
              showToast('ℹ️ 기혼 전환에 따라 부부합산 적격인 [HUG 안심전세 (연 3.6%)]로 자동 보정되었습니다.');
            }
            corrected = true;
          }
        }
      }
    }

    // 2) 매매/분양 금리 라디오 선택 트리거 (rate-preset)
    if (triggerSource === 'rate-preset') {
      const selectedRate = options.selectedRate;
      const el = (typeof INTEREST_RATES_DATA !== 'undefined' && INTEREST_RATES_DATA.evaluateEligibility)
        ? INTEREST_RATES_DATA.evaluateEligibility(state, priceVal, 'resale')
        : null;

      if (selectedRate === 3.0) {
        if (el && el.didimdol && !el.didimdol.passed) {
          const fallbackRate = (el.bogeumjari && el.bogeumjari.passed) ? 3.8 : 4.8;
          state.loanRate = fallbackRate;
          inpRate.value = fallbackRate;
          rngRate.value = fallbackRate;
          syncRateToRadios(fallbackRate);
          showToast(`⚠️ 디딤돌대출 심사 미충족(${el.didimdol.reason})으로 [${fallbackRate === 3.8 ? '보금자리론 (연 3.8%)' : '시중은행 주담대 (연 4.8%)'}]로 자동 적용되었습니다.`);
          return true;
        }
      } else if (selectedRate === 3.8) {
        if (el && el.bogeumjari && !el.bogeumjari.passed) {
          state.loanRate = 4.8;
          inpRate.value = 4.8;
          rngRate.value = 4.8;
          syncRateToRadios(4.8);
          showToast(`⚠️ 보금자리론 심사 미충족(${el.bogeumjari.reason})으로 [시중은행 일반 주담대 (연 4.8%)]로 자동 적용되었습니다.`);
          return true;
        }
      }
    }

    // 3) 전세 금리 라디오 선택 트리거 (jeonse-rate-preset)
    if (triggerSource === 'jeonse-rate-preset') {
      const selectedRate = options.selectedRate;
      const optimal = getOptimalJeonseRateInfo();

      if (selectedRate === 2.4) {
        if (optimal.type !== 'newlywed-beotimmok' || !optimal.eligible) {
          state.loanRate = 3.6;
          inpRate.value = 3.6;
          rngRate.value = 3.6;
          syncRateToRadios(3.6);
          showToast(`⚠️ 신혼 버팀목 기준 미충족(${optimal.reason})으로 [HUG 안심전세 (연 3.6%)]로 자동 적용되었습니다.`);
          return true;
        }
        if (state.householdType === 'single') {
          setHouseholdType('couple', false, true);
          showToast('ℹ️ 신혼 버팀목 전세대출은 [부부합산 필수] 규정입니다. 가구 형태를 [👫 기혼 (부부합산)]으로 자동 보정했습니다.');
          corrected = true;
        }
      } else if (selectedRate === 2.1) {
        if (optimal.type !== 'youth-beotimmok' || !optimal.eligible) {
          state.loanRate = 3.6;
          inpRate.value = 3.6;
          rngRate.value = 3.6;
          syncRateToRadios(3.6);
          showToast(`⚠️ 청년 버팀목 기준 미충족(${optimal.reason})으로 [HUG 안심전세 (연 3.6%)]로 자동 적용되었습니다.`);
          return true;
        }
        if (state.householdType === 'couple') {
          setHouseholdType('single', false, true);
          showToast('ℹ️ 청년 버팀목은 만19~34세 단독 세대주 전용입니다. 가구 형태를 [👤 세대주 혼자 (1인)]로 자동 보정했습니다.');
          corrected = true;
        }
      }
    }

    // 4) 가격/보증금 변경 트리거 (price)
    if (triggerSource === 'price') {
      if (isResaleOrPresale) {
        // 6억 초과 주택인데 디딤돌(3.0)이나 보금자리(3.8)가 선택되어 있는 경우 ➔ 시중은행(4.8)으로 자동 보정
        if (priceVal > 600000000 && (Math.abs(rateVal - 3.0) < 0.05 || Math.abs(rateVal - 3.8) < 0.05)) {
          state.loanRate = 4.8;
          inpRate.value = 4.8;
          rngRate.value = 4.8;
          syncRateToRadios(4.8);
          showToast('⚠️ 매매가 6억 초과 주택은 정책대출 한도 초과로 [시중은행 일반 주담대 (연 4.8%)]로 자동 보정되었습니다.');
          corrected = true;
        }
      } else if (isJeonse) {
        // 보증금 4억 초과인데 신혼버팀목(2.4)이 선택되어 있는 경우 ➔ HUG 안심전세(3.6)로 자동 보정
        if (priceVal > 400000000 && Math.abs(rateVal - 2.4) < 0.05) {
          state.loanRate = 3.6;
          inpRate.value = 3.6;
          rngRate.value = 3.6;
          syncRateToRadios(3.6);
          showToast('⚠️ 보증금 4억 초과 시 신혼버팀목 불가로 [HUG 안심전세 (연 3.6%)]로 자동 보정되었습니다.');
          corrected = true;
        }
      }
    }

    // 4-2) 상시 안전 자동 전환 (Auto-Fallback) - 현재 선택된 금리가 가구/소득/가격 조건상 부적격일 때
    if (isResaleOrPresale) {
      const el = (typeof INTEREST_RATES_DATA !== 'undefined' && INTEREST_RATES_DATA.evaluateEligibility)
        ? INTEREST_RATES_DATA.evaluateEligibility(state, priceVal, 'resale')
        : null;

      if (el) {
        const isDidimdolPassed = el.didimdol ? el.didimdol.passed : true;
        const isBogeumjariPassed = el.bogeumjari ? el.bogeumjari.passed : true;

        if (Math.abs(rateVal - 3.0) < 0.05 && !isDidimdolPassed) {
          const fallbackRate = isBogeumjariPassed ? 3.8 : 4.8;
          const fallbackName = isBogeumjariPassed ? '보금자리론 (연 3.8%)' : '시중은행 주담대 (연 4.8%)';
          state.loanRate = fallbackRate;
          inpRate.value = fallbackRate;
          rngRate.value = fallbackRate;
          syncRateToRadios(fallbackRate);
          showToast(`⚠️ 디딤돌 심사 미충족(${el.didimdol.reason})으로 인해 [${fallbackName}]로 안전 자동 전환되었습니다. 🛡️`);
          corrected = true;
        } else if (Math.abs(rateVal - 3.8) < 0.05 && !isBogeumjariPassed) {
          state.loanRate = 4.8;
          inpRate.value = 4.8;
          rngRate.value = 4.8;
          syncRateToRadios(4.8);
          showToast(`⚠️ 보금자리론 심사 미충족(${el.bogeumjari.reason})으로 인해 [시중은행 주담대 (연 4.8%)]로 안전 자동 전환되었습니다. 🛡️`);
          corrected = true;
        }
      }
    } else if (isJeonse) {
      const optimalJeonse = getOptimalJeonseRateInfo();
      const isNewlywedJeonsePassed = optimalJeonse.type === 'newlywed-beotimmok' && optimalJeonse.eligible;
      const isYouthJeonsePassed = optimalJeonse.type === 'youth-beotimmok' && optimalJeonse.eligible;

      if (Math.abs(rateVal - 2.4) < 0.05 && !isNewlywedJeonsePassed) {
        state.loanRate = 3.6;
        inpRate.value = 3.6;
        rngRate.value = 3.6;
        syncRateToRadios(3.6);
        showToast('⚠️ 신혼 버팀목 기준 미충족으로 인해 [HUG 안심전세 (연 3.6%)]로 안전 자동 전환되었습니다. 🛡️');
        corrected = true;
      } else if (Math.abs(rateVal - 2.1) < 0.05 && !isYouthJeonsePassed) {
        state.loanRate = 3.6;
        inpRate.value = 3.6;
        rngRate.value = 3.6;
        syncRateToRadios(3.6);
        showToast('⚠️ 청년 버팀목 기준 미충족으로 인해 [HUG 안심전세 (연 3.6%)]로 안전 자동 전환되었습니다. 🛡️');
        corrected = true;
      }
    }

    // 5) 가계 가이드 박스 텍스트 업데이트
    const txtAuditGuideTitle = document.getElementById('txt-audit-guide-title');
    const txtAuditGuideDesc = document.getElementById('txt-audit-guide-desc');
    if (txtAuditGuideTitle && txtAuditGuideDesc) {
      if (state.householdType === 'couple') {
        txtAuditGuideTitle.textContent = '소득 심사 규정: 기혼 부부합산 심사 적용';
        txtAuditGuideDesc.textContent = '정부 정책대출(디딤돌·보금자리·신혼버팀목)의 부부합산 필수 규정을 충족하며, 시중은행 대출 시에도 부부합산 DSR 적용이 가능합니다.';
      } else {
        txtAuditGuideTitle.textContent = '소득 심사 규정: 차주 단독 심사 (보금자리론 / 시중 주담대 / 청년버팀목)';
        txtAuditGuideDesc.textContent = '보금자리론(연 7천만 이하·단독신청), 시중은행 일반 주담대(생초 LTV 80%), 청년 버팀목(5천만 이하), HUG 안심전세는 1인 단독 명의 심사가 적용됩니다.';
      }
    }


    return corrected;
  }

  // 4-6. 상환방식(드롭다운) 동적 옵션 제어 (모드 및 상품별 독립)
  function updateRepayTypeOptions(mode, rate) {
    const selRepayType = document.getElementById('sel-repay-type');
    const amortType = document.getElementById('amort-type');
    if (!selRepayType) return;
    
    const isJeonse = mode === 'jeonse';
    const isHF = (!isJeonse && (Math.abs(rate - 3.0) < 0.05 || Math.abs(rate - 3.8) < 0.05));
    
    Array.from(selRepayType.options).forEach(opt => {
      if (opt.value === 'interest-only') {
        if (isJeonse || (!isJeonse && !isHF)) {
          opt.disabled = false;
          opt.textContent = '만기일시상환 (월 이자만)';
        } else {
          opt.disabled = true;
          opt.textContent = '만기일시상환 (HF 불가)';
          if (selRepayType.value === 'interest-only') {
            selRepayType.value = 'equal-payment';
            state.repayType = 'equal-payment';
          }
        }
      } else if (opt.value === 'graduated') {
        if (isJeonse) {
          opt.disabled = true;
          opt.textContent = '체증식 분할상환 (전세 불가)';
          if (selRepayType.value === 'graduated') {
            selRepayType.value = 'interest-only';
            state.repayType = 'interest-only';
          }
        } else {
          opt.disabled = false;
          opt.textContent = '체증식 분할상환';
        }
      } else if (opt.value === 'equal-principal' || opt.value === 'equal-payment') {
        if (isJeonse) {
          // 전세에서는 만기일시상환이 기본이므로 원금 분할상환 억제 옵션 추가 가능. 하지만 HF 버팀목 등에서는 원금균등도 가능.
          opt.disabled = false; 
        } else {
          opt.disabled = false;
        }
      }
    });

    if (amortType && amortType.options.length > 0) {
      Array.from(amortType.options).forEach(opt => {
        const matchOpt = selRepayType.querySelector(`option[value="${opt.value}"]`);
        if (matchOpt) {
          opt.disabled = matchOpt.disabled;
          opt.textContent = matchOpt.textContent;
        }
      });
      if (amortType.querySelector(`option[value="${amortType.value}"]`)?.disabled) {
        amortType.value = selRepayType.value;
      }
    }
  }

  // 5. 모드 전환 핸들러 (매매, 분양, 전세, 가구조건, 금리표)
  function setMode(mode) {
    if (mode === 'resale' || mode === 'presale' || mode === 'jeonse') {
      state.simMode = mode;
    }
    state.mode = mode;

    [tabResale, tabPresale, tabJeonse, tabHousehold, tabRates, tabAmortization].forEach(tab => {
      if (tab) {
        tab.classList.remove('active');
        tab.classList.add('text-slate-600');
      }
    });

    if (mode === 'resale') {
      tabResale.classList.add('active');
      tabResale.classList.remove('text-slate-600');

      simulatorView.classList.remove('hidden');
      if (householdView) householdView.classList.add('hidden');
      ratesView.classList.add('hidden');
      if (amortizationView) amortizationView.classList.add('hidden');

      resalePresets.classList.remove('hidden');
      presalePresets.classList.add('hidden');
      jeonsePresets.classList.add('hidden');
      presetModeBadge.textContent = '매매 모드';
      presetModeBadge.className = 'text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md';

      lblPrice.innerHTML = '<i data-lucide="tag" class="w-4 h-4 text-blue-600"></i> 매매 희망 금액';
      lblEquity.innerHTML = '<i data-lucide="wallet" class="w-4 h-4 text-emerald-600"></i> 보유 순자산 (전세보증금/현금)';
      lblRateTitle.textContent = '주택담보대출 적용 금리';
      mortgageRateRadios.classList.remove('hidden');
      jeonseRateRadios.classList.add('hidden');
      containerLoanYears.classList.remove('hidden');
      if (containerChkFirstHome) containerChkFirstHome.classList.remove('hidden');
      detailsCustomExtra.classList.remove('hidden');
      lblCustomExtra.textContent = '도배/장판/샷시 정비 예산 (매매)';

      selRepayType.value = 'equal-payment';
      state.price = state.price || 450000000;
      state.equity = state.equity || 370000000;
      // 사용자가 이전에 선택한 매매 유효 금리(디딤돌 3.0, 보금자리 3.8 등)가 있으면 보존, 없으면 4.8
      const isCustomValidRate = (state.loanRate && state.loanRate >= 1.5 && state.loanRate <= 8.0 && state.loanRate !== 3.6 && state.loanRate !== 2.4 && state.loanRate !== 2.1);
      state.loanRate = isCustomValidRate ? state.loanRate : 4.8;
      inpPrice.value = (state.price).toLocaleString();
      inpEquity.value = (state.equity).toLocaleString();
      inpRate.value = state.loanRate;
      rngRate.value = state.loanRate;
      syncRateToRadios(state.loanRate);
    } else if (mode === 'presale') {
      tabPresale.classList.add('active');
      tabPresale.classList.remove('text-slate-600');

      simulatorView.classList.remove('hidden');
      if (householdView) householdView.classList.add('hidden');
      ratesView.classList.add('hidden');
      if (amortizationView) amortizationView.classList.add('hidden');

      resalePresets.classList.add('hidden');
      presalePresets.classList.remove('hidden');
      jeonsePresets.classList.add('hidden');
      presetModeBadge.textContent = '분양 모드';
      presetModeBadge.className = 'text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md';

      lblPrice.innerHTML = '<i data-lucide="construction" class="w-4 h-4 text-indigo-600"></i> 목표 분양가';
      lblEquity.innerHTML = '<i data-lucide="wallet" class="w-4 h-4 text-emerald-600"></i> 기존 전세보증금 회수액';
      lblRateTitle.textContent = '신축 잔금 주담대 적용 금리';
      mortgageRateRadios.classList.remove('hidden');
      jeonseRateRadios.classList.add('hidden');
      containerLoanYears.classList.remove('hidden');
      if (containerChkFirstHome) containerChkFirstHome.classList.remove('hidden');
      detailsCustomExtra.classList.remove('hidden');
      lblCustomExtra.textContent = '발코니 확장 및 필수 옵션 예산 (분양)';

      selRepayType.value = 'equal-payment';
      state.price = state.price || 450000000;
      state.equity = state.equity || 370000000;
      const isCustomValidPresaleRate = (state.loanRate && state.loanRate >= 1.5 && state.loanRate <= 8.0 && state.loanRate !== 3.6 && state.loanRate !== 2.4 && state.loanRate !== 2.1);
      state.loanRate = isCustomValidPresaleRate ? state.loanRate : 4.8;
      inpPrice.value = (state.price).toLocaleString();
      inpEquity.value = (state.equity).toLocaleString();
      inpRate.value = state.loanRate;
      rngRate.value = state.loanRate;
      syncRateToRadios(state.loanRate);
    } else if (mode === 'jeonse') {
      tabJeonse.classList.add('active');
      tabJeonse.classList.remove('text-slate-600');

      simulatorView.classList.remove('hidden');
      if (householdView) householdView.classList.add('hidden');
      ratesView.classList.add('hidden');
      if (amortizationView) amortizationView.classList.add('hidden');
      resalePresets.classList.add('hidden');
      presalePresets.classList.add('hidden');
      jeonsePresets.classList.remove('hidden');
      presetModeBadge.textContent = '전세 모드';
      presetModeBadge.className = 'text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md';

      lblPrice.innerHTML = '<i data-lucide="key" class="w-4 h-4 text-emerald-600"></i> 목표 전세보증금';
      lblEquity.innerHTML = '<i data-lucide="coins" class="w-4 h-4 text-emerald-600"></i> 보유 자기자본 (보유 현금)';
      lblRateTitle.textContent = '전세자금대출 적용 금리';
      mortgageRateRadios.classList.add('hidden');
      jeonseRateRadios.classList.remove('hidden');
      containerLoanYears.classList.add('hidden');
      if (containerChkFirstHome) containerChkFirstHome.classList.add('hidden');
      detailsCustomExtra.classList.add('hidden');

      selRepayType.value = 'interest-only';
      state.price = (state.price && state.price <= 500000000) ? state.price : 280000000;
      state.equity = state.equity || 250000000;

      // 가구 조건(신혼 7년이내, 1인단독, 소득)에 따른 최적 전세 정책 대출 금리 자동 판정
      const optimalJeonse = getOptimalJeonseRateInfo();
      state.loanRate = optimalJeonse.rate;

      inpPrice.value = (state.price).toLocaleString();
      inpEquity.value = (state.equity).toLocaleString();
      inpRate.value = state.loanRate;
      rngRate.value = state.loanRate;
      syncRateToRadios(state.loanRate);

      if (optimalJeonse.rate === 2.4) {
        showToast('가구 조건(혼인 7년 이내 신혼)에 맞춰 [신혼 버팀목 (연 2.4%)]가 자동 반영되었습니다! ⚡');
      } else if (optimalJeonse.rate === 2.1) {
        showToast('가구 조건(1인 단독 세대주)에 맞춰 [청년 버팀목 (연 2.1%)]이 자동 반영되었습니다! ⚡');
      }
    } else if (mode === 'household') {
      tabHousehold.classList.add('active');
      tabHousehold.classList.remove('text-slate-600');

      simulatorView.classList.add('hidden');
      ratesView.classList.add('hidden');
      if (amortizationView) amortizationView.classList.add('hidden');
      if (householdView) householdView.classList.remove('hidden');
    } else if (mode === 'rates') {
      tabRates.classList.add('active');
      tabRates.classList.remove('text-slate-600');

      simulatorView.classList.add('hidden');
      if (householdView) householdView.classList.add('hidden');
      if (amortizationView) amortizationView.classList.add('hidden');
      ratesView.classList.remove('hidden');
    } else if (mode === 'amortization') {
      tabAmortization.classList.add('active');
      tabAmortization.classList.remove('text-slate-600');

      simulatorView.classList.add('hidden');
      if (householdView) householdView.classList.add('hidden');
      ratesView.classList.add('hidden');
      if (amortizationView) amortizationView.classList.remove('hidden');
      
      // Initialize with current values
      if (amortAmount) {
        let loanAmt = 100000000;
        if (state.simMode) {
          const simPrice = state.price || 450000000;
          const simEquity = state.equity || 370000000;
          if (simPrice > simEquity) {
            loanAmt = simPrice - simEquity;
          }
        }
        amortAmount.value = loanAmt.toLocaleString();
      }
      if (amortRate) amortRate.value = state.loanRate || 4.8;
      if (amortType && selRepayType) amortType.value = selRepayType.value;
      if (amortTerm) amortTerm.value = state.loanYears || 10;
      if (amortDate && !amortDate.value) {
        const today = new Date();
        amortDate.value = today.toISOString().split('T')[0];
        
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        if (amortFirstDate) amortFirstDate.value = nextMonth.toISOString().split('T')[0];
      }
      
      setTimeout(() => {
        if (typeof calculateAmortization === 'function') {
          calculateAmortization(true);
        }
      }, 50);
    }

    refreshIcons();
    if (mode !== 'rates' && mode !== 'amortization') {
      validateAndAutoCorrectLoanRules('household');
      recalculate();
    }

    // 탭 이동 시 화면 포커스 및 스크롤 최상단 즉각 안착 (외곽선 링 방지)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      const targetView = (mode === 'household')
        ? householdView
        : ((mode === 'rates') ? ratesView : simulatorView);
      if (targetView) {
        targetView.setAttribute('tabindex', '-1');
        targetView.style.outline = 'none';
        targetView.focus({ preventScroll: true });
      }
    });

    const scrollController = document.getElementById('scroll-controller');
    if (scrollController) {
      if (mode === 'amortization') {
        scrollController.classList.remove('hidden');
        window.dispatchEvent(new Event('scroll'));
      } else {
        scrollController.classList.add('hidden');
      }
    }
  }

  // 6-1. 가구 조건 요약 배지 및 사이드바 미니 배너 동시 업데이트
  function updateHouseholdSummaryBadge() {
    let summaryText = '';
    let isSingle = (state.householdType === 'single');

    if (isSingle) {
      summaryText = '1인 단독 · 무주택';
      if (badgeHouseholdSummary) {
        badgeHouseholdSummary.textContent = '1인 단독 · 무주택';
        badgeHouseholdSummary.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800';
      }
    } else {
      const periodStr = state.marriagePeriod === 'under7' ? '신혼 (7년내)' : '기혼 7년+';
      const childStr = state.childCount > 0 ? `${state.childCount}자녀` : '무자녀';
      const incomeStr = state.incomeType === 'single-earner' ? '외벌이' : (state.incomeType === 'individual' ? '단독' : '맞벌이');
      summaryText = `${periodStr} · ${childStr} · ${incomeStr}`;
      if (badgeHouseholdSummary) {
        badgeHouseholdSummary.textContent = summaryText;
        badgeHouseholdSummary.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800';
      }
    }

    // 사이드바 미니 배너 실시간 동기화
    if (sidebarHouseholdSummaryText) {
      const firstHomeStr = state.isFirstHome ? ' · 생초' : '';
      sidebarHouseholdSummaryText.textContent = `${isSingle ? '👤 1인단독' : '👫 ' + summaryText}${firstHomeStr}`;
    }

    if (sidebarActiveProfileName && HOUSEHOLD_PROFILES && HOUSEHOLD_PROFILES[state.activeProfile]) {
      sidebarActiveProfileName.textContent = HOUSEHOLD_PROFILES[state.activeProfile].name;
    }
  }

  // 6-2. 혼인 기간 UI 업데이트
  function updateMarriagePeriodUI(period) {
    state.marriagePeriod = period;
    marriagePeriodRadios.forEach(radio => {
      radio.checked = (radio.value === period);
    });
    marriagePeriodLabels.forEach(label => {
      const radio = label.querySelector('input[type="radio"]');
      if (radio && radio.value === period) {
        label.className = 'marriage-period-btn flex items-center justify-center py-1.5 px-2 rounded-lg cursor-pointer transition bg-white text-blue-700 shadow-sm font-bold';
      } else {
        label.className = 'marriage-period-btn flex items-center justify-center py-1.5 px-2 rounded-lg cursor-pointer transition text-slate-600 hover:text-slate-900 font-bold';
      }
    });
    updateHouseholdSummaryBadge();
  }

  // 6-3. 자녀 수 UI 업데이트
  function updateChildCountUI(count) {
    state.childCount = Number(count);
    childCountBtns.forEach(btn => {
      const btnCount = Number(btn.getAttribute('data-count'));
      if (btnCount === state.childCount) {
        btn.className = 'child-count-btn active py-1.5 text-xs font-bold rounded-lg border-2 border-blue-500 bg-blue-50 text-blue-800 transition shadow-xs';
      } else {
        btn.className = 'child-count-btn py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-blue-50 text-slate-700 transition';
      }
    });

    if (txtChildCountDisplay) {
      const labels = ['0자녀 (상한 7,000만)', '1자녀 (특례 9,000만)', '2자녀+ 다자녀 (특례 1억 원)', '3자녀+ 다자녀 (특례 1억 원)'];
      txtChildCountDisplay.textContent = labels[state.childCount] || `${state.childCount}자녀`;
    }
    updateHouseholdSummaryBadge();
  }

  // 6-4. 소득 형태 빠른 선택 UI 업데이트 (가구 형태 세그먼트 디자인과 100% 일치)
  function updateIncomeTypeUI(incomeType) {
    state.incomeType = incomeType;
    quickIncomeBtns.forEach(btn => {
      const type = btn.getAttribute('data-income-type');
      if (type === incomeType) {
        btn.className = 'quick-income-btn active flex items-center justify-center py-2 px-3 rounded-lg text-xs font-bold cursor-pointer transition bg-white text-blue-700 shadow-sm';
      } else {
        btn.className = 'quick-income-btn flex items-center justify-center py-2 px-3 rounded-lg text-xs font-bold cursor-pointer transition text-slate-600 hover:text-slate-900';
      }
    });
    updateHouseholdSummaryBadge();
  }

  // 6-5. 실시간 대출 적격성 종합 진단 UI 갱신
  function updateEligibilityUI(eligibility, strategyComparison) {
    if (!eligibility) return;

    // 1) 디딤돌대출 상태
    if (badgeDidimdolStatus && txtDidimdolReason) {
      const d = eligibility.didimdol;
      if (d.passed) {
        badgeDidimdolStatus.textContent = '⭕ 승인 적격';
        badgeDidimdolStatus.className = 'text-[9.5px] px-1.5 py-0.2 rounded font-extrabold bg-emerald-100 text-emerald-800';
        txtDidimdolReason.textContent = d.reason || `소득 ${ScenarioEngine.formatKoreanMoney(d.incomeLimit)} 이하 충족 (LTV 80% 가능)`;
      } else {
        badgeDidimdolStatus.textContent = '❌ 부적격';
        badgeDidimdolStatus.className = 'text-[9.5px] px-1.5 py-0.2 rounded font-extrabold bg-red-100 text-red-700';
        txtDidimdolReason.textContent = d.reason || (d.failReasons && d.failReasons.join(', ')) || '심사 기준 미충족';
      }
    }

    // 2) 보금자리론 상태
    if (badgeBogeumjariStatus && txtBogeumjariReason) {
      const b = eligibility.bogeumjari;
      if (b.passed) {
        badgeBogeumjariStatus.textContent = '⭕ 승인 적격';
        badgeBogeumjariStatus.className = 'text-[9.5px] px-1.5 py-0.2 rounded font-extrabold bg-emerald-100 text-emerald-800';
        txtBogeumjariReason.textContent = b.reason || `소득 ${ScenarioEngine.formatKoreanMoney(b.incomeLimit)} 이하 충족`;
      } else {
        badgeBogeumjariStatus.textContent = '❌ 부적격';
        badgeBogeumjariStatus.className = 'text-[9.5px] px-1.5 py-0.2 rounded font-extrabold bg-red-100 text-red-700';
        txtBogeumjariReason.textContent = b.reason || (b.failReasons && b.failReasons.join(', ')) || '심사 기준 미충족';
      }
    }

    // 3) 시중은행 주담대 / 전세대출 상태
    if (badgeCommercialStatus && txtCommercialReason) {
      const c = eligibility.commercial;
      if (c.passed) {
        badgeCommercialStatus.textContent = '⭕ 승인 적격';
        badgeCommercialStatus.className = 'text-[9.5px] px-1.5 py-0.2 rounded font-extrabold bg-blue-100 text-blue-800';
        txtCommercialReason.textContent = c.reason || `${c.auditType === 'couple' ? '기혼 부부합산 DSR 40%' : '차주 단독 DSR 40%'} 충족 (LTV 80%)`;
      } else {
        badgeCommercialStatus.textContent = '⚠️ DSR 주의';
        badgeCommercialStatus.className = 'text-[9.5px] px-1.5 py-0.2 rounded font-extrabold bg-amber-100 text-amber-800';
        txtCommercialReason.textContent = c.reason || (c.failReasons && c.failReasons.join(', ')) || 'DSR 규제 초과';
      }
    }

    // 3-2) 버팀목 전세대출 상태 갱신
    if (badgeBeotimmokStatus && txtBeotimmokReason) {
      const optimalJeonse = getOptimalJeonseRateInfo();
      if (lblBeotimmokTitle) {
        lblBeotimmokTitle.textContent = optimalJeonse.title || '버팀목 전세대출';
      }
      if (lblBeotimmokSource) {
        lblBeotimmokSource.textContent = optimalJeonse.eligible ? '기금 전세자금' : 'HUG 반환보증 100%';
      }
      badgeBeotimmokStatus.textContent = optimalJeonse.badge;
      if (optimalJeonse.eligible) {
        badgeBeotimmokStatus.className = optimalJeonse.rate === 2.1
          ? 'text-[10px] px-2 py-0.5 rounded font-extrabold bg-indigo-100 text-indigo-800 whitespace-nowrap flex-shrink-0'
          : 'text-[10px] px-2 py-0.5 rounded font-extrabold bg-emerald-100 text-emerald-800 whitespace-nowrap flex-shrink-0';
      } else {
        badgeBeotimmokStatus.className = 'text-[10px] px-2 py-0.5 rounded font-extrabold bg-slate-100 text-slate-700 whitespace-nowrap flex-shrink-0';
      }
      txtBeotimmokReason.textContent = optimalJeonse.reason;
      if (txtBeotimmokApplyAction) {
        txtBeotimmokApplyAction.textContent = '전세대출 분석 ➔';
      }
    }

    // 4) 외벌이 전략 이자 절감 알림 배너
    if (bannerSingleEarnerTip) {
      const isEligibleForTip = (!eligibility.didimdol.passed) && (state.householdType === 'couple') && (state.incomeType === 'double');
      if (isEligibleForTip) {
        bannerSingleEarnerTip.classList.remove('hidden');
        if (txtSingleEarnerTipDesc && strategyComparison) {
          const savingWon = ScenarioEngine.formatKoreanMoney(strategyComparison.totalInterestSaving);
          txtSingleEarnerTipDesc.innerHTML = `배우자 서류상 무직 처리 시 <span class="font-bold underline">디딤돌 3.0% (30년 총이자 ${savingWon} 순절감)</span> 즉시 가능!`;
        }
      } else {
        bannerSingleEarnerTip.classList.add('hidden');
      }
    }

    // 5) 사이드바 가구 진단 요약 배지 업데이트
    if (sidebarHouseholdDiagnosisBadge) {
      if (eligibility.didimdol && eligibility.didimdol.passed) {
        sidebarHouseholdDiagnosisBadge.textContent = '디딤돌 3.0% 승인';
        sidebarHouseholdDiagnosisBadge.className = 'flex-shrink-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800';
      } else if (eligibility.bogeumjari && eligibility.bogeumjari.passed) {
        sidebarHouseholdDiagnosisBadge.textContent = '보금자리 3.8% 승인';
        sidebarHouseholdDiagnosisBadge.className = 'flex-shrink-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800';
      } else {
        sidebarHouseholdDiagnosisBadge.textContent = '시중은행 4.8% 대상';
        sidebarHouseholdDiagnosisBadge.className = 'flex-shrink-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700';
      }
    }

    // 6) 진단 카드 금리 적용 하이라이트 및 부적격 잠금 동기화
    highlightSelectedLoanCard(state.loanRate, eligibility);
  }

  // 6-5-2. 진단 카드 시각적 적용 상태 및 부적격 잠금 갱신 함수
  function highlightSelectedLoanCard(rate, eligibilityData) {
    const cardDidimdol = document.getElementById('card-didimdol-status');
    const cardBogeumjari = document.getElementById('card-bogeumjari-status');
    const cardCommercial = document.getElementById('card-commercial-status');
    const cardBeotimmok = document.getElementById('card-beotimmok-status');

    const txtDidimdolApply = document.getElementById('txt-didimdol-apply-action');
    const txtBogeumjariApply = document.getElementById('txt-bogeumjari-apply-action');
    const txtCommercialApply = document.getElementById('txt-commercial-apply-action');
    const txtBeotimmokApply = document.getElementById('txt-beotimmok-apply-action');

    const purchasePrice = (state.mode === 'jeonse') ? 450000000 : (Number(state.price) || 450000000);
    const el = eligibilityData || (typeof INTEREST_RATES_DATA !== 'undefined' && INTEREST_RATES_DATA.evaluateEligibility
      ? INTEREST_RATES_DATA.evaluateEligibility(state, purchasePrice, 'resale')
      : null);

    const isDidimdolPassed = el && el.didimdol ? el.didimdol.passed : true;
    const isBogeumjariPassed = el && el.bogeumjari ? el.bogeumjari.passed : true;
    const optimalJeonse = getOptimalJeonseRateInfo();

    const isDidimdol = Math.abs(rate - 3.0) < 0.05;
    const isBogeumjari = Math.abs(rate - 3.8) < 0.05;
    const isCommercial = Math.abs(rate - 4.8) < 0.05;
    const isBeotimmokRate = (Math.abs(rate - 2.4) < 0.05 || Math.abs(rate - 2.1) < 0.05);
    const isJeonseActive = (state.mode === 'jeonse' || (state.mode === 'household' && state.simMode === 'jeonse'));

    // 1) 디딤돌 진단 카드 (부적격 시 잠금)
    if (cardDidimdol) {
      if (!isDidimdolPassed) {
        cardDidimdol.className = 'p-4 rounded-xl bg-slate-100/70 border border-slate-200 opacity-50 cursor-not-allowed select-none transition flex flex-col justify-between';
        cardDidimdol.title = `⚠️ 디딤돌대출 신청 불가: ${(el && el.didimdol && el.didimdol.reason) || '심사 기준 미충족'}`;
        if (txtDidimdolApply) {
          txtDidimdolApply.className = 'text-red-500 font-extrabold text-xs flex items-center gap-1';
          txtDidimdolApply.textContent = '신청 불가 ❌';
        }
      } else if (isDidimdol) {
        cardDidimdol.className = 'p-4 rounded-xl bg-emerald-50/80 border-2 border-emerald-500 ring-2 ring-emerald-200 shadow-md transition cursor-pointer flex flex-col justify-between';
        cardDidimdol.title = '클릭 시 디딤돌 금리(연 3.0%)로 매매 시뮬레이터 즉시 이동';
        if (txtDidimdolApply) {
          txtDidimdolApply.className = 'text-emerald-800 font-black flex items-center gap-1';
          txtDidimdolApply.innerHTML = '✓ 적용 중 (연 3.0%) <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>';
        }
      } else {
        cardDidimdol.className = 'p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition cursor-pointer flex flex-col justify-between';
        cardDidimdol.title = '클릭 시 디딤돌 금리(연 3.0%)로 매매 시뮬레이터 즉시 이동';
        if (txtDidimdolApply) {
          txtDidimdolApply.className = 'text-emerald-700 font-bold transition';
          txtDidimdolApply.textContent = '매매 분석 ➔';
        }
      }
    }

    // 2) 보금자리론 진단 카드 (부적격 시 잠금)
    if (cardBogeumjari) {
      if (!isBogeumjariPassed) {
        cardBogeumjari.className = 'p-4 rounded-xl bg-slate-100/70 border border-slate-200 opacity-50 cursor-not-allowed select-none transition flex flex-col justify-between';
        cardBogeumjari.title = `⚠️ 보금자리론 신청 불가: ${(el && el.bogeumjari && el.bogeumjari.reason) || '심사 기준 미충족'}`;
        if (txtBogeumjariApply) {
          txtBogeumjariApply.className = 'text-red-500 font-extrabold text-xs flex items-center gap-1';
          txtBogeumjariApply.textContent = '신청 불가 ❌';
        }
      } else if (isBogeumjari) {
        cardBogeumjari.className = 'p-4 rounded-xl bg-indigo-50/80 border-2 border-indigo-500 ring-2 ring-indigo-200 shadow-md transition cursor-pointer flex flex-col justify-between';
        cardBogeumjari.title = '클릭 시 보금자리론 금리(연 3.8%)로 매매 시뮬레이터 즉시 이동';
        if (txtBogeumjariApply) {
          txtBogeumjariApply.className = 'text-indigo-800 font-black flex items-center gap-1';
          txtBogeumjariApply.innerHTML = '✓ 적용 중 (연 3.8%) <span class="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>';
        }
      } else {
        cardBogeumjari.className = 'p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition cursor-pointer flex flex-col justify-between';
        cardBogeumjari.title = '클릭 시 보금자리론 금리(연 3.8%)로 매매 시뮬레이터 즉시 이동';
        if (txtBogeumjariApply) {
          txtBogeumjariApply.className = 'text-indigo-700 font-bold transition';
          txtBogeumjariApply.textContent = '매매 분석 ➔';
        }
      }
    }

    // 3) 시중은행 주담대 진단 카드
    if (cardCommercial) {
      if (isCommercial) {
        cardCommercial.className = 'p-4 rounded-xl bg-blue-50/80 border-2 border-blue-500 ring-2 ring-blue-200 shadow-md transition cursor-pointer flex flex-col justify-between';
        cardCommercial.title = '클릭 시 시중은행 주담대(연 4.8%)로 매매 시뮬레이터 즉시 이동';
        if (txtCommercialApply) {
          txtCommercialApply.className = 'text-blue-800 font-black flex items-center gap-1';
          txtCommercialApply.innerHTML = '✓ 적용 중 (연 4.8%) <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>';
        }
      } else {
        cardCommercial.className = 'p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition cursor-pointer flex flex-col justify-between';
        cardCommercial.title = '클릭 시 시중은행 주담대(연 4.8%)로 매매 시뮬레이터 즉시 이동';
        if (txtCommercialApply) {
          txtCommercialApply.className = 'text-blue-700 font-bold transition';
          txtCommercialApply.textContent = '매매 분석 ➔';
        }
      }
    }

    // 4) 버팀목 전세대출 진단 카드
    if (cardBeotimmok) {
      if (!optimalJeonse.eligible) {
        // 전세 버팀목 기준 미충족 시 (HUG 안심전세 추천)
        if (isJeonseActive && Math.abs(rate - 3.6) < 0.05) {
          cardBeotimmok.className = 'p-4 rounded-xl bg-slate-100 border border-slate-300 transition cursor-pointer flex flex-col justify-between';
          cardBeotimmok.title = '클릭 시 HUG 안심전세(연 3.6%)로 전세대출 시뮬레이터 즉시 이동';
          if (txtBeotimmokApply) {
            txtBeotimmokApply.className = 'text-slate-800 font-black flex items-center gap-1';
            txtBeotimmokApply.innerHTML = '✓ HUG 적용 중 (연 3.6%) <span class="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>';
          }
        } else {
          cardBeotimmok.className = 'p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition cursor-pointer flex flex-col justify-between';
          cardBeotimmok.title = '클릭 시 HUG 안심전세(연 3.6%)로 전세대출 시뮬레이터 즉시 이동';
          if (txtBeotimmokApply) {
            txtBeotimmokApply.className = 'text-slate-600 font-bold transition';
            txtBeotimmokApply.textContent = '전세대출 분석 ➔';
          }
        }
      } else if (isJeonseActive && isBeotimmokRate) {
        cardBeotimmok.className = 'p-4 rounded-xl bg-teal-50/80 border-2 border-teal-500 ring-2 ring-teal-200 shadow-md transition cursor-pointer flex flex-col justify-between';
        cardBeotimmok.title = `클릭 시 [${optimalJeonse.name}]로 전세대출 시뮬레이터 즉시 이동`;
        if (txtBeotimmokApply) {
          txtBeotimmokApply.className = 'text-teal-800 font-black flex items-center gap-1';
          txtBeotimmokApply.innerHTML = `✓ 적용 중 (연 ${rate.toFixed(1)}%) <span class="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>`;
        }
      } else {
        cardBeotimmok.className = 'p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition cursor-pointer flex flex-col justify-between';
        cardBeotimmok.title = `클릭 시 [${optimalJeonse.name}]로 전세대출 시뮬레이터 즉시 이동`;
        if (txtBeotimmokApply) {
          txtBeotimmokApply.className = 'text-teal-700 font-bold transition';
          txtBeotimmokApply.textContent = '전세대출 분석 ➔';
        }
      }
    }
  }

  // 6-6. 가구 조건 5대 사전 설정 프로필 원클릭 적용 함수
  function applyHouseholdProfile(profileId) {
    const profiles = (typeof HOUSEHOLD_PROFILES !== 'undefined' && HOUSEHOLD_PROFILES)
      ? HOUSEHOLD_PROFILES
      : ((typeof INTEREST_RATES_DATA !== 'undefined' && INTEREST_RATES_DATA.HOUSEHOLD_PROFILES)
        ? INTEREST_RATES_DATA.HOUSEHOLD_PROFILES
        : null);

    if (!profiles || !profiles[profileId]) return;
    const p = profiles[profileId];

    state.activeProfile = profileId;
    state.householdType = p.householdType;
    state.marriagePeriod = p.marriagePeriod;
    state.childCount = p.childCount;
    state.incomeType = p.incomeType;
    state.annualIncome = p.annualIncome;
    state.monthlyNetIncome = p.monthlyNetIncome;
    state.isFirstHome = p.isFirstHome;
    state.isHomeless = p.isHomeless;
    const isJeonseActive = (state.mode === 'jeonse' || (state.mode === 'household' && state.simMode === 'jeonse'));
    if (isJeonseActive && p.recommendedJeonseRate) {
      state.loanRate = p.recommendedJeonseRate;
    } else {
      state.loanRate = p.recommendedRate;
    }

    // 폼 입력 요소 일괄 동기화
    inpAnnualIncome.value = formatMoney(p.annualIncome);
    inpMonthlyIncome.value = formatMoney(p.monthlyNetIncome);
    if (chkFirstHome) chkFirstHome.checked = p.isFirstHome;
    if (chkHomeless) chkHomeless.checked = p.isHomeless;
    inpRate.value = state.loanRate;
    rngRate.value = state.loanRate;
    syncRateToRadios(state.loanRate);

    // 가구 형태 및 세부 라디오/버튼 상태 동기화 (재계산은 마지막에 1회만 단독 실행)
    setHouseholdType(p.householdType, false, true, true);
    updateMarriagePeriodUI(p.marriagePeriod);
    updateChildCountUI(p.childCount);
    updateIncomeTypeUI(p.incomeType);

    // 혼인 기간 컨테이너 노출 여부
    if (containerMarriagePeriod) {
      containerMarriagePeriod.classList.toggle('hidden', p.householdType === 'single');
    }

    // 1) 상단 가구 프로필 카드 스타일 갱신
    const cardTagNames = {
      'couple-double': '표준',
      'couple-single-earner': '전략특화',
      'couple-child1': '1자녀특례',
      'newlywed': '신혼특화',
      'single': '단독'
    };
    document.querySelectorAll('.profile-preset-card').forEach(card => {
      const pid = card.getAttribute('data-profile');
      const badge = card.querySelector('.profile-card-status-badge');
      if (pid === profileId) {
        card.className = 'profile-preset-card active p-3 rounded-xl border-2 border-indigo-500 bg-indigo-50/70 transition text-left flex flex-col justify-between shadow-sm hover:border-indigo-600 group';
        if (badge) {
          badge.className = 'profile-card-status-badge text-[10px] font-extrabold text-indigo-700 bg-white px-1.5 py-0.5 rounded shadow-xs border border-indigo-200 whitespace-nowrap flex-shrink-0';
          badge.textContent = '선택됨';
        }
      } else {
        card.className = 'profile-preset-card p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-left flex flex-col justify-between hover:border-slate-300 group';
        if (badge) {
          badge.className = 'profile-card-status-badge text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 border border-slate-200/60';
          badge.textContent = cardTagNames[pid] || '미선택';
        }
      }
    });

    // 2) 사이드바 5열 프리셋 버튼 바 스타일 갱신
    document.querySelectorAll('.profile-preset-bar-btn').forEach(btn => {
      const pid = btn.getAttribute('data-profile');
      if (pid === profileId) {
        btn.className = 'profile-preset-bar-btn active py-1.5 px-0.5 text-center rounded-lg border-2 border-indigo-500 bg-indigo-50 text-indigo-900 font-bold transition shadow-xs text-[10px] whitespace-nowrap flex items-center justify-center';
      } else {
        btn.className = 'profile-preset-bar-btn py-1.5 px-0.5 text-center rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 font-bold transition text-[10px] whitespace-nowrap flex items-center justify-center';
      }
    });

    // 3) 배지 전수 동기화
    document.querySelectorAll('.active-profile-badge').forEach(b => {
      b.textContent = p.name;
    });

    recalculate();
    showToast(`가구 조건 [${p.name}] 사전 설정이 전격 적용되었습니다! 🎯`);
  }

  // 6. 가구 형태(부부합산 vs 단독 세대주) 전환 함수
  function setHouseholdType(type, updateDefaults = false, skipValidation = false, skipRecalculate = false) {
    state.householdType = type;
    
    householdRadioLabels.forEach(label => {
      const radio = label.querySelector('input[type="radio"]');
      if (radio.value === type) {
        radio.checked = true;
        label.className = 'household-radio-btn flex items-center justify-center py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition bg-white text-blue-700 shadow-sm';
      } else {
        radio.checked = false;
        label.className = 'household-radio-btn flex items-center justify-center py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition text-slate-600 hover:text-slate-900';
      }
    });

    if (containerMarriagePeriod) {
      containerMarriagePeriod.classList.toggle('hidden', type === 'single');
    }

    if (type === 'couple') {
      lblAnnualIncome.textContent = '부부합산 연소득';
      if (updateDefaults) {
        inpAnnualIncome.value = (77000000).toLocaleString();
        inpMonthlyIncome.value = (5300000).toLocaleString();
      }
    } else {
      lblAnnualIncome.textContent = '단독 세대주 연소득';
      if (updateDefaults) {
        inpAnnualIncome.value = (50000000).toLocaleString();
        inpMonthlyIncome.value = (3600000).toLocaleString();
      }
    }

    updateHouseholdSummaryBadge();

    if (!skipValidation) {
      validateAndAutoCorrectLoanRules('household');
    }
    if (!skipRecalculate) {
      recalculate();
    }
  }

  // 7. 메인 재계산 및 렌더링 함수
  function recalculate() {
    // 0) 가구 형태, 혼인 기간, 자녀 수, 소득 형태 DOM 최신값 실시간 동기화
    const checkedHousehold = document.querySelector('input[name="household-type"]:checked');
    if (checkedHousehold) state.householdType = checkedHousehold.value;

    const checkedPeriod = document.querySelector('input[name="marriage-period"]:checked');
    if (checkedPeriod) state.marriagePeriod = checkedPeriod.value;

    const activeChildBtn = document.querySelector('.child-count-btn.active');
    if (activeChildBtn) state.childCount = Number(activeChildBtn.getAttribute('data-count') || 0);

    const activeIncomeBtn = document.querySelector('.quick-income-btn.active');
    if (activeIncomeBtn) state.incomeType = activeIncomeBtn.getAttribute('data-income-type') || 'double';

    // 1) 폼 입력값 상태 동기화 (천단위 콤마 제거 파싱)
    state.price = parseMoney(inpPrice.value);
    state.equity = parseMoney(inpEquity.value);
    state.equityDeposit = inpEquityDeposit ? parseMoney(inpEquityDeposit.value) : 0;
    state.equitySavings = inpEquitySavings ? parseMoney(inpEquitySavings.value) : 0;
    state.equityGift = inpEquityGift ? parseMoney(inpEquityGift.value) : 0;
    state.loanRate = Number(inpRate.value) || 4.8;
    state.loanYears = Number(selLoanYears.value) || 30;
    state.repayType = selRepayType.value;
    const defaultAnnual = (state.householdType === 'single') ? 50000000 : 77000000;
    const defaultMonthly = (state.householdType === 'single') ? 3600000 : 5300000;
    state.annualIncome = parseMoney(inpAnnualIncome.value) || defaultAnnual;
    state.monthlyNetIncome = parseMoney(inpMonthlyIncome.value) || defaultMonthly;
    state.isFirstHome = chkFirstHome.checked;
    state.isHomeless = chkHomeless.checked;
    state.creditLoanRate = Number(inpCreditRate.value) || 4.5;
    state.customExtra = inpCustomExtra.value ? parseMoney(inpCustomExtra.value) : null;
    state.includeMandatory = chkIncludeMandatory ? chkIncludeMandatory.checked : true;
    state.includeMovein = chkIncludeMovein ? chkIncludeMovein.checked : false;
    state.moveinExtra = inpMoveinExtra ? parseMoney(inpMoveinExtra.value) : 0;

    // 표시 텍스트 갱신
    txtPriceDisplay.textContent = ScenarioEngine.formatKoreanMoney(state.price);
    txtEquityDisplay.textContent = ScenarioEngine.formatKoreanMoney(state.equity);
    txtRateDisplay.textContent = `연 ${state.loanRate.toFixed(1)}%`;
    if (txtAnnualIncomeDisplay) {
      txtAnnualIncomeDisplay.textContent = ScenarioEngine.formatKoreanMoney(state.annualIncome);
    }
    if (txtMonthlyIncomeDisplay) {
      txtMonthlyIncomeDisplay.textContent = ScenarioEngine.formatKoreanMoney(state.monthlyNetIncome);
    }
    if (txtCustomExtraDisplay) {
      txtCustomExtraDisplay.textContent = state.customExtra ? ScenarioEngine.formatKoreanMoney(state.customExtra) : '';
    }
    if (txtMoveinExtraDisplay) {
      txtMoveinExtraDisplay.textContent = state.moveinExtra ? ScenarioEngine.formatKoreanMoney(state.moveinExtra) : '0원';
    }
    if (containerOptionalInputs) {
      containerOptionalInputs.classList.toggle('opacity-40', !state.includeMovein);
      containerOptionalInputs.classList.toggle('pointer-events-none', !state.includeMovein);
    }

    // 라디오 카드 하이라이트 동기화
    updateRateRadioStyles();
    updateHouseholdSummaryBadge();

    // 2) 시나리오 계산 엔진 실행
    let scenario;
    const calcMode = (state.mode === 'household' || state.mode === 'rates')
      ? (state.simMode || 'resale')
      : state.mode;

    const equityBreakdownParam = {
      deposit: state.equityDeposit,
      savings: state.equitySavings,
      gift: state.equityGift
    };

    if (calcMode === 'resale') {
      scenario = ScenarioEngine.generateResaleScenario({
        householdType: state.householdType,
        marriagePeriod: state.marriagePeriod,
        childCount: state.childCount,
        incomeType: state.incomeType,
        price: state.price,
        equity: state.equity,
        equityBreakdown: equityBreakdownParam,
        annualIncome: state.annualIncome,
        monthlyNetIncome: state.monthlyNetIncome,
        loanRate: state.loanRate,
        loanYears: state.loanYears,
        repayType: state.repayType,
        creditLoanRate: state.creditLoanRate,
        isFirstHome: state.isFirstHome,
        isHomeless: state.isHomeless,
        customRefurbishCost: state.customExtra,
        customMoveinCost: state.moveinExtra,
        includeMovein: state.includeMovein,
        includeMandatory: state.includeMandatory
      });
      state.generatedMarkdown = MarkdownGenerator.generateResaleMarkdown(scenario);
    } else if (calcMode === 'presale') {
      scenario = ScenarioEngine.generatePresaleScenario({
        householdType: state.householdType,
        marriagePeriod: state.marriagePeriod,
        childCount: state.childCount,
        incomeType: state.incomeType,
        price: state.price,
        equity: state.equity,
        equityBreakdown: equityBreakdownParam,
        annualIncome: state.annualIncome,
        monthlyNetIncome: state.monthlyNetIncome,
        loanRate: state.loanRate,
        loanYears: state.loanYears,
        repayType: state.repayType,
        creditLoanRate: state.creditLoanRate,
        isFirstHome: state.isFirstHome,
        isHomeless: state.isHomeless,
        customOptionCost: state.customExtra,
        customMoveinCost: state.moveinExtra,
        includeMovein: state.includeMovein,
        includeMandatory: state.includeMandatory
      });
      state.generatedMarkdown = MarkdownGenerator.generatePresaleMarkdown(scenario);
    } else {
      scenario = ScenarioEngine.generateJeonseScenario({
        householdType: state.householdType,
        marriagePeriod: state.marriagePeriod,
        childCount: state.childCount,
        incomeType: state.incomeType,
        deposit: state.price,
        equity: state.equity,
        equityBreakdown: equityBreakdownParam,
        annualIncome: state.annualIncome,
        monthlyNetIncome: state.monthlyNetIncome,
        loanRate: state.loanRate,
        repayType: state.repayType,
        isHomeless: state.isHomeless,
        customMoveinCost: state.moveinExtra,
        includeMovein: state.includeMovein,
        includeMandatory: state.includeMandatory
      });
      state.generatedMarkdown = MarkdownGenerator.generateJeonseMarkdown(scenario);
    }

    // 가이드 V4 심사 팩트 기반 적격성 진단 UI 갱신
    updateEligibilityUI(scenario.eligibility, scenario.strategyComparison);

    // 사이드바 필수/선택 요약 실시간 갱신
    if (txtMandatoryExpenseSum && scenario.mandatoryExpense !== undefined) {
      txtMandatoryExpenseSum.textContent = state.includeMandatory 
        ? `약 ${ScenarioEngine.formatKoreanMoney(scenario.mandatoryExpense)}`
        : '0원 (미포함)';
    }
    if (txtOptionalExpenseSum && scenario.optionalExpense !== undefined) {
      txtOptionalExpenseSum.textContent = scenario.isMoveinIncluded 
        ? `약 ${ScenarioEngine.formatKoreanMoney(scenario.optionalExpense)}`
        : '0원 (미포함)';
    }
    if (txtMandatoryTaxDetail && scenario.expenseData && scenario.expenseData.taxInfo) {
      txtMandatoryTaxDetail.textContent = `약 ${ScenarioEngine.formatTenThousand(scenario.expenseData.taxInfo.finalTax, false)}`;
    }
    if (txtMandatoryBrokerageDetail && scenario.expenseData && scenario.expenseData.brokerageInfo) {
      txtMandatoryBrokerageDetail.textContent = `약 ${ScenarioEngine.formatTenThousand(scenario.expenseData.brokerageInfo.totalFee, false)}`;
    }
    if (txtMandatoryRegDetail && scenario.expenseData && scenario.expenseData.regFee) {
      txtMandatoryRegDetail.textContent = `약 ${ScenarioEngine.formatTenThousand(scenario.expenseData.regFee, false)}`;
    }

    // 3) 그래픽 대시보드 렌더링
    renderDashboard(scenario);

    // 4) 마크다운 뷰 렌더링
    if (window.marked) {
      markdownRenderedContent.innerHTML = window.marked.parse(state.generatedMarkdown);
    } else {
      markdownRenderedContent.textContent = state.generatedMarkdown;
    }

    refreshIcons();
  }

  // 8. 대시보드 렌더링 세부 함수
  function renderDashboard(s) {
    const formatWon = ScenarioEngine.formatKoreanMoney;
    const formatTenMan = ScenarioEngine.formatTenThousand;
    const isCouple = s.householdType === 'couple';
    const incomeLabel = isCouple ? '부부합산 연소득' : '단독 연소득';

    const surplusMinMan = Math.floor(s.surplusMin / 10000);
    const surplusMaxMan = Math.floor(s.surplusMax / 10000);
    cardSurplus.textContent = `${surplusMinMan}만~${surplusMaxMan}만`;

    if (s.type === 'jeonse') {
      // ===== 전세자금대출 대시보드 렌더링 =====
      cardLblTotal.textContent = '총 전세 소요 예산';
      cardTotalBudget.textContent = formatWon(s.totalBudget);
      cardBudgetSub.textContent = s.isMoveinIncluded 
        ? `순수 전세 ${formatWon(s.pureTotalBudget)} / 이사 포함 ${formatWon(s.fullTotalBudget)}`
        : `순수 전세 ${formatWon(s.pureTotalBudget)} (이사비 미포함)`;

      cardLblLoan.textContent = '필요 전세대출금';
      cardRequiredLoan.textContent = formatWon(s.requiredLoan);
      cardLtvBadge.textContent = `대출비율 ${s.loanRatio}% (안전 한도 80% 이내)`;

      cardLblMonthly.textContent = s.repayType === 'equal-payment' ? '월 원리금 상환액' : '월 순수 이자 부담';
      cardMonthlyPaymentDetail.classList.add('hidden');
      cardMonthlyPayment.textContent = formatTenMan(s.monthlyPayment);
      cardHousingRatio.textContent = `실수령액의 ${s.housingRatio}% (${s.housingRatio <= 10 ? '최상급 초안전' : '안정권'})`;

      const extraCostTotal = (state.includeMandatory ? s.mandatoryExpense : 0) + (s.isMoveinIncluded ? s.optionalExpense : 0);
      const extraCostDesc = (state.includeMandatory && s.isMoveinIncluded)
        ? `법정비용(${formatTenMan(s.mandatoryExpense, false)}) + 입주이사비(${formatTenMan(s.optionalExpense, false)}) 별도 현금 준비 필요`
        : (state.includeMandatory
            ? `중개보수/보증료 등 법정 필수비용(${formatTenMan(s.mandatoryExpense, false)}) 별도 현금 준비 필요`
            : `포장이사/청소 등 입주비용(${formatTenMan(s.optionalExpense, false)}) 별도 현금 준비 필요`);

      titleFundingSection.innerHTML = `<i data-lucide="pie-chart" class="w-5 h-5 text-emerald-600"></i> 전세 자금 조달 구조 및 건전성 지표`;
      tbodyFundingStructure.innerHTML = `
        <tr>
          <td class="px-4 py-3 font-bold text-slate-900">1. 목표 전세보증금</td>
          <td class="px-4 py-3 text-right font-extrabold text-emerald-600">${formatWon(s.deposit)}</td>
          <td class="px-4 py-3 text-slate-500">임대차 계약 기준 전세금</td>
        </tr>
        ${state.includeMandatory ? `
        <tr class="bg-emerald-50/30">
          <td class="px-4 py-3 font-bold text-emerald-900">2. [필수] 취득·거래비용</td>
          <td class="px-4 py-3 text-right font-extrabold text-emerald-700 whitespace-nowrap">약 ${formatWon(s.mandatoryExpense)}</td>
          <td class="px-4 py-3 text-slate-600">중개보수(${formatTenMan(s.brokerageFee, false)}) + HUG 반환보증료(${formatTenMan(s.guaranteeFee, false)}) + 인지세(${formatTenMan(s.stampDuty, false)})</td>
        </tr>
        ${!s.isMoveinIncluded ? `
        <tr class="bg-emerald-100/50 border-t border-b border-emerald-200">
          <td class="px-4 py-2.5 font-extrabold text-emerald-900">➔ [소계] 순수 전세 필요 자금</td>
          <td class="px-4 py-2.5 text-right font-black text-emerald-900 whitespace-nowrap">${formatWon(s.pureTotalBudget)}</td>
          <td class="px-4 py-2.5 text-emerald-800 font-bold">보증금 + 법정 부대비용 (최소 전세 자금)</td>
        </tr>
        ` : ''}
        ` : ''}
        ${s.isMoveinIncluded ? `
        <tr class="bg-indigo-50/30">
          <td class="px-4 py-3 font-bold text-indigo-900">3. [선택] 입주·이사비용</td>
          <td class="px-4 py-3 text-right font-extrabold text-indigo-700 whitespace-nowrap">약 ${formatWon(s.optionalExpense)}</td>
          <td class="px-4 py-3 text-slate-600">포장이사 및 입주 청소 예산</td>
        </tr>
        <tr class="bg-indigo-100/60 border-t border-b border-indigo-200">
          <td class="px-4 py-2.5 font-extrabold text-indigo-950">➔ ${state.includeMandatory ? '[총계] 최종 입주 총 소요 예산' : '[소계] 선택적 비용 포함시 예산'}</td>
          <td class="px-4 py-2.5 text-right font-black text-indigo-950 whitespace-nowrap">${formatWon(s.fullTotalBudget)}</td>
          <td class="px-4 py-2.5 text-indigo-900 font-bold">${state.includeMandatory ? '전세보증금 + 법정비용 + 입주이사비 합산' : '전세보증금 + 선택적 입주·이사비용 합산'}</td>
        </tr>
        ` : ''}
        <tr>
          <td class="px-4 py-3 font-semibold text-slate-700">보유 자기자본 (현금)</td>
          <td class="px-4 py-3 text-right font-bold text-blue-600">${formatWon(s.equity)}</td>
          <td class="px-4 py-3 text-slate-500">계약금 및 잔금 충당용 보유 자산</td>
        </tr>
        <tr class="bg-purple-50/40">
          <td class="px-4 py-3 font-bold text-purple-900">필요 전세자금대출</td>
          <td class="px-4 py-3 text-right font-extrabold text-purple-700">${formatWon(s.requiredLoan)}</td>
          <td class="px-4 py-3 text-purple-700 font-medium">보증금 대비 대출비율 약 ${s.loanRatio}% (정부/은행 한도 80% 적격)</td>
        </tr>
        ${extraCostTotal > 0 ? `
        <tr class="bg-amber-50/50">
          <td class="px-4 py-3 font-bold text-amber-950">준비해야 할 부가 비용</td>
          <td class="px-4 py-3 text-right font-extrabold text-amber-700 whitespace-nowrap">약 ${formatWon(extraCostTotal)}</td>
          <td class="px-4 py-3 text-amber-900 font-medium">${extraCostDesc}</td>
        </tr>
        ` : ''}
        <tr class="border-t-2 border-slate-400">
          <td class="px-4 py-3 pt-3.5 font-semibold text-slate-700 border-t-2 border-slate-400">월 상환 부담금 (이자)</td>
          <td class="px-4 py-3 pt-3.5 text-right font-bold text-slate-800 border-t-2 border-slate-400">${formatTenMan(s.monthlyPayment)}</td>
          <td class="px-4 py-3 pt-3.5 text-slate-500 border-t-2 border-slate-400">${s.repayType === 'equal-payment' ? '2년 만기 원리금' : '2년 만기일시 (월 순수 이자)'} / 금리 연 ${s.loanRate}% 기준</td>
        </tr>
        <tr>
          <td class="px-4 py-3 font-semibold text-slate-700">소득 대비 주거비 비중</td>
          <td class="px-4 py-3 text-right font-bold text-emerald-600">약 ${s.housingRatio}%</td>
          <td class="px-4 py-3 text-slate-500">월 실수령액 ${formatTenMan(s.monthlyNetIncome, false)} 기준 (초안정 구간)</td>
        </tr>
      `;

      titleComparisonSection.innerHTML = `<i data-lucide="scale" class="w-5 h-5 text-purple-600"></i> 전세대출 상품별 월 부담 비교`;
      txtCompareLoanAmount.textContent = `전세대출 ${formatWon(s.requiredLoan)} 기준`;
      tbodyLoanComparison.innerHTML = s.comparisonMatrix.map(row => `
        <tr class="${row.rate === s.loanRate ? 'bg-emerald-50/60 font-bold' : ''}">
          <td class="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">${row.label}</td>
          <td class="px-4 py-3 text-right font-extrabold text-purple-700 whitespace-nowrap">약 ${row.monthlyPaymentTenThousand}만 원</td>
          <td class="px-4 py-3 text-right font-bold text-slate-700 whitespace-nowrap">${row.ratio}%</td>
          <td class="px-4 py-3 text-slate-600">${row.desc}</td>
        </tr>
      `).join('');

      titleTimelineSection.innerHTML = `<i data-lucide="milestone" class="w-5 h-5 text-emerald-600"></i> 실전 4단계 전세 계약 및 안전 실행 로드맵`;
      timelineStep1Title.textContent = '1단계: 매물 탐색 및 임대차 계약 체결 (D-1~2개월)';
      timelineStep1.innerHTML = `
        <div>• <strong>필요 자금:</strong> 계약금 10% = <strong>${formatWon(s.downPayment)}</strong></div>
        <div>• <strong>자금 조달:</strong> 보유 현금(${formatWon(s.equity)})에서 계약금 <strong>${formatWon(s.downPayment)}</strong>을 임대인 계좌로 직접 송금합니다.</div>
        <div class="mt-2 p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 text-amber-900">
          <strong>📌 필수 계약 특약:</strong><br>
          • "임대인 및 임차목적물의 하자로 전세대출 또는 보증보험 가입 거절 시 계약은 무효로 하며 계약금 전액을 즉시 반환한다."<br>
          • "임대인은 잔금 지급일 익일까지 일체의 근저당권 등 권리 제한 행위를 하지 않는다."
        </div>
      `;

      const isJeonsePolicyLoan = (s.loanRate <= 3.0);
      timelineStep2Title.textContent = isJeonsePolicyLoan 
        ? '2단계: 기금e든든 자격심사 및 전세대출 신청 (D-40~50일 전)' 
        : '2단계: 시중은행 전세자금대출 정식 접수 및 심사 (D-30일 전)';

      timelineStep2.innerHTML = `
        <div>• <strong>확정일자:</strong> 계약 직후 주민센터 또는 인터넷등기소에서 확정일자를 부여받아 대항력 순위를 선점합니다.</div>
        <div>• <strong>대출 신청:</strong> 취급 은행에 방문하여 전세자금대출 <strong>${formatWon(s.requiredLoan)}</strong> 신청 접수 (${isJeonsePolicyLoan ? '주택도시기금 <strong>버팀목전세대출 (연 ' + s.loanRate + '%)</strong> 최우선 심사' : '시중 1금융권 <strong>일반 전세자금대출 (연 ' + s.loanRate + '%)</strong> 심사'}).</div>
        <div>• <strong>자격 심사:</strong> ${incomeLabel}(${formatTenMan(s.annualIncome, false)}) 및 무주택 요건 심사를 거쳐 보증서 발급 승인을 확인합니다.</div>

        <!-- 실전 전세대출 현장 접수 시기 팩트 비교 카드 -->
        <div class="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
          <div class="font-bold text-slate-800 flex items-center justify-between">
            <span class="flex items-center gap-1">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-emerald-600"></i>
              실전 전세대출 상품별 접수 골든타임 (은행 현장 실무 팩트)
            </span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded ${isJeonsePolicyLoan ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
              현재: ${isJeonsePolicyLoan ? '🏛️ 기금 정책전세 적용' : '🏦 시중은행 전세 적용'}
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5 text-slate-600 leading-relaxed">
            <div class="p-2 rounded-lg border ${isJeonsePolicyLoan ? 'bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-400 font-medium' : 'bg-white/80 border-slate-200 opacity-70'}">
              <div class="font-bold text-emerald-950 flex items-center gap-1">
                <span>🏛️ 정부 버팀목·기금 전세대출</span>
              </div>
              <div class="text-[10px] text-emerald-900 mt-0.5">
                • <strong>권장 접수:</strong> <strong class="text-emerald-700 underline">잔금 D-40~50일 전 (1.5개월 전)</strong><br>
                • <strong>현장 팩트:</strong> 기금e든든 비대면 자격심사 및 HUG 자산심사(1~2주) ➔ 은행 수탁 심사(2주) 소요로 30일 이내 임박 신청 시 반려될 수 있습니다.
              </div>
            </div>
            <div class="p-2 rounded-lg border ${!isJeonsePolicyLoan ? 'bg-blue-50/90 border-blue-300 ring-1 ring-blue-400 font-medium' : 'bg-white/80 border-slate-200 opacity-70'}">
              <div class="font-bold text-blue-950 flex items-center gap-1">
                <span>🏦 시중은행 일반 전세대출 (SGI/HF/HUG)</span>
              </div>
              <div class="text-[10px] text-blue-900 mt-0.5">
                • <strong>권장 접수:</strong> <strong class="text-blue-700 underline">잔금 D-30일 전 (약 3~4주 전)</strong><br>
                • <strong>현장 팩트:</strong> 대출 유효기간(1개월)으로 D-2개월 전에는 접수를 받지 않습니다. 잔금 30일 전에 접수하면 2~3주 내외로 충분히 승인 완료됩니다.
              </div>
            </div>
          </div>
        </div>
      `;

      timelineStep3Title.textContent = '3단계: 잔금 당일 전세대출 실행 및 대항력 확보 (D-Day)';
      theadStep3.innerHTML = `
        <th class="px-3 py-2 text-center">시간대</th>
        <th class="px-3 py-2">자금 이동 및 주요 행정 처리</th>
        <th class="px-3 py-2 text-right">처리 금액</th>
        <th class="px-3 py-2">비고 및 세부 흐름</th>
      `;
      tbodyStep3.innerHTML = `
        <tr>
          <td class="px-3 py-2.5 text-center font-bold text-slate-500">오전 10:00</td>
          <td class="px-3 py-2.5 font-semibold text-slate-800">은행 전세자금대출 실행 ➔ 임대인 계좌로 직송금</td>
          <td class="px-3 py-2.5 text-right font-extrabold text-blue-600">${formatWon(s.requiredLoan)}</td>
          <td class="px-3 py-2.5 text-slate-500">전세대출 잔금 자동 납부</td>
        </tr>
        <tr>
          <td class="px-3 py-2.5 text-center font-bold text-slate-500">오전 11:00</td>
          <td class="px-3 py-2.5 font-semibold text-slate-800">보유 잔여 현금으로 전세 잔여금 임대인에게 완납</td>
          <td class="px-3 py-2.5 text-right font-bold text-slate-900">${formatWon(s.remainDeposit - s.requiredLoan > 0 ? s.remainDeposit - s.requiredLoan : 0)}</td>
          <td class="px-3 py-2.5 text-slate-500">보증금 완납 확인 및 열쇠/비밀번호 수령</td>
        </tr>
        <tr>
          <td class="px-3 py-2.5 text-center font-bold text-slate-500">오전 11:30</td>
          <td class="px-3 py-2.5 font-semibold text-slate-800">공인중개사 중개보수 및 인지세 정산</td>
          <td class="px-3 py-2.5 text-right font-bold text-slate-700">약 ${formatWon(s.totalExpense)}</td>
          <td class="px-3 py-2.5 text-slate-500">현금영수증 발행 및 영수증 수령</td>
        </tr>
        <tr class="bg-emerald-50/40">
          <td class="px-3 py-2.5 text-center font-bold text-emerald-700">오후 01:00</td>
          <td class="px-3 py-2.5 font-bold text-emerald-900">주민센터 전입신고 및 점유 완료</td>
          <td class="px-3 py-2.5 text-right font-extrabold text-emerald-700">—</td>
          <td class="px-3 py-2.5 text-emerald-800 font-medium">익일 0시 기준 법적 대항력 및 우선변제권 100% 발효</td>
        </tr>
      `;

      timelineStep4Title.textContent = '4단계: 거주 중 가계 안착 및 보증금 100% 안전 관리';
      timelineStep4.innerHTML = `
        <div>• <strong>월 주거비 지출:</strong> 매월 <strong>약 ${formatTenMan(s.monthlyPayment)}</strong>의 이자만 부담하여 지출을 최소화합니다.</div>
        <div>• <strong>HUG 전세보증금 반환보증:</strong> 안심전세대출 미가입 시 입주 후 즉시 개별 가입하여 전세 사기 및 깡통전세 리스크를 완벽 방어합니다.</div>
        <div>• <strong>가계 시드머니 축적:</strong> 월 실수령액 대비 주거비가 <strong>약 ${s.housingRatio}%</strong>에 불과하여, 매월 <strong>약 ${surplusMinMan}만~${surplusMaxMan}만 원</strong>을 주택 매매용 종잣돈으로 집중 축적할 수 있습니다.</div>
      `;

      titleStrategySection.innerHTML = `<i data-lucide="shield-check" class="w-5 h-5 text-emerald-400"></i> 전세 사기 예방 3대 필수 수칙 및 체크리스트`;
      contentStrategySection.innerHTML = `
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <strong>1. 선순위 권리 및 부채 비율 검증:</strong><br>
          • 등기부등본의 선순위 근저당권 채권최고액 + 본인 전세보증금의 합이 아파트 시세의 <strong>70% 이하</strong>여야 경매 시 안전합니다.
        </div>
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <strong>2. 임대차 계약서 안전 특약 명시:</strong><br>
          • "임대인 또는 주택의 하자로 전세대출/보증보험 불가 시 계약 무효 및 계약금 전액 반환"<br>
          • "잔금일 익일까지 일체의 권리 변동(근저당 설정 등) 금지"
        </div>
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <strong>3. HUG/HF 전세보증금 반환보증보험 필수 가입:</strong><br>
          • 만기 시 임대인의 자금 사정과 무관하게 보증기관으로부터 보증금을 100% 안전하게 돌려받을 수 있도록 가입합니다.
        </div>
      `;

    } else if (s.type === 'resale') {
      // ===== 매매 모드 렌더링 =====
      cardLblTotal.textContent = '총 필요 예산';
      cardTotalBudget.textContent = formatWon(s.totalBudget);
      cardBudgetSub.textContent = s.isMoveinIncluded 
        ? `순수 취득 ${formatWon(s.pureTotalBudget)} / 입주 포함 ${formatWon(s.fullTotalBudget)}`
        : `순수 취득 ${formatWon(s.pureTotalBudget)} (입주비 미포함)`;

      cardLblLoan.textContent = '필요 대출 금액';
      cardRequiredLoan.textContent = formatWon(s.requiredLoan);
      cardLtvBadge.textContent = `LTV ${s.ltv}% (매매 대금 기준 ${formatWon(s.requiredLoan)})`;

      if (s.repayType === 'equal-principal' || s.repayType === 'graduated') {
        cardMonthlyPaymentDetail.textContent = `마지막 달: 약 ${formatTenMan(s.lastMonthlyPayment)}`;
        cardMonthlyPaymentDetail.classList.remove('hidden');
        cardLblMonthly.textContent = s.repayType === 'equal-principal' ? '첫 달 원리금 상환액 (체감식)' : '첫 달 원리금 상환액 (체증식)';
      } else {
        cardMonthlyPaymentDetail.classList.add('hidden');
        cardLblMonthly.textContent = '월 원리금 상환액';
      }
      cardMonthlyPayment.textContent = formatTenMan(s.monthlyPayment);
      cardHousingRatio.textContent = `실수령액의 ${s.housingRatio}% (${s.housingRatio <= 20 ? '최상급 안정' : '안정권'})`;

      const extraCostTotal = (state.includeMandatory ? s.mandatoryExpense : 0) + (s.isMoveinIncluded ? s.optionalExpense : 0);
      const extraCostDesc = (state.includeMandatory && s.isMoveinIncluded)
        ? `법정 취득비용(${formatTenMan(s.mandatoryExpense, false)}) + 입주정비비(${formatTenMan(s.optionalExpense, false)}) 별도 현금 준비 필요`
        : (state.includeMandatory
            ? `취득세·중개보수·등기비 등 법정 필수비용(${formatTenMan(s.mandatoryExpense, false)}) 별도 현금 준비 필요`
            : `도배·장판·이사비 등 선택적 입주비용(${formatTenMan(s.optionalExpense, false)}) 별도 현금 준비 필요`);

      titleFundingSection.innerHTML = `<i data-lucide="pie-chart" class="w-5 h-5 text-blue-600"></i> 자금 조달 구조 및 핵심 재무 지표`;
      const taxDesc = `생애최초 취득세 감면(${formatTenMan(s.expenseData.taxInfo.finalTax, false)}) + 중개보수(${formatTenMan(s.expenseData.brokerageInfo.totalFee, false)}) + 법무사/등기/채권할인/인지세(${formatTenMan(s.expenseData.regFee, false)})`;
      const optionalDesc = s.isMoveinIncluded 
        ? `도배/장판/샷시/기본수리(${formatTenMan(s.expenseData.refurbishCost, false)})${s.expenseData.moveinCost > 0 ? ` + 가구/가전/이사비(${formatTenMan(s.expenseData.moveinCost, false)})` : ''}`
        : '선택 안 함 (0원)';

      tbodyFundingStructure.innerHTML = `
        <tr>
          <td class="px-4 py-3 font-bold text-slate-900">1. 아파트 매매 대금</td>
          <td class="px-4 py-3 text-right font-extrabold text-blue-600">${formatWon(s.price)}</td>
          <td class="px-4 py-3 text-slate-500">기준 실거래 매매 계약가</td>
        </tr>
        ${state.includeMandatory ? `
        <tr class="bg-blue-50/30">
          <td class="px-4 py-3 font-bold text-blue-900">2. [필수] 취득·거래비용</td>
          <td class="px-4 py-3 text-right font-extrabold text-blue-700 whitespace-nowrap">약 ${formatWon(s.mandatoryExpense)}</td>
          <td class="px-4 py-3 text-blue-950">${taxDesc}</td>
        </tr>
        ${!s.isMoveinIncluded ? `
        <tr class="bg-blue-100/50 border-t border-b border-blue-200">
          <td class="px-4 py-2.5 font-extrabold text-blue-900">➔ [소계] 순수 취득 필요 자금</td>
          <td class="px-4 py-2.5 text-right font-black text-blue-900 whitespace-nowrap">${formatWon(s.pureTotalBudget)}</td>
          <td class="px-4 py-2.5 text-blue-800 font-bold">매매 대금 + 법정 필수비용 (실제 매수 최소 자금)</td>
        </tr>
        ` : ''}
        ` : ''}
        ${s.isMoveinIncluded ? `
        <tr class="bg-indigo-50/30">
          <td class="px-4 py-3 font-bold text-indigo-900">3. [선택] 입주·정비비용</td>
          <td class="px-4 py-3 text-right font-extrabold text-indigo-700 whitespace-nowrap">약 ${formatWon(s.optionalExpense)}</td>
          <td class="px-4 py-3 text-slate-600">${optionalDesc}</td>
        </tr>
        <tr class="bg-indigo-100/60 border-t border-b border-indigo-200">
          <td class="px-4 py-2.5 font-extrabold text-indigo-950">➔ ${state.includeMandatory ? '[총계] 입주 완료 총 소요 예산' : '[소계] 선택적 비용 포함시 예산'}</td>
          <td class="px-4 py-2.5 text-right font-black text-indigo-950 whitespace-nowrap">${formatWon(s.fullTotalBudget)}</td>
          <td class="px-4 py-2.5 text-indigo-900 font-bold">${state.includeMandatory ? '매매 + 필수취득 + 선택입주 완비 종합 예산' : '매매 대금 + 선택적 입주·정비비용 합산'}</td>
        </tr>
        ` : ''}
        <tr>
          <td class="px-4 py-3 font-semibold text-slate-700">보유 순자산 (전세보증금/현금)</td>
          <td class="px-4 py-3 text-right font-bold text-emerald-600">${formatWon(s.equity)}</td>
          <td class="px-4 py-3 text-slate-500">${getEquityBreakdownSummary('이사 당일 임대인으로부터 전액 반환')}</td>
        </tr>
        <tr class="bg-purple-50/40">
          <td class="px-4 py-3 font-bold text-purple-900">필요 주택담보대출</td>
          <td class="px-4 py-3 text-right font-extrabold text-purple-700">${formatWon(s.requiredLoan)}</td>
          <td class="px-4 py-3 text-purple-700 font-medium">LTV 약 ${s.ltv}% (매매 대금 기준 ${formatWon(s.requiredLoan)})</td>
        </tr>
        ${extraCostTotal > 0 ? `
        <tr class="bg-amber-50/50">
          <td class="px-4 py-3 font-bold text-amber-950">준비해야 할 부가 비용</td>
          <td class="px-4 py-3 text-right font-extrabold text-amber-700 whitespace-nowrap">약 ${formatWon(extraCostTotal)}</td>
          <td class="px-4 py-3 text-amber-900 font-medium">${extraCostDesc}</td>
        </tr>
        ` : ''}
        <tr class="border-t-2 border-slate-400">
          <td class="px-4 py-3 pt-3.5 font-semibold text-slate-700 border-t-2 border-slate-400">월 원리금 상환액</td>
          <td class="px-4 py-3 pt-3.5 text-right font-bold text-slate-800 border-t-2 border-slate-400">${formatTenMan(s.monthlyPayment)}</td>
          <td class="px-4 py-3 pt-3.5 text-slate-500 border-t-2 border-slate-400">${s.loanYears}년 만기 원리금균등 (금리 연 ${s.loanRate}% 기준)</td>
        </tr>
        <tr>
          <td class="px-4 py-3 font-semibold text-slate-700">소득 대비 주거비 비중</td>
          <td class="px-4 py-3 text-right font-bold text-emerald-600">약 ${s.housingRatio}%</td>
          <td class="px-4 py-3 text-slate-500">월 실수령액 ${formatTenMan(s.monthlyNetIncome, false)} 기준 (최상급 안정권)</td>
        </tr>
        <tr>
          <td class="px-4 py-3 font-semibold text-slate-700">DSR (총부채원리금상환비율)</td>
          <td class="px-4 py-3 text-right font-bold text-blue-600">약 ${s.dsr}%</td>
          <td class="px-4 py-3 text-slate-500">${incomeLabel} ${formatTenMan(s.annualIncome, false)} 기준 (법적 한도 40% 대비 초안전)</td>
        </tr>
      `;

      titleComparisonSection.innerHTML = `<i data-lucide="scale" class="w-5 h-5 text-purple-600"></i> 대출 금리 및 조건별 월 부담 비교`;
      txtCompareLoanAmount.textContent = `주담대 ${formatWon(s.requiredLoan)} 기준`;
      tbodyLoanComparison.innerHTML = s.comparisonMatrix.map(row => `
        <tr class="${row.rate === s.loanRate && row.years === s.loanYears ? 'bg-purple-50/60 font-bold' : ''}">
          <td class="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">${row.label}</td>
          <td class="px-4 py-3 text-right font-extrabold text-purple-700 whitespace-nowrap">약 ${row.monthlyPaymentTenThousand}만 원</td>
          <td class="px-4 py-3 text-right font-bold text-slate-700 whitespace-nowrap">${row.ratio}%</td>
          <td class="px-4 py-3 text-slate-600">${row.desc}</td>
        </tr>
      `).join('');

      titleTimelineSection.innerHTML = `<i data-lucide="milestone" class="w-5 h-5 text-emerald-600"></i> 실전 4단계 자금 조달 및 실행 타임라인`;
      timelineStep1Title.textContent = '1단계: 매수 계약 체결 및 계약금 납부 (D-3개월)';
      const borrowerText = isCouple ? '본인 또는 배우자 명의의 신용대출 또는 마이너스통장' : '본인 명의의 신용대출 또는 마이너스통장';
      timelineStep1.innerHTML = `
        <div>• <strong>필요 자금:</strong> 계약금 10% = <strong>${formatWon(s.downPayment)}</strong></div>
        <div>• <strong>자금 조달 방식:</strong> 현재 전세보증금(${formatWon(s.equity)})이 묶여 있으므로, ${borrowerText}에서 <strong>${formatWon(s.downPayment)}</strong>을 단기 인출하여 매도인 계좌로 송금합니다.</div>
        <div class="mt-2 p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 text-amber-900">
          <strong>📌 필수 계약 특약 조항:</strong><br>
          • "잔금 지급일은 매수인이 현재 거주 중인 전세 계약 종료일(보증금 수령일)과 동일자로 확정 기재한다."<br>
          • "매수인의 잔금 지급 및 입주는 매수인이 현재 임차 중인 주택의 보증금 반환 및 대출 실행과 동시이행 조건으로 진행한다."
        </div>
      `;

      const isPolicyLoan = (s.loanRate === 3.0 || s.loanRate === 3.8);
      timelineStep2Title.textContent = isPolicyLoan 
        ? '2단계: 정부 정책대출 사전 자산심사 및 접수 (D-40~60일 전)' 
        : '2단계: 시중은행 주택담보대출 정식 접수 및 본심사 (D-30일 전)';

      const auditBadgeHtml = isCouple 
        ? `<span class="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">👫 ${s.auditInfo.householdLabel} (${s.auditInfo.auditMethodName})</span>`
        : `<span class="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded">👤 ${s.auditInfo.householdLabel} (${s.auditInfo.auditMethodName})</span>`;
      
      let eligibilityBadges = '';
      if (s.eligibility) {
        eligibilityBadges = `
          <div class="flex flex-wrap gap-1 mt-1 mb-1.5">
            <span class="text-[9.5px] px-1.5 py-0.5 rounded font-bold ${s.eligibility.didimdol.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}">
              디딤돌: ${s.eligibility.didimdol.passed ? '⭕ 승인적격' : '❌ 불가'}
            </span>
            <span class="text-[9.5px] px-1.5 py-0.5 rounded font-bold ${s.eligibility.bogeumjari.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}">
              보금자리: ${s.eligibility.bogeumjari.passed ? '⭕ 승인적격' : '❌ 불가'}
            </span>
            <span class="text-[9.5px] px-1.5 py-0.5 rounded font-bold ${s.eligibility.commercial.passed ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}">
              시중주담대: ${s.eligibility.commercial.passed ? '⭕ 승인적격' : '⚠️ DSR주의'}
            </span>
          </div>
        `;
      }

      timelineStep2.innerHTML = `
        <div class="mb-1">${auditBadgeHtml}</div>
        ${eligibilityBadges}
        <div>• <strong>대출 신청:</strong> 필요 주택담보대출 <strong>${formatWon(s.requiredLoan)}</strong> 신청 (${s.loanRate === 3.0 ? 'HUG/HF <strong>디딤돌대출 (연 3.0%)</strong> 최우선 실행' : (s.loanRate === 3.8 ? 'HF <strong>보금자리론 (연 3.8%)</strong> 실행' : `시중 1금융권 <strong>일반 주택담보대출 (연 ${s.loanRate}%)</strong> 실행`)}).</div>
        <div>• <strong>DSR 적격 심사:</strong> ${incomeLabel}(${formatTenMan(s.annualIncome, false)}) 기준 단독 DSR은 <strong>약 ${s.dsr}%</strong> 수준이며, 계약금 단기 신용대출(${formatWon(s.downPayment)})을 보유한 상태로 심사를 받더라도 합산 DSR은 약 ${s.combinedDSR}%로 법적 한도(40%)를 완벽히 충족하여 정상 승인됩니다.</div>
        
        <!-- 실전 은행 현장 접수 시기 팩트 비교 카드 -->
        <div class="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
          <div class="font-bold text-slate-800 flex items-center justify-between">
            <span class="flex items-center gap-1">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-blue-600"></i>
              실전 금융사별 대출 접수 골든타임 (은행 현장 실무 팩트)
            </span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded ${isPolicyLoan ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}">
              현재: ${isPolicyLoan ? '🏛️ 정책대출 권장일정 적용' : '🏦 시중은행 권장일정 적용'}
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5 text-slate-600 leading-relaxed">
            <div class="p-2 rounded-lg border ${isPolicyLoan ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-400 font-medium' : 'bg-white/80 border-slate-200 opacity-70'}">
              <div class="font-bold text-amber-950 flex items-center gap-1">
                <span>🏛️ 정부 정책대출 (디딤돌·보금자리)</span>
              </div>
              <div class="text-[10px] text-amber-900 mt-0.5">
                • <strong>권장 접수:</strong> <strong class="text-amber-700 underline">잔금 D-40~60일 전 (1.5~2개월 전)</strong><br>
                • <strong>현장 팩트:</strong> 기금e든든/HF 사전자산심사(1~2주) ➔ 은행 본심사(2~3주) ➔ 사후심사 등 총 30~40일 이상 소요되므로, 잔금 30일 이내 임박 신청 시 기표 지연 위험이 발생합니다.
              </div>
            </div>
            <div class="p-2 rounded-lg border ${!isPolicyLoan ? 'bg-blue-50/90 border-blue-300 ring-1 ring-blue-400 font-medium' : 'bg-white/80 border-slate-200 opacity-70'}">
              <div class="font-bold text-blue-950 flex items-center gap-1">
                <span>🏦 시중은행 일반 주담대 (1금융권)</span>
              </div>
              <div class="text-[10px] text-blue-900 mt-0.5">
                • <strong>권장 접수:</strong> <strong class="text-blue-700 underline">잔금 D-30일 전 (약 3~4주 전)</strong><br>
                • <strong>현장 팩트:</strong> 서류 유효기간(1개월) 및 승인 기한으로 인해 <strong>D-2개월 전에는 은행 접수 자체가 불가(반려)</strong>합니다. 통상 잔금 30일 전에 접수하면 2주 내외로 심사 및 약정(자서)이 신속 완료됩니다.
              </div>
            </div>
          </div>
        </div>

        ${s.strategyComparison && s.strategyComparison.totalInterestSaving > 0 && s.incomeType === 'double' ? `
        <div class="mt-1.5 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-[11px]">
          💡 <strong>외벌이 전환 전략 팁:</strong> 배우자 서류상 무직 처리 시 디딤돌(3.0%) 즉시 통과로 30년 총이자 <strong>약 ${formatWon(s.strategyComparison.totalInterestSaving)} 순절감</strong> (월 약 ${formatTenMan(s.strategyComparison.monthlySaving)} 절약) 가능! <span class="text-amber-800 font-semibold">(단, 국토부 관리방안에 따라 수도권 아파트는 방공제 5,500만 원 차감으로 생초 호당 한도 최대 1.85억 제한 사전 확인 필수)</span>
        </div>
        ` : ''}
      `;

      timelineStep3Title.textContent = '3단계: 잔금 당일 시간대별 일괄 정산 (D-Day)';
      theadStep3.innerHTML = `
        <th class="px-3 py-2 text-center">시간대</th>
        <th class="px-3 py-2">자금 이동 및 주요 행정 처리</th>
        <th class="px-3 py-2 text-right">처리 금액</th>
        <th class="px-3 py-2">비고 및 자금 세부 흐름</th>
      `;
      tbodyStep3.innerHTML = `
        <tr>
          <td class="px-3 py-2.5 text-center font-bold text-slate-500">오전 10:00</td>
          <td class="px-3 py-2.5 font-semibold text-slate-800">은행 주택담보대출 실행 ➔ 매도인 계좌로 직송금</td>
          <td class="px-3 py-2.5 text-right font-extrabold text-blue-600">${formatWon(s.step3.mortgage)}</td>
          <td class="px-3 py-2.5 text-slate-500">1차 잔금 지급 (매매 잔금 중 일부)</td>
        </tr>
        <tr>
          <td class="px-3 py-2.5 text-center font-bold text-slate-500">오전 11:00</td>
          <td class="px-3 py-2.5 font-semibold text-slate-800">기존 전셋집 이삿짐 반출 및 임대인으로부터 보증금 수령</td>
          <td class="px-3 py-2.5 text-right font-extrabold text-emerald-600">${formatWon(s.step3.deposit)}</td>
          <td class="px-3 py-2.5 text-slate-500">보유 순자산 통장으로 전액 회수 유입</td>
        </tr>
        <tr>
          <td class="px-3 py-2.5 text-center font-bold text-slate-500">오전 11:30</td>
          <td class="px-3 py-2.5 font-semibold text-slate-800">회수한 보증금 중 매매 잔여 대금을 매도인 계좌로 송금</td>
          <td class="px-3 py-2.5 text-right font-bold text-slate-900">${formatWon(s.step3.remainPrice)}</td>
          <td class="px-3 py-2.5 text-slate-500">계약금(${formatWon(s.downPayment)}) + 주담대(${formatWon(s.step3.mortgage)}) + 잔여금 = <strong>매매가 ${formatWon(s.price)} 완납</strong></td>
        </tr>
        <tr class="bg-emerald-50/40">
          <td class="px-3 py-2.5 text-center font-bold text-emerald-700">오후 12:00</td>
          <td class="px-3 py-2.5 font-bold text-emerald-900">전세금 잔여분으로 계약 시 실행한 신용대출 전액 완납 및 계좌 해지</td>
          <td class="px-3 py-2.5 text-right font-extrabold text-emerald-700">${formatWon(s.step3.creditLoanPayoff)}</td>
          <td class="px-3 py-2.5 text-emerald-800 font-medium">단기 부채 완전 변제 (DSR 및 신용점수 원상 회복)</td>
        </tr>
        <tr>
          <td class="px-3 py-2.5 text-center font-bold text-slate-500">오후 01:00</td>
          <td class="px-3 py-2.5 font-semibold text-slate-800">남은 전세금 잔액으로 세금/등기/중개보수 정산 및 키 수령</td>
          <td class="px-3 py-2.5 text-right font-bold text-slate-700">약 ${formatWon(s.step3.expenses)}</td>
          <td class="px-3 py-2.5 text-slate-500">취득세 납부 및 법무사 소유권 이전 등기 접수, 입주 완료</td>
        </tr>
      `;

      timelineStep4Title.textContent = '4단계: 입주 후 가계 재무 안착 및 자산 증식';
      timelineStep4.innerHTML = `
        <div>• <strong>남은 최종 부채:</strong> 계약금 신용대출은 잔금 당일 전액 상환되어 해지되었으므로, 오직 <strong>주택담보대출 ${formatWon(s.requiredLoan)}(단일 채무)</strong>만 남습니다.</div>
        <div>• <strong>월 원리금 부담:</strong> 매월 <strong>약 ${formatTenMan(s.monthlyPayment)}</strong> 수준 (${s.loanYears}년 원리금균등, 연 ${s.loanRate}% 기준)</div>
        <div>• <strong>가계 재무 구조의 안정성:</strong> 실수령액 대비 주거비 지출은 <strong>약 ${s.housingRatio}%</strong>로 매우 안정적이며, 생활비(${s.livingCostDesc})를 여유롭게 지출하더라도 매월 <strong>약 ${surplusMinMan}만~${surplusMaxMan}만 원의 순수 잉여 자금</strong>이 지속 발생합니다.</div>
      `;

      titleStrategySection.innerHTML = `<i data-lucide="shield-alert" class="w-5 h-5 text-amber-400"></i> 일반 매매 시 필수 안전 수칙 & 가이드 V4 심사 전략`;
      contentStrategySection.innerHTML = `
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <strong>1. 매수 잔금일과 전세 만기일의 완전 일치:</strong><br>
          • 매매 계약 체결 시 잔금일을 현재 거주 중인 전세 계약 종료일(보증금 반환일)과 동일자로 확정 기재하여 브릿지 자금 공백을 원천 차단합니다.
        </div>
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <strong>2. 계약서 특약 조항 필수 명시:</strong><br>
          • "매수인의 잔금 지급 및 입주는 현재 임차 중인 주택의 보증금 반환 및 대출 실행과 동시이행 조건으로 진행한다."
        </div>
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <strong>3. 주택 상태 및 누수·결로 현장 점검:</strong><br>
          • 샷시 기밀성, 배관 상태, 욕실 방수 상태를 현장 확인하고, 필요 시 부대비용 예산으로 기본 정비를 선행합니다.
        </div>
        ${s.strategyComparison && s.strategyComparison.totalInterestSaving > 0 ? `
        <div class="p-3 bg-indigo-950/80 rounded-xl border border-indigo-500/50">
          <strong class="text-amber-300">4. 가이드 V4 맞벌이 vs 외벌이 금융비용 정밀 비교 전략:</strong><br>
          • <strong>맞벌이(7,700만):</strong> 시중은행 일반 주담대(연 ${s.strategyComparison.commercialRate}%) ➔ 30년 총이자 <strong>약 ${formatWon(s.strategyComparison.commercialTotalInterest)}</strong><br>
          • <strong>외벌이 전환(5,120만):</strong> 정부 디딤돌대출(연 3.0%) 승인 ➔ 30년 총이자 <strong>약 ${formatWon(s.strategyComparison.didimdolTotalInterest)}</strong><br>
          • ➔ <strong>30년 총이자 약 ${formatWon(s.strategyComparison.totalInterestSaving)} 순절감 (월 약 ${formatTenMan(s.strategyComparison.monthlySaving)} 절약)</strong> 효과 발생
        </div>
        ` : ''}
      `;
    } else {
      // ===== 분양 모드 렌더링 =====
      cardLblTotal.textContent = '총 소요 자금';
      cardTotalBudget.textContent = formatWon(s.totalBudget);
      cardBudgetSub.textContent = s.isMoveinIncluded 
        ? `순수 분양 ${formatWon(s.pureTotalBudget)} / 옵션·입주 포함 ${formatWon(s.fullTotalBudget)}`
        : `순수 분양 ${formatWon(s.pureTotalBudget)} (옵션 미포함)`;

      cardLblLoan.textContent = '필요 잔금 주담대';
      cardRequiredLoan.textContent = formatWon(s.requiredLoan);
      cardLtvBadge.textContent = `LTV ${s.ltv}% (분양가 기준 ${formatWon(s.requiredLoan)})`;

      if (s.repayType === 'equal-principal' || s.repayType === 'graduated') {
        cardMonthlyPaymentDetail.textContent = `마지막 달: 약 ${formatTenMan(s.lastMonthlyPayment)}`;
        cardMonthlyPaymentDetail.classList.remove('hidden');
        cardLblMonthly.textContent = s.repayType === 'equal-principal' ? '첫 달 원리금 상환액 (체감식)' : '첫 달 원리금 상환액 (체증식)';
      } else {
        cardMonthlyPaymentDetail.classList.add('hidden');
        cardLblMonthly.textContent = '월 원리금 상환액';
      }
      cardMonthlyPayment.textContent = formatTenMan(s.monthlyPayment);
      cardHousingRatio.textContent = `실수령액의 ${s.housingRatio}%`;

      const extraCostTotal = (state.includeMandatory ? s.mandatoryExpense : 0) + (s.isMoveinIncluded ? s.optionalExpense : 0);
      const extraCostDesc = (state.includeMandatory && s.isMoveinIncluded)
        ? `필수 취득세/등기비(${formatTenMan(s.mandatoryExpense, false)}) + 옵션/입주비(${formatTenMan(s.optionalExpense, false)}) 별도 현금 준비 필요`
        : (state.includeMandatory
            ? `생애최초 취득세 및 소유권이전 등기비용(${formatTenMan(s.mandatoryExpense, false)}) 별도 현금 준비 필요`
            : `발코니확장/옵션 및 가전이사비(${formatTenMan(s.optionalExpense, false)}) 별도 현금 준비 필요`);

      titleFundingSection.innerHTML = `<i data-lucide="pie-chart" class="w-5 h-5 text-indigo-600"></i> 분양 자금 조달 구조 및 핵심 재무 지표`;
      tbodyFundingStructure.innerHTML = `
        <tr>
          <td class="px-4 py-3 font-bold text-slate-900">1. 목표 분양가</td>
          <td class="px-4 py-3 text-right font-extrabold text-indigo-600">${formatWon(s.price)}</td>
          <td class="px-4 py-3 text-slate-500">단일 기준 공급가</td>
        </tr>
        ${state.includeMandatory ? `
        <tr class="bg-indigo-50/30">
          <td class="px-4 py-3 font-bold text-indigo-900">2. [필수] 취득·거래비용</td>
          <td class="px-4 py-3 text-right font-extrabold text-indigo-700 whitespace-nowrap">약 ${formatWon(s.mandatoryExpense)}</td>
          <td class="px-4 py-3 text-slate-600">생애최초 취득세(${formatTenMan(s.expenseData.taxInfo.finalTax, false)}) + 소유권이전 등기/채권할인(${formatTenMan(s.expenseData.regFee, false)})</td>
        </tr>
        ${!s.isMoveinIncluded ? `
        <tr class="bg-indigo-100/50 border-t border-b border-indigo-200">
          <td class="px-4 py-2.5 font-extrabold text-indigo-900">➔ [소계] 순수 분양 필요 자금</td>
          <td class="px-4 py-2.5 text-right font-black text-indigo-900 whitespace-nowrap">${formatWon(s.pureTotalBudget)}</td>
          <td class="px-4 py-2.5 text-indigo-800 font-bold">분양가 + 필수 취득세/등기비 (옵션 제외 최소 자금)</td>
        </tr>
        ` : ''}
        ` : ''}
        ${s.isMoveinIncluded ? `
        <tr class="bg-purple-50/30">
          <td class="px-4 py-3 font-bold text-purple-900">3. [선택] 옵션 및 입주비용</td>
          <td class="px-4 py-3 text-right font-extrabold text-purple-700 whitespace-nowrap">약 ${formatWon(s.optionalExpense)}</td>
          <td class="px-4 py-3 text-slate-600">${s.isMoveinIncluded ? `발코니확장/시스템에어컨(${formatTenMan(s.expenseData.optionCost, false)})${s.expenseData.moveinCost > 0 ? ` + 가전/가구/이사비(${formatTenMan(s.expenseData.moveinCost, false)})` : ''}` : '선택 안 함'}</td>
        </tr>
        <tr class="bg-purple-100/60 border-t border-b border-purple-200">
          <td class="px-4 py-2.5 font-extrabold text-purple-950">➔ ${state.includeMandatory ? '[총계] 입주 완료 총 소요 자금' : '[소계] 선택적 비용 포함시 예산'}</td>
          <td class="px-4 py-2.5 text-right font-black text-purple-950 whitespace-nowrap">${formatWon(s.fullTotalBudget)}</td>
          <td class="px-4 py-2.5 text-purple-900 font-bold">${state.includeMandatory ? '분양가 + 취득세 + 발코니확장/옵션 + 입주비용' : '분양가 + 발코니확장/옵션 + 입주비용'}</td>
        </tr>
        ` : ''}
        <tr>
          <td class="px-4 py-3 font-semibold text-slate-700">보유 순자산 (전세보증금/현금)</td>
          <td class="px-4 py-3 text-right font-bold text-emerald-600">${formatWon(s.equity)}</td>
          <td class="px-4 py-3 text-slate-500">${getEquityBreakdownSummary('퇴거 시 전액 회수')}</td>
        </tr>
        <tr class="bg-purple-50/40">
          <td class="px-4 py-3 font-bold text-purple-900">필요 잔금 주택담보대출</td>
          <td class="px-4 py-3 text-right font-extrabold text-purple-700">${formatWon(s.requiredLoan)}</td>
          <td class="px-4 py-3 text-purple-700 font-medium">LTV 약 ${s.ltv}% (분양가 기준 ${formatWon(s.requiredLoan)})</td>
        </tr>
        ${extraCostTotal > 0 ? `
        <tr class="bg-amber-50/50">
          <td class="px-4 py-3 font-bold text-amber-950">준비해야 할 부가 비용</td>
          <td class="px-4 py-3 text-right font-extrabold text-amber-700 whitespace-nowrap">약 ${formatWon(extraCostTotal)}</td>
          <td class="px-4 py-3 text-amber-900 font-medium">${extraCostDesc}</td>
        </tr>
        ` : ''}
        <tr class="border-t-2 border-slate-400">
          <td class="px-4 py-3 pt-3.5 font-semibold text-slate-700 border-t-2 border-slate-400">월 원리금 상환액</td>
          <td class="px-4 py-3 pt-3.5 text-right font-bold text-slate-800 border-t-2 border-slate-400">${formatTenMan(s.monthlyPayment)}</td>
          <td class="px-4 py-3 pt-3.5 text-slate-500 border-t-2 border-slate-400">${s.loanYears}년 만기 원리금균등 (금리 연 ${s.loanRate}% 기준)</td>
        </tr>
        <tr>
          <td class="px-4 py-3 font-semibold text-slate-700">소득 대비 주거비 비중</td>
          <td class="px-4 py-3 text-right font-bold text-indigo-600">약 ${s.housingRatio}%</td>
          <td class="px-4 py-3 text-slate-500">월 실수령액 ${formatTenMan(s.monthlyNetIncome, false)} 기준</td>
        </tr>
        <tr>
          <td class="px-4 py-3 font-semibold text-slate-700">DSR (총부채원리금상환비율)</td>
          <td class="px-4 py-3 text-right font-bold text-blue-600">약 ${s.dsr}%</td>
          <td class="px-4 py-3 text-slate-500">${incomeLabel} ${formatTenMan(s.annualIncome, false)} 기준 (법적 한도 40% 이내 적격)</td>
        </tr>
      `;

      titleComparisonSection.innerHTML = `<i data-lucide="scale" class="w-5 h-5 text-purple-600"></i> 대출 만기 및 금리별 월 상환액 비교`;
      txtCompareLoanAmount.textContent = `잔금 주담대 ${formatWon(s.requiredLoan)} 기준`;
      tbodyLoanComparison.innerHTML = s.comparisonMatrix.map(row => `
        <tr class="${row.rate === s.loanRate && row.years === s.loanYears ? 'bg-purple-50/60 font-bold' : ''}">
          <td class="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">${row.label}</td>
          <td class="px-4 py-3 text-right font-extrabold text-purple-700 whitespace-nowrap">약 ${row.monthlyPaymentTenThousand}만 원</td>
          <td class="px-4 py-3 text-right font-bold text-slate-700 whitespace-nowrap">${row.ratio}%</td>
          <td class="px-4 py-3 text-slate-600">${row.desc}</td>
        </tr>
      `).join('');

      titleTimelineSection.innerHTML = `<i data-lucide="milestone" class="w-5 h-5 text-indigo-600"></i> 실전 4단계 분양 자금 조달 및 결산 타임라인`;
      timelineStep1Title.textContent = '1단계: 청약 당첨 및 계약금 납부 (D-Day ~ 1개월)';
      const borrowerText = isCouple ? '본인 또는 배우자 명의의 신용대출 또는 마이너스통장' : '본인 명의의 신용대출 또는 마이너스통장';
      timelineStep1.innerHTML = `
        <div>• <strong>필요 자금:</strong> 계약금 10% = <strong>${formatWon(s.downPayment)}</strong></div>
        <div>• <strong>자금 조달 방식:</strong> 기존 전세보증금(${formatWon(s.equity)})이 임대인에게 묶여 있으므로, ${borrowerText}을 통해 <strong>${formatWon(s.downPayment)}</strong>을 단기 실행하여 납부합니다.</div>
        <div>• <strong>이자 부담:</strong> 공사 기간 중 발생하는 소액의 월 이자(연 ${state.creditLoanRate}% 기준 월 약 ${formatTenMan(s.creditLoanMonthlyInterest, false)})는 가계 여유 소득으로 충분히 흡수 가능합니다.</div>
      `;

      timelineStep2Title.textContent = '2단계: 공사 기간 중도금 납부 (약 2.5년 ~ 3년)';
      timelineStep2.innerHTML = `
        <div>• <strong>필요 자금:</strong> 분양가의 60% = <strong>${formatWon(s.middlePayment)}</strong></div>
        <div>• <strong>자금 조달 방식:</strong> 시공사 및 HUG(주택도시보증공사) 보증 중도금 집단대출(60%)로 전액 실행합니다.</div>
        <div>• <strong>금융 특징:</strong> 중도금 집단대출은 차주의 개인 DSR 규제 적용 대상에서 제외되므로 계약금 신용대출 보유 여부와 상관없이 100% 실행됩니다. 입주 전까지 원금 상환 의무가 없어 현금 투입은 0원입니다.</div>
        <div>• <strong>공사 기간 저축:</strong> 가계 실수령액 중 매월 저축하여 3년간 4,000만~5,000만 원의 입주 비상금을 축적합니다.</div>
      `;

      timelineStep3Title.textContent = '3단계: 준공 및 입주 잔금일 일괄 대환 정산 (D-Day)';
      theadStep3.innerHTML = `
        <th class="px-3 py-2">자금 유입 구분</th>
        <th class="px-3 py-2 text-right">금액</th>
        <th class="px-3 py-2">자금 집행 및 배분 항목</th>
        <th class="px-3 py-2 text-right">처리 금액</th>
      `;
      tbodyStep3.innerHTML = `
        <tr>
          <td class="px-3 py-2.5 font-bold text-indigo-900">신축 잔금 주택담보대출 실행</td>
          <td class="px-3 py-2.5 text-right font-extrabold text-indigo-600">${formatWon(s.step3.inflowMortgage)}</td>
          <td class="px-3 py-2.5 font-semibold text-slate-800">기존 중도금 집단대출 전액 대환 상환 (60%)</td>
          <td class="px-3 py-2.5 text-right font-bold text-slate-900">${formatWon(s.step3.outflowMiddle)}</td>
        </tr>
        <tr>
          <td class="px-3 py-2.5 font-bold text-emerald-900">기존 전세보증금 회수 (퇴거)</td>
          <td class="px-3 py-2.5 text-right font-extrabold text-emerald-600">${formatWon(s.step3.inflowDeposit)}</td>
          <td class="px-3 py-2.5 font-semibold text-slate-800">분양 잔금 완납 (30%)</td>
          <td class="px-3 py-2.5 text-right font-bold text-slate-900">${formatWon(s.step3.outflowRemain)}</td>
        </tr>
        <tr class="bg-emerald-50/40">
          <td class="px-3 py-2.5 text-slate-400 text-center">—</td>
          <td class="px-3 py-2.5 text-slate-400 text-center">—</td>
          <td class="px-3 py-2.5 font-bold text-emerald-900">계약금용 신용대출 전액 상환 및 해지</td>
          <td class="px-3 py-2.5 text-right font-extrabold text-emerald-700">${formatWon(s.step3.outflowCreditLoan)}</td>
        </tr>
        <tr>
          <td class="px-3 py-2.5 text-slate-400 text-center">—</td>
          <td class="px-3 py-2.5 text-slate-400 text-center">—</td>
          <td class="px-3 py-2.5 font-semibold text-slate-800">취득세(생애최초) 및 발코니/옵션/등기 정산</td>
          <td class="px-3 py-2.5 text-right font-bold text-slate-700">약 ${formatWon(s.step3.outflowExpense)}</td>
        </tr>
        <tr class="bg-slate-100 font-extrabold">
          <td class="px-3 py-2.5 text-slate-900">자금 유입 합계</td>
          <td class="px-3 py-2.5 text-right text-slate-900">${formatWon(s.step3.inflowTotal)}</td>
          <td class="px-3 py-2.5 text-slate-900">총 정산 지출 합계</td>
          <td class="px-3 py-2.5 text-right text-slate-900">${formatWon(s.step3.outflowTotal)}</td>
        </tr>
      `;

      timelineStep4Title.textContent = '4단계: 입주 후 월 원리금 안착 및 가계 재무 최적화';
      timelineStep4.innerHTML = `
        <div>• <strong>주택담보대출 최종 조건:</strong> 원금 <strong>${formatWon(s.requiredLoan)}</strong> / ${s.loanYears}년 만기 원리금균등 / 연 ${s.loanRate}% 기준</div>
        <div>• <strong>월 원리금 상환액:</strong> <strong>${formatTenMan(s.monthlyPayment)}</strong> (실수령액 대비 약 ${s.housingRatio}%)</div>
        <div>• <strong>가계 재무 최적화:</strong> 신용대출과 중도금 대출이 모두 0원으로 정리되어 단일 장기 모기지만 남으며, 매월 <strong>약 ${surplusMinMan}만~${surplusMaxMan}만 원</strong>의 여유 저축을 지속할 수 있습니다.</div>
      `;

      titleStrategySection.innerHTML = `<i data-lucide="help-circle" class="w-5 h-5 text-indigo-400"></i> 전세 만기 불일치 시 실전 대응 수칙`;
      contentStrategySection.innerHTML = `
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <strong>📌 시나리오 A: 전세 만기가 아파트 입주보다 3~6개월 먼저 도래하는 경우</strong><br>
          • 현 임대인과 사전 협의를 통해 계약 갱신 또는 개월 단위 단기 연장을 최우선 협의합니다.<br>
          • 보증금을 먼저 반환받을 경우 파킹통장(CMA)에 예치해 무위험 이자 수익을 취하고, 입주일까지 단기 월세 또는 LH 단기 임대 주택을 활용합니다.
        </div>
        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <strong>📌 시나리오 B: 아파트 입주 시점보다 전세 만기가 늦게 끝나는 경우</strong><br>
          • 입주 예정일 6개월 전부터 인근 공인중개사무소 다수에 매물을 등록하고 후속 세입자를 적극 물색합니다.<br>
          • 입주일자에 맞춘 조기 퇴거 확정을 위해 신규 계약 중개수수료를 임차인이 전액 지원하는 조건을 제시하여 매칭 속도를 극대화합니다.
        </div>
      `;
    }
  }

  // 1) 모드 탭 (매매, 분양, 전세, 가구조건, 금리표)
  tabResale.addEventListener('click', () => setMode('resale'));
  tabPresale.addEventListener('click', () => setMode('presale'));
  tabJeonse.addEventListener('click', () => setMode('jeonse'));
  if (tabHousehold) tabHousehold.addEventListener('click', () => setMode('household'));
  tabRates.addEventListener('click', () => setMode('rates'));
  if (tabAmortization) tabAmortization.addEventListener('click', () => setMode('amortization'));
  
  if (btnCalcAmort) {
    btnCalcAmort.addEventListener('click', () => calculateAmortization(false));
  }
  
  function calculateAmortization(skipScroll = false) {
    if (!amortAmount || !amortType || !amortRate || !amortTerm || !tbodyAmortResult || !amortResultContainer) return;
    
    const amount = Number(amortAmount.value.replace(/[^0-9]/g, '')) || 0;
    const type = amortType.value;
    const rate = Number(amortRate.value) / 100 / 12 || 0;
    const term = (Number(amortTerm.value) || 10) * 12;
    const grace = (Number(amortGrace.value) || 0) * 12;
    const startDate = new Date(amortDate.value || new Date());
    let firstPaymentDate = new Date(startDate);
    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
    if (amortFirstDate && amortFirstDate.value) {
      firstPaymentDate = new Date(amortFirstDate.value);
    }
    
    if (amount <= 0 || term <= 0) {
      showToast('⚠️ 대출금액과 대출기간을 올바르게 입력해주세요.');
      return;
    }
    
    let html = '';
    let balance = amount;
    
    if (type === 'equal-payment') {
      // 원리금균등분할상환
      const paymentTerm = term - grace;
      let monthlyPayment = 0;
      if (paymentTerm > 0) {
        // 월 상환금은 은행 표준 방식(월 이율 1/12)으로 고정액 산출
        monthlyPayment = rate === 0 ? amount / paymentTerm : (amount * rate * Math.pow(1 + rate, paymentTerm)) / (Math.pow(1 + rate, paymentTerm) - 1);
      }
      
      let prevDate = startDate;
      for (let i = 1; i <= term; i++) {
        let currentDate;
        if (i === term) {
          // 마지막 달은 대출실행일(startDate) 기준 만기일
          currentDate = new Date(startDate);
          currentDate.setMonth(currentDate.getMonth() + term);
        } else {
          currentDate = new Date(firstPaymentDate);
          currentDate.setMonth(currentDate.getMonth() + (i - 1));
        }
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const annualRate = rate * 12;
        let interest = 0;
        let principal = 0;
        let total = 0;
        
        // 은행 기준: 이자 산출 시작일(prevDate)이 속한 연도가 윤년이면 366일로 나눔
        const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        const daysInYear = isLeapYear(prevDate.getFullYear()) ? 366 : 365;
        
        if (type === 'equal-payment') {
          // 공홈(HF) 하이브리드 방식: 전 구간 실일수 적용 + 마지막 달 잔액 강제 매칭
          const days = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
          interest = Math.floor(balance * (annualRate * days / daysInYear));
          
          if (i > grace) {
            if (i === 1) {
              const standardPrevDate = new Date(currentDate);
              standardPrevDate.setMonth(standardPrevDate.getMonth() - 1);
              const standardDays = Math.round((currentDate - standardPrevDate) / (1000 * 60 * 60 * 24));
              const standardDaysInYear = isLeapYear(standardPrevDate.getFullYear()) ? 366 : 365;
              const standardInterest = Math.floor(balance * (annualRate * standardDays / standardDaysInYear));
              principal = Math.round(monthlyPayment) - standardInterest;
              total = principal + interest;
            } else {
              total = Math.round(monthlyPayment);
              principal = total - interest;
            }
            
            if (i === term || balance < principal) {
              principal = Math.round(balance);
              total = principal + interest;
            }
          } else {
            total = interest;
          }
        }
        
        balance -= principal;
        if (balance < 0) balance = 0;
        prevDate = currentDate;
        
        html += `
          <tr class="${i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}">
            <td class="px-3 py-2 text-center text-slate-500">${i}</td>
            <td class="px-3 py-2 text-center text-slate-700">${dateStr}</td>
            <td class="px-3 py-2 text-slate-800">${principal.toLocaleString()}</td>
            <td class="px-3 py-2 text-slate-800">${interest.toLocaleString()}</td>
            <td class="px-3 py-2 font-bold text-indigo-700">${total.toLocaleString()}</td>
            <td class="px-3 py-2 font-semibold text-slate-600">${Math.round(balance).toLocaleString()}</td>
          </tr>
        `;
      }
    } else if (type === 'equal-principal') {
      // 원금균등분할상환
      const paymentTerm = term - grace;
      const principalMonthly = paymentTerm > 0 ? amount / paymentTerm : 0;
      
      let prevDate = startDate;
      for (let i = 1; i <= term; i++) {
        let currentDate;
        if (i === term) {
          currentDate = new Date(startDate);
          currentDate.setMonth(currentDate.getMonth() + term);
        } else {
          currentDate = new Date(firstPaymentDate);
          currentDate.setMonth(currentDate.getMonth() + (i - 1));
        }
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const days = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        const annualRate = rate * 12;
        const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        const daysInYear = isLeapYear(prevDate.getFullYear()) ? 366 : 365;
        let interest = Math.floor(balance * (annualRate * days / daysInYear));
        let principal = 0;
        
        if (i > grace) {
          principal = Math.round(principalMonthly);
          if (i === term || balance < principal) {
            principal = Math.round(balance);
          }
        }
        
        let total = principal + interest;
        balance -= principal;
        if (balance < 0) balance = 0;
        prevDate = currentDate;
        
        html += `
          <tr class="${i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}">
            <td class="px-3 py-2 text-center text-slate-500">${i}</td>
            <td class="px-3 py-2 text-center text-slate-700">${dateStr}</td>
            <td class="px-3 py-2 text-slate-800">${principal.toLocaleString()}</td>
            <td class="px-3 py-2 text-slate-800">${interest.toLocaleString()}</td>
            <td class="px-3 py-2 font-bold text-indigo-700">${total.toLocaleString()}</td>
            <td class="px-3 py-2 font-semibold text-slate-600">${Math.round(balance).toLocaleString()}</td>
          </tr>
        `;
      }
    } else if (type === 'graduated') {
      // 체증식 분할상환
      const paymentTerm = term - grace;
      const annualRate = rate * 12;
      const g = 0.002; // 월 0.2% 체증
      let pmt1 = 0;
      
      if (paymentTerm > 0) {
        if (rate === g) {
          pmt1 = amount * (1 + rate) / paymentTerm;
        } else {
          const q = (1 + g) / (1 + rate);
          pmt1 = amount * (1 + rate) * (1 - q) / (1 - Math.pow(q, paymentTerm));
        }
      }
      
      let prevDate = startDate;
      for (let i = 1; i <= term; i++) {
        let currentDate;
        if (i === term) {
          currentDate = new Date(startDate);
          currentDate.setMonth(currentDate.getMonth() + term);
        } else {
          currentDate = new Date(firstPaymentDate);
          currentDate.setMonth(currentDate.getMonth() + (i - 1));
        }
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // 이자 계산 (1/12th rate for normal months logic to match equal-payment's zeroing fix if any, but let's use the standard actual days logic matching the rest of the file)
        const days = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        const daysInYear = isLeapYear(prevDate.getFullYear()) ? 366 : 365;
        let interest = Math.floor(balance * (annualRate * days / daysInYear));
        let principal = 0;
        let total = interest;
        
        if (i > grace) {
          const currentPmt = pmt1 * Math.pow(1 + g, i - 1 - grace);
          
          // 실일수 기준 이자를 차감하되 첫달 예외처리 (equal-payment 로직 참조)
          if (i === 1) {
            const standardPrevDate = new Date(currentDate);
            standardPrevDate.setMonth(standardPrevDate.getMonth() - 1);
            const standardDays = Math.round((currentDate - standardPrevDate) / (1000 * 60 * 60 * 24));
            const standardDaysInYear = isLeapYear(standardPrevDate.getFullYear()) ? 366 : 365;
            const standardInterest = Math.floor(balance * (annualRate * standardDays / standardDaysInYear));
            principal = Math.round(currentPmt) - standardInterest;
            total = principal + interest;
          } else {
            total = Math.round(currentPmt);
            principal = total - interest;
          }
          
          if (i === term || balance < principal) {
            principal = Math.round(balance);
            total = principal + interest;
          }
        }
        
        balance -= principal;
        if (balance < 0) balance = 0;
        prevDate = currentDate;
        
        html += `
          <tr class="${i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}">
            <td class="px-3 py-2 text-center text-slate-500">${i}</td>
            <td class="px-3 py-2 text-center text-slate-700">${dateStr}</td>
            <td class="px-3 py-2 text-slate-800">${principal.toLocaleString()}</td>
            <td class="px-3 py-2 text-slate-800">${interest.toLocaleString()}</td>
            <td class="px-3 py-2 font-bold text-indigo-700">${total.toLocaleString()}</td>
            <td class="px-3 py-2 font-semibold text-slate-600">${Math.round(balance).toLocaleString()}</td>
          </tr>
        `;
      }
    } else {
      // 만기일시상환
      let prevDate = startDate;
      for (let i = 1; i <= term; i++) {
        let currentDate;
        if (i === term) {
          currentDate = new Date(startDate);
          currentDate.setMonth(currentDate.getMonth() + term);
        } else {
          currentDate = new Date(firstPaymentDate);
          currentDate.setMonth(currentDate.getMonth() + (i - 1));
        }
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const days = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        const annualRate = rate * 12;
        const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        const daysInYear = isLeapYear(prevDate.getFullYear()) ? 366 : 365;
        let interest = Math.floor(balance * (annualRate * days / daysInYear));
        let principal = i === term ? Math.round(balance) : 0;
        let total = principal + interest;
        balance -= principal;
        if (balance < 0) balance = 0;
        prevDate = currentDate;
        
        html += `
          <tr class="${i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}">
            <td class="px-3 py-2 text-center text-slate-500">${i}</td>
            <td class="px-3 py-2 text-center text-slate-700">${dateStr}</td>
            <td class="px-3 py-2 text-slate-800">${principal.toLocaleString()}</td>
            <td class="px-3 py-2 text-slate-800">${interest.toLocaleString()}</td>
            <td class="px-3 py-2 font-bold text-indigo-700">${total.toLocaleString()}</td>
            <td class="px-3 py-2 font-semibold text-slate-600">${Math.round(balance).toLocaleString()}</td>
          </tr>
        `;
      }
    }
    
    tbodyAmortResult.innerHTML = html;
    amortResultContainer.classList.remove('hidden');
    showToast('상환일정표 계산이 완료되었습니다. 👇');
    
    // Scroll to result only if explicitly clicked
    if (skipScroll !== true) {
      setTimeout(() => {
        amortResultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }
  
  if (amortAmount) {
    bindMoneyInput(amortAmount);
  }

  // 1-2) 사이드바 가구 조건 변경 배너 및 하단 액션 버튼 바인딩
  if (btnGotoHouseholdSettings) {
    btnGotoHouseholdSettings.addEventListener('click', () => setMode('household'));
  }
  if (btnActionGotoResale) {
    btnActionGotoResale.addEventListener('click', () => setMode('resale'));
  }
  if (btnActionGotoPresale) {
    btnActionGotoPresale.addEventListener('click', () => setMode('presale'));
  }
  if (btnActionGotoJeonse) {
    btnActionGotoJeonse.addEventListener('click', () => setMode('jeonse'));
  }

  // 2) 가구 형태(부부합산 vs 단독 세대주) 라디오 바인딩
  document.querySelectorAll('input[name="household-type"]').forEach(radio => {
    radio.addEventListener('change', () => {
      setHouseholdType(radio.value, false);
      recalculate();
    });
  });

  // 2-2) 가구 프로필 사전 설정 버튼 바인딩 (상단 카드 + 하단 5열 바 통합)
  document.querySelectorAll('.profile-preset-card, .profile-preset-bar-btn, .profile-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const profileId = btn.getAttribute('data-profile');
      if (profileId) {
        applyHouseholdProfile(profileId);
      }
    });
  });

  // 2-3) 혼인 기간 (신혼 여부) 라디오 바인딩
  document.querySelectorAll('input[name="marriage-period"]').forEach(radio => {
    radio.addEventListener('change', () => {
      updateMarriagePeriodUI(radio.value);
      recalculate();
    });
  });

  // 2-4) 미성년 자녀 수 버튼 바인딩
  document.querySelectorAll('.child-count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = Number(btn.getAttribute('data-count') || 0);
      updateChildCountUI(count);
      recalculate();
    });
  });

  // 2-5) 소득 형태 빠른 선택 버튼 바인딩
  document.querySelectorAll('.quick-income-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const incType = btn.getAttribute('data-income-type');
      const annual = Number(btn.getAttribute('data-annual'));
      const monthly = Number(btn.getAttribute('data-monthly'));
      updateIncomeTypeUI(incType);
      if (annual) {
        state.annualIncome = annual;
        inpAnnualIncome.value = annual.toLocaleString();
      }
      if (monthly) {
        state.monthlyNetIncome = monthly;
        inpMonthlyIncome.value = monthly.toLocaleString();
      }
      recalculate();
    });
  });

  // 2-6) 외벌이 전략 적용 팁 버튼 바인딩
  if (btnApplySingleEarnerTip) {
    btnApplySingleEarnerTip.addEventListener('click', () => {
      applyHouseholdProfile('couple-single-earner');
    });
  }

  // 2-7) 실시간 진단 카드 클릭 시 해당 금리 즉시 적용 및 시뮬레이터 이동 바인딩
  const cardDidimdolStatus = document.getElementById('card-didimdol-status');
  if (cardDidimdolStatus) {
    cardDidimdolStatus.addEventListener('click', () => {
      const el = (typeof INTEREST_RATES_DATA !== 'undefined' && INTEREST_RATES_DATA.evaluateEligibility)
        ? INTEREST_RATES_DATA.evaluateEligibility(state, state.price, 'resale')
        : null;

      if (el && el.didimdol && !el.didimdol.passed) {
        showToast(`⚠️ 디딤돌대출은 심사 부적격(${el.didimdol.reason})으로 신청 및 시뮬레이션이 불가합니다.`);
        return;
      }

      // 주택 구입자금(디딤돌) ➔ 구축 매매(또는 신축 분양) 시뮬레이터로 이동
      const targetMode = (state.simMode === 'presale') ? 'presale' : 'resale';
      const modeLabel = (targetMode === 'presale') ? '신축 분양' : '구축 매매';
      state.loanRate = 3.0;
      inpRate.value = 3.0;
      rngRate.value = 3.0;
      validateAndAutoCorrectLoanRules('rate-preset', { selectedRate: 3.0 });
      syncRateToRadios(3.0);
      highlightSelectedLoanCard(3.0, el);
      recalculate();
      showToast(`디딤돌대출 금리(연 3.0%)가 [${modeLabel} 시뮬레이터]에 즉시 적용되었습니다! ⚡`);
      setTimeout(() => {
        setMode(targetMode);
      }, 350);
    });
  }

  const cardBogeumjariStatus = document.getElementById('card-bogeumjari-status');
  if (cardBogeumjariStatus) {
    cardBogeumjariStatus.addEventListener('click', () => {
      const el = (typeof INTEREST_RATES_DATA !== 'undefined' && INTEREST_RATES_DATA.evaluateEligibility)
        ? INTEREST_RATES_DATA.evaluateEligibility(state, state.price, 'resale')
        : null;

      if (el && el.bogeumjari && !el.bogeumjari.passed) {
        showToast(`⚠️ 보금자리론은 심사 부적격(${el.bogeumjari.reason})으로 신청 및 시뮬레이션이 불가합니다.`);
        return;
      }

      // 주택 구입자금(보금자리론) ➔ 구축 매매(또는 신축 분양) 시뮬레이터로 이동
      const targetMode = (state.simMode === 'presale') ? 'presale' : 'resale';
      const modeLabel = (targetMode === 'presale') ? '신축 분양' : '구축 매매';
      state.loanRate = 3.8;
      inpRate.value = 3.8;
      rngRate.value = 3.8;
      validateAndAutoCorrectLoanRules('rate-preset', { selectedRate: 3.8 });
      syncRateToRadios(3.8);
      highlightSelectedLoanCard(3.8, el);
      recalculate();
      showToast(`보금자리론 금리(연 3.8%)가 [${modeLabel} 시뮬레이터]에 즉시 적용되었습니다! ⚡`);
      setTimeout(() => {
        setMode(targetMode);
      }, 350);
    });
  }

  const cardCommercialStatus = document.getElementById('card-commercial-status');
  if (cardCommercialStatus) {
    cardCommercialStatus.addEventListener('click', () => {
      // 주택담보대출(시중은행 주담대) ➔ 구축 매매(또는 신축 분양) 시뮬레이터로 이동
      const targetMode = (state.simMode === 'presale') ? 'presale' : 'resale';
      const modeLabel = (targetMode === 'presale') ? '신축 분양' : '구축 매매';
      state.loanRate = 4.8;
      inpRate.value = 4.8;
      rngRate.value = 4.8;
      validateAndAutoCorrectLoanRules('rate-preset', { selectedRate: 4.8 });
      syncRateToRadios(4.8);
      highlightSelectedLoanCard(4.8);
      recalculate();
      showToast(`시중은행 주담대 금리(연 4.8%)가 [${modeLabel} 시뮬레이터]에 즉시 적용되었습니다! ⚡`);
      setTimeout(() => {
        setMode(targetMode);
      }, 350);
    });
  }

  if (cardBeotimmokStatus) {
    cardBeotimmokStatus.addEventListener('click', () => {
      // 전세자금대출(버팀목/HUG) ➔ 100% 전세자금대출 시뮬레이터로 이동
      const optimal = getOptimalJeonseRateInfo();
      state.loanRate = optimal.rate;
      inpRate.value = optimal.rate;
      rngRate.value = optimal.rate;
      setMode('jeonse');
      syncRateToRadios(optimal.rate);
      highlightSelectedLoanCard(optimal.rate);
      recalculate();
      if (optimal.eligible) {
        showToast(`[${optimal.name}] 금리가 [전세자금대출 시뮬레이터]에 즉시 적용되었습니다! ⚡`);
      } else {
        showToast(`⚠️ 버팀목 미충족(${optimal.reason})으로 [${optimal.name}]가 적용되었습니다.`);
      }
    });
  }

  // 3) 뷰 모드 전환 (대시보드 vs 마크다운)
  viewDashboardBtn.addEventListener('click', () => {
    state.viewMode = 'dashboard';
    viewDashboardBtn.classList.add('active');
    viewDashboardBtn.classList.remove('text-slate-600');
    viewMarkdownBtn.classList.remove('active');
    viewMarkdownBtn.classList.add('text-slate-600');
    containerDashboardView.classList.remove('hidden');
    containerMarkdownView.classList.add('hidden');
  });

  viewMarkdownBtn.addEventListener('click', () => {
    state.viewMode = 'markdown';
    viewMarkdownBtn.classList.add('active');
    viewMarkdownBtn.classList.remove('text-slate-600');
    viewDashboardBtn.classList.remove('active');
    viewDashboardBtn.classList.add('text-slate-600');
    containerDashboardView.classList.add('hidden');
    containerMarkdownView.classList.remove('hidden');
  });

  // 4) 프리셋 버튼 클릭
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = Number(btn.dataset.price);
      const e = Number(btn.dataset.equity);
      const r = Number(btn.dataset.rate);
      if (p) inpPrice.value = p.toLocaleString();
      // 사용자가 이미 설정한 순자산(세부 구성 포함)이 있으면 무단 초기화하지 않고 그대로 보존!
      const currentEquity = parseMoney(inpEquity.value);
      if (!currentEquity || currentEquity <= 0) {
        if (e) {
          inpEquity.value = e.toLocaleString();
          syncMainEquityToSub();
        }
      }
      if (r) {
        inpRate.value = r;
        rngRate.value = r;
        syncRateToRadios(r);
      }
      validateAndAutoCorrectLoanRules('price');
      recalculate();
    });
  });

  // 5) 금액 증감 버튼
  document.querySelectorAll('.price-adjust-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = Number(btn.dataset.delta);
      let currentPrice = parseMoney(inpPrice.value) || 0;
      currentPrice = Math.max(10000000, currentPrice + delta);
      inpPrice.value = currentPrice.toLocaleString();
      validateAndAutoCorrectLoanRules('price');
      recalculate();
    });
  });

  // 5-2) 순자산 증감 버튼
  document.querySelectorAll('.equity-adjust-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = Number(btn.dataset.delta);
      let currentEquity = parseMoney(inpEquity.value) || 0;
      currentEquity = Math.max(0, currentEquity + delta);
      inpEquity.value = currentEquity.toLocaleString();
      syncMainEquityToSub();
      recalculate();
    });
  });

  // 5-3) 연소득 증감 버튼
  document.querySelectorAll('.income-adjust-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = Number(btn.dataset.delta);
      let currentIncome = parseMoney(inpAnnualIncome.value) || 0;
      currentIncome = Math.max(0, currentIncome + delta);
      inpAnnualIncome.value = currentIncome.toLocaleString();
      recalculate();
    });
  });

  // 5-4) 월 실수령액 증감 버튼
  document.querySelectorAll('.monthly-income-adjust-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = Number(btn.dataset.delta);
      let currentMonthly = parseMoney(inpMonthlyIncome.value) || 0;
      currentMonthly = Math.max(0, currentMonthly + delta);
      inpMonthlyIncome.value = currentMonthly.toLocaleString();
      recalculate();
    });
  });

  // 5-5) 인테리어/옵션 및 이사/가전 증감 버튼
  document.querySelectorAll('.refurbish-adjust-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = Number(btn.dataset.delta);
      let currentVal = parseMoney(inpCustomExtra.value) || 0;
      currentVal = Math.max(0, currentVal + delta);
      inpCustomExtra.value = currentVal ? currentVal.toLocaleString() : '';
      recalculate();
    });
  });

  document.querySelectorAll('.movein-adjust-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = Number(btn.dataset.delta);
      let currentVal = parseMoney(inpMoveinExtra.value) || 0;
      currentVal = Math.max(0, currentVal + delta);
      inpMoveinExtra.value = currentVal ? currentVal.toLocaleString() : '';
      recalculate();
    });
  });

  // 5-6) 금액 입력 필드 실시간 천단위 콤마 서식 바인딩
  bindMoneyInput(inpPrice, () => {
    validateAndAutoCorrectLoanRules('price');
    recalculate();
  });
  bindMoneyInput(inpEquity, () => {
    syncMainEquityToSub();
    recalculate();
  });
  if (inpEquityDeposit) bindMoneyInput(inpEquityDeposit, syncSubEquityToMain);
  if (inpEquitySavings) bindMoneyInput(inpEquitySavings, syncSubEquityToMain);
  if (inpEquityGift) bindMoneyInput(inpEquityGift, syncSubEquityToMain);
  bindMoneyInput(inpAnnualIncome, () => recalculate());
  bindMoneyInput(inpMonthlyIncome, () => recalculate());
  bindMoneyInput(inpCustomExtra, () => recalculate());
  if (inpMoveinExtra) {
    bindMoneyInput(inpMoveinExtra, () => recalculate());
  }

  // 5-7) 필수/선택 비용 포함 여부 토글 체크박스
  if (chkIncludeMandatory) {
    chkIncludeMandatory.addEventListener('change', () => recalculate());
  }
  if (chkIncludeMovein) {
    chkIncludeMovein.addEventListener('change', () => recalculate());
  }

  // 6) 일반 입력 및 선택 필드 변경 리스너
  [selLoanYears, selRepayType, chkFirstHome, chkHomeless, inpCreditRate].forEach(elem => {
    elem.addEventListener('input', () => {
      recalculate();
    });
    elem.addEventListener('change', () => {
      if (elem === chkHomeless) {
        validateAndAutoCorrectLoanRules('household');
      }
      recalculate();
    });
  });

  // 7) 금리 슬라이더 및 인풋 양방향 동기화
  function handleRateSliderChange() {
    inpRate.value = rngRate.value;
    syncRateToRadios(Number(rngRate.value));
    recalculate();
  }
  rngRate.addEventListener('input', handleRateSliderChange);
  rngRate.addEventListener('change', handleRateSliderChange);

  inpRate.addEventListener('input', () => {
    rngRate.value = inpRate.value;
    syncRateToRadios(Number(inpRate.value));
    recalculate();
  });

  // 8) 금리 라디오 프리셋 선택 (매매용)
  document.querySelectorAll('input[name="rate-preset"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value !== 'custom') {
        const val = Number(radio.value);
        inpRate.value = val;
        rngRate.value = val;
        validateAndAutoCorrectLoanRules('rate-preset', { selectedRate: val });
      }
      updateRateRadioStyles();
      recalculate();
    });
  });

  // 8-2) 금리 라디오 프리셋 선택 (전세용)
  document.querySelectorAll('input[name="jeonse-rate-preset"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const val = Number(radio.value);
      inpRate.value = val;
      rngRate.value = val;
      validateAndAutoCorrectLoanRules('jeonse-rate-preset', { selectedRate: val });
      updateRateRadioStyles();
      recalculate();
    });
  });

  // 8-2-2) 비활성화된 금리 라디오 카드 클릭 가드 (선택 차단 및 사유 토스트 안내)
  document.querySelectorAll('.rate-radio-card').forEach(label => {
    label.addEventListener('click', (e) => {
      const radio = label.querySelector('input[type="radio"]');
      if (radio && radio.disabled) {
        e.preventDefault();
        e.stopPropagation();
        const reasonText = label.title ? label.title.replace(/^⚠️\s*/, '') : '심사 기준 미충족으로 선택 불가';
        showToast(`⚠️ ${reasonText}`);
      }
    });
  });

  // 8-3) 기준표 탭 카테고리 필터 서브 탭 핸들러 (전체 / 주택마련 / 전세)
  const btnFilterAllRates = document.getElementById('btn-filter-all-rates');
  const btnFilterPurchaseRates = document.getElementById('btn-filter-purchase-rates');
  const btnFilterJeonseRates = document.getElementById('btn-filter-jeonse-rates');
  const sectionPurchaseRates = document.getElementById('section-purchase-rates');
  const sectionJeonseRates = document.getElementById('section-jeonse-rates');

  function setRatesFilter(filterType) {
    const filterBtns = [
      { btn: btnFilterAllRates, type: 'all' },
      { btn: btnFilterPurchaseRates, type: 'purchase' },
      { btn: btnFilterJeonseRates, type: 'jeonse' }
    ];

    filterBtns.forEach(({ btn, type }) => {
      if (!btn) return;
      if (type === filterType) {
        btn.className = 'rates-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-sm transition flex items-center gap-1.5';
      } else {
        const hoverClass = type === 'purchase' ? 'hover:bg-blue-50 hover:text-blue-700' : type === 'jeonse' ? 'hover:bg-emerald-50 hover:text-emerald-700' : 'hover:bg-slate-200';
        btn.className = `rates-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 ${hoverClass} transition flex items-center gap-1.5`;
      }
    });

    if (filterType === 'all') {
      if (sectionPurchaseRates) sectionPurchaseRates.classList.remove('hidden');
      if (sectionJeonseRates) sectionJeonseRates.classList.remove('hidden');
    } else if (filterType === 'purchase') {
      if (sectionPurchaseRates) sectionPurchaseRates.classList.remove('hidden');
      if (sectionJeonseRates) sectionJeonseRates.classList.add('hidden');
    } else if (filterType === 'jeonse') {
      if (sectionPurchaseRates) sectionPurchaseRates.classList.add('hidden');
      if (sectionJeonseRates) sectionJeonseRates.classList.remove('hidden');
    }
  }

  if (btnFilterAllRates) {
    btnFilterAllRates.addEventListener('click', () => setRatesFilter('all'));
  }
  if (btnFilterPurchaseRates) {
    btnFilterPurchaseRates.addEventListener('click', () => setRatesFilter('purchase'));
  }
  if (btnFilterJeonseRates) {
    btnFilterJeonseRates.addEventListener('click', () => setRatesFilter('jeonse'));
  }

  // 8-4) 기준표 탭에서 [⚡ 이 금리로 시뮬레이터 적용] 버튼 클릭
  document.querySelectorAll('.apply-rate-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const rate = Number(btn.dataset.rate);
      const targetMode = btn.dataset.mode || (rate <= 2.9 ? 'jeonse' : 'resale');
      if (!rate) return;

      // 1. 타깃 시뮬레이터 모드로 전환 (가구 조건 및 소득은 사용자 설정 100% 온전 보존)
      setMode(targetMode);

      const priceVal = (targetMode === 'jeonse') ? (state.price || 250000000) : (state.price || 450000000);
      const el = (typeof INTEREST_RATES_DATA !== 'undefined' && INTEREST_RATES_DATA.evaluateEligibility)
        ? INTEREST_RATES_DATA.evaluateEligibility(state, priceVal, targetMode)
        : null;

      const modeLabel = targetMode === 'resale' ? '구축 매매' : targetMode === 'presale' ? '신축 분양' : '전세대출';

      // 2. 정책 대출 자격 심사 및 정석 적용
      // 1) 디딤돌대출 (연 3.0%) 클릭 시
      if (Math.abs(rate - 3.0) < 0.05) {
        const isPassed = el && el.didimdol ? el.didimdol.passed : false;
        if (isPassed) {
          state.loanRate = 3.0;
          inpRate.value = 3.0;
          rngRate.value = 3.0;
          syncRateToRadios(3.0);
          showToast(`연 3.0% 디딤돌대출 금리가 [${modeLabel} 시뮬레이터]에 정상 승인·적용되었습니다! 🚀`);
        } else {
          // 부적격 시: 억지로 가구 조건을 조작하지 않고 정직하게 부적격 고지 및 적격 상품(보금자리 3.8% 또는 시중 4.8%) 적용
          const fallbackRate = (el && el.bogeumjari && el.bogeumjari.passed) ? 3.8 : 4.8;
          state.loanRate = fallbackRate;
          inpRate.value = fallbackRate;
          rngRate.value = fallbackRate;
          syncRateToRadios(fallbackRate);
          const reason = el && el.didimdol ? el.didimdol.reason : '자격 요건 미달';
          showToast(`⚠️ 현재 가구 조건은 디딤돌대출 요건(${reason})을 충족하지 못하여 신청 불가입니다. 적격 상품인 [${fallbackRate === 3.8 ? '보금자리론 (연 3.8%)' : '시중은행 주담대 (연 4.8%)'}]가 적용되었습니다.`);
        }
      }
      // 2) 보금자리론 (연 3.8%) 클릭 시
      else if (Math.abs(rate - 3.8) < 0.05) {
        const isPassed = el && el.bogeumjari ? el.bogeumjari.passed : false;
        if (isPassed) {
          state.loanRate = 3.8;
          inpRate.value = 3.8;
          rngRate.value = 3.8;
          syncRateToRadios(3.8);
          showToast(`연 3.8% 보금자리론 금리가 [${modeLabel} 시뮬레이터]에 정상 승인·적용되었습니다! 🚀`);
        } else {
          state.loanRate = 4.8;
          inpRate.value = 4.8;
          rngRate.value = 4.8;
          syncRateToRadios(4.8);
          const reason = el && el.bogeumjari ? el.bogeumjari.reason : '자격 요건 미달';
          showToast(`⚠️ 현재 가구 조건은 보금자리론 요건(${reason})을 충족하지 못하여 신청 불가입니다. [시중은행 일반 주담대 (연 4.8%)]가 적용되었습니다.`);
        }
      }
      // 3) 청년 버팀목 (연 2.1%) 클릭 시
      else if (Math.abs(rate - 2.1) < 0.05) {
        const isPassed = (state.householdType === 'single') && (Number(state.annualIncome) <= 50000000);
        if (isPassed) {
          state.loanRate = 2.1;
          inpRate.value = 2.1;
          rngRate.value = 2.1;
          syncRateToRadios(2.1);
          showToast(`연 2.1% 청년 버팀목전세 금리가 [${modeLabel} 시뮬레이터]에 정상 승인·적용되었습니다! 🚀`);
        } else {
          const fallbackRate = 3.6;
          state.loanRate = fallbackRate;
          inpRate.value = fallbackRate;
          rngRate.value = fallbackRate;
          syncRateToRadios(fallbackRate);
          showToast(`⚠️ 청년 버팀목은 1인 단독 세대주(연소득 5천만 이하) 전용 상품입니다. 현재 조건에서 이용 가능한 [HUG 안심전세대출 (연 3.6%)]가 적용되었습니다.`);
        }
      }
      // 4) 신혼 버팀목 (연 2.4%) 클릭 시
      else if (Math.abs(rate - 2.4) < 0.05) {
        const isPassed = (state.householdType === 'couple') && (state.marriagePeriod === 'under7') && (Number(state.annualIncome) <= 75000000);
        if (isPassed) {
          state.loanRate = 2.4;
          inpRate.value = 2.4;
          rngRate.value = 2.4;
          syncRateToRadios(2.4);
          showToast(`연 2.4% 신혼 버팀목전세 금리가 [${modeLabel} 시뮬레이터]에 정상 승인·적용되었습니다! 🚀`);
        } else {
          const fallbackRate = 3.6;
          state.loanRate = fallbackRate;
          inpRate.value = fallbackRate;
          rngRate.value = fallbackRate;
          syncRateToRadios(fallbackRate);
          showToast(`⚠️ 신혼 버팀목은 혼인 7년 이내 신혼부부(합산소득 7.5천 이하) 전용 상품입니다. 현재 조건에서 이용 가능한 [HUG 안심전세대출 (연 3.6%)]가 적용되었습니다.`);
        }
      }
      // 5) 시중은행 일반 주담대 (연 4.8%), 안심전세 (연 3.6%), 일반전세 (연 4.1%)
      else {
        state.loanRate = rate;
        inpRate.value = rate;
        rngRate.value = rate;
        syncRateToRadios(rate);
        showToast(`연 ${rate.toFixed(1)}% 금리가 [${modeLabel} 시뮬레이터]에 즉시 적용되었습니다! 🚀`);
      }

      validateAndAutoCorrectLoanRules('rate-preset', { selectedRate: state.loanRate });
      recalculate();
    });
  });

  // 8-5) 실시간 공시 금리 동기화 버튼
  const btnSyncRates = document.getElementById('btn-sync-rates');
  if (btnSyncRates) {
    btnSyncRates.addEventListener('click', () => syncRatesFromServer(false));
  }

  // 9) 마크다운 복사 버튼
  btnCopyMd.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(state.generatedMarkdown);
      showToast('마크다운 문서가 클립보드에 복사되었습니다! 📋');
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = state.generatedMarkdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('마크다운 문서가 클립보드에 복사되었습니다! 📋');
    }
  });

  // 10) .md 파일 다운로드 버튼
  btnDownloadMd.addEventListener('click', () => {
    const priceWon = ScenarioEngine.formatKoreanMoney(state.price);
    let filename = '';
    if (state.mode === 'resale') {
      filename = `기존 구축·기축 아파트 ${priceWon} 매매 자금 조달 및 실전 매수 시나리오.md`;
    } else if (state.mode === 'presale') {
      filename = `분양가 ${priceWon} 자금 조달 및 전세보증금 회수 4단계 실전 로드맵 V3.md`;
    } else {
      filename = `전세보증금 ${priceWon} 자금 조달 및 전세대출 실전 로드맵.md`;
    }

    const blob = new Blob([state.generatedMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`${filename} 다운로드 완료! 💾`);
  });

  // 11) 인쇄 버튼
  btnPrint.addEventListener('click', () => {
    window.print();
  });

  // 최초 로드 실행
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  
  // 스크롤 컨트롤러 로직 (최상단, 위, 아래)
  const scrollController = document.getElementById('scroll-controller');
  const btnScrollTop = document.getElementById('btn-scroll-top');
  const btnScrollUp = document.getElementById('btn-scroll-up');
  const btnScrollDown = document.getElementById('btn-scroll-down');
  const btnScrollBottom = document.getElementById('btn-scroll-bottom');
  const btnScrollStop = document.getElementById('btn-scroll-stop');
  
  if (scrollController) {
    let autoScrollId = null;
    
    function stopAutoScroll() {
      if (autoScrollId) {
        cancelAnimationFrame(autoScrollId);
        autoScrollId = null;
      }
      if (btnScrollStop) btnScrollStop.classList.add('hidden');
    }
    
    function startAutoScroll(direction) {
      stopAutoScroll(); // 혹시 실행 중인 스크롤이 있으면 중지
      if (btnScrollStop) btnScrollStop.classList.remove('hidden');
      
      const speed = 3; // 스크롤 속도 (픽셀)
      
      function scrollStep() {
        window.scrollBy({ top: direction * speed, behavior: 'instant' });
        
        // 최상단이거나 최하단에 도달하면 자동 중지
        if (direction === -1 && window.scrollY <= 0) {
          stopAutoScroll();
          return;
        }
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        if (direction === 1 && window.scrollY >= maxScroll) {
          stopAutoScroll();
          return;
        }
        
        autoScrollId = requestAnimationFrame(scrollStep);
      }
      autoScrollId = requestAnimationFrame(scrollStep);
    }
    
    window.addEventListener('scroll', () => {
      const isAmort = state.mode === 'amortization';
      
      if (btnScrollTop) {
        if (isAmort && window.scrollY > 300) {
          btnScrollTop.classList.remove('hidden');
        } else {
          btnScrollTop.classList.add('hidden');
        }
      }
      
      if (btnScrollBottom) {
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        // 하단에서 300px 이내로 접근하면 숨김 처리
        if (isAmort && window.scrollY < maxScroll - 300) {
          btnScrollBottom.classList.remove('hidden');
        } else {
          btnScrollBottom.classList.add('hidden');
        }
      }
    });
    
    // 마우스 휠이나 터치 시 자동 스크롤 중지 (사용자 개입)
    window.addEventListener('wheel', stopAutoScroll, { passive: true });
    window.addEventListener('touchstart', stopAutoScroll, { passive: true });

    if (btnScrollTop) {
      btnScrollTop.addEventListener('click', () => {
        stopAutoScroll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    
    if (btnScrollUp) {
      btnScrollUp.addEventListener('click', () => {
        startAutoScroll(-1);
      });
    }
    
    if (btnScrollDown) {
      btnScrollDown.addEventListener('click', () => {
        startAutoScroll(1);
      });
    }
    
    if (btnScrollStop) {
      btnScrollStop.addEventListener('click', () => {
        stopAutoScroll();
      });
    }

    if (btnScrollBottom) {
      btnScrollBottom.addEventListener('click', () => {
        stopAutoScroll();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      });
    }
  }

  syncRatesFromServer(true);
  setMode('resale');
});
