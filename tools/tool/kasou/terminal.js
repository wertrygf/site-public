let vmRunning = false;
let history = [];
let historyIndex = -1;
let currentUser = "";

const terminal = document.getElementById("terminal");
const vmState = document.getElementById("vmState");
const input = document.getElementById("commandInput");
const prompt = document.getElementById("prompt");
const usernameInput = document.getElementById("usernameInput");

function login() {
  const user = usernameInput.value.trim() || "user";
  currentUser = user;
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("vmInterface").style.display = "block";
  document.getElementById("currentUser").textContent = user;
  prompt.textContent = `${user}@ubuntu:${getCurrentPath()}$`;
}

function appendTerminal(text) {
  terminal.textContent += "\n" + text;
  terminal.scrollTop = terminal.scrollHeight;
}

function setCommandEnabled(enabled) {
  input.disabled = !enabled;
}

function startVM() {
  if (vmRunning) return appendTerminal("仮想マシンは既に起動しています。");
  vmRunning = true;
  vmState.textContent = "稼働中";
  vmState.style.color = "lime";
  setCommandEnabled(true);
  appendTerminal("仮想マシンを起動しました。");
}

function stopVM() {
  if (!vmRunning) return appendTerminal("仮想マシンは既に停止しています。");
  vmRunning = false;
  vmState.textContent = "停止中";
  vmState.style.color = "red";
  setCommandEnabled(false);
  append
