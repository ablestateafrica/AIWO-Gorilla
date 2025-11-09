const chat = document.getElementById("chat");
const promptInput = document.getElementById("prompt");
const sendBtn = document.getElementById("send");
const stopBtn = document.getElementById("stop");
const modelEl = document.getElementById("modelSelect");
let model = "gemma:2b";
let isStreaming = false;
let abortController = null; // Track the current request

modelEl.addEventListener("change", () => {
	model = modelEl.value;
});

function newChat() {
	chat.innerHTML = "";
	stopBtn.style.display = "none";
	sendBtn.style.display = "inline-block";
}

async function sendMessage() {
	const text = promptInput.value.trim();
	if (!text) return;

	// Show stop button, hide send
	stopBtn.style.display = "inline-block";
	sendBtn.style.display = "none";
	isStreaming = true;

	// Create new AbortController for this request
	abortController = new AbortController();

	// Display user message
	addMessage(text, "user");
	promptInput.value = "";

	// Create bot message container
	const botDiv = addMessage("...", "bot");

	try {
		// Call Ollama API with abort signal
		const response = await fetch("/api/generate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model: model,
				prompt: text,
			}),
			signal: abortController.signal, // Allow cancellation
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
						botDiv.innerHTML = marked.parse(fullResponse);
						chat.scrollTop = chat.scrollHeight;
					}
				} catch (err) {
					console.warn("Stream parse error:", err);
				}
			}
		}

		// Clean up after streaming completes
		if (reader) {
			reader.cancel();
		}
	} catch (err) {
		if (err.name === "AbortError") {
			// User stopped the request
			botDiv.innerHTML = marked.parse(
				botDiv.innerText + "\n\n*[Response stopped by user]*"
			);
		} else {
			botDiv.innerText = "Error: " + err.message;
		}
	} finally {
		stop();
	}
}

function stop() {
	// Actually abort the fetch request
	if (abortController) {
		abortController.abort();
		abortController = null;
	}

	// Stop streaming
	isStreaming = false;

	// Update UI
	stopBtn.style.display = "none";
	sendBtn.style.display = "inline-block";
}

function addMessage(text, type) {
	const div = document.createElement("div");
	div.className = `msg ${type}`;
	div.innerText = text;
	chat.appendChild(div);
	chat.scrollTop = chat.scrollHeight;
	return div;
}

// Make stop button actually call the stop function
stopBtn.addEventListener("click", stop);
