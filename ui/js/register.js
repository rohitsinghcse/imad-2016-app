//registration
var register = document.getElementById('register_btn');
register.onclick = function () {
  var request = new XMLHttpRequest();
  //capture the response and store it in a variable
  request.onreadystatechange =function () {
    if(request.readyState === XMLHttpRequest.DONE){
      if(request.status === 200){
       console.log('user logged in');
       alert('Registration successful');
      }
      else if (request.status ===500){
          alert('Something went wrong with the server');
      }
    }
  };
  
  //registration module
  var user = document.getElementById('user').value;
  var pass = document.getElementById('pass').value;
  console.log(user);
  console.log(pass);
   //make the request
    request.open('POST','http://rohitsinghcse.imad.hasura-app.io/create-user');
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({username:"user",password:"pass"}));
      
};