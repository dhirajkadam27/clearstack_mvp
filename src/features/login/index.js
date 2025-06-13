import './styles.css';
import Logo from '../../assets/images/logo.svg';
import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { gql, useLazyQuery } from '@apollo/client';

const LOGIN_QUERY = gql`
  query Login($email: String!, $password: String!) {
    account(email: $email, password: $password) {
      account_id
      first_name
      last_name
      email
    }
  }
`;

function Login() {
  const [searchParams] = useSearchParams();
  const prefillEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [detectorMsg, setDetectorMsg] = useState('');
  const navigate = useNavigate();

  const [login, { loading }] = useLazyQuery(LOGIN_QUERY, {
    fetchPolicy: 'no-cache',
    onCompleted: (data) => {
      const user = data.account;
      console.log('Logged in user:', user);
      // Optionally navigate to dashboard or save user to context
    },
    onError: (error) => {
      const msg = error.message;
      if (msg === 'Email not registered') {
        setDetectorMsg(msg);
      } else {
        setErrorMsg(msg);
      }
    },
  });

  const handleLogin = () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    login({ variables: { email, password } });
  };

  return (
    <div className='login'>
      <div className='box'>
        <img src={Logo} alt='Clearstack logo' />
        <div className='title'>Login to your account</div>

        {errorMsg && <div className='error'>{errorMsg}</div>}
        {detectorMsg && (
          <div className='detector'>
            {detectorMsg}{' '}
            <button onClick={() => navigate(`/signup?email=${email}`)}>Sign up</button>
          </div>
        )}

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

        <button onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <Link to='/signup'>Don't have an account? Sign up</Link>
      </div>
    </div>
  );
}

export default Login;
