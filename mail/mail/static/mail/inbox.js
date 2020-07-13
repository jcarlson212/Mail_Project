document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  const element = document.createElement('div');
  element.innerHTML = '';
  element.id = "email-view";
  element.style.display = "none";
  document.querySelector('.container').append(element);

  //add submit functionality for sending emails
  document.querySelector('#compose-form').onsubmit = function() {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent');
    });
  }

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

const reply = (email) => {
  compose_email()
  document.querySelector('#compose-recipients').value = [email.sender];
  document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
}

const createReplyButton = (email) => {
  const replyButton = document.createElement("button")
  replyButton.innerHTML = "Reply";
  replyButton.onclick = () => reply(email);
  return replyButton;
}

const viewEmail = (id, giveArchiveOptions) => {
  console.log(id)
  console.log(giveArchiveOptions)
  fetch('/emails/' + id)
  .then(response => response.json())
  .then(email => {
    console.log(email)
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#email-view').innerHTML = `
    <div class="email">
        <div><div><h4>From: </h4></div><div><p>${email.sender}</p></div></div>
        <div><h4>To: </h4><p>${email.recipients}</p></div>
        <div><h4>Subject: </h4><p>${email.subject}</p></div>
        <div><h4>Timestamp: </h4><p>${email.timestamp}</p></div>
        <div><h4>Body: </h4><p>${email.body}</p></div>
    </div>
    `

    const replyButton = createReplyButton(email)
    document.querySelector('#email-view').append(replyButton)
    if(giveArchiveOptions){
      let newNode = null;
  
      if(email.archived == false){
        //create a archive button
        newNode = document.createElement('button');
        newNode.isArchive = false;
      }else{
        //create a un-archive button
        newNode = document.createElement('button');
        newNode.isArchive = true;
      }
      newNode.onclick = () => {
        console.log("clicked1")
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !newNode.isArchive
          })
        })
        if(newNode.isArchive){
          newNode.isArchive = false;
          newNode.innerHTML = "Archive";
        }else{
          newNode.isArchive = true;
          newNode.innerHTML = "Un-archive";
        }
        setTimeout(() => load_mailbox('inbox'), 10);
        
      }
      newNode.innerHTML = newNode.isArchive ? "Un-archive" : "Archive";
      document.querySelector('#email-view').append(newNode)
    }
    
  })
  .then(fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })).catch((err) => console.log(err));
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  console.log(mailbox)
  let mailbox_name = mailbox.charAt(0).toUpperCase() + mailbox.slice(1);
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox_name}</h3>`;
  const giveArchiveOptions = (mailbox === 'inbox') || (mailbox === 'archive')
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      for(key in result){
        email = result[key]
        isRead = email.read ? "read" : "unread";
        console.log(email)
        document.querySelector('#emails-view').innerHTML += `
        <div class="email-item-${isRead}" onclick="viewEmail(${email.id}, ${giveArchiveOptions})">
            <div><div><h4>From: </h4></div><div><p>${email.sender}</p></div></div>
            <div><h4>To: </h4><p>${email.recipients}</p></div>
            <div><h4>Subject: </h4><p>${email.subject}</p></div>
            <div><h4>Timestamp: </h4><p>${email.timestamp}</p></div>
        </div>
        <hr>`;
      }

  }).catch((err) => console.log(err));
    


}