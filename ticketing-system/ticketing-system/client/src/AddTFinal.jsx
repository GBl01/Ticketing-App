import { useState,useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Form,Row,Col,Button,Container,Alert} from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import API from "./API";



function AddTFinal(props){

  const navigate = useNavigate();

  const location = useLocation()
  const { title,category,desc } = location.state;
  const [errorMessage,setErrorMessage] = useState('');

  useEffect(() => {
   if (props.authToken) {
    const t = parseInt(props.numTick) + 1;

    const s = [];
    const up = {
      title: title,
      category: category,
      code: t
    }
    s.push(up);
    API.getTicketStats(props.authToken, s).then(stat => {
        props.setTempStat(stat[0])
      })
      .catch(e => console.log('erroreee'));
    }
  },[])

  const handleCancel = () => {

    const t = {
      tit: title ? title : '',
      des: desc ? desc: '',
      cat: category? category : 'maintenance'
    }

    props.setFieldT(t);

    navigate("/")
  }

  const addTick = () => {

    const t = parseInt(props.numTick)+1;

    const ticketBl = {
      tit: title,
      cat: category,
      des: desc,
      cod: t
    }

    API.addTicket(ticketBl).then(t => {
      props.setDirty(true)
      navigate("/")
    }
    ).catch(err => {
      // NB: Generic error message, should not give additional info (e.g., if user exists etc.)
      //setErrorMessage("Something goes wrong :/")
      setErrorMessage(err.error);
   })

   props.setAddT(false);
    
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    addTick();
  }



  return (
    <Container fluid style={{ marginTop: '100px' }}>
      {errorMessage ? <Alert variant='danger' dismissible onClick={()=>setErrorMessage('')}>{errorMessage}</Alert> : ''}
      <Row>
        <Col>
        Estimated closing time: {props.tempStat.estimation}{props.user.admin == 1 ? 'h' : 'd'}
        </Col>
      </Row>
      <Row>
        <Col>
          <Form className='mt-2' onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" placeholder={title} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select disabled>
                <option>{category}</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as='textarea' placeholder={desc} disabled>
              </Form.Control>
            </Form.Group>
            <Button variant="outline-success my-2" type="submit">Submit</Button>
            <Button variant="outline-danger" style={{ marginLeft: '6px' }} onClick={handleCancel}>
              Cancel
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export {AddTFinal}