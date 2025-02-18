// Third Party Imports
import axios from 'axios'
import { toast } from 'react-toastify'

// Helper Imports
import UrlHelper from '../Url/index'
import AppUtils from '../AppUtils'

const statusCodes = [200, 201]

// interface Props {
//   url: string
//   isMultipart?: boolean
//   method: string
//   data?
//   isLogin?: boolean
//   isHideToast?: boolean
// }

// // Function to check if accessToken is expired (15 minutes)
// const isTokenExpired = (issueTime: number | null) => {
//   if (!issueTime) return true // Consider the token expired if there's no issueTime

//   const currentTime = new Date().getTime()
//   const fifteenMinutesInMilliseconds = 15 * 60 * 1000

//   return currentTime - issueTime >= fifteenMinutesInMilliseconds
// }

// // Function to get a new accessToken using the refresh token
// const refreshAccessToken = async () => {
//   try {
//     const refreshToken = Storage.get<any>(Constants.CONFIG_DATA)?.refreshToken
//     const response = await axios.post(`${UrlHelper.serverUrl}${UrlHelper.API_PATH}${APIConstants.REFRESH_TOKEN}`, {
//       refresh_token: refreshToken
//     })

//     if (AppUtils.checkValue(response?.data?.accessToken)) {
//       Storage.set(Constants.CONFIG_DATA, {
//         ...Storage.get<any>(Constants.CONFIG_DATA),
//         accessToken: response.data.accessToken,
//         tokenIssueTime: new Date().getTime()
//       })

//       return response.data.accessToken
//     }
//   } catch (error) {
//     console.error('Error refreshing token:', error)
//     throw error
//   }
// }

const redirectToLogin = () => {
  AppUtils.removeLocalStorageItem('CHATBOT')
  window.location.href = '/'
}

const apiCall = async (props) => {
  const { url, isMultipart, method, data, isLogin, isHideToast } = props

  let response

  // // Get accessToken and its issueTime from storage
  // let accessToken = Storage.get<any>(Constants.CONFIG_DATA)?.accessToken
  // let tokenIssueTime = Storage.get<any>(Constants.CONFIG_DATA)?.tokenIssueTime || null

  // // Check if token is expired and refresh if necessary
  // if (!isLogin && isTokenExpired(tokenIssueTime)) {
  //   try {
  //     accessToken = await refreshAccessToken()
  //   } catch (error) {
  //     console.error('Failed to refresh access token:', error)
  //     return // Handle token refresh failure appropriately
  //   }
  // }

  let header = {}

  let accessToken = AppUtils.getLocalStorage("CHATBOT")?.token || ''

  if (!isLogin) {
    header = {
      Authorization: `Bearer ${accessToken ?? ''}`,
      ...(isMultipart && { 'Content-Type': 'multipart/form-data' })
    }
  }

  try {
    response = await axios({
      method: method,
      url: `${UrlHelper.serverUrl}${url}`,
      headers: header,
      data: data
    })
  } catch (e) {
    console.log(':::service catch::::', e)
    response = e
  }

  if (statusCodes.some((item) => item === response?.data?.status)) {
    if (!isHideToast) {
      toast.success(response?.data?.message)
    }

    return response.data
  } else {

    response?.response?.data?.status === 401 && redirectToLogin()

    if (response?.response?.data?.message) {
      toast.error(
        response?.response?.data?.message,
        { position: 'top-right', closeOnClick: true, draggable: true }
      )
    } else {
      Object.entries(response.response.data.errors).forEach(([field, message]) => {
        toast.error(
          `${field}: ${message}`,
          { position: 'top-right', closeOnClick: true, draggable: true }
        )
      });

      return response?.response?.data
    }
  }

  if (isLogin) return response?.data
  else return response?.response?.data
}

export default apiCall
