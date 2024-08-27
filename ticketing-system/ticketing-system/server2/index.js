'use strict';

const express = require('express');
const morgan = require('morgan'); 
const cors = require('cors');
const jwtSecret = '47e5edcecab2e23c8545f66fca6f3aec8796aee5d830567cc362bb7fb31adafc';
const { expressjwt: jwt } = require('express-jwt');
const {body } = require("express-validator");

//const jsonwebtoken = require('jsonwebtoken');
//const expireTime = 6000; 

// init express
const app = new express();
const port = 3002;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); 

// Check token validity
app.use(jwt({
  secret: jwtSecret,
  algorithms: ["HS256"],
})
);

app.use( function (err, req, res, next) {
  console.log("err: ", err);
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ errors: [{  'param': 'Server', 'msg': 'Authorization error', 'path': err.code }] });
  } else {
    next();
  }
} );


/*** APIs ***/
app.post('/api/tickets-stats',
  body('tickets','invalid array of tickets').isArray()
  ,(req,res) => {
  const admin = req.auth.access;
  const tickets = req.body;
  
  const results = [];

  for (const t of tickets){
    let title = t.title;
    let category = t.category;
    let numChar = (title + category).replace(/\s/g, '').length;
    let randomFactor = Math.floor(Math.random() * 240) + 1;
    let estimation = (numChar * 10) + randomFactor;
    if (admin == '1') {
      results.push({code: t.code, estimation: estimation});
    } else {
      const result = Math.round(estimation / 24);
      results.push({code: t.code, estimation: result});
    }
  }
  

  return res.json(results);
});




// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
