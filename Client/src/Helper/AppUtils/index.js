// Third Party Imports
import CryptoJS from 'crypto-js'


const AppUtils = {
  // encode the string function
  decodeStr: function (str) {
    return CryptoJS.AES.decrypt(str && str !== null && str !== undefined && str, 'CHATBOT').toString(
      CryptoJS.enc.Utf8
    );
  },

  // decode the string function
  encodeStr: function (str) {
    return CryptoJS.AES.encrypt(str, 'CHATBOT').toString();
  },

  // getLoccalStorage Data
  setLocalStorage: (key, val) => localStorage.setItem(key, val),

  // getLoccalStorage Data
  removeLocalStorageItem: (key) => localStorage.removeItem(key),

  // setLoccalStorage Data
  getLocalStorage: (key) => {
    const data = typeof window !== 'undefined' && localStorage.getItem(key)

    const jPrs = data && data !== null && data !== undefined && JSON.parse(AppUtils.decodeStr(data))

    return jPrs
  },

  // apiError handle
  apiErrorHandling: function (formik, fields, error) {
    let isError = true;
    if (typeof error !== 'undefined' && error !== null) {
      for (let i = 0; i < fields.length; i++) {
        if (error[fields[i]]) {
          formik.setFieldTouched(fields[i], true, false);
          formik.setFieldError(fields[i], error[fields[i]]);
          isError = false;
        }
      }
    }
    return isError;
  },

  roundOff: function (value, decimals) {
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
  },

  checkValueFromArr: function (arr, fields) {
    let isValid = false;
    if (arr && arr.length > 0) {
      let passVal = 0;
      for (let i = 0; i < fields.length; i++) {
        if (arr.includes(fields[i])) {
          passVal++;
        }
      }
      if (passVal === fields.length) {
        isValid = true;
      }
    }
    return isValid;
  },

  checkValue: function (field) {
    return field !== undefined && field !== null && (typeof field === 'string' && field.trim() !== '' || typeof field === 'boolean' || typeof field === 'number' || typeof field === 'object');
  },

  checkFieldValue: function (data, field) {
    return AppUtils.checkValue(data) && data[field] !== undefined && data[field] !== null && (typeof data[field] === 'string' && data[field].trim() !== '' || typeof data[field] === 'boolean' || typeof data[field] === 'number' || typeof data[field] === 'object');
  },

  mobileNumberFormate: function (value) {
    let mNumString = value ? value.replace(/[^0-9]/g, '') : '';
    let formatted = '';
    if (mNumString.length > 0) {
      let block1 = mNumString.substring(0, 3);
      let block2 = mNumString.substring(3, 6);
      let block3 = mNumString.substring(6, 10);
      formatted = (block1 ? '(' + block1 + ')-' : '') + (block2 ? block2 + '-' : '') + (block3 || '');
    }
    return formatted;
  },

  randomId: function () {
    return Math.random().toString(36).substring(2, 7);
  },

  hexToRgba: function (hex, alpha) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  getRandomColor: function () {
    return '#' + Array.from({ length: 6 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
  },

};

export default AppUtils;
