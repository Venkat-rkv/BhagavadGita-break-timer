document.addEventListener("DOMContentLoaded", () => {
  const waterStat = document.getElementById("water-stat");
  const breaksStat = document.getElementById("breaks-stat");
  const intervalSelect = document.getElementById("interval-select");
  const breakNowBtn = document.getElementById("break-now-btn");
  const resetStatsBtn = document.getElementById("reset-stats-btn");

  // Load current values
  chrome.storage.local.get(["waterCount", "breaksCount", "intervalMinutes"], (data) => {
    waterStat.textContent = data.waterCount || 0;
    breaksStat.textContent = data.breaksCount || 0;
    if (data.intervalMinutes) {
      intervalSelect.value = data.intervalMinutes;
    }
  });

  // Handle interval change
  intervalSelect.addEventListener("change", (e) => {
    const minutes = parseInt(e.target.value, 10);
    chrome.storage.local.set({ intervalMinutes: minutes }, () => {
      chrome.runtime.sendMessage({ type: "UPDATE_INTERVAL", minutes: minutes });
    });
  });

  // Handle immediate test break
  breakNowBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "TRIGGER_MANUAL_BREAK" });
  });

  // Reset daily tracking
  resetStatsBtn.addEventListener("click", () => {
    chrome.storage.local.set({ waterCount: 0, breaksCount: 0 }, () => {
      waterStat.textContent = "0";
      breaksStat.textContent = "0";
    });
  });
});