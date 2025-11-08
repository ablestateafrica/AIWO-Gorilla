const chat = document.getElementById("chat");
const promptInput = document.getElementById("prompt");
const sendBtn = document.getElementById("send");
const stopBtn = document.getElementById("stop");
const modelEl = document.getElementById("modelSelect");
let model = "gemma:2b";
let isStreaming = true;

modelEl.addEventListener("change", () => {
	// console.log("Model changed to:", modelEl.value);
	model = modelEl.value;
});
function newChat() {
	chat.innerHTML = "";
	botDiv = null;
	stopBtn.style.display = "none";
	sendBtn.style.display = "inline-block";
}
async function sendMessage() {
	stopBtn.style.display = "inline-block";
	sendBtn.style.display = "none";
	const text = promptInput.value.trim();
	if (!text) return;

	// Display user message
	addMessage(text, "user");
	promptInput.value = "";

	// Create bot message container
	const botDiv = addMessage("...", "bot");

	// Call Ollama API (change IP to your Pi)
	const response = await fetch("http://192.168.1.37:11434/api/generate", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			model: model,
			prompt: text,
		}),
	}).catch((err) => {
		botDiv.innerText = "Error: " + err.message;
		stop();
	});

	if (!response || !response.body) {
		botDiv.innerText = "Error: No response from server.";
		stop();
		return;
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder("utf-8");
	let fullResponse = "";

	while (isStreaming) {
		const { value, done } = await reader.read();
		if (done) break;
		const chunk = decoder.decode(value);

		// Split by newlines because Ollama sends multiple JSON lines
		const lines = chunk.split("\n").filter(Boolean);
		for (const line of lines) {
			try {
				const json = JSON.parse(line);
				if (json.response) {
					fullResponse += json.response;
					botDiv.innerHTML = marked.parse(fullResponse); // update on screen as text streams in
					chat.scrollTop = chat.scrollHeight;
				}
			} catch (err) {
				console.warn("Stream parse error:", err);
			}
		}
	}
	stop();
}
function stop() {
	document.getElementById("stop").style.display = "none";
	document.getElementById("send").style.display = "inline-block";
	isStreaming = false;
}
function addMessage(text, type) {
	const div = document.createElement("div");
	div.className = `msg ${type}`;
	div.innerText = text;
	chat.appendChild(div);
	chat.scrollTop = chat.scrollHeight;
	return div;
}
