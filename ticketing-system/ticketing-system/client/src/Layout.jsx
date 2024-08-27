import { React,useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Container,Nav,Navbar,Button, Dropdown, DropdownButton,Modal, Col,Row} from 'react-bootstrap'
import { Link} from 'react-router-dom';


function Navigation(props){

  return(
    <Navbar fixed="top" className="bg-body-tertiary shadow d-flex justify-content-between">
      <Container>
        <Navbar.Brand style={{ margin: '-90px' }}>
          <i className="bi bi-ticket-perforated" style={{ fontSize: '40px' }}>TicketExam</i>
        </Navbar.Brand>
        <Nav>
          {
            props.logged ?
              <Navbar.Text>
                <i className="bi bi-person-circle custom-icon" style={{ fontSize: '18px' }}> {props.user.name} {props.user.admin == 1 ? <b style={{color: 'gold'}}>ADMIN</b> : ''} |</i>
                <Button variant="outline-secondary" style={{ borderRadius: '50px', marginLeft: '30px' }} onClick={props.logout}>
                  Logout
                </Button>
              </Navbar.Text>
              :
              <Navbar.Text>
                <Link to="/login">
                  <Button variant="outline-secondary" style={{ borderRadius: '50px', marginRight: '-150px' }}>
                    Login
                  </Button>
                </Link>
              </Navbar.Text>
          }
        </Nav>
      </Container>
    </Navbar>
  )
}

function Filter(props){

  return (
    <Dropdown>
      <DropdownButton variant="success" id="dropdown-basic" title={props.filter} onSelect={(eK)=>props.setFil(eK)}>
        <Dropdown.Item eventKey="Filter">No filter</Dropdown.Item>
        <Dropdown.Item eventKey="Inquiry">Inquiry</Dropdown.Item>
        <Dropdown.Item eventKey="Maintenance">Maintenance</Dropdown.Item>
        <Dropdown.Item eventKey="New Feature">New Feature</Dropdown.Item>
        <Dropdown.Item eventKey="Administrative">Administrative</Dropdown.Item>
        <Dropdown.Item eventKey="Payment">Payment</Dropdown.Item>
      </DropdownButton>
    </Dropdown>
  )
}

function NotFoundPage() {
  return <>
    <div style={{"textAlign": "center", "paddingTop": "5rem"}}>
      <h1>
        <i className="bi bi-exclamation-circle-fill"/>
        {" "}
        The page cannot be found
        {" "}
        <i className="bi bi-exclamation-circle-fill"/>
      </h1>
      <br/>
      <p>
        The requested page does not exist, please head back to the <Link to={"/"}>app</Link>.
      </p>
    </div>
  </>
}

export { Navigation,Filter,NotFoundPage }