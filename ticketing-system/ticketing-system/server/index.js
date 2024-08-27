'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');
const dao = require('./dao');
const passport = require('passport'); // auth middleware
const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = '47e5edcecab2e23c8545f66fca6f3aec8796aee5d830567cc362bb7fb31adafc';
const { check, validationResult } = require("express-validator");
 

const LocalStrategy = require('passport-local'); 
const app = new express();
const session = require('express-session'); 
const dayjs = require('dayjs');

const port = 3001;
const expireTime = 6000; 

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));



// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); 



passport.use(new LocalStrategy(
  function(username, password, done) {
    dao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username or password.' });
        
      return done(null, user);
    })
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  dao.getUserById(id)
    .then(user => {
      done(null, user); 
    }).catch(err => {
      done(err, null);
    });
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

app.use(session({
  secret: "thisisthewebapplicationexamticketingsystemmmmmmmmmmm",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: app.get('env') === 'production' ? true : false },
}));

app.use(passport.initialize());
app.use(passport.session());


/*** APIs ***/

// GET /api/tickets
app.get('/api/tickets', (req, res) => {
  dao.getTickets(req.query.filter)
    .then(tickets => res.json(tickets))
    .catch((err) => res.status(500).json(err));
});

// GET blocks only if logged
app.get('/api/blocks',isLoggedIn,
  (req,res) => {
  dao.getBlocks().then(blocks => res.json(blocks)).catch((err) => res.status(500).json(err));
})

// POST /api/blocks     insert a new block
app.post('/api/blocks',isLoggedIn,[
  check('ticket').isInt({min: 1}),
  check('description').isString().isLength({min: 1})
],
async (req,res) => {
  const err = validationResult(req);
  const errList = [];
  if (!err.isEmpty()) {
    errList.push(...err.errors.map(e => e.msg));
    return res.status(400).json({ errors: errList });
  }
  const block = {
    user: req.user.id,
    ticket: req.body.ticket,
    description: req.body.description,
    author: req.user.name,
    timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss')
  };

  try {
    const result = await dao.createBlock(block);
    if (result.error){
      return res.status(403).json(result);
    }
    return res.json(result);
  } catch (err){
    return res.status(503).json({error: 'Error during the creation of a new block'});
  }
})

// POST /api/tickets  
// insert a new ticket
app.post('/api/tickets',isLoggedIn,[
  check('cat').isString().isLength({min: 1}),
  check('tit').isString().isLength({min: 1}),
  check('des').isString().isLength({min: 1}),
],
async (req,res) => {
  const err = validationResult(req);
  const errList = [];
  if (!err.isEmpty()) {
    errList.push(...err.errors.map(e => e.msg));
    return res.status(400).json({ errors: errList });
  }
  const t = dayjs().format('YYYY-MM-DD HH:mm:ss');

  const ticket = {
    state: 'open',
    category: req.body.cat,
    title: req.body.tit,
    timestamp: t,
    author: req.user.name,
    owner: req.user.id,
  }

  const block={
    user: req.user.id,
    author: req.user.name,
    ticket: req.body.cod,
    description: req.body.des,
    timestamp: t
  }
 
  try {
    const result = await dao.createTicket(ticket);
    if (result.error){
      return res.status(403).json(result);
    }
    const res2 = await dao.createBlock(block);
    return res.status(200).json(result)
  }catch (err){
    return res.status(503).json({error: 'Error during the creation of a new ticket'});
  }
})

// updateCategory
app.put('/api/tickets/:id/category',isLoggedIn, 
  [check('code','the code must be an integer').isInt({min: 1}),
   check('category','invalid category').isString().isLength({min: 1}), 
  ]
  ,async (req,res) => {
    const err = validationResult(req);
    const errList = [];
    if (!err.isEmpty()) {
      errList.push(...err.errors.map(e => e.msg));
      return res.status(400).json({errors: errList});
    }
    try {
      const ticket = await dao.getTicket(req.params.id);
      if (ticket.error) {
        return res.status(401).json(ticket);
      }
      ticket.category = req.body.category;
      const result = await dao.upCat(ticket, ticket.code, req.user.admin);
      if (result.error) {
        return res.status(401).json(result);
      }
      return res.json(result);
    } catch (err) {     
      return res.status(503).json({ error: `Database error during the category update of ticket ${req.params.id}` });
    }
});

//update the state
app.put('/api/tickets/:id/state', isLoggedIn,[
  check('code','the code must be an integer').isInt({min: 1}),
  check('state','invalid category').isString().isLength({min: 1}), 
],async (req,res) => {

  const err = validationResult(req);
  const errList = [];
  if (!err.isEmpty()) {
    errList.push(...err.errors.map(e => e.msg));
    return res.status(400).json({ errors: errList });
  }
  try{
    const ticket = await dao.getTicket(req.params.id);
    if (ticket.error){
      return res.status(404).json(ticket);
    }
    if (req.user.admin == 1){
      ticket.state = req.body.state;
      const result = await dao.upSta(ticket,ticket.code,req.user);
      if (result.error){
        return res.status(401).json(result);
      }
      return res.json(result);
    } else {
      ticket.state = req.body.state;
      const result = await dao.upSta(ticket,ticket.code,req.user);
      if (result.error){
        return res.status(401).json(result);
      }
      return res.json(result);
    }

  }catch(err){
    return res.status(503).json({ error: `Database error during the state update of ticket ${req.params.id}` });
  }
})





/*** Users APIs ***/

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      return res.status(401).json({ "error": "incorrect username and/or password" });
    }
    req.login(user, (err) => {
      if (err)
        return next(err);

      return res.json(req.user);
    });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', isLoggedIn,(req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', isLoggedIn,(req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});


/*** Token ***/

// GET /api/auth-token
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  let authLevel = req.user.admin;

  const payloadToSign = { access: authLevel, userId: req.user.id };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {expiresIn: expireTime});

  res.json({token: jwtToken});  
});

// activate the server

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});