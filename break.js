document.addEventListener("DOMContentLoaded", async () => {
  const themeBadge = document.getElementById("theme-badge");
  const verseSanskrit = document.getElementById("verse-sanskrit");
  const verseTransliteration = document.getElementById("verse-transliteration");
  const verseRef = document.getElementById("verse-ref");
  const verseTranslation = document.getElementById("verse-translation");
  const verseTakeaway = document.getElementById("verse-takeaway");
  const verseAction = document.getElementById("verse-action");
  const drinkBtn = document.getElementById("drink-btn");
  const closeBtn = document.getElementById("close-btn");
  const countdownEl = document.getElementById("countdown");

  // 1. Increment Breaks Completed Count
  chrome.storage.local.get(["breaksCount"], (res) => {
    chrome.storage.local.set({ breaksCount: (res.breaksCount || 0) + 1 });
  });

  // 2. Load verses and pick via non-repeating random deck
  try {
    const response = await fetch(chrome.runtime.getURL("data/verses.json"));
    const verses = await response.json();

    // Retrieve the pool of remaining unshown verse IDs
    chrome.storage.local.get(["unseenVerseIds"], (stored) => {
      let pool = stored.unseenVerseIds;

      // If pool is uninitialized or all 58 verses have been seen, replenish it
      if (!Array.isArray(pool) || pool.length === 0) {
        pool = verses.map((v) => v.id);
      }

      // Pick a random index from the pool
      const randomIndex = Math.floor(Math.random() * pool.length);
      const chosenId = pool[randomIndex];

      // Remove the chosen ID from the pool and save back to storage
      pool.splice(randomIndex, 1);
      chrome.storage.local.set({ unseenVerseIds: pool });

      // Locate the chosen verse object
      const selectedVerse = verses.find((v) => v.id === chosenId) || verses[0];

      // Populate UI
      themeBadge.textContent = selectedVerse.theme;
      verseSanskrit.textContent = selectedVerse.sanskrit;
      verseTransliteration.textContent = selectedVerse.transliteration;
      verseRef.textContent = `Bhagavad Gita • Chapter ${selectedVerse.chapter}, Verse ${selectedVerse.verse}`;
      verseTranslation.textContent = selectedVerse.translation;
      verseTakeaway.textContent = selectedVerse.takeaway;
      verseAction.textContent = selectedVerse.action;
    });
  } catch (err) {
    console.error("Failed to load or randomize verses:", err);
  }

  // 3. 120-Second Countdown
  let timeLeft = 120;
  const timer = setInterval(() => {
    timeLeft -= 1;
    if (countdownEl) countdownEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      if (countdownEl) {
        countdownEl.parentElement.textContent = "Break complete. Return whenever you are ready.";
      }
    }
  }, 1000);

  // 4. Log Water
  drinkBtn.addEventListener("click", () => {
    chrome.storage.local.get(["waterCount"], (res) => {
      const updated = (res.waterCount || 0) + 1;
      chrome.storage.local.set({ waterCount: updated }, () => {
        drinkBtn.textContent = "✅ Logged!";
        drinkBtn.disabled = true;
      });
    });
  });

  // 5. Close Tab
  closeBtn.addEventListener("click", () => {
    window.close();
  });
});