"use strict"

const sqlite = require("sqlite3");
const crypto = require("crypto");
const dayjs = require('dayjs');
const e = require("cors");
const { resolve } = require("path");
 
//wrapper functions

const db = new sqlite.Database('ticketDb.db', err => {
  if (err) throw err;
});

const filterValues = {
  'Inquiry':  { filterFunction: ticket => ticket.category == 'inquiry' },
  'Maintenance':      { filterFunction: ticket => ticket.category == 'maintenance' },
  'New Feature': { filterFunction: ticket => ticket.category == 'new feature' },
  'Administrative':    { filterFunction: ticket => ticket.category == 'administrative' },
  'Payment':       { filterFunction: ticket => ticket.category == 'payment' },
};
 
const filters = ['inquiry','maintenance','payment','new feature','administrative'];
const states = ['open','closed'];

// retrieve tickets
exports.getTickets = (filter) => {
  return new Promise((resolve, reject) => {
    const sql = "select state, code, category, owner, title ,timestamp,author from tickets order by timestamp desc";
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const tickets = rows.map((e) => ({ state: e.state, code: e.code, category: e.category, owner: e.owner, timestamp: dayjs(e.timestamp), title: e.title, author: e.author }));
      if (filter) {
        if (filterValues.hasOwnProperty(filter)) {
          resolve(tickets.filter(filterValues[filter].filterFunction));
          return;  
        }
      }
      resolve(tickets);
    });
  });
};

// retrieve blocks
exports.getBlocks = () => {
  return new Promise((resolve, reject) => {
    const sql = "select * from blocks order by timestamp asc";
    db.all(sql,[],(err,rows) => {
      if (err){
        reject(err);
        return;
      }
      const blocks = rows.map((e) => ({ author: e.author, ticketid: e.ticket, blockid: e.blockid, desc: e.description, timestamp: dayjs(e.timestamp)}));
      resolve(blocks);
    })
  })
}

// insert new block
exports.createBlock = (block) => { 
  return new Promise((resolve, reject) => {
    if (block.description.trim() == ''){
      resolve({error: 'Cannot add an empty block'});
    }
    db.get('SELECT state FROM tickets WHERE code=?',[block.ticket],(err,row) => {
      if (err){
        reject(err);
        return;
      }
      if (row && row.state=='open'){
        const sql2 = 'INSERT INTO blocks (user, ticket, description, timestamp, author) VALUES(?, ?, ?, ?, ?)';
        db.run(sql2, [block.user, block.ticket, block.description, block.timestamp, block.author], function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({message: 'Block added succesfully'});
      })
      }else{
        resolve({error: 'Cannot add block to a closed ticket'});
      }
    });
  }); 
};

// insert new ticket
exports.createTicket = (tick) => {
  if (tick.title.trim() == ''){
    resolve({error: 'Add a title'});
  }
  if (!filters.includes(tick.category.toLowerCase())){
    resolve({error: 'Insert a valid category'})
  }
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO tickets (state, category, timestamp, author, title, owner) VALUES(?, ?, ?, ?, ?,?)';
    db.run(sql, [tick.state, tick.category, tick.timestamp, tick.author, tick.title, tick.owner], function (err) {
      if (err) {
        reject(err);
        return;
      }
      // Returning the newly created object with the DB additional properties (i.e., unique id) to the client.
      resolve({message: 'Ticket added succesfully'});
    });
  });
}

//get ticket by id
exports.getTicket = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM tickets WHERE code=?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({ error: 'Ticket not found.' });
      } else {
        const ticket = { 
          state: row.state, code: row.code, category: row.category, owner: row.owner, timestamp: dayjs(row.timestamp), title: row.title, author: row.author 
        };
        resolve(ticket);
      }
    });
  });
}

// update category
exports.upCat = (tick,id,admin) => {
  return new Promise((resolve, reject) => {
    if (!filters.includes(tick.category)){
      resolve({error: 'Insert a valid category'})
    }
    if (admin == 1){
      const sql = 'UPDATE tickets SET category=? WHERE code=?';
      db.run(sql, [tick.category, id], function (err) {
        if (err) {
          reject(err);
          return;
        }
        if (this.changes !== 1) {
          resolve({ error: 'Ticket not found.' });
        } else {
          resolve({});
        }
      })
    } else {
      resolve({error: 'You are not an admin!'});
    }
  });
}

// update state
exports.upSta = (ticket,id,user) => {
  return new Promise((resolve,reject) =>{
    if (user.admin == 1){
      if (!states.includes(ticket.state)){
        resolve({error: 'Insert a valid state'});
      }

      const sql = 'UPDATE tickets SET state=? WHERE code=?';
      db.run(sql, [ticket.state,id], function (err) {
        if (err){
          reject(err);
          return;
        }
        else {
          resolve({});
        }
    })
    } else {
        const s = 'open';
        const sql = 'UPDATE tickets SET state=? WHERE code=? and owner =? and state=?';
        db.run(sql, [ticket.state, id,user.id,s], function (err) {
          if (err) {
            reject(err);
            return;
          }
          if (this.changes !== 1) {
            resolve({ error: 'you cannot modify the state of the ticket' });
          } else {
            resolve({});
          }
        })
      }
  });
}




exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) 
          reject(err);
        else if (row === undefined)
          resolve({error: 'User not found.'});
        else {
          // by default, the local strategy looks for "username":
          const user = {id: row.id, username: row.email, name: row.name, admin: row.admin}
          resolve(user);
        }
    });
  });
};

exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) { reject(err); }
      else if (row === undefined) { resolve(false); }
      else {
        const user = { id: row.id, username: row.email, name: row.name,admin: row.admin };
        const salt = row.salt;
        crypto.scrypt(password, salt, 64, (err, hashedPassword) => {
          if (err) reject(err);
          const passwordHex = Buffer.from(row.hash, 'hex');

          if (!crypto.timingSafeEqual(passwordHex, hashedPassword))
            resolve(false);
          else resolve(user);
        });
      }
    });
  });
};