import './styles.css';
import Logo from '../../assets/images/logo.svg';
import { Link } from 'react-router-dom';

function Login() {
  return (
    <div className='login'>
      <div className='box'>
        <img src={Logo} alt='Clearstack logo' />
        <div className='title'>Login to your account</div>
        <input type='email' placeholder='Enter your email' />
        <input type='password' placeholder='Enter your password' />
        <button>Login</button>
        <Link to="/signup">Don't have a account? Sign up</Link>
      </div>
    </div>
  );
}

export default Login;
