// High School Korean History Quiz Engine
class QuizEngine {
  constructor() {
    this.units = [];
    this.allQuestions = [];
    this.selectedUnits = new Set();
    this.currentQuestions = [];
    this.currentIndex = 0;
    this.userAnswers = {}; // { questionIndex: selectedOptionNumber (1-5) }
    this.revealedExplanations = {}; // { questionIndex: true }
    this.bookmarks = new Set(JSON.parse(localStorage.getItem('history_bookmarks') || '[]'));
    this.timer = null;
    this.timeElapsed = 0; // seconds
    this.mode = 'study'; // 'study' (instant grading) | 'exam' (batch grading at end)
    this.questionCountTarget = 30;
  }

  async loadData() {
    // 1. Check if data is already loaded via <script src="data/data.js"> (works directly on file:// protocol)
    if (window.HISTORY_UNITS && window.HISTORY_QUESTIONS) {
      this.units = window.HISTORY_UNITS;
      this.allQuestions = window.HISTORY_QUESTIONS;
      this.selectAllUnits();
      return true;
    }

    // 2. Otherwise fetch JSON via HTTP (works when hosted on web servers)
    try {
      const [unitsRes, questionsRes] = await Promise.all([
        fetch('data/units.json'),
        fetch('data/questions.json')
      ]);
      this.units = await unitsRes.json();
      this.allQuestions = await questionsRes.json();
      this.selectAllUnits();
      return true;
    } catch (err) {
      console.error('Failed to load JSON data:', err);
      return false;
    }
  }

  selectAllUnits() {
    this.selectedUnits.clear();
    this.units.forEach(book => {
      book.units.forEach(unit => {
        this.selectedUnits.add(unit.unitId);
      });
    });
  }

  clearAllUnits() {
    this.selectedUnits.clear();
  }

  toggleUnit(unitId) {
    if (this.selectedUnits.has(unitId)) {
      this.selectedUnits.delete(unitId);
    } else {
      this.selectedUnits.add(unitId);
    }
  }

  isUnitSelected(unitId) {
    return this.selectedUnits.has(unitId);
  }

  getFilteredQuestions() {
    if (this.selectedUnits.size === 0) return [];
    return this.allQuestions.filter(q => this.selectedUnits.has(q.unitId));
  }

  // Shuffle array using Fisher-Yates (Knuth) Algorithm - O(N) unbiased random sampling
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Start Quiz with Random Sampling
   * @param {number} questionCount - target number of questions (default 30)
   * @param {string} mode - 'study' (instant grading) or 'exam' (batch submission)
   */
  startQuiz(questionCount = 30, mode = 'study') {
    const filtered = this.getFilteredQuestions();
    if (filtered.length === 0) {
      throw new Error('선택된 단원에 문제가 없습니다. 최소 1개 이상의 단원을 선택해주세요.');
    }

    this.mode = mode;
    const requestedCount = questionCount;
    const availableCount = filtered.length;
    const isCapped = availableCount < requestedCount;
    this.questionCountTarget = Math.min(requestedCount, availableCount);

    // 1. Shuffle using Fisher-Yates algorithm
    const shuffled = this.shuffle(filtered);
    
    // 2. Extract random N questions
    this.currentQuestions = shuffled.slice(0, this.questionCountTarget);
    this.currentIndex = 0;
    this.userAnswers = {};
    this.revealedExplanations = {};
    this.timeElapsed = 0;

    this.startTimer();

    return {
      questions: this.currentQuestions,
      requestedCount,
      actualCount: this.currentQuestions.length,
      isCapped
    };
  }

  /**
   * Start Quiz with Custom Questions (e.g. Retry Wrong Questions)
   * @param {Array} customQuestions - questions array to practice
   * @param {string} mode - 'study' (default) or 'exam'
   */
  startQuizWithQuestions(customQuestions, mode = 'study') {
    if (!customQuestions || customQuestions.length === 0) {
      throw new Error('풀이할 문제가 없습니다.');
    }
    this.mode = mode;
    this.currentQuestions = this.shuffle(customQuestions);
    this.questionCountTarget = this.currentQuestions.length;
    this.currentIndex = 0;
    this.userAnswers = {};
    this.revealedExplanations = {};
    this.timeElapsed = 0;

    this.startTimer();

    return {
      questions: this.currentQuestions,
      requestedCount: this.currentQuestions.length,
      actualCount: this.currentQuestions.length,
      isCapped: false
    };
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeElapsed++;
      if (window.app && window.app.updateTimerDisplay) {
        window.app.updateTimerDisplay(this.timeElapsed);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getCurrentQuestion() {
    return this.currentQuestions[this.currentIndex];
  }

  answerQuestion(optionIndex) {
    this.userAnswers[this.currentIndex] = optionIndex;
    if (this.mode === 'study') {
      this.revealedExplanations[this.currentIndex] = true;
    }
    return this.checkCurrentAnswer();
  }

  checkCurrentAnswer() {
    const q = this.getCurrentQuestion();
    if (!q) return null;
    const userAns = this.userAnswers[this.currentIndex];
    const isCorrect = userAns === q.answer;
    return {
      userAnswer: userAns,
      correctAnswer: q.answer,
      isCorrect: isCorrect,
      isAnswered: userAns !== undefined
    };
  }

  toggleBookmark(questionId) {
    if (this.bookmarks.has(questionId)) {
      this.bookmarks.delete(questionId);
    } else {
      this.bookmarks.add(questionId);
    }
    localStorage.setItem('history_bookmarks', JSON.stringify(Array.from(this.bookmarks)));
    return this.bookmarks.has(questionId);
  }

  isBookmarked(questionId) {
    return this.bookmarks.has(questionId);
  }

  calculateResults() {
    this.stopTimer();
    let correctCount = 0;
    let earnedPoints = 0;
    let totalPossiblePoints = 0;
    const unitStats = {}; // { unitId: { name, total, correct, earnedPoints, totalPoints } }
    const details = [];

    this.currentQuestions.forEach((q, idx) => {
      const userAns = this.userAnswers[idx];
      const isCorrect = userAns === q.answer;
      const pts = typeof q.points === 'number' ? q.points : 4.5;
      
      totalPossiblePoints += pts;
      if (isCorrect) {
        correctCount++;
        earnedPoints += pts;
      }

      if (!unitStats[q.unitId]) {
        unitStats[q.unitId] = {
          unitId: q.unitId,
          unitName: q.unitName,
          total: 0,
          correct: 0,
          earnedPoints: 0,
          totalPoints: 0
        };
      }
      unitStats[q.unitId].total++;
      unitStats[q.unitId].totalPoints += pts;
      if (isCorrect) {
        unitStats[q.unitId].correct++;
        unitStats[q.unitId].earnedPoints += pts;
      }

      details.push({
        index: idx + 1,
        question: q,
        userAnswer: userAns || null,
        isCorrect: isCorrect,
        points: pts
      });
    });

    const total = this.currentQuestions.length;
    const score = totalPossiblePoints > 0 ? Math.round((earnedPoints / totalPossiblePoints) * 100) : 0;
    
    // Grade calculation (Standard Korean High School 내신 등급 기준)
    let grade = 9;
    if (score >= 90) grade = 1;
    else if (score >= 80) grade = 2;
    else if (score >= 70) grade = 3;
    else if (score >= 60) grade = 4;
    else if (score >= 50) grade = 5;
    else if (score >= 40) grade = 6;
    else if (score >= 30) grade = 7;
    else if (score >= 20) grade = 8;

    return {
      score,
      grade,
      correctCount,
      total,
      earnedPoints: Math.round(earnedPoints * 10) / 10,
      totalPossiblePoints: Math.round(totalPossiblePoints * 10) / 10,
      timeElapsed: this.timeElapsed,
      unitStats: Object.values(unitStats),
      details
    };
  }
}

window.quizEngine = new QuizEngine();
