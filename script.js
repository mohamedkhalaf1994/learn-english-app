const inputVild = document.getElementById("arabic-input");
const translateBtn = document.querySelector("button");
const translationContainer = document.getElementById("translation");
const clearBtn = document.getElementById("clearAllBtn");
const voiceBtn = document.getElementById("voiceBtn");

// الترجمة
translateBtn?.addEventListener("click", () => {
  const sentence = inputVild.value.trim();
  if (!sentence) return;

  const apiURL = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sentence)}&langpair=ar|en`;

  fetch(apiURL)
    .then(response => response.json())
    .then(data => {
      const translated = data.responseData.translatedText;

      const newEntry = {
        original: sentence,
        translated: translated,
        savedAt: new Date().toISOString()
      };

      let stored = JSON.parse(localStorage.getItem("translations")) || [];
      stored.push(newEntry);
      localStorage.setItem("translations", JSON.stringify(stored));

      showEntry(newEntry);
      inputVild.value = "";
    });
});

// عرض الترجمة
function showEntry(item) {
  const entryDiv = document.createElement("div");
  entryDiv.className = "translation-entry";
  entryDiv.innerHTML = `
    <p>${item.original}</p>
    <p class="translated-text">${item.translated}</p>
    <div class="translation-actions">
      <span class="icon material-icons" onclick="speak('${item.translated}')">volume_up</span>
      <span class="icon material-icons" onclick="copyText(this)">content_copy</span>
      <span class="icon material-icons" onclick="deleteEntry(this, '${item.savedAt}')">delete</span>
    </div>
    <hr>
  `;
  translationContainer?.appendChild(entryDiv);
}

// النطق
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  const rate = document.getElementById("rateControl")?.value || 1;
  utterance.rate = parseFloat(rate);
  speechSynthesis.speak(utterance);
}

// تحميل الترجمات الحديثة
function loadRecentTranslations() {
  const data = JSON.parse(localStorage.getItem("translations")) || [];
  const recent = data.filter(item => {
    const date = new Date(item.savedAt);
    return (new Date() - date) / (1000 * 60 * 60 * 24) <= 14;
  });
  recent.forEach(showEntry);
}

// التعرف على الصوت
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ar-EG';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function(event) {
        const spokenText = event.results[0][0].transcript;
        inputVild.value = spokenText;
    };

    recognition.onerror = function(event) {
        console.error("❌ خطأ في التعرف على الصوت:", event.error);
    };

    voiceBtn.addEventListener('click', () => {
        recognition.start();
        voiceBtn.classList.add('listening');
    });

    recognition.onend = function() {
        voiceBtn.classList.remove('listening');
    };
} else {
    alert("❗ المتصفح لا يدعم التعرف على الصوت. جرب Google Chrome");
    voiceBtn.style.display = 'none';
}


// تحميل الأرشيف
function loadArchive() {
  const container = document.getElementById("archive-container");
  const data = JSON.parse(localStorage.getItem("translations")) || [];
  const old = data.filter(item => {
    const date = new Date(item.savedAt);
    return (new Date() - date) / (1000 * 60 * 60 * 24) > 14;
  });

  old.forEach(item => {
    const div = document.createElement("div");
    div.className = "archive-entry";
    div.innerHTML = `
      <p>${item.original}</p>
      <p class="translated-text">${item.translated}</p>
      <div class="translation-actions">
        <span class="icon material-icons" onclick="speak('${item.translated}')">volume_up</span>
        <span class="icon material-icons" onclick="copyText(this)">content_copy</span>
        <span class="icon material-icons" onclick="deleteEntry(this, '${item.savedAt}')">delete</span>
      </div>
      <hr>
    `;
    container.appendChild(div);
  });
}

// نسخ النص
function copyText(copyIcon) {
  const entry = copyIcon.closest(".translation-entry") || copyIcon.closest(".archive-entry");
  const translatedText = entry.querySelector(".translated-text")?.textContent;

  const tempInput = document.createElement("textarea");
  tempInput.value = translatedText;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  const message = document.createElement("div");
  message.textContent = "✅ تم النسخ";
  message.className = "copy-message";
  message.style.color = "green";
  message.style.marginTop = "10px";
  message.style.fontWeight = "bold";
  entry.appendChild(message);
  setTimeout(() => message.remove(), 2000);
}


// حذف ترجمة واحدة
function deleteEntry(deleteIcon, timestamp) {
  let stored = JSON.parse(localStorage.getItem("translations")) || [];
  stored = stored.filter(item => item.savedAt !== timestamp);
  localStorage.setItem("translations", JSON.stringify(stored));

  const entry = deleteIcon.closest(".translation-entry") || deleteIcon.closest(".archive-entry");
  entry.remove();
}

// حذف الكل مع تأكيد
clearBtn?.addEventListener("click", () => {
  const confirmDelete = confirm("⚠️ هل أنت متأكد أنك تريد حذف كل الترجمات؟");
  if (confirmDelete) {
    localStorage.removeItem("translations");
    translationContainer.innerHTML = "";
  }
});

// تحميل الترجمات أو الأرشيف تلقائياً
if (document.getElementById("translation")) loadRecentTranslations();
if (document.getElementById("archive-container")) loadArchive();
