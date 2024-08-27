import { React,useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Container,Button,Row,Col,Form,Alert} from 'react-bootstrap'
import {useNavigate } from 'react-router-dom';
import API from './API';

function AuthN(props){

  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('')

  const navigate = useNavigate();

  const logIn = (credentials) => {
    API.logIn(credentials)
      .then( user => {
        setErrorMessage('');
        props.logSucc(user);
        navigate('/');
      })
      .catch(err => {
        // NB: Generic error message, should not give additional info (e.g., if user exists etc.)
        setErrorMessage("Wrong username or password")
      })
  }


  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { username, password };
    setErrorMessage('');

    let valid = true;
    if (username === '' || password === '')
      valid = false;

    if (valid) {
      logIn(credentials);
    } else {
      setErrorMessage("username and password must no be empty!");
    }
  };

  return( 
    <Container fluid>      
      <Row className='justify-content-center' style={ {marginTop: '130px'}}>
      <Col md={3}>
      </Col>
        <Col>
        <i className="bi bi-ticket-perforated" style={{ fontSize: '40px'}}>TicketExam</i>
        {errorMessage ? <Alert variant='danger' dismissible onClick={()=>setErrorMessage('')}>{errorMessage}</Alert> : ''}
        </Col>
        <Col md={3}>
        </Col>
      </Row>
      <Row className='justify-content-center' style={ {marginTop: '40px'} }>
        <Col md={3}>
        </Col>
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" value={username} onChange={ (e) => setUsername(e.target.value)}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" value={password} onChange={ (e) => setPassword(e.target.value)}/>
            </Form.Group>
            <Button variant="outline-success" type="submit" >Login</Button>
            <Button variant="outline-danger" style={ {marginLeft: '590px'} } onClick={ () => navigate("/")}>
              Cancel
            </Button>
          </Form>
        </Col>
        <Col md={3}></Col>
      </Row>
    </Container>
  )
}

export { AuthN }