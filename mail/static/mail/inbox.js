document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

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
    });
  }

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  fetch('/emails/inbox')
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      for(key in result){
        email = result[key]
        console.log(email)
        document.querySelector('#emails-view').innerHTML += `
          <div class=\"container\"><div><h4>From: </h4></div><div><p>${email.sender}</p></div></div>
          <div class=\"container\"><h4>To: </h4><p>${email.recipients}</p></div>
          <div class=\"container\"><h4>Subject: </h4><p>${email.subject}</p></div>
          <div class=\"container\"><h4>Timestamp: </h4><p>${email.timestamp}</p></div>
        <hr>`;
      }

  }).catch((err) => console.log(err));
     


}