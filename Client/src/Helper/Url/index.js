const mode = {
  PRODUCTION: 'https://classgpt.in', // Production URL
  LOCAL: "http://localhost:3030" // Local URL
}

const appMode = process.env.REACT_APP_MODE // In Future use ENV value (currently it is static)

const UrlHelper = {
  serverUrl: `${mode[appMode]}/api/`,
  mediaURL: `${mode[appMode]}/`,
};


export default UrlHelper
