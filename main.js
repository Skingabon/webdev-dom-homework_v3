// План
// 1. Реализовать форму логина в приложении (+)
//  * Перенести всю разметку в рендер функцию (+)
//  * Сделать форму входа динамическй (+)
//  * отрефакторить приложение на модули
//    * api (+)
//    * вытищть логин компонент в отдельный модуль (+)
//    * TODO: вытащить компонент списка задач и форму добавления в отдельный модуль
// 2. Реализовать форму регистрации (+)

import { addTodo, deleteTodo, getTodos } from "./api.js";
import { renderLoginComponent } from "./components/login-component.js";
import { format } from "date-fns";
import _ from 'lodash';
// import { formatDateToRu, formatDateToUs } from "./lib/formatDate/formatDate.js";
let tasks = [];

let token = "Bearer asb4c4boc86gasb4c4boc86g37k3bk3cg3c03ck3k37w3cc3bo3b8";

token = null;

const fetchTodosAndRender = () => {
  return getTodos({ token }).then((responseData) => {
    tasks = responseData.todos;
    renderApp();
  });
};

const renderApp = () => {
  const appEl = document.getElementById("app");
  if (!token) {
    renderLoginComponent({
      appEl,
      setToken: (newToken) => {
        token = newToken;
      },
      fetchTodosAndRender,
    });

    return;
  }

  // const formatDate = (date) => {
  //   return `${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}/${
  //     date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth()
  //   }/${date.getFullYear()} ${
  //     date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
  //   }:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`;
  // };

  const country = "ru";
  const tasksHtml = tasks
    .map((task) => {
      // Вызываем функцию format из date-fns, первый параметр — это дата, которую
      // хотим отформатировать, второй параметр — это строка: к какому формату
      // желаем привести дату. Обратите внимание MM — это номер месяца,
      // mm — это минуты
      //в разметке ЗАДАЧА СОЗДАНА был тернарный оператор в зависимости от переменной формата даты. Мы заменили все на функцию из модуляdate-fns
      const createDate = format(new Date(task.created_at), 'MM-dd-yyyy hh:mm');
      return `
          <li class="task">
            <p class="task-text">
              ${task.text} (Создал: ${task.user?.name ?? "Неизвестно"})
              <button data-id="${task.id
        }" class="button delete-button">Удалить</button>
            </p>
            <p><i>Задача создана123: ${createDate}
                </i></p>
          </li>`;
    })
    .join("");

  const appHtml = `
                <h1>Список задач</h1>

                <ul class="tasks" id="list">
                <!-- Список рендерится из JS -->
                ${tasksHtml}
                </ul>
                <br />
                <div class="form">
                <h3 class="form-title">Форма добавления</h3>
                <div class="form-row">
                    Что нужно сделать:
                    <input
                    type="text"
                    id="text-input"
                    class="input"
                    placeholder="Выпить кофе"
                    />
                </div>
                <br />
                <button class="button" id="add-button">Добавить</button>
                </div>`;

  appEl.innerHTML = appHtml;

  const buttonElement = document.getElementById("add-button");
  const listElement = document.getElementById("list");
  const textInputElement = document.getElementById("text-input");

  const deleteButtons = document.querySelectorAll(".delete-button");

  for (const deleteButton of deleteButtons) {
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();

      const id = deleteButton.dataset.id;

      // подписываемся на успешное завершение запроса с помощью then
      deleteTodo({
        id,
        token,
      }).then((responseData) => {
        // получили данные и рендерим их в приложении
        tasks = responseData.todos;
        renderApp();
      });
    });
  }

  buttonElement.addEventListener("click", () => {
    if (textInputElement.value === "") {
      return;
    }

    buttonElement.disabled = true;
    buttonElement.textContent = "Задача добавляеятся...";

    addTodo({
      text: _.capitalize(textInputElement.value),
      // textInputElement.value,
      token,
    })
      .then(() => {
        // TODO: кинуть исключение
        textInputElement.value = "";
      })
      .then(() => {
        return fetchTodosAndRender();
      })
      .then(() => {
        buttonElement.disabled = false;
        buttonElement.textContent = "Добавить";
      })
      .catch((error) => {
        console.error(error);
        alert("Кажется у вас проблемы с интернетом, попробуйте позже");
        buttonElement.disabled = false;
        buttonElement.textContent = "Добавить";
      });
  });
};

renderApp();
