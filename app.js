
(() => {
  const form = document.getElementById("taskForm");
  const button = document.getElementById("saveButton");
  const message = document.getElementById("message");
  const config = window.APP_CONFIG;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    button.disabled = true;
    button.textContent = "Saving...";
    message.textContent = "";

    const record = {
      date: document.getElementById("date").value,
      task: document.getElementById("task").value.trim(),
      completed: document.getElementById("completed").value,
      reason: document.getElementById("reason").value.trim(),
      remarks: document.getElementById("remarks").value.trim()
    };

    const callback = "addTaskCallback";

    try {
      const url = new URL(config.API_URL);
      url.searchParams.set("action", "add");
      url.searchParams.set("pin", config.SHARED_PIN);
      url.searchParams.set("record", JSON.stringify(record));
      url.searchParams.set("callback", callback);

      const result = await new Promise((resolve, reject) => {
        const script = document.createElement("script");

        const timer = setTimeout(() => {
          delete window[callback];
          script.remove();
          reject(new Error("Request timed out. Please try again."));
        }, 15000);

        window[callback] = (data) => {
          clearTimeout(timer);
          delete window[callback];
          script.remove();
          resolve(data);
        };

        script.onerror = () => {
          clearTimeout(timer);
          delete window[callback];
          script.remove();
          reject(new Error("Could not connect to the server."));
        };

        script.src = url.href;
        document.body.appendChild(script);
      });

      if (!result.ok) {
        throw new Error(result.error || "Unable to add task.");
      }

      message.textContent = "Task added successfully!";
      message.style.color = "green";
      form.reset();

    } catch (error) {
      message.textContent = error.message;
      message.style.color = "red";
    } finally {
      button.disabled = false;
      button.textContent = "Add Task";
    }
  });
})();
