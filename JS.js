$(document).ready(function () {
    // Check for existing tasks in local storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Load existing tasks
    loadTasks();

    function initializeAutocomplete() {
        $('#taskTitle').autocomplete({
            source: getTitleSuggestions(),
            minLength: 0,
        });
    }
    loadTasks();
    initializeAutocomplete();

    // Task Form Submission
    $('#taskForm').submit(function (event) {
        event.preventDefault();
        addTask();
    });

    // Event handler for enabling notifications
    $('#enableNotifications').click(function () {
        requestNotificationPermission();
    });

    // Function to request notification permission
    function requestNotificationPermission() {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(function (permission) {
                if (permission === 'granted') {
                    alert('Notifications enabled!');
                } else {
                    alert('Notifications denied. You can enable them in your browser settings.');
                }
            });
        } else {
            alert('Notifications are already enabled!');
        }
    }

    // Function to add a new task
    function addTask() {
        let title = $('#taskTitle').val();
        let description = $('#taskDescription').val();
        let dueDate = $('#dueDate').val();
        let priority = $('#priority').val();

        if (title && dueDate) {
            let task = {
                title: title,
                description: description,
                dueDate: dueDate,
                priority: priority,
                completed: false
            };

            tasks.push(task);
            saveTasks();
            loadTasks();
            $('#taskForm')[0].reset();

            initializeAutocomplete();
        }
    }

    // Function to load tasks into the list
    function loadTasks() {
        $('#taskList').empty();

        tasks.forEach(function (task, index) {
            let listItem = $('<li class="list-group-item"></li>');

            if (task.completed) {
                listItem.addClass('list-group-item-success');
            }

            listItem.append('<strong>' + task.title + '</strong>');
            listItem.append('<p>' + task.description + '</p>');

            let formattedDueDate = new Date(task.dueDate).toLocaleString();
            listItem.append('<small>Due Date: ' + formattedDueDate + '</small>');

            listItem.append('<span class="badge badge-primary">' + task.priority + '</span>');

            listItem.append('<button class="btn btn-success btn-sm float-right mr-2">Complete</button>');
            listItem.append('<button class="btn btn-danger btn-sm float-right">Delete</button>');

            listItem.find('.btn-success').click(function () {
                tasks[index].completed = true;
                saveTasks();
                loadTasks();
            });

            listItem.find('.btn-danger').click(function () {
                tasks.splice(index, 1);
                saveTasks();
                loadTasks();
            });

            $('#taskList').append(listItem);
        });

        // Call setReminder function on page load
        setReminder();
    }

    // Function to save tasks to local storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Function to get title suggestions for Autocomplete
    function getTitleSuggestions() {
        return tasks.map(task => task.title);
    }

    function setReminder() {
        tasks.forEach(function (task) {
            if (!task.completed) {
                let dueDate = new Date(task.dueDate).getTime();
                let currentTime = new Date().getTime();
                let timeDifference = dueDate - currentTime;
                if (timeDifference > 0 && timeDifference <= 3600000) {
                    // Notify the user
                    notifyUser(task.title, 'is due soon!');
                }
            }
        });
    }
    // Function to send browser notifications
    function notifyUser(title, message) {
        if (Notification.permission === 'granted') {
            new Notification('To Do Reminder', {
                body: title + ' ' + message,
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(function (permission) {
                if (permission === 'granted') {
                    notifyUser(title, message);
                }
            });
        }
    }
});