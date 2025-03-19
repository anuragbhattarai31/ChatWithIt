let promptInput = document.querySelector("#prompt");
let submitBtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imageBtn = document.querySelector("#image");
let imagePreview = document.querySelector("#image img");
let imageInput = document.querySelector("#image input");

const API_URL = 'api/chat';

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

async function generateResponse(aiChatBox) {
    const textArea = aiChatBox.querySelector(".ai-chat-area");
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: user.message },
                        ...(user.file.data ? [{ inline_data: user.file }] : [])
                    ]
                }]
            })
        });
        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .trim();
        textArea.innerHTML = responseText;
    } catch (error) {
        console.error("API Error:", error);
        textArea.innerHTML = "Sorry, I'm having trouble responding right now.";
    } finally {
        aiChatBox.scrollIntoView({ behavior: "smooth" });
        imagePreview.src = "/assets/img.svg";
        imagePreview.classList.remove("choose");
        user.file = {};
    }
}

function createChatElement(html, className) {
    const div = document.createElement("div");
    div.className = className;
    div.innerHTML = html;
    return div;
}

function handleUserMessage(message) {
    user.message = message;
    
    // User message template
    const userHTML = `
        <div class="user-chat-box">
            <div class="user-chat-area">
                ${user.message}
                ${user.file.data ? 
                    `<img src="data:${user.file.mime_type};base64,${user.file.data}" 
                         class="chooseimg" />` : ""}
            </div>
            <img src="/assets/user.png" class="avatar" alt="User">
        </div>
    `;
    
    const userBubble = createChatElement(userHTML, "user-message");
    chatContainer.appendChild(userBubble);
    userBubble.scrollIntoView({ behavior: "smooth" });
    
    // AI response template
    setTimeout(() => {
        const aiHTML = `
            <div class="ai-chat-box">
                <img src="/assets/AI.png" class="avatar" alt="AI">
                <div class="ai-chat-area">
                    <img src="/assets/loading.webp" class="load" width="40">
                </div>
            </div>
        `;
        const aiBubble = createChatElement(aiHTML, "ai-message");
        chatContainer.appendChild(aiBubble);
        aiBubble.scrollIntoView({ behavior: "smooth" });
        generateResponse(aiBubble);
    }, 600);

    // Reset and scroll
    promptInput.value = "";
}

// Event Listeners
promptInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleUserMessage(promptInput.value);
});

submitBtn.addEventListener("click", () => {
    handleUserMessage(promptInput.value);
});

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        user.file = {
            mime_type: file.type,
            data: e.target.result.split(",")[1]
        };
        imagePreview.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        imagePreview.classList.add("choose");
    };
    reader.readAsDataURL(file);
});

imageBtn.addEventListener("click", () => imageInput.click());