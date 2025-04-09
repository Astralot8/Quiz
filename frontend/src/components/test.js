import { Auth } from "../services/auth.js";
import { CustomHttp } from "../services/custom-http.js";
import config from "../config/config.js";

export class Test {
  constructor() {
    this.quiz = null;
    this.progressBarElement = null;
    this.currentQuestionIndex = 1;
    this.questionTitleElement = null;
    this.optionsElement = null;
    this.nextButtonElement = null;
    this.prevButtonElement = null;
    this.passButtonElement = null;
    this.passButtonArrowElement = null;
    this.userResult = [];
    this.testId = sessionStorage.getItem("id");
    this.init();
  }

  async init() {
    
    if (this.testId) {
      try {
        const result = await CustomHttp.request(
          config.host + "/tests/" + this.testId
        );
        if (result) {
          if (result.error) {
            throw new Error(result.error);
          }
          this.quiz = result;
          this.startQuiz();
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  startQuiz() {
    this.progressBarElement = document.getElementById("progress-bar");
    this.questionTitleElement = document.getElementById("title");

    this.optionsElement = document.getElementById("options");

    this.nextButtonElement = document.getElementById("next");
    this.nextButtonElement.onclick = this.move.bind(this, "next");

    this.passButtonElement = document.getElementById("pass");
    this.passButtonElement.onclick = this.move.bind(this, "pass");

    this.passButtonArrowElement = document.getElementById('arrow_right');
    

    this.prevButtonElement = document.getElementById("prev");
    this.prevButtonElement.onclick = this.move.bind(this, "prev");

    document.getElementById("pre-title").innerText = this.quiz.name;

    this.prepareProgressBar();
    this.showQuestion();

    const timerElement = document.getElementById("timer");
    let seconds = 59;
    this.interval = setInterval(
      function () {
        seconds--;
        timerElement.innerText = seconds;
        if (seconds === 0) {
          clearInterval(this.interval);
          this.complete();
        }
      }.bind(this),
      1000
    );
  }

  prepareProgressBar() {
    for (let i = 0; i < this.quiz.questions.length; i++) {
      const itemElement = document.createElement("div");
      itemElement.className =
        "test__progress-bar-item " + (i === 0 ? "active" : "");

      const itemCircleElement = document.createElement("div");
      itemCircleElement.className = "test__progress-bar-item-circle";

      const itemTextElement = document.createElement("div");
      itemTextElement.className = "test__progress-bar-item-text";
      itemTextElement.innerText = "Вопрос " + (i + 1);

      itemElement.appendChild(itemCircleElement);
      itemElement.appendChild(itemTextElement);
      this.progressBarElement.appendChild(itemElement);
    }
  }

  showQuestion() {
    const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
    this.questionTitleElement.innerHTML =
      '<span class="test__question-title-blue">Вопрос ' +
      this.currentQuestionIndex +
      ": </span> " +
      activeQuestion.question;

    this.optionsElement.innerHTML = "";
    const that = this;
    const choosenOption = this.userResult.find(
      (item) => item.questionId === activeQuestion.id
    );
    activeQuestion.answers.forEach((answer) => {
      const optionElement = document.createElement("div");
      optionElement.className = "test__question-option";

      const inputId = "answer-" + answer.id;
      const inputElement = document.createElement("input");
      inputElement.setAttribute("id", inputId);
      inputElement.setAttribute("type", "radio");
      inputElement.setAttribute("name", "answer");
      inputElement.setAttribute("value", answer.id);
      inputElement.className = "test__answer option-answer";

      if (choosenOption && choosenOption.chosenAnswerId === answer.id) {
        inputElement.setAttribute("checked", "checked");
      }

      inputElement.onchange = function () {
        that.chooseAnswer();
      };

      const labelElement = document.createElement("label");
      labelElement.setAttribute("for", inputId);
      labelElement.innerText = answer.answer;

      optionElement.appendChild(inputElement);
      optionElement.appendChild(labelElement);

      this.optionsElement.appendChild(optionElement);
    });
    if (choosenOption && choosenOption.chosenAnswerId) {
      this.nextButtonElement.removeAttribute("disabled");
    } else {
      this.nextButtonElement.setAttribute("disabled", "disabled");
    }

  
    
    if (!choosenOption) {
      this.passButtonElement.style.pointerEvents = "auto";
      this.passButtonElement.style.color = "#6933dc";
      this.passButtonArrowElement.style.fill = "#6933dc";
    } else {
      this.passButtonElement.style.pointerEvents = "none";
      this.passButtonElement.style.color = "#dcdcf3";
      this.passButtonArrowElement.style.fill = "#dcdcf3";
    }

    if (this.currentQuestionIndex === this.quiz.questions.length) {
      this.nextButtonElement.innerText = "Завершить";
    } else {
      this.nextButtonElement.innerText = "Далее";
    }
    if (this.currentQuestionIndex > 1) {
      this.prevButtonElement.removeAttribute("disabled");
    } else {
      this.prevButtonElement.setAttribute("disabled", "disabled");
    }
  }
  chooseAnswer() {
    this.nextButtonElement.removeAttribute("disabled");
    this.passButtonElement.style.pointerEvents = "none";
    this.passButtonElement.style.color = "#dcdcf3";
    this.passButtonArrowElement.style.fill = "#dcdcf3";
  }
  move(action) {
    const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
    const choosenAnswer = Array.from(
      document.getElementsByClassName("option-answer")
    ).find((element) => {
      return element.checked;
    });

    let chosenAnswerId = null;
    if (choosenAnswer && choosenAnswer.value) {
      chosenAnswerId = Number(choosenAnswer.value);
    }

    const existingResult = this.userResult.find((item) => {
      return item.questionId === activeQuestion.id;
    });

    if (existingResult) {
      existingResult.chosenAnswerId = chosenAnswerId;
    } else {
      this.userResult.push({
        questionId: activeQuestion.id,
        chosenAnswerId: chosenAnswerId,
      });
    }

    if (action === "next" || action === "pass") {
      this.currentQuestionIndex++;
    } else {
      this.currentQuestionIndex--;
    }

    if (this.currentQuestionIndex > this.quiz.questions.length) {
      clearInterval(this.interval);
      this.complete();
      return;
    }

    Array.from(this.progressBarElement.children).forEach((item, index) => {
      const currentItemIndex = index + 1;
      item.classList.remove("complete");
      item.classList.remove("active");
      if (currentItemIndex === this.currentQuestionIndex) {
        item.classList.add("active");
      } else if (currentItemIndex < this.currentQuestionIndex) {
        item.classList.add("complete");
      }
    });

    this.showQuestion();
  }
  async complete() {

    const userInfo = Auth.getUserInfo();
    if (!userInfo) {
      location.href = "#/";
    }

    try {
      const result = await CustomHttp.request(
        config.host + "/tests/" + this.testId + "/pass",
        "POST",
        {
          userId: userInfo.userId,
          results: this.userResult,
        }
      );
      if (result) {
        if (result.error) {
          throw new Error(result.error);
        }
        location.href = "#/result?=" + this.testId;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
