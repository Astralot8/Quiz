import { Auth } from "../services/auth.js";
import { CustomHttp } from "../services/custom-http.js";
import config from "../config/config.js";

export class Result {
  constructor() {
    this.showAnswers = null;

    this.init();
    this.watchRightAnswers();
  }

  async init() {
    const testId = sessionStorage.getItem("id");
    const userInfo = Auth.getUserInfo();
    if (!userInfo) {
      location.href = "#/";
    }
    if (testId) {
      try {
        const result = await CustomHttp.request(config.host + "/tests/" + testId + "/result?userId=" + userInfo.userId);
        if (result) {
          if (result.error) {
            throw new Error(result.error);
          }
          document.getElementById("result-score").innerText = result.score + "/" + result.total;
          return;
        }
      } catch (error) {
        console.log(error);
      }
    }
    location.href = "#/";
  }

  watchRightAnswers() {
    this.showAnswers = document.getElementById("result-answer");
    this.showAnswers.onclick = function () {
      location.href = "#/answer";
    };
  }
}
