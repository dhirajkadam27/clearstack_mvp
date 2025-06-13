import './styles.css';
import Logo from '../../assets/images/logo.svg';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

const CREATE_ACCOUNT = gql`
  mutation CreateAccount($first_name: String!, $last_name: String!, $email: String!, $password: String!) {
    createAccount(first_name: $first_name, last_name: $last_name, email: $email, password: $password) {
      account_id
      email
    }
  }
`;

function Signup() {
  const [searchParams] = useSearchParams();
  const prefillEmail = searchParams.get('email') || '';
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [detectorMsg, setDetectorMsg] = useState('');

  const [createAccount, { loading }] = useMutation(CREATE_ACCOUNT, {
    onCompleted: (data) => {
      const user = data.createAccount;
      console.log('Account created:', user);
      // You can navigate or store user info here
    },
    onError: (error) => {
      const msg = error.message;
      if (msg === 'Email already registered') {
        setDetectorMsg(msg);
      } else {
        setErrorMsg(msg);
      }
    },
  });

  const handleSignup = () => {
    setErrorMsg('');
    if (!firstName || !lastName || !email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    createAccount({
      variables: {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      },
    });
  };

  return (
    <div className='signup'>
      <div className='box'>
        <img src={Logo} alt='Clearstack logo' />

        {errorMsg && <div className='error'>{errorMsg}</div>}

        {detectorMsg && (
          <div className='detector'>
            {detectorMsg}{' '}
            <button onClick={() => navigate(`/login?email=${email}`)}>Log in</button>
          </div>
        )}

        <div className='title'>Create your account</div>

        <input
          type='text'
          placeholder='Enter your first name'
          value={firstName}
          onChange={(e) => {
            setErrorMsg('');
            setDetectorMsg('');
            setFirstName(e.target.value);
          }}
        />
        <input
          type='text'
          placeholder='Enter your last name'
          value={lastName}
          onChange={(e) => {
            setErrorMsg('');
            setDetectorMsg('');
            setLastName(e.target.value);
          }}
        />
        <input
          type='email'
          placeholder='Enter your email'
          value={email}
          onChange={(e) => {
            setErrorMsg('');
            setDetectorMsg('');
            setEmail(e.target.value);
          }}
        />
        <input
          type='password'
          placeholder='Enter your password'
          value={password}
          onChange={(e) => {
            setErrorMsg('');
            setDetectorMsg('');
            setPassword(e.target.value);
          }}
        />
        <button onClick={handleSignup} disabled={loading}>
          {loading ? 'Creating...' : 'Continue'}
        </button>

        <Link to='/login'>Already have an account? Login</Link>
      </div>
    </div>
  );
}

export default Signup;
