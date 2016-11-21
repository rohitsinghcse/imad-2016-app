var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto =require('crypto');
var bodyParser = require('body-parser');

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

app.post('/create-user',function(req,res){
    //username ,password
    //JSON request
    console.log('inside create user');
    var username = req.body.username; //Request body req.body
    var password = req.body.password;
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password,salt);
    pool.query('INSERT INTO USERS (username,password) VALUES ($1,$2)',[username,dbString],function(err,result){
      if(err){
          
          alert('inside err');
          res.status(500).send(err.toString());
          
      } 
    //   else{
    //       if(results.rows.length===0){
    //         res.send(403).send('Username or password is invalid');
    //       }
    //       else{
    //       //Match the password
    //           var dbString = result.rows[0].password;
    //           var salt = dbString.split('$')[2];
    //           var hashedPassword = hash(password,salt);
    //           if(hashedPassword === dbString){
    //             res.send("Credentials are correct");
    //           }
    //           else{
    //             res.send(403).send('Username or password is invalid');
    //           }
    //       }
    //       res.send('User successfully created'+username);
    //   }
    });
});

app.post('/login',function(req,res){
    var username = req.body.username; //Request body req.body
    var password = req.body.password;
    pool.query('SELECT * FROM USERS WHERE username = $1 ' ,['username'],function(err,result){
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
            res.send('Logged in ');
          }else
          {
           res.status(403).send('Username/password is invalid');        
          }
      }
          
      }
    });
});



var pool= new Pool(config);

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

app.get('/articles/:articleName',function(req,res){
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

// app.get('/:articleName',function (req,res) {
//   var articleName = req.params.articleName;
//   res.send(createTemplate(articles[articleName]));
// });

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
