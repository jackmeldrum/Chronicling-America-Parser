import React, { useState } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.css";
import {register} from './UserFunctions';

export default function Signup(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  var [error, setError] = useState("");

  function validateForm() {
    return email.length > 0 && password.length > 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    var errors = {
      password: '',
      verifyPassword: ''
    }
    const user = {
      email: email,
      password: password,
    }
    if (user.password.length < 6) {
      errors.password = "Password should be at least 6 characters.";
      //setError("Password should be at least 6 characters.");
    }
    if (user.password !== repeat) {
      errors.verifyPassword = "Passwords do not match.";
      //setError("Passwords do not match");
    }
      if (errors.password === "" && errors.verifyPassword === "") {
        register(user).then(res => {
            if(res.success){    
                //this.props.history.push(`/profile`)
                props.history.push('/');
            }else{
                setError(res.reason);
            }
            
        })
    }else{
      console.log(errors);
        setError(errors.verifyPassword + ' ' + errors.password)
    }
  }

  return (
    <div className="Login">
      <form onSubmit={handleSubmit}>
        <FormGroup controlId="email" bsSize="large">
          <ControlLabel>Email</ControlLabel>
          <FormControl
            autoFocus
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </FormGroup>
        <FormGroup controlId="password" bsSize="large">
          <ControlLabel>Password</ControlLabel>
          <FormControl
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
          />
        </FormGroup>
        <FormGroup controlId="repeat" bsSize="large">
            <ControlLabel>Repeat Password</ControlLabel>
            <FormControl
                value={repeat}
                onChange={e =>setRepeat(e.target.value)}
                type="password"
            />
        </FormGroup>
        <div className="alert alert-danger" style={{ display: (error !== '') ? 'block' : 'none' }}>
            {error}
        </div>
        <Button block bsSize="large" disabled={!validateForm()} type="submit">
          Sign up
        </Button>
      </form>
    </div>
  );
}
