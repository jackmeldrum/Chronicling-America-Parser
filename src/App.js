import React from "react";
import { Link } from "react-router-dom";
import { FormGroup, FormControl, Button } from "react-bootstrap";
import "./App.css";
import Routes from "./Routes";
import Navbar from "./containers/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';


function App(props) {
    
  return (
    <div>
      <Navbar/>
      <Routes />
    </div>
  );
}


export default App;
