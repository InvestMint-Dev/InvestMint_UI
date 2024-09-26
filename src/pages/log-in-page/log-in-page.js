import React, { useState, useEffect, navigate } from 'react';
import { useAuth0 } from '@auth0/auth0-react'; // Import Auth0 hook

import './log-in-page.css';
import '../styling/form-styling.css';

import { validateLogInFields } from '../../validators/validators';
import bigLeafLogo from '../../assets/images/logo/InvestMint Big Leaf Logo - 2.png';
import openEye from '../../assets/images/icons/Eye.png';
import closedEye from '../../assets/images/icons/Closed Eye.png';

export const LogInPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
        });
        
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const [submitButtonClicked, setSubMitButtonClicked] = useState(false);

    const { loginWithRedirect, isAuthenticated } = useAuth0(); // Use Auth0 hooks

    useEffect(() => {
        // Runs after the component mounts
        const element = document.querySelector('.log-in-form');
        if (element) {
            element.classList.add('fade-in');
        }
        document.title = 'Log In | InvestMint';
    }, []); // Empty dependency array means this effect runs once after the initial render


    const validateForm = () => {
        const validationErrors = validateLogInFields(formData, 'login');
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        setSubMitButtonClicked(true);
        e.preventDefault();

        if (validateForm()) {
            if (!isAuthenticated) {
                await loginWithRedirect();
            } else {
                navigate('/dashboard');
                setSubMitButtonClicked(false);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevFormData) => {
        const updatedFormData = { ...prevFormData, [name]: value };
        const validationErrors = validateLogInFields(updatedFormData, 'login');
        setErrors(validationErrors);
        return updatedFormData;
    })};

    return (
        <div>
            <img className='logo-display' src={bigLeafLogo} alt="InvestMint Logo" />

            <div className='log-in-form-container'>
                <h1 className='form-heading'>Log In</h1>
                <form className='log-in-form' onSubmit={handleSubmit}>
                    {/* email input */}
                    <input 
                        className='form-textarea form-textarea-full' 
                        placeholder='Email'
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={{
                            border: (errors.email && submitButtonClicked) ? "2px solid #71CCA8" : "none"
                        }} />
                    {(errors.email && submitButtonClicked) && <p style={{ color: "#71CCA8" }}>{errors.email}</p>}


                    {/* password input */}
                    <div className='password-container'>
                        <input 
                            type={showPassword ? "text" : "password"} // Toggling between text and password
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className='form-textarea form-textarea-full password-textarea' 
                            placeholder='Password'
                            style={{
                                border: (errors.password && submitButtonClicked) ? "2px solid #71CCA8" : "none"
                            }} >
                            </input>
                        <button type="button" className='show-password-button' onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <img src={openEye}/> : <img src={closedEye}/>}
                        </button>
                    </div>
                    {(errors.password && submitButtonClicked) && <p style={{ color: "#71CCA8" }}>{errors.password}</p>}

                    <div className="form-option-1-container">
                        <input className="form-checkbox" type="checkbox" id="rememberUser" name="rememberUser" value="rememberUser" />
                        <span className="form-label">Remember Me</span>
                        <a href="" className="form-link">Forgot password?</a>
                    </div>

                    <button type="submit" className='form-submit-button'>
                        Submit
                    </button>

                    <div className='form-option-2-container'> 
                        <span className="form-label">New Member? </span>
                        <a href="/create-account" className="form-link">Sign Up here</a>
                    </div>
                </form>
            </div>
        </div>);
    }