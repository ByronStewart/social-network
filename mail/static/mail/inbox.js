document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";

  const composeForm = document.getElementById("compose-form");
  /* strange bug where it submits multiple times */
  composeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("sending");
    const recipients = document.getElementById("compose-recipients").value;
    const subject = document.getElementById("compose-subject").value;
    const body = document.getElementById("compose-body").value;

    const response = await fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients,
        subject,
        body,
      }),
    });
    /*
    TODO
    fix the status code problem
    */
    if (response.status == 201) {
      load_mailbox("inbox");
    }
    const data = await response.json();
  });
}

async function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  const container = document.querySelector("#emails-view");
  container.style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // Get the mail
  const emails = await getEmail();
  console.log(emails);
  removeChildren(container);
  emails.forEach((email) => {
    renderEmail(email, container);
  });
}
async function getEmail(option = "inbox") {
  const response = await fetch(`/emails/${option}`);
  const data = await response.json();
  console.log(data);
  return data;
}

function renderEmail(email, container) {
  const sender = email.sender;
  const subject = email.subject;
  const timestamp = email.timestamp;

  const div = document.createElement("div");
  div.classList.add("email");
  const left = document.createElement("div");
  const senderContainer = document.createElement("div");
  senderContainer.textContent = sender;
  const subjectContainer = document.createElement("div");
  subjectContainer.textContent = subject;
  const timestampContainer = document.createElement("div");
  timestampContainer.textContent = timestamp;

  left.appendChild(senderContainer);
  left.appendChild(subjectContainer);
  div.appendChild(left);
  div.appendChild(timestampContainer);

  container.appendChild(div);
}
/**
 * @param {HTMLElement} node
 */
function removeChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
