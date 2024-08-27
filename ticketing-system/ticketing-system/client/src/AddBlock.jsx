import { React,useState,} from 'react'
import {Row,Col,Container,Form,Button,Alert } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useLocation } from 'react-router-dom'
import API from './API';
import {useNavigate } from 'react-router-dom';


function AddBlock(){

  const [bl, setBl] = useState('');
  const [errorMessage,setErrorMessage] = useState('')

  const location = useLocation()
  const { ticket,user } = location.state;
  const navigate = useNavigate();

  const subBl = (blo) => {
    API.addBlock(blo).then(t => {
      navigate("/")
    }).catch(err => {
      setErrorMessage(err.error)
   })
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');

    let valid = true;
    if (bl.trim() == '')
      valid = false;

    const blocco = {
        description: bl,
        ticket: ticket.code,
    }
  

    if (valid) {
      subBl(blocco);
    } else {
      setErrorMessage("block mustn not be empty");
    }
  };

  return(
    <Container fluid style={ {marginTop: '200px'}}>
      {errorMessage ? <Alert variant='danger' dismissible onClick={()=>setErrorMessage('')}>{errorMessage}</Alert> : ''}
      <Row>
        <Col md={3}>
        </Col>
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>
                <b>TickedId:</b> {ticket.code} <span style={{ marginLeft: '50px' }}><b>Title:</b> {ticket.title}</span>
              </Form.Label>
              <Form.Control as='textarea' value={bl} onChange={ (e) => setBl(e.target.value)} placeholder="Enter description">
              </Form.Control>
            </Form.Group>
            <Button variant="outline-success my-2" type="submit" >Add Block</Button>
            <Button variant="outline-danger" style={ {marginLeft: '6px'} } onClick={ () => navigate("/")}>
              Cancel
            </Button>
          </Form>
        </Col>
        <Col md={3}>
        </Col>
      </Row>
    </Container>
  )
}

export { AddBlock } 