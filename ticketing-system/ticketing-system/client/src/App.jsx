import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { React, useState, useEffect } from 'react';
import { Container, Row, Col, Button,Spinner } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Outlet, useNavigate} from 'react-router-dom';

import { Navigation,Filter,NotFoundPage } from './Layout';
import { AuthN } from './Auth';
import { TicketsBlocks } from './TicketsBlocks';
import { AddBlock } from './AddBlock';
import { AddT } from './AddT';
import { AddTFinal } from './AddTFinal';
import API from './API';


function App() {
  return (
    <BrowserRouter>
      <Main/>
    </BrowserRouter>
  );
}


function Main() {

  const navigate = useNavigate();

  
  const [ticketList, setTicketList] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);  
  const [filter,setFilter] = useState("Filter");
  const [dirty, setDirty] = useState(false);
  const [user,setUser] = useState(undefined);
  const [ blocks, setBlocksList ] = useState([]);
  const [addT,setAddT] = useState(false); 
  const [fieldT, setFieldT] = useState({});
  const [authToken, setAuthToken] = useState(undefined);
  const [tickStats,setTickStats] = useState([]);
  const [tempStat,setTempStat] = useState({});
  const [loading,setLoading] = useState(true);

  const filters = {
    'Filter': { label: 'Filter', url: '/', filterFunction: () => true },
    'Inquiry': { label: 'Inquiry', url: '/filter/inquiry', filterFunction: ticket => ticket.category == 'inquiry' },
    'Maintenance': { label: 'Maintenance', url: '/filter/maintenance', filterFunction: ticket => ticket.category == 'inquiry' },
    'New feature': { label: 'New feature', url: '/filter/new feature', filterFunction: ticket => ticket.category == 'new feature' },
    'Administrative': { label: 'Administrative', url: '/filter/administrative', filterFunction: ticket => ticket.category == 'administrative' },
    'Payment': { label: 'Payment', url: '/filter/payment', filterFunction: ticket => ticket.category == 'payment' }
  };



  const renewToken = () => {
    API.getAuthToken().then((resp) => { setAuthToken(resp.token); } )
    .catch(err => {console.log("DEBUG: renewToken err: ",err)});
  }

  const loginOk = (user) => {
    try {
      setUser(user);
      setLoggedIn(true);
      renewToken();
    }catch(err){
      console.log('errore')
    }
  }

  const logOut = async () => {
    
    
    await API.logOut().then( () => {
      setLoggedIn(false);
      setUser(undefined);
      setBlocksList([]);
      setAuthToken(undefined);
      setTickStats([]);
      navigate("/");
    }).catch(e => {
      console.log(e)
    });
    
    // setDirty ... ?
    /* set state to empty if appropriate */
    //setAuthToken('');  // NB: this does not invalidate token, it just removes it from the app
  }

  useEffect(() => {
    setDirty(true);
  }, [filter]);

  useEffect(() => {
    if (dirty) {
      API.getTickets(filter)
      .then(t => {
        setTicketList(t);
        setDirty(false);
        setLoading(false);
      })
      .catch(e => console.log(e)); 
    }
  }, [dirty]);

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
        API.getAuthToken().then((resp) => { setAuthToken(resp.token); })
      } catch(err) {
        // NO need to do anything: user is simply not yet authenticated
        //handleError(err);
      }
    };
    checkAuth();
  }, []);

  return (
      <Routes>
        <Route path="/" element={<Layout isLogged={loggedIn} logout={logOut} user={user}/>} >
          <Route index element={loading ? <MySpinner /> : <TickBlock user={user} isLogged={loggedIn} tickets={ticketList} setTicketList={setTicketList}
           filts={filters} filter={filter} setFil={setFilter} blocks={blocks}
           setBlocks={setBlocksList} dirty={dirty} setDirty={setDirty} 
           addT={addT} setAddT={setAddT} fieldT={fieldT} setFieldT={setFieldT}
           tickStats={tickStats} setTickStats={setTickStats} authToken={authToken} setAuthToken={setAuthToken}
           numTick={ticketList.length} renewToken={renewToken} logOut={logOut}/> } />
          <Route path="addB" element={<AddBlock />} />
          <Route path="addT" element={<AddTFinal fieldT={fieldT} setFieldT={setFieldT} setAddT={setAddT} numTick={ticketList.length} user={user}
          tickStats={tickStats} setTickStats={setTickStats} authToken={authToken} setAuthToken={setAuthToken}
          tempStat={tempStat} setTempStat={setTempStat} setDirty={setDirty}/>} />
        </Route>
        <Route path="/login" element={<AuthN logSucc={loginOk} />} />
        <Route path="*" element={<NotFoundPage/>}/>
      </Routes>
  )
}

function Layout(props) {
  return (
    <>
      <Navigation logged={props.isLogged} logout={props.logout} user={props.user}/>
      <Outlet />
    </>
  );
}

function TickBlock(props){
  return(
    <>
    <Container fluid style={ {marginTop: '100px'}}>
      <Row className='justify-content-center'>
        <Col lg>
          <Filter filts={props.filts} filter={props.filter} setFil={props.setFil}/>
        </Col>
        <Col lg>
          <Button variant="outline-secondary" style={{ borderRadius: '50px',marginLeft: '600px'}} onClick={() => props.setAddT(true)} disabled={props.isLogged ? false : true}>
            New Ticket
          </Button>
        </Col>
      </Row>
      { (props.isLogged && props.addT) ? <AddT fieldT={props.fieldT} setFieldT={props.setFieldT} setAddT={props.setAddT}
    authToken={props.authToken}  numTick={props.numTick} />: ''}
      <Row>
        <Col>
          <TicketsBlocks user={props.user} tickets={props.tickets} setTicketList={props.setTicketList} filts={props.filters} filter={props.filter} setFil={props.setFilter} blocks={props.blocks} setBlocks={props.setBlocks}
          setDirty={props.setDirty} dirty={props.dirty} isLogged={props.isLogged}
          tickStats={props.tickStats} setTickStats={props.setTickStats} authToken={props.authToken} setAuthToken={props.setAuthToken}
          renewToken={props.renewToken} />
        </Col>
      </Row>
    </Container>
    
    </>
  )
}

function MySpinner() {
  return (
    <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}


export default App
