//registration
var register = document.getElementById('register_btn');
register.onclick = function () {
  var newRequest = new XMLHttpRequest();
  //capture the response and store it in a variable
  newRequest.onreadystatechange =function () {
    if(newRequest.readyState === XMLHttpRequest.DONE){
      if(newRequest.status === 200){
          alert('Registration successful');
      }
      else if(newRequest.status ===500){
          alert('Something went wrong with the server');
        }
    }
  };
  
  //registration module
  var newUsername = document.getElementById('user').value;
  var newPassword = document.getElementById('pass').value;
  console.log(newUsername);
  console.log(newPassword);
   //make the request
    newRequest.open('POST','http://rohitsinghcse.imad.hasura-app.io/create-user');
    newRequest.setRequestHeader('Content-Type','application/json');
    newRequest.send(JSON.stringify({newUsername:newUsername,newPassword:newPassword}));
    
};
