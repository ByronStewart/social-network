document.addEventListener("DOMContentLoaded", async function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", async () => await load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", async () => await load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", async () => await load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  await load_mailbox("inbox");
});

function compose_email(_,reply) {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#detail-view").style.display = "none";

  // Clear out composition fields
  const composeRecipients = document.querySelector("#compose-recipients")
  const composeSubject = document.querySelector("#compose-subject")
  const composeBody = document.querySelector("#compose-body")

  composeRecipients.value = ""
  composeSubject.value = ""
  composeBody.value = ""

  // if it is a reply fill form with new values
  if (reply !== undefined) {
    composeRecipients.value = reply.sender
    console.log(reply.subject)
    if (reply.subject.slice(0,4) === "Re: "){
      
      composeSubject.value = reply.subject
    } else {
      composeSubject.value = "Re: " + reply.subject
    }
    composeBody.value = `\n\nOn ${reply.timestamp} ${reply.sender} wrote:\n${reply.body}`
  }

  const composeForm = document.getElementById("compose-form");

  // logic to submit the form
  composeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
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
    const data = await response.json();

    if (response.status == 201) {
      await load_mailbox("inbox");
    } else {
      console.log(data.error);
    }
  });
}

async function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  const container = document.querySelector("#emails-view");
  container.style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#detail-view").style.display = "none";

  // Show the mailbox name
  container.innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // Get the mail
  const response = await fetch(`/emails/${mailbox}`);
  const data = await response.json();

  for (const email of data) {
    // create the email element

    const element = createEmailCard(email);

    // attach it to the container
    container.appendChild(element);
  }
}

function createEmailCard({ sender, subject, timestamp, read, id }) {
  const card = document.createElement("div");
  card.classList.add("card", "mb-3");
  card.style.cursor = "pointer"
  card.addEventListener("click", async () => {
    const response = await fetch(`/emails/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        read: true,
      }),
    });
    await loadEmailDetail(id);
  });

  /* body with details */
  const cardBody = document.createElement("div");
  if (read) {
    cardBody.classList.add("bg-light");
  }
  cardBody.classList.add("card-body");

  const title = document.createElement("h5");
  title.classList.add("card-title");
  title.innerText = "subject: " + subject;

  const subtitle = document.createElement("h6");
  subtitle.classList.add("card-subtitle", "mb-2", "text-muted");
  subtitle.innerText = "from " + sender;

  const cardText = document.createElement("p");
  cardText.classList.add("card-text");
  cardText.innerText = timestamp;

  cardBody.appendChild(title);
  cardBody.appendChild(subtitle);
  cardBody.appendChild(cardText);

  card.appendChild(cardBody);

  return card;
}

async function loadEmailDetail(id) {
  // show the email and hide other views
  let isArchived;

  const container = document.querySelector("#detail-view");
  container.style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#emails-view").style.display = "none";

  // load the data from the email
  const response = await fetch(`/emails/${id}`);
  const email = await response.json();

  isArchived = email.archived

  document.querySelector("#email-sender").innerText = email.sender;
  document.querySelector("#email-subject").innerText = email.subject;
  document.querySelector("#email-timestamp").innerText = email.timestamp;
  document.querySelector("#email-body").innerText = email.body;

  const recipientsList = document.querySelector("#recipients-list");
  recipientsList.innerHTML = "";
  for (const recipient of email.recipients) {
    const li = document.createElement("li");
    li.innerText = recipient;
    recipientsList.appendChild(li);
  }

  const archiveBtn = document.createElement("button")
  archiveBtn.classList.add("btn", "btn-info")
  archiveBtn.innerText = !isArchived ? "Archive" : "unarchive"
  archiveBtn.addEventListener("click", async () => {

    const response = await fetch(`/emails/${id}`, {
      method : "PUT",
      body : JSON.stringify({
        archived : !isArchived
      })
    })
    if (response.ok) {
      isArchived = !isArchived
      archiveBtn.innerText = !isArchived ? "Archive" : "Unarchive"
      await load_mailbox("inbox")
    }
  })

  const replyBtn = document.createElement("button")
  replyBtn.classList.add("btn", "btn-primary", "btn-outline")
  replyBtn.innerText = "Reply"
  replyBtn.addEventListener("click", (e) => {
    compose_email(e, email)
  })

  document.querySelector("#email-archive-btn-container").innerHTML = ""
  document.querySelector("#email-archive-btn-container").appendChild(replyBtn)
  document.querySelector("#email-archive-btn-container").appendChild(archiveBtn)

  
}
