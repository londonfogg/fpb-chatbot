(function () {
  var API_URL = window.FPB_CHAT_API_URL || 'https://REPLACE-WITH-YOUR-DEPLOYMENT.vercel.app/api/chat';

  var history = [];

  var style = document.createElement('style');
  style.textContent = `
    #fpb-chat-bubble {
      position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px;
      border-radius: 50%; background: #1a1a2e; color: #fff; border: none;
      cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.25); z-index: 999999;
      display: flex; align-items: center; justify-content: center; font-size: 26px;
      transition: transform 0.15s ease;
    }
    #fpb-chat-bubble:hover { transform: scale(1.06); }
    #fpb-chat-badge {
      position: fixed; bottom: 34px; right: 92px; z-index: 999998;
      background: #1a1a2e; color: #fff; border-radius: 999px;
      padding: 9px 14px; font-size: 12.5px; font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 4px 14px rgba(0,0,0,0.22); white-space: nowrap;
      display: flex; align-items: center; gap: 8px; cursor: pointer;
      opacity: 0; transform: translateY(6px) scale(0.96);
      transition: opacity 0.25s ease, transform 0.25s ease;
      pointer-events: none;
    }
    #fpb-chat-badge.show { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    #fpb-chat-badge::after {
      content: ''; position: absolute; right: -6px; bottom: 14px;
      width: 10px; height: 10px; background: #1a1a2e;
      transform: rotate(45deg); border-radius: 2px; z-index: -1;
    }
    #fpb-chat-badge .fpb-badge-close {
      background: none; border: none; color: #fff; opacity: 0.6;
      font-size: 14px; line-height: 1; cursor: pointer; padding: 0;
    }
    #fpb-chat-badge .fpb-badge-close:hover { opacity: 1; }
    #fpb-chat-panel {
      position: fixed; bottom: 96px; right: 24px; width: 340px; max-width: 90vw;
      height: 460px; max-height: 70vh; background: #fff; border-radius: 14px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.25); z-index: 999999; display: none;
      flex-direction: column; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont,
      "Segoe UI", Roboto, sans-serif;
    }
    #fpb-chat-panel.open { display: flex; }
    #fpb-chat-header {
      background: #1a1a2e; color: #fff; padding: 14px 16px; display: flex;
      flex-direction: column; gap: 2px;
    }
    #fpb-chat-header .title { font-weight: 600; font-size: 15px; }
    #fpb-chat-header .tag {
      font-size: 11px; opacity: 0.75; letter-spacing: 0.02em;
    }
    #fpb-chat-close {
      position: absolute; top: 10px; right: 12px; background: none; border: none;
      color: #fff; font-size: 18px; cursor: pointer; opacity: 0.8;
    }
    #fpb-chat-messages {
      flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;
    }
    .fpb-msg { max-width: 85%; padding: 9px 12px; border-radius: 12px; font-size: 13.5px; line-height: 1.4; }
    .fpb-msg.bot { background: #f0f1f5; color: #1a1a2e; align-self: flex-start; border-bottom-left-radius: 2px; }
    .fpb-msg.user { background: #1a1a2e; color: #fff; align-self: flex-end; border-bottom-right-radius: 2px; }
    .fpb-msg.typing { opacity: 0.6; font-style: italic; }
    #fpb-chat-input-row { display: flex; border-top: 1px solid #eee; padding: 10px; gap: 8px; }
    #fpb-chat-input {
      flex: 1; border: 1px solid #ddd; border-radius: 20px; padding: 8px 14px;
      font-size: 13.5px; outline: none;
    }
    #fpb-chat-send {
      background: #1a1a2e; color: #fff; border: none; border-radius: 20px;
      padding: 8px 16px; font-size: 13px; cursor: pointer;
    }
    #fpb-chat-send:disabled { opacity: 0.5; cursor: default; }
  `;
  document.head.appendChild(style);

  var bubble = document.createElement('button');
  bubble.id = 'fpb-chat-bubble';
  bubble.setAttribute('aria-label', 'Open FPB chat');
  bubble.textContent = '💬';
  document.body.appendChild(bubble);

  var badgeDismissed = false;
  try {
    badgeDismissed = sessionStorage.getItem('fpbChatBadgeDismissed') === '1';
  } catch (e) {}

  var badge = document.createElement('div');
  badge.id = 'fpb-chat-badge';
  badge.innerHTML = `
    <span>100% AI-Created Chatbot</span>
    <button class="fpb-badge-close" aria-label="Dismiss">×</button>
  `;
  document.body.appendChild(badge);

  function hideBadge(remember) {
    badge.classList.remove('show');
    if (remember) {
      badgeDismissed = true;
      try {
        sessionStorage.setItem('fpbChatBadgeDismissed', '1');
      } catch (e) {}
    }
  }

  if (!badgeDismissed) {
    setTimeout(function () {
      if (!badgeDismissed) badge.classList.add('show');
    }, 1200);
  }

  badge.addEventListener('click', function (e) {
    if (e.target.classList.contains('fpb-badge-close')) {
      hideBadge(true);
      return;
    }
    hideBadge(true);
    openPanel();
  });

  var panel = document.createElement('div');
  panel.id = 'fpb-chat-panel';
  panel.innerHTML = `
    <div id="fpb-chat-header" style="position:relative;">
      <span class="title">Future Proof Bootcamp</span>
      <span class="tag">Chatbot made by AI — answers may be incomplete, book a free call for details</span>
      <button id="fpb-chat-close" aria-label="Close chat">×</button>
    </div>
    <div id="fpb-chat-messages"></div>
    <div id="fpb-chat-input-row">
      <input id="fpb-chat-input" type="text" placeholder="Ask a question..." maxlength="500" />
      <button id="fpb-chat-send">Send</button>
    </div>
  `;
  document.body.appendChild(panel);

  var messagesEl = panel.querySelector('#fpb-chat-messages');
  var inputEl = panel.querySelector('#fpb-chat-input');
  var sendBtn = panel.querySelector('#fpb-chat-send');

  function addMessage(text, role) {
    var el = document.createElement('div');
    el.className = 'fpb-msg ' + role;
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function openPanel() {
    panel.classList.add('open');
    if (!messagesEl.childElementCount) {
      addMessage("Hi! I'm the FPB chatbot — built by Coach Indy with AI. Ask me anything about pricing, the program, or how to apply.", 'bot');
    }
    inputEl.focus();
  }

  bubble.addEventListener('click', function () {
    hideBadge(true);
    panel.classList.contains('open') ? panel.classList.remove('open') : openPanel();
  });
  panel.querySelector('#fpb-chat-close').addEventListener('click', function () {
    panel.classList.remove('open');
  });

  async function sendMessage() {
    var text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    sendBtn.disabled = true;
    addMessage(text, 'user');
    var typingEl = addMessage('Thinking...', 'bot typing');

    try {
      var res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history }),
      });
      var data = await res.json();
      typingEl.remove();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      addMessage(data.reply, 'bot');
      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      typingEl.remove();
      addMessage("Sorry, I couldn't reach the server. Please try again or book a free call with Coach Indy.", 'bot');
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendMessage();
  });
})();
