import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { React, useState } from 'react';
import { Row,Col, Container,Form,Button,Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'

function AddT(props){

  const fieldT = JSON.stringify(props.fieldT) === "{}" ? false : true

  const [tit,setTit] = useState(fieldT ? props.fieldT.tit : '');
  const [cat,setCat] = useState(fieldT ? props.fieldT.cat :'Maintenance');
  const [des,setDes] = useState(fieldT ? props.fieldT.des : '');
  const [tempStat,setTempStat] = useState({});
  const [errorMessage,setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleCancel = () => {
    props.setFieldT({});
    props.setAddT(false);
  }


  const handleClick = () => {
    if (des.trim() == '' || tit.trim() == ''){
      setErrorMessage('Block and title cannot be empty');
    }else{
    navigate("/addT", { state: { title: tit, category: cat, desc: des, user: props.user, stat: tempStat } });
    } 
  }

  return(
    <Container fluid style={{marginTop: '30px'}}  className='border border-success'>
      {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
      <Row>
        <Col>
          <Form className='mt-2'>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" placeholder="Enter title" value={tit} onChange={ (e) => setTit(e.target.value)}/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select value={cat} onChange={ (e) => setCat(e.target.value)}>
                <option>maintenance</option>
                <option>inquiry</option>
                <option>payment</option>
                <option>new feature</option>
                <option>administrative</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as='textarea' placeholder="Enter description" value={des} onChange={ (e) => setDes(e.target.value)}>
              </Form.Control>
            </Form.Group>
            <Button variant="outline-success my-2" onClick={handleClick}>Add Ticket</Button>
            <Button variant="outline-danger" style={ {marginLeft: '6px'} } onClick={handleCancel}>
              Cancel
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export { AddT }