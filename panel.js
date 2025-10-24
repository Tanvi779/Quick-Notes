(async () => {
  await new Promise((resolve) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", resolve);
    } else {
      resolve();
    }
  });

  const contentBox = document.getElementById("content");
  const statusBox = document.getElementById("status");

  statusBox.textContent = "";

  const statusMessage = document.createElement("div");
  statusBox.appendChild(statusMessage);

  const getCurrentTabURL = async () =>
    (await browser.tabs.query({ active: true, currentWindow: true }))[0]?.url;

  const displayNote = (noteText) => {
    if (noteText) {
      const savedList = document.createElement("div");
      savedList.textContent = noteText;
      savedList.className = "note-item";
      statusBox.appendChild(savedList);
    }
  };

  const setStatus = (text, color = "inherit") => {
    statusMessage.textContent = text;
    statusMessage.style.color = color;
  };

  const loadNote = async () => {
    const url = await getCurrentTabURL();
    if (!url) return;
    const data = await browser.storage.local.get(url);
    const note = data[url] || "";
    contentBox.value = note;
    if (note) {
      setStatus("Loaded note", "blue");
      displayNote(note);
    } else {
      setStatus("No notes saved", "gray");
    }
  };

  const saveNote = async () => {
    const url = await getCurrentTabURL();
    if (!url) return;

    await browser.storage.local.set({ [url]: contentBox.value });
    setStatus("✅ Saved!", "green");
    displayNote(contentBox.value);
  };

  const deleteNote = async () => {
    const url = await getCurrentTabURL();
    if (!url) return;

    await browser.storage.local.remove(url);
    contentBox.value = "";

    const noteItems = statusBox.querySelectorAll(".note-item");
    noteItems.forEach((el) => el.remove());

    setStatus("🗑️ Deleted!", "red");
  };

  const clearNote = () => {
    contentBox.value = "";
  };

  document.getElementById("save-btn").onclick = saveNote;
  document.getElementById("clear-btn").onclick = clearNote;
  document.getElementById("delete-btn").onclick = deleteNote;

  browser.tabs.onActivated.addListener(loadNote);
  browser.tabs.onUpdated.addListener(loadNote);

  await loadNote();
})();
