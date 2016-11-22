var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto =require('crypto');
var bodyParser = require('body-parser');
var session =require('express-session');


var config = {
    user : 'rohitsinghcse',
    database : 'rohitsinghcse',
    host :'db.imad.hasura-app.io',
    port :'5432',
    password :process.env.DB_PASSWORD 
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({ 
    secret: 'anythingRandom',
    cookie :{maxAge : 1000*60 *60* 24 *30}
    
    }));

//server-side templating

var articles ={
   'article-one'  :{  //object
    title : 'Article-one Rohit Singh',
    heading : 'Article-one',
    date :  'Sep 5, 2016',
    content : `
    <p>
      This is the content for my first article.This is the content for my first article.
      This is the content for my first article.This is the content for my first article.
      This is the content for my first article.This is the content for my first article.
    </p>
    <p>
      This is the content for my first article.This is the content for my first article.
      This is the content for my first article.This is the content for my first article.
      This is the content for my first article.This is the content for my first article.
    </p>
    <p>
      This is the content for my first article.This is the content for my first article.
      This is the content for my first article.This is the content for my first article.
      This is the content for my first article.This is the content for my first article.
    </p>`
  },
   'article-two' : {
     title : 'Article-two Rohit Singh',
     heading : 'article-two',
     date :  'Sep 15, 2016',
     content : `
     <p>
     This is the content for my second article.
     </p>
    `
     },
    'article-three' : {
     title : 'article-three  Rohit Singh',
     heading : 'Article-three',
     date :  'Sep 25, 2016',
     content : `
     <p>
       This is the content for my third article.
     </p>
    `
   }
 };


function createTemplate(data) {
  var title = data.title;
  var date = data.date;
  var heading = data.heading;
  var content = data.content;
  var htmlTemplate =
    `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <meta name="viewport" content="width-device-width,initial-scale=1"/>
        <link href="/ui/style.css" rel="stylesheet" />
      </head>
      <body>
        <div class="container">
            <div class="">
                <a href="/">Home</a>
            </div>
            <hr>
            <h3>${heading}</h3>
            <div class="">
              ${date.toDateString()}
            </div>
            <div class="">
              ${content}
            </div>
        </div>
      </body>
    </html>
  `;
  return htmlTemplate;
}

var counter =0;
app.get('/counter',function (req,res) {
  counter = counter +1;
  res.send(counter.toString());
});


function hash(input,salt){
    //create a hash 
    var hashed = crypto.pbkdf2Sync(input,salt,10000,512,'sha512');
    return ["pbkdf2","10000",salt,hashed.toString('hex')].join('$');
}

app.get('/hash/:input',function(req,res){
    var hashedString = hash(req.params.input,'this-is-some-random-string');
    res.send(hashedString);
});

var pool= new Pool(config);
//register user start
app.post('/register-user',function(req,res){
 var uname = req.body.uname;
 var passwd =req.body.passwd;
 var salt = crypto.randomBytes(128).toString('hex');
 var dbString = hash(passwd,salt);
 pool.query('INSERT INTO users (username,password) VALUES ($1,$2)',[uname,dbString],function(err,result){
  if(err){
    res.status(500).send(err.toString());
  }
  else{
    res.status(200).send('User created successfully'+uname);
  }
 });
});
//register user end

//create user start
//  app.post('/create-user',function(req,res){
//     //username ,password
//     //JSON request
//     console.log('inside create user');
//     var newUsername = req.body.newUsername; //Request body req.body
//     var newPassword = req.body.newPassword;
//     var salt = crypto.randomBytes(128).toString('hex');
//     var dbString = hash(newPassword,salt);
//     pool.query('INSERT INTO "users" (username,password) VALUES ($1,$2)',[newUsername,dbString],function(err,result){
//       if(err){
//             console.log("inside 500");
//             res.status(500).send(err.toString());
          
//       } 
//       else{
//           res.status(200).send('User successfully created'+username);
//       }
//     });
// });

//create user end

app.post('/login',function(req,res){
    var username = req.body.username; //Request body req.body
    var password = req.body.password;
    pool.query('SELECT * FROM USERS WHERE username = $1 ' ,[username],function(err,result){
      if(err){
          res.status(500).send(err.toString());
      } 
      else {
          if(result.rows.length ===0){
              res.status(403).send('Username/password is invalid');        
      }else{
        //match the password
          var dbString =result.rows[0].password;
          var salt = dbString.split('$')[2];
          var hashedPassword = hash(password,salt);
          if(hashedPassword ===dbString){
              //set the session
              req.session.auth ={userId:result.rows[0].id};
            res.send('Logged in ');
            
          }else
          {
           res.status(403).send('Username/password is invalid');        
          }
      }
          
      }
    });
});

//check login endpoint starts
    app.get('/check-login',function(req,res){
       if(req.session && req.session.auth && req.session.auth.userId) {
           res.send("you are logged in "+req.session.auth.userId.toString());
       }
       else{
           res.send("You are not logged in ");
       }
    });


//check login endpoint ends

//logout endpoint starts
    app.get('/logout',function(req,res){
       delete  req.session.auth;
       res.send("you are logged out");
    });
    
//logout endpoint ends



app.get('/test-db',function(req,res){
   //make a select request 
   pool.query('SELECT * from test',function(err,result){
      if(err){
          res.status(500).send(err.toString());
      } 
      else{
          res.send(JSON.stringify(result.rows));
      }
   });
   //return the response with the results
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/registration.html', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'registration.html'));
});


var names =[];
app.get('/submit-name',function (req,res) { //submit-name?name=xxxxx
  //Get the name from the request
  var name =  req.query.name;
  names.push(name);
  //JSON
  res.send(JSON.stringify(names));
});
//fetch artilces from db start
//app.get('/articles/:articleName',function(req,res){
// pool.query("SELECT * FROM articles WHERE title ='"+ req.params.articleName+"'",function(err,result){
    pool.query("SELECT * FROM articles WHERE title = $1",[req.params.articleName],function(err,result){
    
  if(err){
  res.status(500).send(err.toString());
  }else{
    if(result.rows.length===0){
      res.status(400).send('Article not found');
    }else{
        var articleData = result.rows[0];
        res.send(createTemplate(articleData));
    }
  }

});
});
//fetch artilces from db end

app.get('/articles/:articleName',function (req,res) {
  var articleName = req.params.articleName;
  res.send(createTemplate(articles[articleName]));
});

// app.get('/article-one',function(req,res)
// {
//      //res.sendFile(path.join(__dirname, 'ui', 'article-one.html'));
//      res.send(createTemplate(articleOne));
// });
// app.get('/article-two',function(req,res)
// {
//     res.sendFile(path.join(__dirname, 'ui', 'article-two.html'));
// });
// app.get('/article-three',function(req,res)
// {
//     res.sendFile(path.join(__dirname, 'ui', 'article-three.html'));
// });

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


app.get('/img/linkedin.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'img', 'linkedin.png'));
});

app.get('/ui/main.js',function (req,res) {
  res.sendFile(path.join(__dirname,'ui','main.js'));
});

app.get('/ui/js/register.js',function(req,res){
    res.sendFile(path.join(__dirname,'ui/js','register.js'));
    
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}`);
});
