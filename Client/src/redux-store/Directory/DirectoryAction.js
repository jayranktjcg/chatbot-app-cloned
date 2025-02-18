import apiCall from "../../Helper/Service";
import { setDirectories, setModalDirectories, addDirectory, updateDirectory, removeDirectory, setLoading } from "./DirectoryReducer";

// ✅ Fetch directory list based on parent_id
export const fetchDirectoryList = async (parent_id, dispatch, type = "main") => {
  dispatch(setLoading(true));

  const res = await apiCall({
    url: `directory/list?parent_id=${parent_id}&page=1&limit=10`,
    method: "get",
    isHideToast: true
  });

  if (res?.status === 200) {
    const directories = res;
    if (type === "modal") {
      dispatch(setModalDirectories(directories));
    } else {
      dispatch(setDirectories(directories));
    }
  }

  dispatch(setLoading(false));
  return res;
};

// ✅ Create new directory
export const createDirectory = async (payload, dispatch) => {
  dispatch(setLoading(true));

  const res = await apiCall({
    url: `directory/create`,
    method: "post",
    data: { ...payload, type: payload.type || "directory" },
    isHideToast: true
  });

  if (res?.status === 201) {
    dispatch(addDirectory(res.data));
  }

  dispatch(setLoading(false));
  return res;
};

// ✅ Update directory name
export const editDirectory = async (directoryId, payload, dispatch) => {
    if (!directoryId) {
      console.error("Directory ID is undefined in edit request");
      return { status: 400, message: "Invalid Directory ID" };
    }
  
    const res = await apiCall({
      url: `directory/update/${directoryId}`, // ✅ Pass correct ID
      method: "put",
      data: payload,
      isHideToast: true
    });
  
    return res;
};  

// ✅ Delete a directory
export const deleteDirectory = async (id, dispatch) => {
  dispatch(setLoading(true));

  const res = await apiCall({
    url: `directory/remove/${id}`,
    method: "delete",
    isHideToast: true
  });

  if (res?.status === 200) {
    dispatch(removeDirectory(id));
  }

  dispatch(setLoading(false));
  return res;
};

// ✅ Move a directory to another parent
export const moveDirectory = async (id, newParentId, dispatch) => {
  dispatch(setLoading(true));

  const res = await apiCall({
    url: `directory/move/${id}`,
    method: "PATCH",
    data: { newParentId: newParentId },
    isHideToast: true
  });

  dispatch(setLoading(false));
  return res;
};

// ✅ Fetch file details
export const fetchFileDetails = async (id) => {
  return await apiCall({
    url: `directory/fileDetails/${id}`,
    method: "get",
    isHideToast: true
  });
};
