import { Auth } from "../services/auth.js";
import { CustomHttp } from "../services/custom-http.js";
import config from "../config/config.js";

export class Answer {
  constructor() {
    this.quiz = null;
    this.currentQuestionIndex = 1;
    this.questionTitleElement = null;
    this.rightAnswers = [];
    this.allQuestions = null;
    this.userTitle = null;
    this.question = null;
    this.questionTitle = null;
    this.questionAnswers = null;
    this.questionAnswer = null;
    this.userResult = [];
    this.userAnswersArray = [];
    this.id = sessionStorage.getItem("id");

    this.init();
  }

  async init() {
    const userInfo = Auth.getUserInfo();
    if (!userInfo) {
      location.href = "#/";
    }
    if (this.id && userInfo) {
      try {
        const result = await CustomHttp.request(
          config.host +
            "/tests/" +
            this.id +
            "/result/details?userId=" +
            userInfo.userId
        );
        if (result) {
          if (result.error) {
            throw new Error(result.error);
          }
          this.quiz = result;

          document.getElementById("user-name").innerText =
            userInfo.fullName + ", " + userInfo.email;
          this.showAllAnswers();
          this.returnBackToResult();
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      location.href = "#/";
    }
  }

  showAllAnswers() {
    console.log(this.quiz);
    document.getElementById("answer-test-title").innerText =
      this.quiz.test.name;
    this.questionTitleElement = document.getElementById(
      "answer__question-title"
    );
    this.allQuestions = document.getElementById("allQuestions");

    for (let i = 0; i < this.quiz.test.questions.length; i++) {
      const question = document.createElement("div");
      question.className = "answer__question";

      const questionTitle = document.createElement("div");
      questionTitle.className = "answer__question-title";
      questionTitle.innerHTML =
        '<span class="answer__question-title-blue">Вопрос ' +
        (i + 1) +
        ": </span>" +
        this.quiz.test.questions[i].question;

      question.appendChild(questionTitle);
      this.allQuestions.appendChild(question);
      const that = this;
      const currentQuestion = this.quiz.test.questions[i];

      currentQuestion.answers.forEach((answerItem) => {
        const answer = document.createElement("div");
        answer.classList.add("answer__question-answer");
        answer.innerHTML =
          '<div class="answer__circle"></div>' + answerItem.answer;
        question.appendChild(answer);

        if (answerItem.correct === false) {
          answer.classList.add("answer__question-answer-false");
          answer.innerHTML =
            '<div class="answer__circle-false"></div>' + answerItem.answer;
          question.appendChild(answer);
        } else if (answerItem.correct === true) {
          answer.classList.add("answer__question-answer-true");
          answer.innerHTML =
            '<div class="answer__circle-true"></div>' + answerItem.answer;
          question.appendChild(answer);
        }
      });
    }
  }
  returnBackToResult() {
    this.returnToResult = document.getElementById("back-to-result");
    this.returnToResult.onclick = function () {
      location.href = "#/result";
    };
  }
}
