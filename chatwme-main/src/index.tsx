import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { renderer } from "./renderer";
import { EventSourceParserStream } from "eventsource-parser/stream";
import { Ai } from "@cloudflare/workers-types";

type Bindings = {
  AI: Ai;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(renderer);

app.get("/", (c) => {
  return c.render(
    <>
      <div className="flex h-screen bg-gray-200">
        <div
          className="flex-grow flex flex-col"
          style="max-width: calc(100% - 20rem)"
        >
          <div
            id="chat-history"
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-white flex flex-col-reverse messages-container"
          ></div>
          <div className="px-6 py-2 bg-white shadow-up">
            <form className="flex items-center" id="chat-form">
              <textarea
                id="message-input"
                className="flex-grow m-2 p-2 border border-chat-border rounded shadow-sm placeholder-chat-placeholder"
                placeholder="Type a message..."
              ></textarea>
              <button
                type="submit"
                className="m-2 px-4 py-2 bg-chat-button text-black rounded hover:bg-gray-300"
              >
                Send
              </button>
            </form>
            <div className="text-xs text-gray-500 mt-2">
              <p className="model-display">-</p>
              <input
                type="hidden"
                class="message-user message-assistant message-model"
              />
            </div>
          </div>
        </div>
        <div className="w-80 bg-chat-settings p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Chat Settings</h2>
              <p className="text-sm text-chat-helpertext mt-1">
                Try out different models and configurations for your chat
                application
              </p>
            </div>
            <form>
              <div className="mb-4">
                <label className="block text-black text-sm font-bold mb-2">
                  Model
                </label>
                <select
                  id="model-select"
                  className="border border-chat-border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                ></select>
              </div>
              <div className="mb-4">
                <label className="block text-black text-sm font-bold mb-2">
                  System Message
                </label>
                <p className="text-sm text-chat-helpertext mb-2">
                  Guides the tone of the response
                </p>
                <textarea
                  id="system-message"
                  className="border border-chat-border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter system message..."
                ></textarea>
              </div>
              <button
                id="apply-chat-settings"
                className="w-full px-4 py-2 bg-chat-apply text-white rounded hover:bg-gray-800 focus:outline-none focus:shadow-outline"
              >
                Apply Changes
              </button>
            </form>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center">
            <span className="mr-2 pt-2">Powered by</span>
            <a
              href="https://developers.cloudflare.com/workers-ai/"
              target="_blank"
            >
              <img
                src="/static/cloudflare-logo.png"
                alt="Cloudflare Logo"
                className="h-6 inline"
              />
            </a>
          </div>
        </div>
      </div>
      <script src="/static/script.js"></script>
    </>
  );
});

app.post("/api/chat", async (c) => {
  const payload = await c.req.json();
  const messages = [...payload.messages];

  // *** ADD SYSTEM MESSAGE HERE ***
  const systemMessage = "أنت مساعد ذكي تتحدث باللهجة الجزائرية فقط. حاول  " +
    "التحدث مثل شاب جزائري.  " +
    "لا تستخدم اللغة العربية الفصحى.";
  messages.unshift({ role: "system", content: systemMessage });

  // Prepend the systemMessage (existing code, keep as is)
  if (payload?.config?.systemMessage) {
    messages.unshift({
      role: "system",
      content: payload.config.systemMessage,
    });
  }

  // ... (rest of the existing code to handle AI model, keep it as is)... 

  return streamText(c, async (stream) => {
    for await (const msg of tokenStream) {
      if (msg.data !== "[DONE]") {
        const data = JSON.parse(msg.data);

        // *** OPTIONAL: MODIFY RESPONSE HERE ***
        stream.write("شوف... " + data.response); 
      }
    }
  });
});

export default app;
