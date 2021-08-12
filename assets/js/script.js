var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// edit task text
//when click on the task created, it will be highlighted and able to be editted
$(".list-group").on("click", "p", function() {
  //get current text of p element
  var text = $(this)
    .text()
    .trim();
  //replace p element with a new text area
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);
  //auto focus new element
  textInput.trigger("focus");
})

//this blur event will trigger as soon as the user interacts with anything other than the textarea element. wehn that happens we need to collect - data, current value of element, parent element's id and the elements position in the list. these data points will help us udate the correct task in the tasks object
$(".list-group").on("blur", "textarea", function() {
  // get the textarea's current value/text
  //.val is value
  //trim diminishes white space (deleted .trim() to match code snippet)
  var text = $(this).val();
  

  // get the parent ul's id attribute
  // attr is returning the ID which will be "lis-" followed by the category
  // replace is to find and replace text in a string
  //remove "list-" from the text, which will give us the category name (ex) toDo) that will match one of the arrays on the tasks object (ex: tasks.toDo)
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // tasks is an object. tasks[status] returns an array (ex: toDo). tasks[status][index] returns the object at the given index in the array. tasks[status][index].text returns the text property of the object at the given index
  tasks[status][index].text = text;
  //need to save this to local storage to save
  saveTasks();

  //convert the textarea back into a p element
  //recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  //replace text area with p element
  $(this).replaceWith(taskP);
})

//add ability to edit task dates
//due date was clicked
$(".list-group").on("click", "span", function() {
  //get current text
  var date = $(this)
    .text()
    .trim();

  //create new input element
  var dateInput = $("<input>")

    // attr() method set up as type = "text". attr() serves 2 purposes: 1 argument it gets an attribute (ex: attr("id")) and with 2 arguments it sets an attribute (ex: attr("type", "text"))
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  //swap out elements
  $(this).replaceWith(dateInput);

  //automatically focus on new element
  dateInput.trigger("focus");
})

//value of due date was changed
$(".list-group").on("blur", "input[type= 'text']", function() {
  //get current text
  var date = $(this)
    .val()
    .trim();

  //get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  //get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  //update task in array and re-save to localStorage
  tasks[status][index].date = date;
  saveTasks();

  //recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  //replace input with span element
  $(this).replaceWith(taskSpan);
})

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


