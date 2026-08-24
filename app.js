// Application Main Controller
class App {
  constructor() {
    this.currentScreen = 'lobby'; // 'lobby' | 'quiz' | 'result' | 'review'
    this.reviewFilter = 'wrong'; // 'all' | 'wrong' | 'bookmarked'
    this.lastResult = null;
    this.initElements();
    this.initTheme();
    this.bindEvents();
  }

  initElements() {
    // Screens
    this.lobbyScreen = document.getElementById('lobby-screen');
    this.quizScreen = document.getElementById('quiz-screen');
    this.resultScreen = document.getElementById('result-screen');
    this.reviewScreen = document.getElementById('review-screen');

    // Lobby Elements
    this.unitListContainer = document.getElementById('unit-list-container');
    this.selectAllBtn = document.getElementById('select-all-btn');
    this.deselectAllBtn = document.getElementById('deselect-all-btn');
    this.availableCountEl = document.getElementById('available-count');
    this.questionCountSelect = document.getElementById('question-count-select');
    this.startQuizBtn = document.getElementById('start-quiz-btn');
    this.modeStudyRadio = document.getElementById('mode-study');
    this.modeExamRadio = document.getElementById('mode-exam');

    // Quiz Elements
    this.quizProgressText = document.getElementById('quiz-progress-text');
    this.quizProgressBar = document.getElementById('quiz-progress-bar');
    this.quizTimerText = document.getElementById('quiz-timer-text');
    this.unitBadgeEl = document.getElementById('quiz-unit-badge');
    this.typeBadgeEl = document.getElementById('quiz-type-badge');
    this.difficultyBadgeEl = document.getElementById('quiz-difficulty-badge');
    this.pointsBadgeEl = document.getElementById('quiz-points-badge');
    this.bookmarkBtn = document.getElementById('quiz-bookmark-btn');
    this.questionTextEl = document.getElementById('quiz-question-text');
    this.passageContainer = document.getElementById('quiz-passage-container');
    this.passageTextEl = document.getElementById('quiz-passage-text');
    this.optionsContainer = document.getElementById('quiz-options-container');
    this.explanationContainer = document.getElementById('quiz-explanation-container');
    
    // Quiz Navigation
    this.prevBtn = document.getElementById('quiz-prev-btn');
    this.nextBtn = document.getElementById('quiz-next-btn');
    this.submitBtn = document.getElementById('quiz-submit-btn');
    this.omrModalBtn = document.getElementById('quiz-omr-btn');
    this.omrModal = document.getElementById('omr-modal');
    this.omrGrid = document.getElementById('omr-grid');
    this.closeOmrBtn = document.getElementById('close-omr-btn');

    // Result Elements
    this.resultScoreEl = document.getElementById('result-score');
    this.resultGradeEl = document.getElementById('result-grade');
    this.resultGradeDescEl = document.getElementById('result-grade-desc');
    this.resultCorrectCountEl = document.getElementById('result-correct-count');
    this.resultPointsEl = document.getElementById('result-points');
    this.resultTimeEl = document.getElementById('result-time');
    this.resultUnitStatsContainer = document.getElementById('result-unit-stats');
    this.retryWrongBtn = document.getElementById('retry-wrong-btn');
    this.openReviewBtn = document.getElementById('open-review-btn');
    this.printResultBtn = document.getElementById('print-result-btn');
    this.retryQuizBtn = document.getElementById('retry-quiz-btn');
    this.backToLobbyBtn = document.getElementById('back-to-lobby-btn');

    // Review Elements
    this.reviewListContainer = document.getElementById('review-list-container');
    this.reviewFilterAllBtn = document.getElementById('filter-all-btn');
    this.reviewFilterWrongBtn = document.getElementById('filter-wrong-btn');
    this.reviewFilterBookmarkBtn = document.getElementById('filter-bookmark-btn');
    this.reviewRetryWrongBtn = document.getElementById('review-retry-wrong-btn');
    this.printReviewBtn = document.getElementById('print-review-btn');
    this.reviewBackResultBtn = document.getElementById('review-back-result-btn');

    // Toast Container
    this.toastContainer = document.getElementById('toast-container');

    // Top Controls
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
  }

  showToast(message, type = 'info', duration = 4000) {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    const colors = {
      info: 'bg-indigo-900/95 border-indigo-500 text-white',
      warning: 'bg-amber-900/95 border-amber-500 text-amber-100',
      success: 'bg-emerald-900/95 border-emerald-500 text-emerald-100',
      error: 'bg-rose-900/95 border-rose-500 text-rose-100'
    };
    const icons = {
      info: 'info',
      warning: 'alert-circle',
      success: 'check-circle-2',
      error: 'alert-triangle'
    };

    toast.className = `p-4 rounded-2xl border shadow-2xl backdrop-blur-md text-xs md:text-sm font-semibold flex items-start gap-3 pointer-events-auto transition-all duration-300 transform translate-y-2 opacity-0 ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <i data-lucide="${icons[type] || 'info'}" class="w-5 h-5 flex-shrink-0 mt-0.5"></i>
      <div class="flex-1 leading-relaxed">${message}</div>
    `;

    this.toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    // Trigger entrance animation
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  initTheme() {
    const isDark = localStorage.getItem('history_quiz_theme') === 'dark' || 
      (!localStorage.getItem('history_quiz_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    this.updateSoundBtnUI();
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('history_quiz_theme', isDark ? 'dark' : 'light');
    window.soundFX.playClick();
  }

  toggleSound() {
    const muted = window.soundFX.toggleMute();
    this.updateSoundBtnUI();
  }

  updateSoundBtnUI() {
    if (!this.soundToggleBtn) return;
    const isMuted = window.soundFX.muted;
    this.soundToggleBtn.innerHTML = isMuted 
      ? `<i data-lucide="volume-x" class="w-5 h-5 text-gray-400"></i>`
      : `<i data-lucide="volume-2" class="w-5 h-5 text-indigo-500"></i>`;
    if (window.lucide) window.lucide.createIcons();
  }

  async init() {
    const success = await window.quizEngine.loadData();
    if (!success) {
      alert('데이터를 불러오지 못했습니다. 새로고침 해주세요.');
      return;
    }
    this.renderUnitSelector();
    this.updateAvailableCount();
    this.switchScreen('lobby');
    if (window.lucide) window.lucide.createIcons();
  }

  bindEvents() {
    // Theme & Sound
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => this.toggleSound());
    }

    // Lobby Actions
    if (this.selectAllBtn) {
      this.selectAllBtn.addEventListener('click', () => {
        window.soundFX.playClick();
        window.quizEngine.selectAllUnits();
        this.updateUnitCheckboxes();
        this.updateAvailableCount();
      });
    }

    if (this.deselectAllBtn) {
      this.deselectAllBtn.addEventListener('click', () => {
        window.soundFX.playClick();
        window.quizEngine.clearAllUnits();
        this.updateUnitCheckboxes();
        this.updateAvailableCount();
      });
    }

    if (this.questionCountSelect) {
      this.questionCountSelect.addEventListener('change', () => {
        window.soundFX.playClick();
        this.updateAvailableCount();
      });
    }

    if (this.startQuizBtn) {
      this.startQuizBtn.addEventListener('click', () => this.handleStartQuiz());
    }

    // Quiz Navigation
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevQuestion());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextQuestion());
    }
    if (this.submitBtn) {
      this.submitBtn.addEventListener('click', () => this.confirmSubmit());
    }
    if (this.bookmarkBtn) {
      this.bookmarkBtn.addEventListener('click', () => this.handleToggleBookmark());
    }

    // OMR Modal
    if (this.omrModalBtn) {
      this.omrModalBtn.addEventListener('click', () => this.openOmrModal());
    }
    if (this.closeOmrBtn) {
      this.closeOmrBtn.addEventListener('click', () => this.closeOmrModal());
    }
    if (this.omrModal) {
      this.omrModal.addEventListener('click', (e) => {
        if (e.target === this.omrModal) this.closeOmrModal();
      });
    }

    // Result Actions
    if (this.retryWrongBtn) {
      this.retryWrongBtn.addEventListener('click', () => this.handleRetryWrong());
    }
    if (this.openReviewBtn) {
      this.openReviewBtn.addEventListener('click', () => this.openReviewScreen('wrong'));
    }
    if (this.printResultBtn) {
      this.printResultBtn.addEventListener('click', () => this.handlePrintReport());
    }
    if (this.retryQuizBtn) {
      this.retryQuizBtn.addEventListener('click', () => this.handleStartQuiz());
    }
    if (this.backToLobbyBtn) {
      this.backToLobbyBtn.addEventListener('click', () => this.switchScreen('lobby'));
    }

    // Review Actions
    if (this.reviewFilterAllBtn) {
      this.reviewFilterAllBtn.addEventListener('click', () => this.setReviewFilter('all'));
    }
    if (this.reviewFilterWrongBtn) {
      this.reviewFilterWrongBtn.addEventListener('click', () => this.setReviewFilter('wrong'));
    }
    if (this.reviewFilterBookmarkBtn) {
      this.reviewFilterBookmarkBtn.addEventListener('click', () => this.setReviewFilter('bookmarked'));
    }
    if (this.reviewRetryWrongBtn) {
      this.reviewRetryWrongBtn.addEventListener('click', () => this.handleRetryWrong());
    }
    if (this.printReviewBtn) {
      this.printReviewBtn.addEventListener('click', () => this.handlePrintReport());
    }
    if (this.reviewBackResultBtn) {
      this.reviewBackResultBtn.addEventListener('click', () => this.switchScreen('result'));
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  handleKeyboard(e) {
    if (this.currentScreen !== 'quiz') return;
    if (this.omrModal && !this.omrModal.classList.contains('hidden')) return;

    // Number keys 1-4 for choosing options
    if (['1', '2', '3', '4'].includes(e.key)) {
      const optionNum = parseInt(e.key, 10);
      this.selectOption(optionNum);
    } else if (e.key === 'ArrowLeft') {
      this.prevQuestion();
    } else if (e.key === 'ArrowRight') {
      this.nextQuestion();
    }
  }

  switchScreen(screenName) {
    this.currentScreen = screenName;
    const screens = [
      { name: 'lobby', el: this.lobbyScreen },
      { name: 'quiz', el: this.quizScreen },
      { name: 'result', el: this.resultScreen },
      { name: 'review', el: this.reviewScreen }
    ];

    screens.forEach(s => {
      if (s.name === screenName) {
        s.el.classList.remove('view-hidden');
      } else {
        s.el.classList.add('view-hidden');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) window.lucide.createIcons();
  }

  renderUnitSelector() {
    this.unitListContainer.innerHTML = '';

    window.quizEngine.units.forEach(book => {
      const bookCard = document.createElement('div');
      bookCard.className = 'bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200/80 dark:border-gray-700/80 transition-all';
      
      const unitsHtml = book.units.map(unit => {
        const isChecked = window.quizEngine.isUnitSelected(unit.unitId);
        const subUnitsList = unit.subUnits.map(sub => `<li class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><span class="w-1 h-1 rounded-full bg-indigo-400"></span>${sub}</li>`).join('');

        return `
          <label class="group relative flex items-start gap-3.5 p-4 rounded-xl border border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800 cursor-pointer transition-all duration-200">
            <input type="checkbox" data-unit-id="${unit.unitId}" ${isChecked ? 'checked' : ''} class="unit-checkbox mt-1 w-5 h-5 text-indigo-600 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500 transition cursor-pointer">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">${unit.unitName}</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">${unit.summary}</p>
              <ul class="space-y-1 bg-white/70 dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/80">
                ${subUnitsList}
              </ul>
            </div>
          </label>
        `;
      }).join('');

      bookCard.innerHTML = `
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">${book.badge}</span>
            <h3 class="font-bold text-base text-gray-800 dark:text-gray-200">${book.bookTitle}</h3>
          </div>
          <button type="button" class="select-book-units-btn text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline" data-book-id="${book.bookId}">단원 전체선택</button>
        </div>
        <div class="space-y-3">
          ${unitsHtml}
        </div>
      `;

      this.unitListContainer.appendChild(bookCard);
    });

    // Checkbox change handlers
    this.unitListContainer.querySelectorAll('.unit-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        window.soundFX.playClick();
        const unitId = e.target.dataset.unitId;
        window.quizEngine.toggleUnit(unitId);
        this.updateAvailableCount();
      });
    });

    // Per-book batch select
    this.unitListContainer.querySelectorAll('.select-book-units-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        window.soundFX.playClick();
        const bookId = e.target.dataset.bookId;
        const targetBook = window.quizEngine.units.find(b => b.bookId === bookId);
        if (targetBook) {
          targetBook.units.forEach(u => window.quizEngine.selectedUnits.add(u.unitId));
          this.updateUnitCheckboxes();
          this.updateAvailableCount();
        }
      });
    });
  }

  updateUnitCheckboxes() {
    this.unitListContainer.querySelectorAll('.unit-checkbox').forEach(chk => {
      const unitId = chk.dataset.unitId;
      chk.checked = window.quizEngine.isUnitSelected(unitId);
    });
  }

  updateAvailableCount() {
    const questions = window.quizEngine.getFilteredQuestions();
    this.availableCountEl.textContent = `${questions.length}문제`;
    if (questions.length === 0) {
      this.startQuizBtn.disabled = true;
      this.startQuizBtn.classList.add('opacity-50', 'cursor-not-allowed');
      this.startQuizBtn.querySelector('span').textContent = '단원을 1개 이상 선택해주세요';
    } else {
      this.startQuizBtn.disabled = false;
      this.startQuizBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      const targetCount = parseInt(this.questionCountSelect.value, 10) || 30;
      const actualCount = Math.min(targetCount, questions.length);
      this.startQuizBtn.querySelector('span').textContent = `선택한 범위로 ${actualCount}제 퀴즈 시작하기`;
    }
  }

  handleStartQuiz() {
    window.soundFX.playClick();
    const count = parseInt(this.questionCountSelect.value, 10) || 30;
    const mode = this.modeStudyRadio.checked ? 'study' : 'exam';

    try {
      const result = window.quizEngine.startQuiz(count, mode);
      this.renderCurrentQuestion();
      this.switchScreen('quiz');

      if (result && result.isCapped) {
        this.showToast(
          `⚠️ 선택한 단원의 총 문제 수(${result.actualCount}문제)가 목표 문항 수(${result.requestedCount}문제) 미만이므로, 전체 ${result.actualCount}문제를 무작위 셔플하여 출제합니다.`,
          'warning',
          5000
        );
      }
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  updateTimerDisplay(seconds) {
    if (!this.quizTimerText) return;
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    this.quizTimerText.textContent = `${m}:${s}`;
  }

  renderCurrentQuestion() {
    const q = window.quizEngine.getCurrentQuestion();
    const curIdx = window.quizEngine.currentIndex;
    const total = window.quizEngine.currentQuestions.length;

    if (!q) return;

    // Header Progress
    const padCur = String(curIdx + 1).padStart(2, '0');
    const padTotal = String(total).padStart(2, '0');
    this.quizProgressText.textContent = `문제 ${padCur} / ${padTotal}`;
    const progressPercent = Math.round(((curIdx + 1) / total) * 100);
    this.quizProgressBar.style.width = `${progressPercent}%`;

    // Badges
    this.unitBadgeEl.textContent = `${q.unitName} > ${q.subUnit || ''}`;
    
    // Type badge
    if (this.typeBadgeEl) {
      this.typeBadgeEl.textContent = q.questionType || '사료 제시형';
    }

    // Difficulty badge
    let diffColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
    if (q.difficulty === '상') diffColor = 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300';
    if (q.difficulty === '하') diffColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
    this.difficultyBadgeEl.className = `px-2.5 py-0.5 rounded-full text-xs font-semibold ${diffColor}`;
    this.difficultyBadgeEl.textContent = `난이도: ${q.difficulty}`;

    // Points badge
    if (this.pointsBadgeEl) {
      const pts = typeof q.points === 'number' ? q.points : 4.5;
      this.pointsBadgeEl.textContent = `[${pts}점]`;
    }

    // Bookmark status
    const isBm = window.quizEngine.isBookmarked(q.questionId);
    this.bookmarkBtn.innerHTML = isBm 
      ? `<i data-lucide="bookmark-check" class="w-5 h-5 text-amber-500 fill-amber-500"></i>`
      : `<i data-lucide="bookmark" class="w-5 h-5 text-gray-400 hover:text-amber-500"></i>`;

    // Question title
    this.questionTextEl.innerHTML = `<span class="inline-block mr-2 font-display text-indigo-600 dark:text-indigo-400 font-extrabold text-xl">[Q${padCur}]</span>${q.question}`;

    // Passage / 사료 box
    if (q.boxContent && q.boxContent.trim().length > 0) {
      this.passageContainer.classList.remove('hidden');
      
      let headerTitle = '【 사 료 / 제 시 문 】';
      if (q.questionType === '가상 일기형') headerTitle = '【 가 상 일 기 / 기 록 】';
      else if (q.questionType === '수행평가 보고서형') headerTitle = '【 수 행 평 가 / 탐 구 자 료 】';
      else if (q.questionType === '역사 신문형') headerTitle = '【 역 사 신 문 / 보 도 기 사 】';
      else if (q.questionType === '[보기] 조합형') headerTitle = '【 <보 기> 자 료 】';
      else if (q.questionType === '(가)-(나) 비교형') headerTitle = '【 시 기 비 교 자 료 】';
      else if (q.questionType === '시대 순서 배열형') headerTitle = '【 시 대 순 서 자 료 】';
      else if (q.questionType === '역사 대화형') headerTitle = '【 역 사 대 화 / 토 론 】';

      let passageHtml = `<div class="passage-header-title text-xs font-bold tracking-wider mb-2 text-amber-900 dark:text-amber-300 font-sans">${headerTitle}</div><div>${q.boxContent.replace(/\n/g, '<br>')}</div>`;
      if (q.source && q.source.trim().length > 0) {
        passageHtml += `<div class="text-right text-xs text-amber-900/80 dark:text-amber-300/80 font-medium italic mt-2.5 pt-2 border-t border-amber-300/40 dark:border-gray-700/50">- ${q.source} -</div>`;
      }
      this.passageTextEl.innerHTML = passageHtml;
    } else {
      this.passageContainer.classList.add('hidden');
    }

    // Render 4 Options
    const userAns = window.quizEngine.userAnswers[curIdx];
    const isStudyMode = window.quizEngine.mode === 'study';
    const isAnswered = userAns !== undefined;
    const isRevealed = isStudyMode && isAnswered;

    this.optionsContainer.innerHTML = '';
    const numberIcons = ['①', '②', '③', '④'];

    q.options.forEach((optText, i) => {
      const optNum = i + 1;
      const isSelected = userAns === optNum;
      const isCorrect = q.answer === optNum;

      let btnStyle = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20';

      if (isRevealed) {
        if (isCorrect) {
          btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500 font-semibold';
        } else if (isSelected && !isCorrect) {
          btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500 line-through opacity-80';
        } else {
          btnStyle = 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-gray-400 dark:text-gray-500';
        }
      } else if (isSelected) {
        btnStyle = 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-500 font-semibold shadow-sm';
      }

      // Format option text: remove only circled ①~④ to avoid stripping historical dates like 3·15 or 4·19
      const cleanOptText = optText.replace(/^[①②③④]\s*/, '');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `option-btn w-full p-4 rounded-xl border-2 text-left flex items-start gap-3 text-sm md:text-base leading-relaxed ${btnStyle}`;
      btn.innerHTML = `
        <span class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-indigo-600 text-white dark:bg-indigo-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}">
          ${optNum}
        </span>
        <span class="flex-1 mt-0.5">${cleanOptText}</span>
        ${isRevealed && isCorrect ? '<i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5"></i>' : ''}
        ${isRevealed && isSelected && !isCorrect ? '<i data-lucide="x-circle" class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5"></i>' : ''}
        <span class="hidden sm:inline-flex text-[10px] text-gray-400 dark:text-gray-500 font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700/60 font-semibold self-center">[키: ${optNum}]</span>
      `;

      btn.addEventListener('click', () => this.selectOption(optNum));
      this.optionsContainer.appendChild(btn);
    });

    // Explanation Box (Study Mode)
    if (isRevealed) {
      this.explanationContainer.classList.remove('hidden');
      const isCorrect = userAns === q.answer;
      
      const cardBorder = isCorrect 
        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40' 
        : 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40';
      const headerBorder = isCorrect 
        ? 'border-emerald-200/80 dark:border-emerald-800/80' 
        : 'border-rose-200/80 dark:border-rose-800/80';
      
      let tipsHtml = '';
      if (q.tips && q.tips.length > 0) {
        tipsHtml = `
          <div class="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 mt-3">
            <div class="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 mb-2.5">
              <i data-lucide="lightbulb" class="w-4 h-4 text-amber-600 dark:text-amber-400"></i>
              <span>💡 오답 선지 완벽 분석 & 수능 출제 포인트</span>
            </div>
            <ul class="space-y-2">
              ${q.tips.map(t => `<li class="text-xs md:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span><span>${t}</span></li>`).join('')}
            </ul>
          </div>
        `;
      }

      this.explanationContainer.className = `p-5 md:p-6 rounded-2xl border shadow-sm transition-all duration-300 ${cardBorder} space-y-4`;
      this.explanationContainer.innerHTML = `
        <div class="flex items-center justify-between pb-3 border-b ${headerBorder}">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'} font-extrabold text-sm shadow-xs flex-shrink-0">
              ${isCorrect ? '<i data-lucide="check" class="w-5 h-5"></i>' : '<i data-lucide="x" class="w-5 h-5"></i>'}
            </span>
            <div>
              <h4 class="font-extrabold text-sm md:text-base ${isCorrect ? 'text-emerald-900 dark:text-emerald-200' : 'text-rose-900 dark:text-rose-200'}">
                ${isCorrect ? '🎉 정답입니다!' : '❌ 아쉽네요, 오답입니다!'}
              </h4>
              <div class="text-xs md:text-sm ${isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'} font-medium mt-0.5">
                ${isCorrect 
                  ? `배점 <strong>${q.points || 4.5}점</strong>을 획득하였습니다.` 
                  : `내가 고른 답: <span class="font-bold underline text-rose-600 dark:text-rose-400">${userAns}번</span> ➔ 실제 정답: <span class="font-bold text-emerald-600 dark:text-emerald-400">${q.answer}번</span>`}
              </div>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold ${isCorrect ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200'}">
            정답: ${q.answer}번
          </span>
        </div>

        <div class="p-4 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/80 dark:border-gray-700 shadow-xs">
          <div class="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-2">
            <i data-lucide="book-open" class="w-4 h-4 text-indigo-600 dark:text-indigo-400"></i>
            <span>🎯 정답 및 사료 심층 해설</span>
          </div>
          <p class="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif-kr">
            ${q.explanation}
          </p>
        </div>

        ${tipsHtml}
      `;
    } else {
      this.explanationContainer.classList.add('hidden');
    }

    // Navigation buttons state
    this.prevBtn.disabled = curIdx === 0;
    this.prevBtn.classList.toggle('opacity-50', curIdx === 0);
    this.prevBtn.classList.toggle('cursor-not-allowed', curIdx === 0);

    const isLast = curIdx === total - 1;
    if (isLast) {
      this.nextBtn.classList.add('hidden');
      this.submitBtn.classList.remove('hidden');
    } else {
      this.nextBtn.classList.remove('hidden');
      this.submitBtn.classList.add('hidden');
    }

    if (window.lucide) window.lucide.createIcons();
  }

  selectOption(optNum) {
    const result = window.quizEngine.answerQuestion(optNum);
    
    // Play sound based on result in study mode
    if (window.quizEngine.mode === 'study') {
      if (result.isCorrect) {
        window.soundFX.playCorrect();
      } else {
        window.soundFX.playIncorrect();
      }
    } else {
      window.soundFX.playClick();
    }

    this.renderCurrentQuestion();
  }

  prevQuestion() {
    if (window.quizEngine.currentIndex > 0) {
      window.soundFX.playClick();
      window.quizEngine.currentIndex--;
      this.renderCurrentQuestion();
    }
  }

  nextQuestion() {
    if (window.quizEngine.currentIndex < window.quizEngine.currentQuestions.length - 1) {
      window.soundFX.playClick();
      window.quizEngine.currentIndex++;
      this.renderCurrentQuestion();
    }
  }

  handleToggleBookmark() {
    const q = window.quizEngine.getCurrentQuestion();
    if (!q) return;
    window.soundFX.playClick();
    window.quizEngine.toggleBookmark(q.questionId);
    this.renderCurrentQuestion();
  }

  openOmrModal() {
    window.soundFX.playClick();
    const total = window.quizEngine.currentQuestions.length;
    this.omrGrid.innerHTML = '';

    window.quizEngine.currentQuestions.forEach((q, idx) => {
      const userAns = window.quizEngine.userAnswers[idx];
      const isCurrent = idx === window.quizEngine.currentIndex;
      const isAnswered = userAns !== undefined;

      const item = document.createElement('button');
      item.type = 'button';
      item.className = `omr-dot p-3 rounded-xl flex flex-col items-center justify-center border text-center transition ${
        isCurrent 
          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500'
          : isAnswered
          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500'
      }`;

      item.innerHTML = `
        <span class="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Q${idx + 1}</span>
        <span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
          isAnswered ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
        }">${isAnswered ? userAns : '-'}</span>
      `;

      item.addEventListener('click', () => {
        window.soundFX.playClick();
        window.quizEngine.currentIndex = idx;
        this.closeOmrModal();
        this.renderCurrentQuestion();
      });

      this.omrGrid.appendChild(item);
    });

    this.omrModal.classList.remove('hidden');
  }

  closeOmrModal() {
    this.omrModal.classList.add('hidden');
  }

  confirmSubmit() {
    const unansweredCount = window.quizEngine.currentQuestions.length - Object.keys(window.quizEngine.userAnswers).length;
    if (unansweredCount > 0) {
      const confirm = window.confirm(`아직 풀지 않은 문제가 ${unansweredCount}문제 있습니다. 정말 제출하고 결과를 확인하시겠습니까?`);
      if (!confirm) return;
    }
    this.finishQuiz();
  }

  finishQuiz() {
    window.soundFX.playFinish();
    this.lastResult = window.quizEngine.calculateResults();
    this.renderResultScreen(this.lastResult);
    this.switchScreen('result');
  }

  renderResultScreen(result) {
    this.resultScoreEl.textContent = `${result.score}점`;
    this.resultGradeEl.textContent = `${result.grade}등급`;
    this.resultCorrectCountEl.textContent = `${result.correctCount} / ${result.total}`;
    if (this.resultPointsEl) {
      this.resultPointsEl.textContent = `${result.earnedPoints} / ${result.totalPossiblePoints}점`;
    }

    const m = Math.floor(result.timeElapsed / 60);
    const s = result.timeElapsed % 60;
    this.resultTimeEl.textContent = `${m}분 ${s}초`;

    // Grade Description (Korean High School Exam Standard)
    const gradeTexts = {
      1: '🏆 완벽합니다! 한국사 마스터! 중간·기말고사 1등급 확실!',
      2: '🥇 최상위권 도약! 1등급 턱밑까지 도달한 2등급입니다.',
      3: '🥈 안정권입니다! 오답 노트를 복습해 1등급으로 도약해보세요.',
      4: '🥉 기본기가 탄탄합니다. 조금 더 심화 사료를 분석해보세요.',
      5: '📚 개념 복습이 필요합니다. 취약 단원을 집중 공략하세요.',
      6: '💡 핵심 사건과 인물의 시대적 인과관계를 다시 정리해보세요.',
      7: '🔥 교과서 기본 흐름부터 차근차근 다시 시작해봐요!',
      8: '⚡ 다시 한 번 도전해볼까요? 할 수 있습니다!',
      9: '🌱 기초 개념 학습부터 다시 시작해봅시다!'
    };
    this.resultGradeDescEl.textContent = gradeTexts[result.grade] || '수고하셨습니다!';

    // Unit Breakdown
    this.resultUnitStatsContainer.innerHTML = '';
    result.unitStats.forEach(stat => {
      const rate = Math.round((stat.correct / stat.total) * 100);
      const card = document.createElement('div');
      card.className = 'p-3.5 rounded-xl border border-gray-150 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/60 flex items-center justify-between';
      card.innerHTML = `
        <div class="flex-1 pr-4">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm font-bold text-gray-800 dark:text-gray-200">${stat.unitName}</span>
            <span class="text-xs font-semibold ${rate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : rate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}">${stat.correct}/${stat.total}문항 (${Math.round((stat.earnedPoints || 0)*10)/10} / ${Math.round((stat.totalPoints || 0)*10)/10}점) [${rate}%]</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500 ${rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${rate}%"></div>
          </div>
        </div>
      `;
      this.resultUnitStatsContainer.appendChild(card);
    });
  }

  handleRetryWrong() {
    window.soundFX.playClick();
    if (!this.lastResult || !this.lastResult.details) {
      this.showToast('이전 시험 결과가 없습니다.', 'error');
      return;
    }

    const wrongDetails = this.lastResult.details.filter(d => !d.isCorrect);
    if (wrongDetails.length === 0) {
      window.soundFX.playFinish();
      this.showToast('🎉 축하합니다! 틀린 문제가 없어 100점 만점입니다. 재도전할 오답이 없습니다.', 'success');
      return;
    }

    const wrongQuestions = wrongDetails.map(d => d.question);
    try {
      window.quizEngine.startQuizWithQuestions(wrongQuestions, 'study');
      this.renderCurrentQuestion();
      this.switchScreen('quiz');
      this.showToast(`🔥 틀렸던 ${wrongQuestions.length}문항으로 오답 집중 재시험을 시작합니다!`, 'warning', 4500);
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  handlePrintReport() {
    window.soundFX.playClick();
    document.body.setAttribute('data-print-date', new Date().toLocaleString('ko-KR'));
    window.print();
  }

  openReviewScreen(filter = 'wrong') {
    window.soundFX.playClick();
    this.setReviewFilter(filter);
    this.switchScreen('review');
  }

  setReviewFilter(filter) {
    this.reviewFilter = filter;
    
    // Update filter tabs
    [
      { btn: this.reviewFilterAllBtn, key: 'all' },
      { btn: this.reviewFilterWrongBtn, key: 'wrong' },
      { btn: this.reviewFilterBookmarkBtn, key: 'bookmarked' }
    ].forEach(({ btn, key }) => {
      if (btn) {
        if (this.reviewFilter === key) {
          btn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm transition';
        } else {
          btn.className = 'px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition';
        }
      }
    });

    this.renderReviewList();
  }

  renderReviewList() {
    if (!this.lastResult) return;
    this.reviewListContainer.innerHTML = '';

    let items = this.lastResult.details;
    if (this.reviewFilter === 'wrong') {
      items = items.filter(d => !d.isCorrect);
    } else if (this.reviewFilter === 'bookmarked') {
      items = items.filter(d => window.quizEngine.isBookmarked(d.question.questionId));
    }

    if (items.length === 0) {
      this.reviewListContainer.innerHTML = `
        <div class="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <i data-lucide="check-circle" class="w-12 h-12 text-emerald-500 mx-auto mb-3"></i>
          <p class="text-gray-600 dark:text-gray-300 font-bold">해당하는 문제가 없습니다!</p>
          <p class="text-xs text-gray-400 mt-1">모든 문제를 완벽하게 맞혔거나 필터 조건에 부합하는 문제가 없습니다.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    items.forEach(d => {
      const q = d.question;
      const card = document.createElement('div');
      card.className = `p-6 rounded-2xl border bg-white dark:bg-gray-800 shadow-sm space-y-4 ${
        d.isCorrect ? 'border-emerald-200 dark:border-emerald-800/60' : 'border-rose-200 dark:border-rose-800/60'
      }`;

      // Options html
      const optionsHtml = q.options.map((opt, optI) => {
        const optNum = optI + 1;
        const isUserPick = d.userAnswer === optNum;
        const isAns = q.answer === optNum;

        let optClass = 'border-gray-150 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300';
        if (isAns) {
          optClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
        } else if (isUserPick && !isAns) {
          optClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 line-through';
        }

        // Format option text: remove only circled ①~④ to preserve historical dates like 3·15 or 4·19
        const cleanText = opt.replace(/^[①②③④]\s*/, '');

        return `
          <div class="p-3 rounded-lg border text-sm flex items-start gap-2.5 ${optClass}">
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isAns ? 'bg-emerald-600 text-white' : isUserPick ? 'bg-rose-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}">${optNum}</span>
            <span class="flex-1">${cleanText}</span>
            ${isAns ? '<span class="text-xs text-emerald-600 font-bold">[정답]</span>' : ''}
            ${isUserPick && !isAns ? '<span class="text-xs text-rose-600 font-bold">[내가 고른 오답]</span>' : ''}
          </div>
        `;
      }).join('');

      card.innerHTML = `
        <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${d.isCorrect ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'}">
              ${d.isCorrect ? '정답' : '오답'}
            </span>
            <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              ${q.questionType || '사료 제시형'}
            </span>
            <span class="text-xs font-bold text-violet-600 dark:text-violet-400">[배점: ${d.points || 4.5}점]</span>
            <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">${q.unitName}</span>
          </div>
          <span class="text-xs font-semibold text-gray-400">문제 ${d.index}</span>
        </div>

        <h4 class="font-bold text-gray-900 dark:text-gray-100 text-base leading-snug">${q.question}</h4>

        ${q.boxContent ? `
          <div class="passage-box p-4 rounded-xl text-xs md:text-sm font-serif-kr leading-relaxed text-gray-800 dark:text-gray-200">
            <div class="passage-header-title text-xs font-bold tracking-wider mb-2 text-amber-900 dark:text-amber-300 font-sans">
              ${q.questionType === '가상 일기형' ? '【 가 상 일 기 / 기 록 】' :
                q.questionType === '수행평가 보고서형' ? '【 수 행 평 가 / 탐 구 자 료 】' :
                q.questionType === '역사 신문형' ? '【 역 사 신 문 / 보 도 기 사 】' :
                q.questionType === '[보기] 조합형' ? '【 <보 기> 자 료 】' :
                q.questionType === '(가)-(나) 비교형' ? '【 시 기 비 교 자 료 】' :
                q.questionType === '시대 순서 배열형' ? '【 시 대 순 서 자 료 】' :
                q.questionType === '역사 대화형' ? '【 역 사 대 화 / 토 론 】' : '【 사 료 / 제 시 문 】'}
            </div>
            <div class="whitespace-pre-line">${q.boxContent}</div>
            ${q.source ? `<div class="text-right text-[11px] text-amber-900/80 dark:text-amber-300/80 font-medium italic mt-2 pt-2 border-t border-amber-300/40 dark:border-gray-700/50">- ${q.source} -</div>` : ''}
          </div>
        ` : ''}

        <div class="space-y-2 pt-2">
          ${optionsHtml}
        </div>

        <div class="mt-4 p-4 md:p-5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/60 space-y-3">
          <div class="p-3.5 md:p-4 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-indigo-100 dark:border-gray-700 shadow-xs">
            <h5 class="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1.5 flex items-center gap-1.5">
              <i data-lucide="book-open" class="w-4 h-4 text-indigo-600 dark:text-indigo-400"></i>
              <span>🎯 정답 및 사료 심층 해설 (정답: ${q.answer}번)</span>
            </h5>
            <p class="text-xs md:text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-serif-kr">${q.explanation}</p>
          </div>
          ${q.tips && q.tips.length > 0 ? `
            <div class="p-3.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60">
              <span class="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-2 flex items-center gap-1.5">
                <i data-lucide="lightbulb" class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400"></i>
                <span>💡 오답 선지 완벽 분석 & 수능 출제 포인트</span>
              </span>
              <ul class="space-y-1.5">
                ${q.tips.map(t => `<li class="text-xs md:text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 leading-relaxed"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span><span>${t}</span></li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;

      this.reviewListContainer.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
