import { Form } from "./components/form.js";
import { Choice } from "./components/choice.js";
import { Test } from "./components/test.js";
import { Result } from "./components/result.js";
import { Answer } from "./components/answer.js";
import { Auth } from "./services/auth.js";

export class Router {
  constructor() {
    this.contentElement = document.getElementById("content");
    this.stylesElement = document.getElementById("styles");
    this.pageTitle = document.getElementById("pageTitle");
    this.profileElement = document.getElementById("profile");
    this.profileFullNameElement = document.getElementById("profile-full-name");
    

    this.routes = [
      {
        route: "#/",
        title: "Главная",
        template: "templates/index.html",
        styles: "styles/index.css",
        load: () => {},
      },
      {
        route: "#/singup",
        title: "Регистрация",
        template: "templates/singup.html",
        styles: "styles/form.css",
        load: () => {
          new Form("singup");
        },
      },
      {
        route: "#/login",
        title: "Вход в систему",
        template: "templates/login.html",
        styles: "styles/form.css",
        load: () => {
          new Form("login");
        },
      },
      {
        route: "#/choice",
        title: "Выбор теста",
        template: "templates/choice.html",
        styles: "styles/choice.css",
        load: () => {
          new Choice();
        },
      },
      {
        route: "#/test",
        title: "Прохождение теста",
        template: "templates/test.html",
        styles: "styles/test.css",
        load: () => {
          new Test();
        },
      },
      {
        route: "#/result",
        title: "Результаты теста",
        template: "templates/result.html",
        styles: "styles/result.css",
        load: () => {
          new Result();
        },
      },
      {
        route: "#/answer",
        title: "Правильные ответы",
        template: "templates/answer.html",
        styles: "styles/answer.css",
        load: () => {
          new Answer();
        },
      },
    ];
  }
  async openRoute() {
    const urlRoute = window.location.hash.split('?')[0];
    if(urlRoute === '#/logout'){
      await Auth.logout();
      window.location.href = "#/";
      return;
      }

    const newRoute = this.routes.find((item) => {
      return item.route === urlRoute;
    });
    if (!newRoute) {
      window.location.href = "#/";
      return;
    }
    this.contentElement.innerHTML = await fetch(newRoute.template).then(
      (response) => response.text()
    );
    this.stylesElement.setAttribute("href", newRoute.styles);
    this.pageTitle.innerText = newRoute.title;

    const userInfo = Auth.getUserInfo();
    const accessToken = localStorage.getItem(Auth.accessTokenKey);
    if (userInfo && accessToken) {
      this.profileElement.style.display = 'flex';
      this.profileFullNameElement.innerText = userInfo.fullName;
    } else {
      this.profileElement.style.display = 'none';
    }

    newRoute.load();
  }
}
