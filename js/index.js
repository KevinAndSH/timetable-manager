const root = document.getElementById("root")
const title = document.getElementById("title")
const body = document.getElementById("body")

function makeHTMLCard (title, link, startTime, endTime, key = null) {
  return `
    <div class="card">
      <a class="card--title"" href=${link} target="_blank">
        ${title}
      </a>

      ${ key ? `
      <div class="card--key-container">
        <p class="card--key">
          <b>Passcode:</b> <span class="card--key__italic">${key}</span>
        </p>
        <button class="card--copy-btn"">Copy</button>
      </div>` : ""
      }

      <h3 class="card--subtitle">Schedule:</h3>
      <p class="card--schedule">${startTime} - ${endTime}</p>
    </div>
  `
}

function renderAddForm () {
  title.innerText = "Add new item"
  body.innerHTML = `
    <div class="add-form">
      <label for="title">Title</label>
      <input type="text" name="title">

      <label for="link">Link</label>
      <input type="text" name="link">

      <label for="key">Passcode (if exists)</label>
      <input type="text" name="key">

      <label for="start-time">Starts at:</label>
      <input type="time" name="start-time">

      <label for="end-time">Ends at:</label>
      <input type="time" name="end-time">
    </div>
    <button class="switch-btn">Save</button>
  `

  document.querySelector(".switch-btn").addEventListener("click", saveNewItem)
}

async function copyText(keyEl) {
  const keyText = keyEl.innerText
  await navigator.clipboard.writeText(keyText)
}

function renderTimetable() {
  chrome.storage.local.get(["schedules"], res => {
    let bodyString = ""

    if (res.schedules?.length > 0) {
      res.schedules.forEach(sch => {
        bodyString += makeHTMLCard(sch.title, sch.link, sch.startTime, sch.endTime, sch.key)
      })
    } else {
      bodyString += `<h3 class="card--key">Nothing here yet...</h3>`
    }

    bodyString += `<button class="switch-btn">Add new item</button>`
    
    title.innerText = "Timetable"
    body.innerHTML = bodyString
  
    document.querySelector(".switch-btn").addEventListener("click", renderAddForm)
  
    body.addEventListener("click", e => {
      if (e.target.matches(".card--copy-btn") || e.target.matches(".card--title")) {
        copyText(e.target.parentElement.querySelector(".card--key__italic"))
      }
    })
  })
}

function saveNewItem() {
  const inputEls = document.querySelectorAll(".add-form input")

  const newItem = {
    title: inputEls[0].value,
    link: inputEls[1].value,
    key: inputEls[2].value,
    startTime: inputEls[3].value,
    endTime: inputEls[4].value,
  }

  if (!newItem.title || !newItem.startTime || !newItem.endTime) {
    title.innerText = "Add new item, but do it right this time"
  } else {
    chrome.storage.local.get(["schedules"], res => {
      res.schedules.push(newItem)
      chrome.storage.local.set({schedules: res.schedules})
      renderTimetable()
    })
  }
}


//* Main script
renderTimetable()
