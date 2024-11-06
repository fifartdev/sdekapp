// components/PasswordInput.js
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const PasswordInput = ({ password, setPassword }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="password-container relative w-full">
      <input
        type={showPassword ? "text" : "password"}
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:shadow-outline"
      />
      <FontAwesomeIcon
        icon={showPassword ? faEyeSlash : faEye}
        onClick={togglePasswordVisibility}
        className="toggle-password absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
      />
    </div>
  );
};

export default PasswordInput;
