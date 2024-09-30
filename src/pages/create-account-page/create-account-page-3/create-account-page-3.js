import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateCompanyLegalInfo } from '../../../validators/validators';

import { ErrorAlertPanel } from '../../../components/error-alert-panel/error-alert-panel';
import { CreateAccountSidebar } from '../create-account-sidebar/create-account-sidebar';
import '../create-account-page.css';
import './create-account-page-3.css'
;
import { handleKeyDown } from '../../../utils/utils';

export const CreateAccountPage3 = () => {
    const navigate = useNavigate(); // Navigate hook

    const [nextButtonClicked, setNextButtonClicked] = useState(false);
    const [suggestions, setSuggestions] = useState({
        state: [],
        city: [],
        zipcode: [],
        countryName: []
    });

    const [showErrorAlert, setShowErrorAlert] = useState(false); // State for alert visibility
    const [alertClass, setAlertClass] = useState(""); // State for alert class
    const REACT_APP_HERE_API_KEY = process.env.REACT_APP_HERE_API_KEY;

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        mobileNumber: "",
        companyName: "",
        countryName: "",
        addressLine1: "",
        state: "",
        city: "",
        zipcode: "",
        companyPhoneNumber: "",
        bankAccounts: [{ id: 1, bank: "", accountNumber: "" }], // Example initial bank account
        advisorName: "",
        investmentAccountNumber: ""
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e, index) => {
        const { name, value } = e.target;

        // Phone number masking logic
        const formatPhoneNumber = (phoneNumber) => {
            const cleaned = phoneNumber.replace(/\D/g, ''); // Remove all non-numeric characters
            let formattedPhoneNumber = '';
            if (cleaned.length > 0) {
                formattedPhoneNumber += '(' + cleaned.substring(0, 3);
            }
            if (cleaned.length > 3) {
                formattedPhoneNumber += ') ' + cleaned.substring(3, 6);
            }
            if (cleaned.length > 6) {
                formattedPhoneNumber += '-' + cleaned.substring(6, 10);
            }
            return formattedPhoneNumber;
        };

        if (name === 'bank' || name === 'accountNumber') {
            // Handle changes for bank account fields
            setFormData(prevData => {
                const updatedBankAccounts = [...prevData.bankAccounts];
                updatedBankAccounts[index] = { ...updatedBankAccounts[index], [name]: value }; // name can be 'bank' or 'accountNumber'
                const updatedData = { ...prevData, bankAccounts: updatedBankAccounts };
                const validationErrors = validateCompanyLegalInfo(updatedData);
                setErrors(validationErrors);
                return updatedData;
            });
        } else {
            // Handle changes for other form fields
            setFormData(prevData => {
                const updatedValue = (name === 'phoneNumber') || (name === 'mobileNumber') || (name === 'companyPhoneNumber') ? formatPhoneNumber(value) : value;
                const updatedData = { ...prevData, [name]: updatedValue };
                const validationErrors = validateCompanyLegalInfo(updatedData);
                setErrors(validationErrors);
                return updatedData;
            });
        }

        if (name === 'addressLine1' && value.length > 2) {
            // Fetch suggestions based on addressLine1
            fetchAddressSuggestions(value);
        }
    };

    const handleNext = async () => {
        setNextButtonClicked(true);
        const validationErrors = validateCompanyLegalInfo(formData);
        setErrors(validationErrors);
        const isValid = Object.keys(validationErrors).length === 0;
    
        if (isValid) {
            navigate('/create-account-4'); // Navigate to the next page
            setNextButtonClicked(false);
            setShowErrorAlert(false);
        } else {
            setAlertClass("show"); // Show error alert
            setShowErrorAlert(true); // Show error alert on validation failure
            window.scrollTo({ top: 0, behavior: 'auto' });
    
            // Hide error alert after 2 seconds
            setTimeout(() => {
                setAlertClass("hide"); // Start fade-out
                setTimeout(() => {
                setShowErrorAlert(false); // Remove from DOM after fade-out
                }, 1000); // Duration of the fade-out transition
            }, 2000);
        }
      };

      const handleBack = () => {
        navigate('/create-account-1');
      };

    const fetchAddressSuggestions = async (address) => {
        try {
            const response = await axios.get(`https://autocomplete.search.hereapi.com/v1/autocomplete`, {
                params: {
                    q: address,
                    in: 'countryCode:CAN', // For Canada
                    apiKey: REACT_APP_HERE_API_KEY, // Replace with your actual API key
                },
            });

            if (response.data && response.data.items) {
                const addressSuggestions = response.data.items.map(item => ({
                    title: item.address.label,
                    city: item.address.city || '', // Handle cases where city might be undefined
                    state: item.address.state || '', // Handle cases where state might be undefined
                    zipcode: item.address.postalCode || '', // Handle cases where zipcode might be undefined
                    countryName: item.address.countryName || '' // Handle cases where zipcode might be undefined
                }));

                setSuggestions(addressSuggestions);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]); // Clear suggestions on error
        }
    };

    const handleLocationSuggestionClick = (suggestion) => {
        setFormData({
            ...formData,
            addressLine1: suggestion.title, // Set the selected address line
            city: suggestion.city,
            state: suggestion.state,
            zipcode: suggestion.zipcode,
            countryName: suggestion.countryName
        });
        setSuggestions([]); // Clear suggestions after selection
    };


    const addBankInputSet = () => {
        setFormData(prevData => ({
            ...prevData,
            bankAccounts: [...prevData.bankAccounts, { id: Date.now(), bank: "", accountNumber: "" }]
        }));
    };

    const removeBankInputSet = (index) => {
        setFormData(prevData => ({
            ...prevData,
            bankAccounts: prevData.bankAccounts.filter((_, i) => i !== index)
        }));
    };

    return (
        <div>
            {showErrorAlert && (
                <ErrorAlertPanel className={alertClass} />
            )}

            <CreateAccountSidebar currentPage={3}/>

            <div className='page-3-container'>
                <h1 className='form-heading'>Company Legal Information</h1>
                <div className='company-legal-information-form'>
                    {/* Form fields */}
                    <div className='form-flex-container'>
                        <textarea onKeyDown={handleKeyDown}  id="form-textarea" className='form-textarea form-textarea-half' name="firstName" placeholder='First Name' value={formData.firstName} onChange={handleChange} style={{ border: (errors.firstName && nextButtonClicked) ? "2px solid #71CCA8" : "none" }} />
                        <textarea onKeyDown={handleKeyDown}  id="form-textarea" className='form-textarea form-textarea-half' name="lastName" placeholder='Last Name' value={formData.lastName} onChange={handleChange} style={{ border: (errors.lastName && nextButtonClicked) ? "2px solid #71CCA8" : "none" }} />
                    </div>
                    {(errors.firstName && nextButtonClicked) && <p style={{ color: '#71CCA8' }}>{errors.firstName}</p>}
                    {(errors.lastName && nextButtonClicked) && <p style={{ color: '#71CCA8' }}>{errors.lastName}</p>}

                    <textarea onKeyDown={handleKeyDown}  id="form-textarea" className='form-textarea form-textarea-full' name="email" placeholder='Email' value={formData.email} onChange={handleChange} style={{ border: (errors.email && nextButtonClicked) ? "2px solid #71CCA8" : "none" }} />
                    {(errors.email && nextButtonClicked) && <p style={{ color: '#71CCA8' }}>{errors.email}</p>}

                    <div className='form-flex-container'>
                        <textarea onKeyDown={handleKeyDown}  id="form-textarea"
                            className='form-textarea form-textarea-half'
                            name="phoneNumber"
                            placeholder='Phone Number'
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            style={{ border: (errors.phoneNumber && nextButtonClicked) ? "2px solid #71CCA8" : "none" }}
                        />
                        <textarea onKeyDown={handleKeyDown}  id="form-textarea"
                            className='form-textarea form-textarea-half'
                            name="mobileNumber"
                            placeholder='Mobile Number'
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            style={{ border: (errors.mobileNumber && nextButtonClicked) ? "2px solid #71CCA8" : "none" }}
                        />
                    </div>
                    {(errors.phoneNumber && nextButtonClicked) && <p style={{ color: '#71CCA8' }}>{errors.phoneNumber}</p>}
                    {(errors.mobileNumber && nextButtonClicked) && <p style={{ color: '#71CCA8' }}>{errors.mobileNumber}</p>}

                    <textarea onKeyDown={handleKeyDown}  id="form-textarea" className='form-textarea form-textarea-full' name="companyName" placeholder='Company Name' value={formData.companyName} onChange={handleChange} style={{ border: (errors.companyName && nextButtonClicked) ? "2px solid #71CCA8" : "none" }} />
                    {(errors.companyName && nextButtonClicked) && <p style={{ color: '#71CCA8' }}>{errors.companyName}</p>}

                    <textarea onKeyDown={handleKeyDown}  id="form-textarea" 
                        className='form-textarea form-textarea-full' 
                        name="companyPhoneNumber" 
                        placeholder='Company Phone Number' 
                        value={formData.companyPhoneNumber} 
                        onChange={handleChange} 
                        style={{ border: (errors.companyPhoneNumber && nextButtonClicked) ? "2px solid #71CCA8" : "none" }} />
                    {(errors.companyPhoneNumber && nextButtonClicked) && <p style={{ color: '#71CCA8' }}>{errors.companyPhoneNumber}</p>}

                    <textarea onKeyDown={handleKeyDown}  id="form-textarea"
                        className='form-textarea form-textarea-full'
                        name="addressLine1"
                        placeholder='Company Address Line 1'
                        value={formData.addressLine1}
                        onChange={handleChange}
                        style={{ border: (errors.addressLine1 && nextButtonClicked) ? "2px solid #71CCA8" : "none" }}
                    />
                    {/* Render suggestions for address line */}
                    {suggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {suggestions.map((suggestion, index) => (
                                <li key={index} onClick={() => handleLocationSuggestionClick(suggestion)}>
                                    {suggestion.title}
                                </li>
                            ))}
                        </ul>
                    )}
                    {(errors.addressLine1 && nextButtonClicked) && <p style={{ color: '#71CCA8' }}>{errors.addressLine1}</p>}

                    <div className='form-flex-container'>
                        {/* City Input */}
                        <textarea onKeyDown={handleKeyDown}  id="form-textarea"
                            className='form-textarea form-textarea-third'
                            style={{ border: (errors.state && nextButtonClicked)  ? "2px solid #71CCA8" : "none" }} 
                            name="city"
                            placeholder='City'
                            value={formData.city}
                            readOnly // Make this read-only since it's auto-filled
                        />

                        {/* State Input */}
                        <textarea onKeyDown={handleKeyDown}  id="form-textarea"
                            className='form-textarea form-textarea-third'
                            style={{ border: (errors.city && nextButtonClicked) ? "2px solid #71CCA8" : "none" }} 
                            name="state"
                            placeholder='State'
                            value={formData.state}
                            readOnly // Make this read-only since it's auto-filled
                        />

                        {/* Zipcode Input */}
                        <textarea onKeyDown={handleKeyDown}  id="form-textarea"
                            className='form-textarea form-textarea-third'
                            style={{ border: (errors.zipcode && nextButtonClicked)  ? "2px solid #71CCA8" : "none" }} 
                            name="zipcode"
                            placeholder='Zipcode'
                            value={formData.zipcode}
                            readOnly // Make this read-only since it's auto-filled
                        />
                    </div>
                    {(errors.state && nextButtonClicked) && <p style={{ color: '#71CCA8' }}>{errors.state}</p>}
                    {(errors.city && nextButtonClicked) && <p style={{ color: '#71CCA8' }}>{errors.city}</p>}
                    {(errors.zipcode && nextButtonClicked) && <p style={{ color: '#71CCA8' }}>{errors.zipcode}</p>}

                    <textarea onKeyDown={handleKeyDown}  id="form-textarea" 
                        className='form-textarea form-textarea-full' 
                        name="countryName" 
                        placeholder='Country' 
                        value={formData.countryName} 
                        style={{ border: (errors.countryName && nextButtonClicked) ? "2px solid #71CCA8" : "none" }} 
                        readOnly/>
                    {(errors.countryName && nextButtonClicked) && <p style={{ color: '#71CCA8' }}>{errors.countryName}</p>}

                    <h3>Company Bank Accounts</h3>
                    <div className="bankinputs-container">
                        <button className="bankinputs-add-button" onClick={addBankInputSet}>+</button>

                        {formData.bankAccounts.map((set, index) => (
                            <div key={set.id} className="bankinputs-set">
                                <button className="bankinputs-remove-button" onClick={() => removeBankInputSet(index)}>Delete</button>

                                <div className='form-select bankinputs-select'>
                                    <select 
                                        style={{ border: (errors[`account-${index}`] && nextButtonClicked) ? "2px solid #71CCA8" : "none" }} 
                                        id={`bank-${index}`} 
                                        name="bank" 
                                        value={formData.bankAccounts[index].bank} // Ensure the value is set correctly
                                        onChange={(e) => handleChange(e, index)}
                                    >
                                        <option value="">Select Bank</option>
                                        <option value="RBC">Royal Bank of Canada (RBC)</option>
                                        <option value="TD">Toronto-Dominion Bank (TD)</option>
                                        <option value="BMO">Bank of Montreal (BMO)</option>
                                        <option value="Scotiabank">Scotiabank (TD)</option>
                                        <option value="CIBC">Canadian Imperial Bank of Commerce (CIBC)</option>
                                        <option value="NBC">National Bank of Canada (NBC)</option>
                                        <option value="Laurentian Bank">Laurentian Bank</option>
                                        <option value="EQ Bank">Equitable Bank (EQ Bank)</option>
                                    </select>                            
                                </div>
                                {(errors[`bank-${index}`] && nextButtonClicked) && <p style={{ color: '#71CCA8' }}>{errors[`bank-${index}`]}</p>}
                                
                                <textarea onKeyDown={handleKeyDown}
                                    className='form-textarea bankinputs-textarea'
                                    id={`account-${index}`} 
                                    style={{ border: (errors[`account-${index}`] && nextButtonClicked) ? "2px solid #71CCA8" : "none" }} 
                                    name="accountNumber" 
                                    value={formData.bankAccounts[index].accountNumber} // Ensure the value is set correctly
                                    placeholder="Account number" 
                                    onChange={(e) => handleChange(e, index)}
                                />
                                {(errors[`account-${index}`] && nextButtonClicked) && <p style={{ color: '#71CCA8' }}>{errors[`account-${index}`]}</p>}
                            </div>
                        ))}
                    </div>

                    <h3>If your company has an investment advisor:</h3>
                    <textarea onKeyDown={handleKeyDown}  id="form-textarea" className='form-textarea form-textarea-full' name="advisorName" placeholder='Advisor Name' value={formData.advisorName} onChange={handleChange} style={{ border: errors.advisorName ? "2px solid #71CCA8" : "none" }} />
                    {errors.advisorName && <p style={{ color: '#71CCA8' }}>{errors.advisorName}</p>}
                    <textarea onKeyDown={handleKeyDown}  id="form-textarea" className='form-textarea form-textarea-full' name="investmentAccountNumber" placeholder='Company Investment Account Number' value={formData.investmentAccountNumber} onChange={handleChange} style={{ border: errors.investmentAccountNumber ? "2px solid #71CCA8" : "none" }} />
                    {errors.investmentAccountNumber && <p style={{ color: '#71CCA8' }}>{errors.investmentAccountNumber}</p>}
                </div>

                <div className='stepper-container'>
                    <div className="stepper-button-container">
                        <button className='form-stepper-button' onClick={handleBack}>
                        Back
                        </button>
                        <button className='form-stepper-button' onClick={handleNext}>
                        Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};