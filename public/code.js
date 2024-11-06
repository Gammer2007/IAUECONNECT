
(function () {
  const app = document.querySelector(".app");
  const socket = io();
  let uname;

  // Function to format timestamp
  function formatTimestamp(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours % 12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
  function run() {
    const messages = document.querySelectorAll('.my-message');
    const lastMessage = messages[messages.length - 1];
    socket.emit('delete-last-message', (lastMessage));
    lastMessage.remove();
  }
  

  // Function to render message
  function renderMessage(type, message) {
    const messageContainer = app.querySelector(".chat-screen .messages");

    if (type === "my") {
      const el = document.createElement("div");
      el.setAttribute("class", "message");
      el.innerHTML = `
        <div>
          <div class="my-message" data-id="${new Date().getTime()}">
            <div class="name">You</div>
            <div class="text">${message.text}</div>
            <div class="timestamp">${formatTimestamp(new Date())}</div>
            <div class="status">Delivered</div>
            
          </div>
        </div>
      `;
      messageContainer.appendChild(el);
    } else if (type === "other") {
      const el = document.createElement("div");
      el.setAttribute("class", "message");
      el.innerHTML = `
        <div>
          <div class="other-message" data-id="${new Date().getTime()}">
            <div class="name">${message.username}</div>
            <div class="text">${message.text}</div>
          </div>
        </div>
      `;
      messageContainer.appendChild(el);
    } else if (type === "update") {
      const el = document.createElement("div");
      el.setAttribute("class", "update");
      el.innerText = message;
      messageContainer.appendChild(el);
    }

    messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
  }

  // Function to delete message
  function deleteMessage(button) {
    const messageElement = button.parentNode;
    messageElement.remove();
  }

  // Event listeners
  app.querySelector(".join-screen #join-user").addEventListener("click", () => {
    const username = app.querySelector(".join-screen #username").value;
    if (username.length === 0) return;
    socket.emit("newuser", username);
    uname = username;
    app.querySelector(".logo").innerHTML = `Hello, ${username}! Welcome`;
    app.querySelector(".join-screen").classList.remove("active");
    app.querySelector(".chat-screen").classList.add("active");
  });

  app.querySelector(".join-screen #username").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const username = e.target.value;
      if (username.length === 0) return;
      socket.emit("newuser", username);
      uname = username;
      app.querySelector(".logo").innerHTML = `Hello, ${username}! Welcome`;
      app.querySelector(".join-screen").classList.remove("active");
      app.querySelector(".chat-screen").classList.add("active");
    }
  });

  app.querySelector(".chat-screen #send-message").addEventListener("click", () => {
    const message = app.querySelector(".chat-screen #message-input").value;
    if (message.length === 0) return;
    renderMessage("my", { username: uname, text: message });
    socket.emit("chat", { username: uname, text: message });
    app.querySelector(".chat-screen #message-input").value = "";
  });

  app.querySelector(".chat-screen #message-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const message = e.target.value;
      if (message.length === 0) return;
      renderMessage("my", { username: uname, text: message });
      socket.emit("chat", { username: uname, text: message });
      e.target.value = "";
    }
  });

  app.querySelector(".chat-screen #exit-chat").addEventListener("click", () => {
    socket.emit("exituser", uname);
    window.location.href = window.location.href;
  });

  // Socket event listeners
  socket.on("update", (update) => {
    renderMessage("update", update);
  });

  socket.on("chat", (message) => {
    renderMessage("other", message);
  });
  socket.on('delete-message', (messageId) => {
    const messageElement = document.querySelector(`.my-message[data-id="${messageId}"]`);
    if (messageElement) {
      messageElement.remove();
    }
  });  
})();
