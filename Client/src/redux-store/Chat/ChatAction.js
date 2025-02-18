// Service Imports
import apiCall from '../../Helper/Service';

// Action Imports
import { deleteChat, setHistory, setLoading, setPagination } from './ChatReducer'

export const getChatHistoryById = async (payload) => {

  const res = await apiCall({
    url: `chats/${payload}/messages`,
    method: 'get',
    isHideToast: true
  })

  return res
}

export const getChatHistoryByMessageId = async (id) => {

  const res = await apiCall({
    url: `chats/messages/${id}`,
    method: 'get',
    isHideToast: true
  });
  
  return res;
};

export const getChatHistory = async (payload, dispatch) => {

  const res = await apiCall({
    url: `chats?page=${payload?.page}&limit=${payload?.limit}`,
    method: 'get',
    isHideToast: true
  })

  if (res?.status === 200) {
    dispatch(setHistory(res?.data?.history))
    dispatch(setPagination(res?.data?.pagination))
  }

  return res
}

export const deleteChatData = async (payload, dispatch) => {

  dispatch(setLoading(true))

  const res = await apiCall({
    url: `chats/${payload}`,
    method: 'delete',
    isHideToast: true
  })

  res?.status === 200 && dispatch(deleteChat(payload))

  dispatch(setLoading(false))

  return res
}