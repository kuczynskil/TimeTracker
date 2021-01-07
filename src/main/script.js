const apikey = '9ecd6e22-c01a-42a0-a8be-06f68e902ba1';
const apihost = 'https://todo-api.coderslab.pl';


document.addEventListener("DOMContentLoaded", function () {

    function apiListTasks() {
        return fetch(
            apihost + '/api/tasks',
            {
                headers: {'Authorization': apikey}
            }
        ).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                alert("Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny");
            }
        })
    }

    function renderTask(taskId, title, description, status) {
        const section = document.createElement("section");
        section.className = 'card mt-5 shadow-sm';
        document.querySelector('main').appendChild(section);

        const headerDiv = document.createElement('div');
        headerDiv.className = 'card-header d-flex justify-content-between align-items-center';
        section.appendChild(headerDiv);

        const headerLeftDiv = document.createElement('div');
        headerDiv.appendChild(headerLeftDiv);

        const h5 = document.createElement('h5');
        h5.innerText = title;
        headerLeftDiv.appendChild(h5);

        const h6 = document.createElement('h6');
        h6.className = 'card-subtitle text-muted';
        h6.innerText = description;
        headerLeftDiv.appendChild(h6);

        const headerRightDiv = document.createElement('div');
        headerDiv.appendChild(headerRightDiv);

        if (status == 'open') {
            const finishButton = document.createElement('button');
            finishButton.className = 'btn btn-dark btn-sm js-task-open-only';
            finishButton.innerText = 'Finish';
            headerRightDiv.appendChild(finishButton);

            finishButton.addEventListener("click", ev => {
                const elementToDel = document.querySelectorAll(".js-task-open-only");
                elementToDel.forEach(el => {
                    el.remove();
                })
                ev.preventDefault();
                apiUpdateTask(taskId, title, description, 'closed').then(resp => {
                    status = resp.data.status;
                })
            })
        }

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
        deleteButton.innerText = 'Delete';
        headerRightDiv.appendChild(deleteButton);

        deleteButton.addEventListener("click", ev => {
            apiDeleteTask(taskId).then(resp => {
                section.remove();
            })
        })

        const ul = document.createElement('ul');
        ul.className = 'list-group list-group-flush';
        section.appendChild(ul);

        apiListOperationsForTask(taskId).then(resp => {
            resp.data.forEach(el => {
                renderOperation(ul, status, el.id, el.description, el.timeSpent)
            })
        })

        const formAddNewTask = document.createElement('div');
        formAddNewTask.className = 'card-body js-task-open-only';
        formAddNewTask.innerHTML =
            `           <form id="addOp${taskId}">\n` +
            '               <div class="input-group">\n' +
            '                   <input type="text" placeholder="Operation description" class="form-control" minlength="5">\n' +
            '                   <div class="input-group-append">\n' +
            '                       <button class="btn btn-info">Add</button>\n' +
            '                   </div>\n' +
            '               </div>\n' +
            '           </form>';
        section.appendChild(formAddNewTask);

        const formOp = document.querySelector(`#addOp${taskId}`);
        console.log(formOp);
        formOp.addEventListener("submit", evt => {
            evt.preventDefault();
            const description = formOp.firstElementChild.firstElementChild;
            apiCreateOperationForTask(taskId, description.value).then(resp => {
                renderOperation(ul, status, resp.data.id, resp.data.description, resp.data.timeSpent);
            })
        })
    }

    function apiListOperationsForTask(taskId) {
        return fetch(
            apihost + `/api/tasks/${taskId}/operations`,
            {
                headers: {Authorization: apikey}
            }
        ).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                alert("Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny");
            }
        })
    }

    function renderOperation(operationsList, status, operationId, operationDescription, timeSpent) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        operationsList.appendChild(li);

        const descriptionDiv = document.createElement('div');
        descriptionDiv.innerText = operationDescription;
        li.appendChild(descriptionDiv);

        const time = document.createElement('span');
        time.className = 'badge badge-success badge-pill ml-2';
        time.innerText = convertTime(timeSpent);
        descriptionDiv.appendChild(time);

        const buttonsDiv = document.createElement('div');
        li.appendChild(buttonsDiv);

        if (status == "open") {
            const buttons = document.createElement('div');
            buttons.innerHTML =
                `          <button class="btn btn-outline-success btn-sm mr-2 js-task-open-only" id="btn15${operationId}">+15m</button>\n` +
                `          <button class="btn btn-outline-success btn-sm mr-2 js-task-open-only" id="btn60${operationId}">+1h</button>\n` +
                `          <button class="btn btn-outline-danger btn-sm js-task-open-only" id="btnDelete${operationId}">Delete</button>`;
            li.appendChild(buttons);

            const button15 = document.querySelector(`#btn15${operationId}`);
            const button60 = document.querySelector(`#btn60${operationId}`);
            const buttonDelete = document.querySelector(`#btnDelete${operationId}`);

            button15.addEventListener("click", evt => {
                evt.preventDefault();
                apiUpdateOperation(operationId, operationDescription, timeSpent += 15).then(resp => {
                    time.innerText = convertTime(resp.data.timeSpent);
                    timeSpent = resp.data.timeSpent;
                })
            })

            button60.addEventListener("click", evt => {
                evt.preventDefault();
                apiUpdateOperation(operationId, operationDescription, timeSpent += 60).then(resp => {
                    time.innerText = convertTime(resp.data.timeSpent);
                    timeSpent = resp.data.timeSpent;
                })
            })

            buttonDelete.addEventListener("click", evt => {
                evt.preventDefault();
                apiDeleteOperation(operationId).then(resp => {
                    li.remove();
                })
            })
        }
    }

    function convertTime(time) {
        if (time >= 60 && time % 60 !== 0) {
            return Math.floor(time / 60) + 'h ' + time % 60 + 'm';
        } else if (time >= 60 && time % 60 === 0) {
            return time / 60 + 'h';
        } else {
            return time + 'm';
        }
    }

    function apiCreateTask(title, description) {
        return fetch(
            apihost + '/api/tasks',
            {
                headers: {Authorization: apikey, 'Content-Type': 'application/json'},
                body: JSON.stringify({title: title, description: description, status: 'open'}),
                method: 'POST'
            }
        ).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                alert("apiCreateTask ISSUE");
            }
        })
    }

    const form = document.querySelector(".js-task-adding-form");
    form.addEventListener("submit", evt => {
        evt.preventDefault();
        const title = document.querySelector("#title");
        const description = document.querySelector("#description");
        apiCreateTask(title.value, description.value).then(resp => {
            renderTask(resp.data.id, resp.data.title, resp.data.description, resp.data.status)
        });
    })

    function apiDeleteTask(taskId) {
        return fetch(
            apihost + `/api/tasks/${taskId}`,
            {
                headers: {Authorization: apikey},
                method: 'DELETE'
            }
        ).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                alert("apiDeleteTask ISSUE");
            }
        })
    }

    function apiCreateOperationForTask(taskId, description) {
        return fetch(
            apihost + `/api/tasks/${taskId}/operations`,
            {
                headers: {Authorization: apikey, 'Content-Type': 'application/json'},
                body: JSON.stringify({description: description, timeSpent: 0}),
                method: 'POST'
            }
        ).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                alert("apiCreateTask ISSUE");
            }
        })
    }

    function apiUpdateOperation(operationId, description, timeSpent) {
        return fetch(
            apihost + `/api/operations/${operationId}`,
            {
                headers: {Authorization: apikey, 'Content-Type': 'application/json'},
                body: JSON.stringify({description: description, timeSpent: timeSpent}),
                method: 'PUT'
            }
        ).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                alert("apiCreateTask ISSUE");
            }
        })
    }

    function apiDeleteOperation(operationId) {
        return fetch(
            apihost + `/api/operations/${operationId}`,
            {
                headers: {Authorization: apikey},
                method: 'DELETE'
            }
        ).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                alert("apiDeleteOperation ISSUE");
            }
        })
    }

    function apiUpdateTask(taskId, title, description, status) {
        return fetch(
            apihost + `/api/tasks/${taskId}`,
            {
                headers: {Authorization: apikey, 'Content-Type': 'application/json'},
                body: JSON.stringify({title: title, description: description, status: status}),
                method: 'PUT'
            }
        ).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                alert("apiUpdateTask ISSUE");
            }
        })
    }

    apiListTasks().then(resp => {
        resp.data.forEach(el => {
            renderTask(el.id, el.title, el.description, el.status);
        })
    })

});
