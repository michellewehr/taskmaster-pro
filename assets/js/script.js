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

  //check due date
  auditTask(taskLi);

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
  var date = $(this).text().trim();

  //create new input element
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);
  // ^^ attr() method set up as type = "text". attr() serves 2 purposes: 1 argument it gets an attribute (ex: attr("id")) and with 2 arguments it sets an attribute (ex: attr("type", "text"))

  //swap out elements
  $(this).replaceWith(dateInput);

  //enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      //when calendar is closed, force a "change" event on the dateInput. the onChange method forces change event on the dateInput whenever the user closes the date
      $(this).trigger("change");
    }
  });

  //automatically focus on new element
  dateInput.trigger("focus");
})

//value of due date was changed -- changed .on("blur") to .on("change", "input[type'text']", function()) so that the date changes
$(".list-group").on("change", "input[type= 'text']", function() {
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

  //pass task's li element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
})

//MOVE LIST ITEMS/ sort them into different card elements (to do, in progress, in review, done)
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolderance: "pointer",
  //helper: clone- tells jquery to create a copy of the dragged element and move the copy instead of the original. necessary to prevent click events from accidently triggering on the original element
  helper: "clone",
  //added eent listeners- activate, over, and out
  activate: function(event) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function(event) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function(event) {
    $(event.target).addClass("dropover-active");
  },
  out: function(event) {
    $(event.target).removeClass("dropover-active");
  },
  update: function(event) {
    //array to store the task data in 
    var tempArr = [];
    //loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();
      var date = $(this)
        .find("span")
        .text()
        .trim()
      
      //add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });

    //GET TASKS TO STAY IN COLUMN DRAGGED TO
    //trim down list's ID to match objet property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    //update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

//TRASH DRAG AND DROP COMPONENT
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolderance: "touch",
  drop: function(event, ui) {
    console.log("drop");
    ui.draggable.remove();
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function(event, ui) {
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  out: function(event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-drag");
  }
})

//DATE PICKER
$("#modalDueDate").datepicker({
  minDate: 1
});

//AUDIT TASK FUNCTION 
// in audit task function ew can get the date info and parse it into a moment object using moment.js. we use jquery to select the taskel element and find the span element inside of it, then retrieve the text value using .text(). we chained .trim() to cute off any possible leading or trailing empty spaces **Pro tip: use trim() when reading form values to ensure no unnecessary empty spaces are in beg/end of string
var auditTask = function(taskEl) {
  //to ensure element is getting to the function
  console.log(taskEl);
  // get date from task element
  var date = $(taskEl).find("span").text().trim();
  //ensure it worked
  // console.log(date);

  //convert to moment object at 5:00pm. once we hace the date info and store it in date variable wehave to pass that value into moment() function to turn into moment object. we specified date, "L" coz the date var doesn't specify time of day and will default to 12am- converted to 5pm using "hour", 17 in .set() method
  var time = moment(date, "L").set("hour", 17);
  // this should print out an object for the value of the date variable, but at 5:00pm of that date
  // console.log(time);

  //apply new class if task is near/over due date -- note Math.abs ensures we're getting the absolute value of that number
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};

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
$("#task-form-modal .btn-save").click(function() {
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

//set interval function 
setInterval(function() {
  $(".card .list-group-item").each(function(index, el) {
    auditTask(el);
  });
}, (1000 * 60) * 30);

