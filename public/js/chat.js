const socket = io();

// ELements
const $chatForm = document.querySelector("#chatForm");
const $shareLocationButton = document.querySelector("#shareLocationButton");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

// Templates
const $messageTemplate = document.querySelector("#messageTemplate").innerHTML;
const $locationMessageTemplate = document.querySelector(
  "#locationMessageTemplate"
).innerHTML;
const $sidebarTemplate = document.querySelector("#sidebarTemplate").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild;

  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = $messages.offsetHeight;
  const contentHeight = $messages.scrollHeight;

  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (contentHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users,
  });

  $sidebar.innerHTML = html;
});

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render($messageTemplate, {
    text: message.text,
    username: message.username,
    createdAt: moment(message.createdAt).format("dddd, h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (message) => {
  console.log(message);
  const html = Mustache.render($locationMessageTemplate, {
    url: message.url,
    username: message.username,
    createdAt: moment(message.createdAt).format("dddd, h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

$chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formSubmitButton = e.target.querySelector("button");
  formSubmitButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message;

  socket.emit("sendMessage", message.value, (error) => {
    if (error) {
      return console.log(error);
    }

    console.log("Message delivered!");

    message.value = "";
    message.focus();

    formSubmitButton.removeAttribute("disabled");
  });
});

$shareLocationButton.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  e.target.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;

    socket.emit("sendLocation", { latitude, longitude }, () => {
      console.log("Location shared!");
      e.target.removeAttribute("disabled");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
