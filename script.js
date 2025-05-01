let coins = 0;
let level = 1;
let tasksCompleted = 0;
let redeemCount = 0;
let requiredRedeems = 2; // Initial requirement for level up

function updateCoins(amount) {
    coins += amount;
    document.getElementById("coinCount").innerText = coins;
}

function updateProgress() {
    let progress = (tasksCompleted % 10) * 10;
    document.getElementById("progress").style.width = progress + "%";

    if (tasksCompleted > 0 && tasksCompleted % 10 === 0) {
        levelUp();
    }
}

function addNote() {
    let noteInput = document.getElementById("noteInput");
    let noteText = noteInput.value.trim();
    if (noteText === "") return;

    let noteList = document.getElementById("noteList");
    let noteItem = document.createElement("li");
    noteItem.innerText = noteText;
    
    let deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.classList.add("delete");
    deleteBtn.onclick = function () {
        noteList.removeChild(noteItem);
    };
    
    noteItem.appendChild(deleteBtn);
    noteList.appendChild(noteItem);
    
    updateCoins(1);
    noteInput.value = "";
}

function addTodo() {
    let todoInput = document.getElementById("todoInput");
    let todoText = todoInput.value.trim();
    let reminderTime = document.getElementById("reminderTime").value;
    let priority = document.getElementById("priority").value;

    if (todoText === "") {
        alert("Please enter a task!");
        return;
    }

    if (!reminderTime) {
        alert("Please select a reminder time!");
        return;
    }

    let todoList = document.getElementById("todoList");
    let todoItem = document.createElement("li");
    todoItem.innerHTML = `${todoText} (${priority}) - <small>Reminder: ${new Date(reminderTime).toLocaleString()}</small>`;

    let doneBtn = document.createElement("button");
    doneBtn.innerText = "✔";
    doneBtn.classList.add("done");
    doneBtn.onclick = function () {
        todoList.removeChild(todoItem);
        tasksCompleted++;
        updateCoins(5);
        updateProgress();
    };

    todoItem.appendChild(doneBtn);
    todoList.appendChild(todoItem);

    // Save task with reminder in localStorage
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let task = { text: todoText, priority: priority, reminderTime: new Date(reminderTime).getTime() };
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    // Schedule the reminder
    scheduleReminder(task);

    // Clear input fields
    todoInput.value = "";
    document.getElementById("reminderTime").value = "";
}

// ✅ Function to schedule a reminder in the browser
function scheduleReminder(task) {
    const reminderTime = task.reminderTime;
    const currentTime = new Date().getTime();
    const timeDiff = reminderTime - currentTime;

    if (timeDiff > 0) {
        setTimeout(() => {
            showNotification(task.text);
        }, timeDiff);
    }
}

// ✅ Show browser notification when the reminder time comes
function showNotification(taskText) {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Task Reminder", {
                    body: `⏰ Don't forget: ${taskText}`,
                    icon: "https://cdn-icons-png.flaticon.com/512/1828/1828911.png"
                });
            }
        });
    } else {
        alert(`⏰ Reminder: ${taskText}`);
    }
}

// ✅ Request permission for notifications
if ("Notification" in window) {
    Notification.requestPermission();
}

function levelUp() {
    level++;
    tasksCompleted = 0; // Reset completed tasks
    redeemCount = 0; // Reset redeemed rewards
    requiredRedeems = Math.max(2, Math.floor(requiredRedeems * 1.5)); // Adjust difficulty
    document.getElementById("level").innerText = level;
    alert(`Congratulations! You've reached Level ${level} 🎉`);
}

function redeemReward() {
    if (coins >= 10) {
        updateCoins(-10);
        redeemCount++;

        if (redeemCount >= requiredRedeems) {
            levelUp();
        } else {
            alert(`Reward redeemed! You need ${requiredRedeems - redeemCount} more for the next level.`);
        }
    } else {
        alert("Not enough coins!");
    }
}

function startVoiceInput(type) {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser doesn't support voice input.");
        return;
    }

    let recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = function(event) {
        let transcript = event.results[0][0].transcript.trim();
        
        if (type === 'task') {
            document.getElementById("todoInput").value = transcript;
        } else if (type === 'habit') {
            document.getElementById("habitInput").value = transcript;
        } else if (type === 'note') {
            document.getElementById("noteInput").value = transcript;
        } else {
            alert("Unknown input type.");
        }
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error:", event.error);
    };

    recognition.onend = function() {
        console.log("Voice input ended.");
    };
}
let streak = parseInt(localStorage.getItem("streak")) || 0;
let lastCompletedDate = localStorage.getItem("lastCompletedDate");

document.getElementById("streak").innerText = streak;

function updateStreak() {
let today = new Date().toDateString();

if (lastCompletedDate === today) {
    return; // Prevent multiple increments in one day
}

let yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
let yesterdayStr = yesterday.toDateString();

if (lastCompletedDate === yesterdayStr) {
    streak++; // Continue streak
} else {
    streak = 1; // Reset streak if a day is missed
}

localStorage.setItem("streak", streak);
localStorage.setItem("lastCompletedDate", today);
document.getElementById("streak").innerText = streak;
}