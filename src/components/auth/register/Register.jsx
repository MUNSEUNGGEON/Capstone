import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../Auth.css';
import IdField from './IdField';
import PasswordField from './PasswordField';
import NameField from './NameField';
import EmailField from './EmailField';
import PhoneField from './PhoneField';
import AddressField from './AddressField';
import ChildInfoField from './ChildInfoField';
import AllergyField from './AllergyField';

const initialFormData = {
  id: '',
  password: '',
  confirmPassword: '',
  name: '',
  email: '',
  email_id: '',
  email_domain: '',
  phone_number: '',
  address: '',
  address_detail: '',
  postal_address: '',
  kid_name: '',
  kid_gender: '',
  kid_birth: ''
};

const initialFieldErrors = {
  id: false,
  password: false,
  confirmPassword: false,
  name: false,
  email: false,
  phone: false,
  address: false,
  kidName: false
};

const Register = ({ setIsLoggedIn, setUserInfo }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [idChecked, setIdChecked] = useState(false);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const validateForm = useCallback(() => {
    const errors = { ...initialFieldErrors };
    let hasError = false;

    // 아이디 중복 확인
    if (!idChecked) {
      errors.id = true;
      setError('아이디 중복 확인을 해주세요.');
      setFieldErrors(errors);
      return false;
    }

    // 비밀번호 유효성 검사
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = true;
      hasError = true;
    }

    // 비밀번호 일치 여부
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = true;
      hasError = true;
    }

    // 이름 유효성 검사
    if (!validateName(formData.name)) {
      errors.name = true;
      hasError = true;
    }

    // 이메일 유효성 검사
    if (!formData.email_id || !formData.email_domain || 
        !validateEmailId(formData.email_id) || 
        !validateEmailDomain(formData.email_domain)) {
      errors.email = true;
      hasError = true;
    }

    // 휴대폰번호 유효성 검사
    if (!validatePhoneNumber(formData.phone_number)) {
      errors.phone = true;
      hasError = true;
    }

    // 주소 유효성 검사
    if (!formData.postal_address || !formData.address || !formData.address_detail) {
      errors.address = true;
      setError('우편번호와 주소를 입력해 주세요.');
      setFieldErrors(errors);
      return false;
    }

    // 아이 정보 유효성 검사
    if (!validateKidName(formData.kid_name) || !formData.kid_gender || !formData.kid_birth) {
      errors.kidName = true;
      hasError = true;
    }

    setFieldErrors(errors);
    setError(''); // 나머지 에러는 상단에 표시하지 않음
    return !hasError;
  }, [formData, idChecked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setFieldErrors(initialFieldErrors);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { confirmPassword, email_id, email_domain, address_detail, ...dataToSend } = formData;
      
      // 이메일 합치기
      const email = `${email_id}@${email_domain}`;
      
      const registerData = {
        ...dataToSend,
        email,
        address: `${formData.address}, ${address_detail}`,
        allergies: selectedAllergies
      };

      const response = await axios.post('http://127.0.0.1:5000/api/register', registerData);

      if (response.data.success) {
        setSuccess('회원가입이 완료되었습니다.');
        // 사용자 정보와 토큰 저장 (백엔드에서 반환한 완전한 정보 사용)
        const userInfo = {
          ...response.data.user,
          token: response.data.token
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        // 전역 상태 업데이트(자동 로그인)
        if (setIsLoggedIn) setIsLoggedIn(true);
        if (setUserInfo) setUserInfo(userInfo);
        // 회원가입 성공 시 폼 초기화
        setFormData(initialFormData);
        setIdChecked(false);
        setSelectedAllergies([]);
        setFieldErrors(initialFieldErrors);
        // 즉시 식단표 페이지로 이동
        navigate('/diet-plan');
        return;
      } else {
        setError(response.data.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          (err.request ? '서버에 연결할 수 없습니다.' : '알 수 없는 오류가 발생했습니다.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 유효성 검사 함수들
  const validateId = (id) => /^[a-zA-Z0-9]{4,16}$/.test(id);

  const validatePassword = (password) => {
    if (password.length < 8 || password.length > 16) {
      return {
        isValid: false,
        message: '비밀번호는 8~16자 사이여야 합니다.'
      };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    const conditionsMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars]
      .filter(Boolean).length;

    return {
      isValid: conditionsMet >= 2,
      message: conditionsMet >= 2 ? '' : '비밀번호는 영문 대/소문자, 숫자, 특수문자 중 2가지 이상을 포함해야 합니다.'
    };
  };

  const validateName = (name) => /^[가-힣a-zA-Z]+$/.test(name);

  const validateEmailId = (emailId) => /^[a-zA-Z0-9]+$/.test(emailId);

  const validateEmailDomain = (domain) => /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/.test(domain);

  const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return false;
    const cleanNumber = phoneNumber.replace(/-/g, '');
    if (cleanNumber.length < 10 || cleanNumber.length > 11) return false;
    const firstPart = cleanNumber.substring(0, 3);
    return ['010', '011', '016', '017', '018', '019'].includes(firstPart);
  };

  const validateKidName = (name) => /^[가-힣a-zA-Z]+$/.test(name);

  return (
    <div className="auth-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <IdField 
          formData={formData} 
          setFormData={setFormData} 
          idChecked={idChecked} 
          setIdChecked={setIdChecked} 
        />
        <PasswordField 
          formData={formData} 
          setFormData={setFormData} 
          fieldErrors={fieldErrors}
        />
        <NameField formData={formData} setFormData={setFormData} />
        <EmailField formData={formData} setFormData={setFormData} />
        <PhoneField formData={formData} setFormData={setFormData} />
        <AddressField formData={formData} setFormData={setFormData} />
        <ChildInfoField formData={formData} setFormData={setFormData} />
        <AllergyField 
          selectedAllergies={selectedAllergies} 
          setSelectedAllergies={setSelectedAllergies} 
        />

        {error === '아이디 중복 확인을 해주세요.' ? (
          <p className="error-message">아이디 중복 확인을 해주세요.</p>
        ) : fieldErrors.password ? (
          <p className="error-message">비밀번호는 8~16자 사이여야 합니다.</p>
        ) : error === '우편번호와 주소를 입력해 주세요.' ? (
          <p className="error-message">우편번호와 주소를 입력해 주세요.</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : null}
        {success && <p className="success-message">{success}</p>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '처리 중...' : '회원가입'}
        </button>
      </form>

      <p className="auth-link">
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
};

export default Register;