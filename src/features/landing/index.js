import './styles.css';
import Logo from '../../assets/images/logo.svg';
import Promo from '../../assets/images/promo.webp';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();
  return (
    <div className='landing'>
      <div className='nav'>
        <img src={Logo} alt='Clearstack logo' />
        <div className='btns'>
          <button onClick={()=> navigate('/login')}>login</button>
          <button onClick={()=> navigate('/signup')}>Get it free</button>
        </div>
      </div>
      <div className='hero'>
        <div className='title'>Set as Default Backend</div>
        <div className='subtitle'>Your default backend for every project — powerful, secure, and easy.</div>
        <button onClick={()=> navigate('/signup')}>Get Started for free</button>
      </div>
      <div className='showcase-right'>
        <div className='data'>
          <div className='title'>Build Projects in Minutes</div>
          <div className='subtitle'>Create data tables, organize files, and manage user data effortlessly — no complex setup needed.</div>

        </div>
        <img src={Promo} alt='Clearstack Promo' />
      </div>
      <div className='showcase-left'>
        <img src={Promo} alt='Clearstack Promo' />

        <div className='data'>
          <div className='title'>Secure & Reliable</div>
          <div className='subtitle'>Protect your apps with token-based authentication and seamless third-party login integrations.</div>

        </div>
      </div>
      <div className='showcase-right'>

        <div className='data'>
          <div className='title'>Visual API Builder — Connect Everything</div>
          <div className='subtitle'>Design APIs visually like flowcharts. Connect your data, logic, and third-party apps with simple drag-and-drop.</div>

        </div>
        <img src={Promo} alt='Clearstack Promo' />
      </div>

      <div className='why'>
        <div className='title'>Why Choose Us?</div>
        <div className='subtitle'>Accelerate Development: Launch backend infrastructure in minutes, not days.</div>
        <div className='subtitle'>One Backend for All: Use the same powerful backend across every project.</div>
        <div className='subtitle'>Intuitive & Visual: Build and manage APIs without writing tedious code.</div>
        <div className='subtitle'>Enterprise-Grade Security: Keep your data safe with robust authentication.</div>
      </div>

      <div className='footer'>
        <div className='title'>Ready to Make Backend Setup Effortless?</div>
        <button onClick={()=> navigate('/signup')}>Start Your Free Trial</button>
        <div className='subtitle'>The backend that works as hard as you do — simple, secure, and scalable.</div>
      </div>
    </div>
  );
}

export default Landing;
