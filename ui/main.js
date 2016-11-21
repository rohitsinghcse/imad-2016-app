
var button = document.getElementById('counter');
button.onclick =function() {
  var request = new XMLHttpRequest();
  //capture the response and store it in a variable
  request.onreadystatechange =function () {
    if(request.readyState === XMLHttpRequest.DONE){
      if(request.status === 200){
        var counter = request.responseText;
        var span = document.getElementById('count');
        span.innerHTML = counter.toString();
      }
    }
  };
  //make the request
 // request.open('GET','http://localhost:8080/counter',true);
  request.open('GET','http://rohitsinghcse.imad.hasura-app.io/counter',true);
  
  request.send(null);
};
//Submit username /password to login
    
var login = document.getElementById('login_btn');
login.onclick = function () {
  var request = new XMLHttpRequest();
  //capture the response and store it in a variable
  request.onreadystatechange =function () {
    if(request.readyState === XMLHttpRequest.DONE){
      if(request.status === 200){
       console.log('user logged in');
       alert('Login successful');
      }
      else if (request.status ===403){
          alert('username/password is incorrect');
      }
      else if (request.status ===500){
          alert('Something went wrong with the server');
      }
    }
  };
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  console.log(username);
  console.log(password);
   //make the request
    request.open('POST','http://rohitsinghcse.imad.hasura-app.io/login');
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({username:"username",password:"password"}));
      
};




//another practical

var submit = document.getElementById('submit_btn');
submit.onclick = function () {
  var request = new XMLHttpRequest();
  //capture the response and store it in a variable
  request.onreadystatechange =function () {
    if(request.readyState === XMLHttpRequest.DONE){
      if(request.status === 200){
        // var names = ['name1','name2','name3','name4']; instead of hard coding
        var names = request.responseText;
        names = JSON.parse(names);
        var list = '';
        for(var i=0;i<names.length;i++)
        {
         list += '<li>'+names[i] +'</li>' ;
        }

        var ul = document.getElementById('nameList');
        ul.innerHTML =list;

        // var counter = request.responseText;
        // var span = document.getElementById('count');
        // span.innerHTML = counter.toString();
      }
    }
  };
  //make the request
  var nameInput = document.getElementById('name');
  var name = nameInput.value;
 // request.open('GET','http://localhost:8080/submit-name?name='+name,true);
  request.open('GET','http://rohitsinghcse.imad.hasura-app.io/submit-name?name='+name,true);
  request.send(null);
 //make a request to the server and send the name

 //capture a list of names and render it as a list
};



// console.log('Loaded!');
//
//
// //Change text
// var element = document.getElementById('content');
//
// console.log(element);
// element.innerHTML = 'Click on the image to move it left.';
//
// var image = document.getElementById('madi');
// var marginLeft =0;
// function moveRight() {
//   marginLeft = marginLeft +5;
//   image.style.marginLeft = marginLeft + 'px';
// }
//
// image.onclick = function () {
//   var interval = setInterval(moveRight,50);
// }
