class DataLoader {
  _url = "http://localhost:8080/uu-jokes-maing01/22222222222222222222222222222222/";
  constructor(dynamicContent) {
    this.DynamicContent = dynamicContent;
  }
  ListJokes = async () => {
    const data = await this._sendRequest(this._url + "joke/list");
    let newHtml =
      "<table id='jokes-table' class='table table-hover'>\n" +
      "      <thead class='thead-light'>\n" +
      "        <tr>\n" +
      "          <th>Name</th>\n" +
      "          <th>Category</th>\n" +
      "          <th>Text</th>\n" +
      "        </tr>\n" +
      "      </thead>";
    data.itemList.forEach((joke) => {
      newHtml += `
        <tr class="joke-row">
          <td id="${joke.id}" class="joke-name"><button type="button" class="btn btn-link">${joke.name}</button></td>
          <td>${joke.categoryName}</td>
          <td>${joke.text}</td>
        </tr>`;
    });
    newHtml += "</table>" +
      "<button id='add-joke-btn' type='button' class='btn btn-outline-success'>+</button>";
    this.DynamicContent.innerHTML = newHtml;

    const jokeNames = this.DynamicContent.querySelectorAll(".joke-name");
    const addJokeBtn = this.DynamicContent.querySelector("#add-joke-btn");

    jokeNames.forEach((jokeName) => {
      jokeName.addEventListener("click", (button) => {
        this.Joke(jokeName.id);
      });
    });
    addJokeBtn.addEventListener("click", (button) => {
      this.CreateJokeForm();
    });
  };
  Joke = async (id) => {
    const data = { id: id };
    const joke = await this._sendRequest(this._url + "joke/get", data);

    this.DynamicContent.innerHTML = `
        <h3>${joke.name}</h3>
        <small class="text-muted">${joke.categoryName}</small>
        <p>${joke.text}</p>
        <button id="joke-update-btn" type="button" class="btn btn-outline-primary" value="${joke.id}">Upravit</button>
        <button id="joke-delete-btn" type="button" class="btn btn-outline-danger" value="${joke.id}">Smazat</button>`;
    const deleteBtn = document.querySelector("#joke-delete-btn");
    const updateBtn = document.querySelector("#joke-update-btn");
    deleteBtn.addEventListener("click", (button) => {
      this.DeleteJoke(deleteBtn.value);
    });
    updateBtn.addEventListener("click", (button) => {
      this.UpdateJokeForm(deleteBtn.value);
    });
  };
  CreateJokeForm(){
    this.DynamicContent.innerHTML =
      "<form id='joke-form'>" +
      "<div class='input-group mb-3'>\n" +
      "  <div class='input-group-prepend'>\n" +
      "    <span class='input-group-text' id='basic-addon1'>Název vtipu</span>\n" +
      "  </div>\n" +
      "  <input type='text' class='form-control' placeholder='Název...' aria-label='name' aria-describedby='basic-addon1' name='name' required>\n" +
      "</div>\n" +
      "<div class='input-group mb-3'>\n" +
      "  <div class='input-group-prepend'>\n" +
      "    <span class='input-group-text' id='basic-addon2'>Kategorie</span>\n" +
      "  </div>\n" +
      "  <input type='text' class='form-control' placeholder='Kategorie...' aria-label='category' aria-describedby='basic-addon2'name='category' required>\n" +
      "</div>\n" +
      "<div class='input-group mb-3'>\n" +
      "  <div class='input-group-prepend'>\n" +
      "    <span class='input-group-text'>Text</span>\n" +
      "  </div>\n" +
      "  <textarea class='form-control' aria-label='text' name='text' required></textarea>\n" +
      "</div>\n" +
      "</form>\n" +
      "<button id='submit-btn' class='btn btn-success'>Vytvořit</button>";
    const submitBtn = this.DynamicContent.querySelector('#submit-btn');
    submitBtn.addEventListener('click', button =>{
      this.CreateJoke();
    });
  }
  CreateJoke = async () =>{
    //const formData = new FormData(this.DynamicContent.querySelector('#joke-form'));
    const form = this.DynamicContent.querySelector('#joke-form');
    const formData = Object.fromEntries(new FormData(form).entries());
    const data = {
      "name": formData.name,
      "categoryName": formData.category,
      "text": formData.text
    };
    const res = await this._sendRequest(this._url + 'joke/create',data);
    await this.Joke(res.id);
  }
  UpdateJokeForm = async (id) =>{
    const joke = await this._sendRequest(this._url + 'joke/get',{"id":id});
    console.log(joke);
    this.DynamicContent.innerHTML =
      "<form id='joke-form'>" +
      "<div class='input-group mb-3'>\n" +
      "  <div class='input-group-prepend'>\n" +
      "    <span class='input-group-text' id='basic-addon1'>Název vtipu</span>\n" +
      "  </div>\n" +
      `  <input type='text' class='form-control' placeholder='${joke.name}' aria-label='name' aria-describedby='basic-addon1' name='name' required>\n` +
      "</div>\n" +
      "<div class='input-group mb-3'>\n" +
      "  <div class='input-group-prepend'>\n" +
      "    <span class='input-group-text' id='basic-addon2'>Kategorie</span>\n" +
      "  </div>\n" +
      `  <input type='text' class='form-control' placeholder='${joke.categoryName}' aria-label='category' aria-describedby='basic-addon2'name='category' required>\n` +
      "</div>\n" +
      "<div class='input-group mb-3'>\n" +
      "  <div class='input-group-prepend'>\n" +
      "    <span class='input-group-text'>Text</span>\n" +
      "  </div>\n" +
      `  <textarea class='form-control' aria-label='text' name='text' placeholder='${joke.text}' required></textarea>\n` +
      "</div>\n" +
      "</form>\n" +
      "<button id='submit-btn' class='btn btn-success'>Změnit</button>";
    const submitBtn = this.DynamicContent.querySelector('#submit-btn');
    submitBtn.addEventListener('click', button =>{
      this.UpdateJoke(joke.id);
    });
  }
  UpdateJoke = async (id) =>{
    const form = this.DynamicContent.querySelector('#joke-form');
    const formData = Object.fromEntries(new FormData(form).entries());
    const data = {"id":id};
    if(formData.name)
      data.name = formData.name;
    if(formData.category)
      data.categoryName = formData.category;
    if(formData.text)
      data.text = formData.text;
    console.log(data);
    const res = await this._sendRequest(this._url + 'joke/update',data);
    await this.Joke(res.id);
  }
  DeleteJoke = async (id) => {
    const data = { id: id };
    const res = await this._sendRequest(this._url + "joke/delete", data);
    await this.ListJokes();
  };
  ListCategories = async () => {
    const data = await this._sendRequest(this._url + "category/list");
    let newHtml =
      "<table id='categories-table' class='table table-hover'>\n" +
      "      <thead class='thead-light'>\n" +
      "        <tr>\n" +
      "          <th>Category Name</th>\n" +
      "        </tr>" +
      "      </thead>";
    data.itemList.forEach((category) => {
      newHtml += `
        <tr class="category-row">
          <td id="${category.id}" class="category-name">
            <button type="button" class="btn btn-link">${category.name}</button>
          </td>
        </tr>`;
    });
    newHtml += "</table>";
    this.DynamicContent.innerHTML = newHtml;
    const categoryNames = this.DynamicContent.querySelectorAll(".category-name");
    categoryNames.forEach((categoryName) => {
      categoryName.addEventListener("click", (button) => {
        this.Category(categoryName.id);
      });
    });
  };
  Category = async (id) => {
    const data = { id: id };
    const category = await this._sendRequest(this._url + "category/get", data);

    this.DynamicContent.innerHTML = `
        <h3>${category.name}</h3>
        <button id="category-delete-btn" type="button" class="btn btn-outline-danger" value="${category.id}">Smazat</button>`;
    const deleteBtn = document.querySelector("#category-delete-btn");
    deleteBtn.addEventListener("click", (button) => {
      this.DeleteCategory(deleteBtn.value);
    });
  };
  DeleteCategory = async (id) => {
    const data = { id: id };
    const res = await this._sendRequest(this._url + "category/delete", data);
    await this.ListCategories();
  };
  _sendRequest = async (url, data = undefined) => {
    let res;
    if (!data) res = await fetch(url);
    else {
      res = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      });
    }
    return res.json(); // parses JSON response into native JavaScript objects
  };
}

//const dynamicContent = document.querySelector('#dynamic-content')
const dataLoader = new DataLoader(document.querySelector("#dynamic-content"));
document.querySelector("#jokes-btn").addEventListener("click", (button) => {
  dataLoader.ListJokes();
});
document.querySelector("#categories-btn").addEventListener("click", (button) => {
  dataLoader.ListCategories();
});
dataLoader.ListJokes();
