import dayjs from "dayjs";
import { resolvePath } from "react-router-dom";

const URL = 'http://localhost:3001/api';

function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> } 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {

         // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
         response.json()
            .then( json => resolve(json) )
            .catch( err => reject({ error: "Cannot parse server response" }))

        } else {
          // analyzing the cause of error
          response.json()
            .then(obj => 
              reject(obj)
              ) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch(err => 
        reject({ error: "Cannot communicate"  })
      ) // connection error
  });
}

async function getTickets(filter) {
  
  const response = await fetch(filter ? URL+'/tickets?filter=' + filter : URL + '/tickets');
  const tickets = await response.json();
  if (response.ok) {
    return tickets.map((e) => ({ state: e.state, code: e.code, category: e.category, owner: e.owner, timestamp: dayjs(e.timestamp), title: e.title,author: e.author }) )
  } else {
    throw tickets;  // expected to be a json object (coming from the server) with info about the error
  }
}

async function getBlocks() {
  
  const response = await fetch(URL + '/blocks', {
    credentials: 'include',
  });
  const blocks = await response.json();
  if (response.ok) {
    return blocks.map((e) => ({ author: e.author, ticketid: e.ticketid, blockid: e.blockid, desc: e.desc, timestamp: dayjs(e.timestamp)}) )
  } else {
    throw blocks;  // expected to be a json object (coming from the server) with info about the error
  }
}

async function addBlock(block) {
  return getJson(fetch(URL+'/blocks', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(block),
  }));
}

async function addTicket(ticket) {
  return getJson(fetch(URL+'/tickets', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ticket),
  }))
}

function upCat(prop){
  return getJson(fetch(URL + '/tickets/' + prop.code + "/category", {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(prop)
  }))
}

function upSta(prop){
  return getJson(fetch(URL + '/tickets/' + prop.code + "/state", {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(prop)
  }))
}




async function logIn (credentials) {
  const response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
    body: JSON.stringify(credentials),
  })
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
};

async function logOut() {
  await fetch(URL+'/sessions/current', {
    method: 'DELETE', 
    credentials: 'include' 
  });
}

async function getUserInfo() {
  const response = await fetch(URL+'/sessions/current', {
    credentials: 'include'
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}

async function getAuthToken() {
  return getJson(fetch(URL + '/auth-token', {
    // this parameter specifies that authentication cookie must be forwared
    credentials: 'include'
  })
  )
}

async function getTicketStats(authToken, tickets) {
  // retrieve info from an external server, where info can be accessible only via JWT token
  return getJson(fetch('http://localhost:3002/api/' + 'tickets-stats', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tickets),
  })
  );
}


const API = {getTickets, logIn, logOut, getUserInfo, getBlocks,addBlock, addTicket, upCat, upSta, getTicketStats,getAuthToken};
export default  API;