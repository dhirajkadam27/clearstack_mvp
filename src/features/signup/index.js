import './styles.css';
import Logo from '../../assets/images/logo.svg';
import { Link } from 'react-router-dom';

function Signup() {
  return (
    <div className='signup'>
      <div className='box'>
        <img src={Logo} alt='Clearstack logo' />
        <div className='title'>create your account</div>
        <input type='text' placeholder='Enter your first name' />
        <input type='text' placeholder='Enter your last name' />
        <input type='email' placeholder='Enter your email' />
        <input type='password' placeholder='Enter your password' />
        <button>Continue</button>
        <Link to="/login">Already have a account? Login</Link>
      </div>
    </div>
  );
}

export default Signup;
