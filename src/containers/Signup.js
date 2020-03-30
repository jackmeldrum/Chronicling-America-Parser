import React, { useState } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.css";

export default function Signup(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");

  function validateForm() {
    return email.length > 0 && password.length > 0 && password === repeat;
  }

  function handleSubmit(event) {
    //event.preventDefault();
    if (email && password && repeat)
        props.history.push('/login');
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
        <Button block bsSize="large" disabled={!validateForm()} type="submit">
          Sign up
        </Button>
      </form>
    </div>
  );
}
