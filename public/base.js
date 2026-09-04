async function init() {
  if (!globalThis.Temporal) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src =
        'https://cdn.jsdelivr.net/npm/temporal-polyfill@1.0.4/global.min.js'

      script.onload = resolve
      script.onerror = reject

      document.head.appendChild(script)
    })
  }
}

init()

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateTime(value) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatTime(value) {
  return timeFormatter.format(new Date(value));
}

export function formatAllDay(value) {
  return value;
}



// const formatter = new Intl.DateTimeFormat(undefined, {
//     dateStyle: "medium",
//     timeStyle: "short",
// });
export function localizeTimes() {
  for (const el of document.querySelectorAll("time.localized")) {
    const date = new Date(el.dateTime);
    if (el.classList.contains("datetime")) {
      el.textContent = formatDateTime(date);
    } else if (el.classList.contains("time")) {
      el.textContent = formatTime(date);
    } else if (el.classList.contains("date")) {
      el.textContent = formatAllDay(date);
    }
  }
}

localizeTimes();
