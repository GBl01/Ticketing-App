import { React,useEffect,useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Accordion,Form,Alert} from 'react-bootstrap'
import API from './API';
import { Link } from 'react-router-dom';


function TicketsBlocks(props){

  const filterQueryId = props.filter || '';

  const [modCat, setModCat] = useState(false);
  const [newCat, setNewCat] = useState('maintenance');
  const [edId, setEdId] = useState('');
  const [modSta, setModSta] = useState(false);
  const [newSta, setNewSta] = useState('open');
  const [errorMessage, setErrorMessage] = useState('')
  const [signalExp,setSignal] = useState(false);
  

  useEffect(() => {
    if (props.tickets.length > 0) {
      if (props.authToken && props.user.admin) {
        if (Array.isArray(props.tickets)) {
          API.getTicketStats(props.authToken, props.tickets)
            .then(stats => {
              props.setTickStats(stats)
            })
            .catch(err => {
              API.getAuthToken()
                .then(resp => {
                  props.setAuthToken(resp.token)
                  setSignal(true);
                });
            });
        }
      }
    }
  }, [props.tickets, props.authToken]);

  //to handle case where token expires: call stats with the new token
  useEffect(() => {
    if (signalExp) {
      API.getTicketStats(props.authToken, props.tickets)
        .then(stats => {
          props.setTickStats(stats);
          setSignal(false);
        }).catch(err => console.log(err))
    }
  },[signalExp]);


  // retrieve blocks only if logged
  useEffect(() => {
    if (props.isLogged){
      API.getBlocks()
      .then(bl => {
        props.setBlocks(bl);
      })
      .catch(e => console.log(e))
    }
  },[])

  const handleClick1 = (e,t) => {
    e.stopPropagation();
    setEdId(t);
    setModCat(true);
  }

  const handleClick2 = (e,t) => {
    e.stopPropagation();
    setEdId(t);
    setModSta(true);
  }

  const handleSave1 = (e,t) => {
    e.stopPropagation();
    const chang = {
      category: newCat,
      code: t
    }
    API.upCat(chang).then(t => {
      props.setDirty(true);
      setModCat(false);
      setNewCat('maintenance');
    }).catch(err => setErrorMessage(err.error));
  
  } 

  const handleSave2 = (e,t) => {
    e.stopPropagation();
    const chang = {
      state: newSta,
      code: t
    }
    API.upSta(chang).then(t => {
      props.setDirty(true);
      setModSta(false);
    }).catch(err => setErrorMessage(err.error));
  }

  const handleCancel1 = (e) => {
    e.stopPropagation();
    setNewCat('maintenance');
    setModCat(false);
  }

  const handleCancel2 = (e) => {
    e.stopPropagation();
    setNewSta('open');
    setModSta(false);
  }

  return (
    <>
    {errorMessage ? <Alert variant='danger'style={{marginTop: '10px'}} dismissible onClick={()=>setErrorMessage('')}>{errorMessage}</Alert> : ''}
    <Accordion defaultActiveKey={['0']} alwaysOpen style={ {marginTop: '20px'}}>
      {props.tickets.map( (t) => (
        <Accordion.Item eventKey={t.code} key={t.code} >
          <Accordion.Header ><p><b>Date:</b> {t.timestamp.format("YYYY-MM-DD HH:mm:ss")} <b className='ms-4'>Title:</b> {t.title}</p> <p className='me-4 ms-4'> <b>Author:</b> {t.author} </p>
            { (modCat && t.code === edId) ? 
                <span className='ms-3'>
                  <p className='me-5'><b>Category: </b></p>
                  <Form.Control as="select" value={newCat} onChange={(e) => setNewCat(e.target.value)} style={{ width: '120px' }} onClick={ (e) => e.stopPropagation()} key={t.code}>
                    <option value='maintenance'>maintenance</option>
                    <option value='inquiry'>inquiry</option>
                    <option value='payment'>payment</option>
                    <option value='administrative'>administrative</option>
                    <option value='new feature'>new feature</option>
                  </Form.Control>
                </span>
             : <p><b>Category: </b>{t.category.toLowerCase()}</p>}
            { (modCat && t.code === edId) ? 
            <span style={ {marginLeft: '20px', marginRight: '20px'}}>
              <i className="bi bi-save me-3" style={{fontSize: '1.2rem'}} onClick={ (e) => handleSave1(e,t.code)}></i> 
              <i className="bi bi-x-circle" style={{fontSize: '1.2rem'}} onClick={handleCancel1}></i>
            </span>
            :
            <span> {props.isLogged && props.user.admin == 1 ? <i className="bi bi-pencil ms-2 me-3" style={{fontSize: '1.2rem'}} onClick={ (e) => handleClick1(e,t.code)} ></i> : ''}</span>} 
           
            { (modSta && t.code == edId) ? 
              <span>
                <span className='me-4'><b>State: </b></span>
                <Form.Control as="select" value={newSta} onChange={(e) => setNewSta(e.target.value)} style={{ width: '100px' }} onClick={(e) => e.stopPropagation()}>
                  <option >open</option>
                  <option >closed</option>
                </Form.Control>
              </span>
            : <p className='ms-3'><b>State: </b><b style={{color: t.state == 'closed' ? 'red' : 'green'}}>{t.state}</b></p>}
            {(modSta && t.code === edId) ?
              <span style={{ marginLeft: '20px', marginRight: '20px' }}>
                <i className="bi bi-save me-3" style={{ fontSize: '1.2rem' }} onClick={(e) => handleSave2(e, t.code)}></i>
                <i className="bi bi-x-circle" style={{ fontSize: '1.2rem' }} onClick={handleCancel2}></i>
              </span>
              :
              <span>{props.isLogged && ((t.owner == props.user.id) || props.user.admin == 1) ? <i className="bi bi-pencil ms-2 me-3" style={{ fontSize: '1.2rem' }} onClick={(e) => handleClick2(e, t.code)} ></i> : ''}</span>}
              { props.isLogged && props.user.admin  == 1 && t.state == 'open' ? 
              <span>
                <p className='ms-2'> <b style={{color: 'green'}}>Estimated closing time:</b> {props.tickStats.filter((s) => 
                s.code == t.code 
              ).map((e) => (
                    e.estimation
                ))}h </p> </span> : '' }
            {props.isLogged && t.state == 'open' ? 
            <Link to="/addB" state={{ticket: t, user: props.user}} className='ms-3'>
              <i className="bi bi-plus-circle" style={{marginLeft: '20px',fontSize: '1.4rem' }}></i>
            </Link>
            : '' }
          </Accordion.Header>
          { props.isLogged? props.blocks.filter( (b) => b.ticketid == t.code).map( (b) => (
            <Accordion.Body key={b.blockid} className='border'>
              <span style={{color: 'rgb(10,10,10)', fontWeight: '600'}}>Author:</span> {b.author} | <span style={{color: 'rgb(10,10,10)', fontWeight: '600'}}>Date:</span> {b.timestamp.format("YYYY-MM-DD HH:mm:ss")} 
              <p style={{ whiteSpace: 'pre-wrap',fontStyle: 'italic' }}>{b.desc}</p>
            </Accordion.Body>
          )): ''}
        </Accordion.Item>
      ))}
      
    </Accordion>  
    </>
  )

}

export {TicketsBlocks}