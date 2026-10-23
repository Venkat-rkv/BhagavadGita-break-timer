const ALARM_NAME = "gita_break_alarm";

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    intervalMinutes: 30,
    waterCount: 0,
    breaksCount: 0,
    isRunning: true
  });
  scheduleNextBreak(30);
});

// Schedule alarm using chrome.alarms
function scheduleNextBreak(minutes) {
  const safeMinutes = Math.max(1, Number(minutes) || 30);
  chrome.alarms.clear(ALARM_NAME, () => {
    chrome.alarms.create(ALARM_NAME, { delayInMinutes: safeMinutes });
  });
}

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    triggerBreakScreen();
    // Reschedule next break
    chrome.storage.local.get(["intervalMinutes", "isRunning"], (res) => {
      if (res.isRunning !== false) {
        scheduleNextBreak(res.intervalMinutes || 30);
      }
    });
  }
});

// Open the break screen in a new tab
function triggerBreakScreen() {
  chrome.tabs.create({ url: chrome.runtime.getURL("break.html") });
}

// Listen for messages from popup UI
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "UPDATE_INTERVAL") {
    scheduleNextBreak(request.minutes);
    sendResponse({ status: "scheduled" });
  } else if (request.type === "TRIGGER_MANUAL_BREAK") {
    triggerBreakScreen();
    sendResponse({ status: "triggered" });
  }
  return true; // Keeps the message channel open for response
});