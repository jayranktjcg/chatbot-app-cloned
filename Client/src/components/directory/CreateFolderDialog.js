import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Typography, Breadcrumbs, Link, Card, CardContent, Grid, Dialog, DialogContent, TextField, DialogActions } from '@mui/material';
import Colors from '../../Helper/Colors';
import LeftArrowWhite from '../../assets/icons/leftArrowWhite.svg';
import AddFolderIcon from "../../assets/icons/addFolderIcon.svg";
import MainCreateFolder from "../../assets/icons/mainCreateFolder.svg";
import FolderCreateIcon from "../../assets/icons/folderCreateIcon.svg";
import DeleteFolderIcon from "../../assets/icons/deleteFolderIcon.svg";
import XClose from "../../assets/icons/XClose.svg";
import FolderIcon from "../../assets/icons/FolderIcon.svg";
import FilesIcon from "../../assets/icons/filesIcon.svg";
import HomeDirectory from "../../assets/icons/homeDirectory.svg";
import EditDirectory from "../../assets/icons/editDirectory.svg";
import MoveDirectory from "../../assets/icons/moveDirectory.svg";
import DeleteDirectory from "../../assets/icons/deleteDirectory.svg";
import { fetchDirectoryList, createDirectory, editDirectory, deleteDirectory, moveDirectory  } from "../../redux-store/Directory/DirectoryAction";
import FilePreviewModal from './FilePreviewModal';
import { getChatHistoryById, getChatHistoryByMessageId } from '../../redux-store/Chat/ChatAction';

const CreateFolderDialogContent = ({ open, onClose, folderData, folderName, setFolderName, error, handleSave }) => {
  return (
    <Dialog open={open} onClose={onClose} sx={{ '& .MuiDialog-paperWidthSm': { borderRadius: '20px', overflow: 'hidden', minWidth: '450px', width: '450px' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', m: '20px 20px 10px 20px' }}>
        <img src={FolderCreateIcon} alt="Add Folder" style={{ height: '50px', cursor: 'pointer' }} />
        <Button
          onClick={onClose}
          sx={{ backgroundColor: Colors.transparent, borderRadius: '50%', boxShadow: 'none', width: '30px', minWidth: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', "&:hover": { backgroundColor: Colors.transparent, color: Colors.white, boxShadow: 'none' } }}
        >
          <img src={XClose} alt="Close" style={{ height: '25px', cursor: 'pointer' }} />
        </Button>
      </Box>
      <DialogContent sx={{ textAlign: 'start', display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0 }}>
        <Typography sx={{ textAlign: 'start', fontSize: '1.3rem', fontWeight: 600, color: Colors.black, width: '100%' }}>
          {folderData ? `Rename “${folderName}”?` : "Create a New Folder"}
        </Typography>
        <Typography sx={{ textAlign: 'start', width: '100%', fontSize: '1rem', color: Colors.QuickTestQuestionColor, marginBottom: '10px' }}>
          {folderData ? "" : "Create and save your folders for your notes"}
        </Typography>
        <Box sx={{ width: '100%', mb: '1.5rem' }}>
          <Typography sx={{ color: Colors.black, fontWeight: 500, fontSize: '1.1rem', mb: '0.5rem', ml: '0' }}>Folder Name</Typography>
          <TextField
            variant="outlined"
            fullWidth
            placeholder='Enter Folder Name'
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: '2rem', borderColor: `${Colors.InputBorderColor} !important` }, '& .MuiInputBase-input': { padding: '12px 18px' } }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textTransform: 'capitalize',
              px: 2,
              py: 1,
              width: '100%',
              borderRadius: 50,
              backgroundColor: Colors.black,
              "&:hover": { backgroundColor: Colors.black, opacity: 0.8 },
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            {folderData ? "Update" : "Create"}
          </Button>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textTransform: 'capitalize',
              px: 2,
              py: 1,
              width: '100%',
              borderRadius: 50,
              color: Colors.black,
              boxShadow: 'none',
              borderStyle: 'solid',
              borderWidth: '1px',
              borderColor: Colors.InputBorderColor,
              backgroundColor: Colors.white,
              "&:hover": { backgroundColor: Colors.white, opacity: 0.8, color: Colors.black, boxShadow: 'none' },
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const CreateFolderDialog = ({ open, onClose, parentId = 0 }) => {
  const dispatch = useDispatch();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [folderData, setFolderData] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState([{ name: "All", id: 0 }]);
  const [directoriesMain, setDirectoriesMain] = useState([]);
  const [modalDirectories, setModalDirectories] = useState([]);
  const [modalBreadcrumbs, setModalBreadcrumbs] = useState([{ name: "All", id: 0 }]);
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [openMoveDialog, setOpenMoveDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [openChatModal, setOpenChatModal] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const directories = useSelector((state) => state.directory.directories);

  useEffect(() => {
    if (!openMoveDialog) {
      fetchDirectoryList(parentId, dispatch, "main");
    }
  }, [parentId, dispatch, openMoveDialog]);

  const handleSave = async () => {
    if (!folderName.trim()) {
      setError("Folder name is required");
      return;
    }
    setError("");

    const currentParentId = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1]?.id : 0;

    const payload = {
      name: folderName,
      parentId: currentParentId,
    };

    let response;
    if (folderData?.id) {
      response = await editDirectory(folderData.id, { name: folderName }, dispatch);
    } else {
      response = await createDirectory(payload, dispatch);
    }

    if (response?.status === 201 || response?.status === 200) {
      fetchDirectoryList(currentParentId, dispatch);
      setOpenDialog(false);
    } else {
      setError(response?.message || "Something went wrong");
    }
  };

  const handleOpenDialog = (folder = null) => {
    setFolderData(folder);
    setFolderName(folder?.name || "");
    fetchDirectoryList(0, dispatch, "modal");
    setOpenDialog(true);
  };

  const handleFolderClick = (folder) => {
    if (!isMoveDialogOpen) {
      setBreadcrumbs([...breadcrumbs, { name: folder.name, id: folder.id }]);
      fetchDirectoryList(folder.id, dispatch, "main");
    }
  };

  const handleFileClick = async (file) => {
    setSelectedFile(file);
    setOpenChatModal(true);
  
    if (!file.message_id) {
      return;
    }
  
    try {
      const response = await getChatHistoryByMessageId(file.message_id);
      if (response?.status === 200 && response?.data) {
        setSelectedFile({ ...file, message: response.data });
        setChatHistory(response?.data || []);
      } else {
        setChatHistory([]);
      }
    } catch (error) {
      setChatHistory([]);
    }
  };  
  
  const handleBreadcrumbClick = (index) => {
    if (openMoveDialog) {
      const newBreadcrumbs = modalBreadcrumbs.slice(0, index + 1);
      setModalBreadcrumbs(newBreadcrumbs);
      fetchDirectoryList(newBreadcrumbs[newBreadcrumbs.length - 1]?.id, dispatch, "modal");
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      fetchDirectoryList(newBreadcrumbs[newBreadcrumbs.length - 1]?.id, dispatch, "main");
    }
  };

  const handleOpenDeleteDialog = (folderId) => {
    setSelectedFolderId(folderId);
    setOpenDialogDelete(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDialogDelete(false);
    setSelectedFolderId(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedFolderId) {
      await deleteDirectory(selectedFolderId, dispatch);
      fetchDirectoryList(breadcrumbs[breadcrumbs.length - 1]?.id, dispatch);
    }
    handleCloseDeleteDialog();
  };

  const handleOpenMoveDialog = (item) => {
    setSelectedItem(item);
    setIsMoveDialogOpen(true);
    fetchDirectoryList(0, dispatch, "modal");
    setOpenMoveDialog(true);
  };  

  const handleCloseMoveDialog = () => {
    setIsMoveDialogOpen(false);
    setOpenMoveDialog(false);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', height: '65px' }}>
        <Button
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.close();
            }
          }}
          variant="contained"
          aria-label="back"
          edge="start"
          sx={{ 
            marginRight: '8px', backgroundColor: Colors.black, borderRadius: '50%', 
            width: { xs: '35px', md: '40px' }, minWidth: { xs: '35px', md: '40px' }, height: { xs: '35px', md: '40px' }, 
            display: 'flex', justifyContent: 'center', alignItems: 'center', "&:hover": { backgroundColor: Colors.black, color: Colors.white } 
          }}
        >
          <img src={LeftArrowWhite} alt="Back" style={{ height: '20px', cursor: 'pointer' }} />
        </Button>
        <Typography id="create-folder-dialog" sx={{ flexGrow: 1, textAlign: 'center', color: Colors.black, fontWeight: 600, fontSize: '24px' }}>
          Organize Your Content
        </Typography>
        <Button
          variant="contained"
          aria-label="add-folder"
          onClick={() => handleOpenDialog(null)}
          sx={{ 
            marginRight: '8px', backgroundColor: Colors.black, borderRadius: '50%', 
            width: { xs: '35px', md: '40px' }, minWidth: { xs: '35px', md: '40px' }, height: { xs: '35px', md: '40px' }, 
            display: 'flex', justifyContent: 'center', alignItems: 'center', "&:hover": { backgroundColor: Colors.black, color: Colors.white } 
          }}
        >
          <img src={AddFolderIcon} alt="Add Folder" style={{ height: '20px', cursor: 'pointer' }} />
        </Button>
      </Box>

      <Box sx={{ height: "calc(100vh - 118px)", overflow: "hidden", }}>
      
      {/* Breadcrumb Navigation */}
        <Breadcrumbs separator=">" aria-label="breadcrumb" sx={{ marginBottom: 2 }}>
          {breadcrumbs.map((folder, index) => (
            <Link
              key={index}
              component="button"
              onClick={() => handleBreadcrumbClick(index)}
              sx={{ textDecoration: "none", fontSize: "1rem", fontWeight: 500, color: index === breadcrumbs.length - 1 ? "black" : Colors.dangerRed, display: "flex", alignItems: "center", gap: 0.5,  }}
            >
              {index === 0 && <img src={HomeDirectory} style={{ height: '22px' }} />}
              {folder.name}
            </Link>
          ))}
        </Breadcrumbs>

        {/* Folders and Files Grid */}
        <Box sx={{ height: "calc(100vh - 200px)", overflow: "auto", p: '16px', width: '100%'}}>
          <Grid container spacing={1} sx={{height: '100%'}}>
            {directories && directories.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', height: '100%' }}>
                  <img src={MainCreateFolder} alt="Main Folder" style={{ width: '100px', height: 'auto' }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <Typography sx={{ px: 1, pb: 1, fontSize: '2rem', fontWeight: 600, color: Colors.black }}>
                      Organize Your Content
                    </Typography>
                    <Typography sx={{ px: 1, fontSize: '0.9rem', pb: 3, fontWeight: 500, color: Colors.black }}>
                      Create and manage folders to store your work efficiently
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => handleOpenDialog(null)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textTransform: 'capitalize',
                        px: 2,
                        py: 1,
                        borderRadius: 50,
                        backgroundColor: Colors.black,
                        "&:hover": { backgroundColor: Colors.black, opacity: 0.8 },
                        fontSize: '1rem',
                        fontWeight: 500,
                      }}
                    >
                      <img src={AddFolderIcon} alt="Add" style={{ marginRight: 8 }} />
                      Add Folder
                    </Button>
                  </Box>
                </Box>
              </Box>
            ) : (
              directories?.map((item, index) => (
                <Grid item xs={10} sm={8} md={2} key={index} sx={{height: 'max-content'}}>
                  <Card
                    onClick={() => item.type === "directory" ? handleFolderClick(item) : handleFileClick(item)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: '16px 0 30px 0',
                      cursor: item.type === "directory" ? "pointer" : "default",
                      borderRadius: "12px",
                      boxShadow: "none",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease-in-out",
                      "&:hover .action-buttons": {
                        opacity: 1,
                        transform: "translateY(6px)",
                      },
                    }}
                  >
                    <Box
                      className="folder-icon"
                      sx={{
                        width: "100px",
                        transition: "all 0.3s ease-in-out",
                      }}
                    >
                      <img src={item.type === "directory" ? FolderIcon : FilesIcon} alt={item.type} style={{ width: "100%", transition: "all 0.3s ease-in-out" }} />
                    </Box>
              
                    {/* Folder Name */}
                    <CardContent sx={{ padding: "0 !important", textAlign: "center" }}>
                      <Typography
                        fontSize="1rem"
                        fontWeight={500}
                        sx={{
                          p: 0,
                          color: Colors.black,
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.name}
                      </Typography>
              
                      {/* File Count */}
                      {item.totalFiles > 0 && (
                        <Typography
                          fontSize="0.8rem"
                          fontWeight={500}
                          sx={{
                            p: 0,
                            color: Colors.black,
                            background: Colors.transparent,
                            borderRadius: 30,
                            padding: "3px 10px",
                          }}
                        >
                          {item.totalFiles} Files
                        </Typography>
                      )}
                      <Box
                        className="action-buttons"
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          position: "absolute",
                          bottom: 10,
                          opacity: 0,
                          transform: "translateY(10px)",
                          transition: "all 0.3s ease-in-out",
                          width: "100%",
                          left: 0
                        }}
                      >
                        <Button sx={{ width: "35px", minWidth: "35px", '&:hover': {backgroundColor: Colors.transparent} }} onClick={(e) => { e.stopPropagation(); handleOpenDialog(item); }}>
                          <img src={EditDirectory} style={{ height: "22px" }} />
                        </Button>
                        {item.type === 'file' && (
                          <Button sx={{ width: "35px", minWidth: "35px", '&:hover': {backgroundColor: Colors.transparent} }} onClick={(e) => { e.stopPropagation(); handleOpenMoveDialog(item); }}>
                            <img src={MoveDirectory} style={{ height: "22px" }} />
                          </Button>
                        )}
                        <Button sx={{ width: "35px", minWidth: "35px", '&:hover': {backgroundColor: Colors.transparent} }} onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(item.id); }}>
                          <img src={DeleteDirectory} style={{ height: "18px" }} />
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))              
            )}
          </Grid>
        </Box>
      </Box>

      {selectedItem && (
        <MoveFolderDialog
          open={openMoveDialog}
          onClose={handleCloseMoveDialog}
          item={selectedItem}
        />
      )}

      <FilePreviewModal
        open={openChatModal}
        onClose={() => setOpenChatModal(false)}
        chatHistory={chatHistory}
        file={selectedFile}    
      />

      <CreateFolderDialogContent
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        folderData={folderData}
        folderName={folderName}
        setFolderName={setFolderName}
        error={error}
        handleSave={handleSave}
      />

      <Dialog open={openDialogDelete} onClose={handleCloseDeleteDialog} sx={{'& .MuiDialog-paperWidthSm' : {borderRadius: '20px', overflow: 'hidden', minWidth: '450px', width: '450px'}}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', m: '20px 20px 10px 20px'}}>
          <img src={DeleteFolderIcon} alt="Add Folder" style={{ height: '70px', cursor: 'pointer' }} />
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{backgroundColor: Colors.transparent, borderRadius: '50%', boxShadow: 'none',
              width: '30px', minWidth: '30px', height: '30px', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', "&:hover": { backgroundColor: Colors.transparent, color: Colors.white, boxShadow: 'none', } 
            }}
          >
            <img src={XClose} alt="Add Folder" style={{ height: '25px', cursor: 'pointer' }} />
          </Button>
        </Box>
        <DialogContent sx={{ textAlign: 'start', display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0}}>
          <Typography sx={{ textAlign: 'start', fontSize: '1.3rem', fontWeight: 600, color: Colors.black, width: '100%' }}>
            Delete “Folder Name”?
          </Typography>
          <Typography sx={{ textAlign: 'start', fontSize: '1rem', color: Colors.QuickTestQuestionColor, marginBottom: '10px' }}>
            Are you sure you want to delete this folder? This action cannot be undone.
          </Typography>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%'}}>
            <Button
              variant="contained"
              onClick={handleConfirmDelete}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textTransform: 'capitalize',
                px: 2,
                py: 1,
                width: '100%',
                borderRadius: 50,
                backgroundColor: Colors.RedColor,
                boxShadow: 'none',
                "&:hover": { backgroundColor: Colors.RedColor, opacity: 0.8, boxShadow: 'none', },
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              onClick={handleCloseDeleteDialog}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textTransform: 'capitalize',
                px: 2,
                py: 1,
                width: '100%',
                borderRadius: 50,
                color: Colors.black,
                boxShadow: 'none',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderColor: Colors.InputBorderColor,
                backgroundColor: Colors.white,
                "&:hover": { backgroundColor: Colors.white, opacity: 0.8, color: Colors.black, boxShadow: 'none', },
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

const MoveFolderDialog = ({ open, onClose, item }) => {
  const dispatch = useDispatch();
  const [moveDirectories, setMoveDirectories] = useState([]);
  const [moveBreadcrumbs, setMoveBreadcrumbs] = useState([{ name: "All", id: 0 }]);
  const [selectedMoveParentId, setSelectedMoveParentId] = useState(0);
  const [openCreateFolder, setOpenCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetchMoveDirectories(0);
    }
  }, [open]);  

  const fetchMoveDirectories = async (newParentId) => {
    const res = await fetchDirectoryList(newParentId, dispatch);
    if (res?.status === 200) {
      setMoveDirectories(res.data);
    }
  };

  const handleSaveFolder = async () => {
    if (!folderName.trim()) {
      setError("Folder name is required");
      return;
    }
    setError("");

    const payload = {
      name: folderName,
      parentId: selectedMoveParentId,
    };

    const response = await createDirectory(payload, dispatch);
    if (response?.status === 201 || response?.status === 200) {
      fetchMoveDirectories(selectedMoveParentId);
      setOpenCreateFolder(false);
    } else {
      setError(response?.message || "Something went wrong");
    }
  };

  const handleMoveBreadcrumbClick = (index) => {
    const newBreadcrumbs = moveBreadcrumbs.slice(0, index + 1);
    setMoveBreadcrumbs(newBreadcrumbs);
    setSelectedMoveParentId(newBreadcrumbs[newBreadcrumbs.length - 1]?.id);
    fetchMoveDirectories(newBreadcrumbs[newBreadcrumbs.length - 1]?.id);
  };

  const handleMoveFolderClick = (folder) => {
    setMoveBreadcrumbs([...moveBreadcrumbs, { name: folder.name, id: folder.id }]);
    setSelectedMoveParentId(folder.id);
    fetchMoveDirectories(folder.id);
  };

  const handleConfirmMove = async () => {
    if (!item || !selectedMoveParentId) return;
  
    const res = await moveDirectory(item.id, selectedMoveParentId, dispatch);
    if (res?.status === 200) {
      fetchDirectoryList(moveBreadcrumbs[moveBreadcrumbs.length - 1]?.id, dispatch, "modal");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{'& .MuiDialog-paperFullWidth' : {borderRadius: '20px', overflow: 'hidden', minHeight: '70vh'}}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', height: '65px' }}>
        <Typography id="create-folder-dialog" sx={{ flexGrow: 1, textAlign: 'center', color: Colors.black, fontWeight: 600, fontSize: '24px' }}>
          Move "{item?.name}"
        </Typography>
        <Button
          variant="contained"
          aria-label="add-folder"
          onClick={() => setOpenCreateFolder(true)}
          sx={{ 
            marginRight: '8px', backgroundColor: Colors.black, borderRadius: '50%', 
            width: { xs: '35px', md: '40px' }, minWidth: { xs: '35px', md: '40px' }, height: { xs: '35px', md: '40px' }, 
            display: 'flex', justifyContent: 'center', alignItems: 'center', "&:hover": { backgroundColor: Colors.black, color: Colors.white } 
          }}
        >
          <img src={AddFolderIcon} alt="Add Folder" style={{ height: '20px', cursor: 'pointer' }} />
        </Button>
      </Box>
      <DialogContent sx={{paddingTop: '1rem !important'}}>
        <Breadcrumbs separator=">" sx={{ marginBottom: 2, p: 0 }}>
          {moveBreadcrumbs.map((folder, index) => (
            <Link
              key={index}
              component="button"
              onClick={() => handleMoveBreadcrumbClick(index)}
              sx={{ textDecoration: "none", fontSize: "1rem", fontWeight: 500, color: index === moveBreadcrumbs.length - 1 ? "black" : Colors.dangerRed, display: "flex", alignItems: "center", gap: 0.5,  }}
            >
              {index === 0 && <img src={HomeDirectory} style={{ height: "22px" }} />}
              {folder.name}
            </Link>
          ))}
        </Breadcrumbs>

        <Box sx={{ height: "calc(100% - 100px)", overflow: "auto", p: '16px'}}>
          <Grid container spacing={2}>
            {moveDirectories.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '450px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', height: '100%' }}>
                  <img src={MainCreateFolder} alt="Main Folder" style={{ width: '100px', height: 'auto' }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <Typography sx={{ px: 1, pb: 1, fontSize: '2rem', fontWeight: 600, color: Colors.black }}>
                      Organize Your Content
                    </Typography>
                    <Typography sx={{ px: 1, fontSize: '0.9rem', pb: 3, fontWeight: 500, color: Colors.black }}>
                      Create and manage folders to store your work efficiently
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setOpenCreateFolder(true)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textTransform: 'capitalize',
                        px: 2,
                        py: 1,
                        borderRadius: 50,
                        backgroundColor: Colors.black,
                        "&:hover": { backgroundColor: Colors.black, opacity: 0.8 },
                        fontSize: '1rem',
                        fontWeight: 500,
                      }}
                    >
                      <img src={AddFolderIcon} alt="Add" style={{ marginRight: 8 }} />
                      Add Folder
                    </Button>
                  </Box>
                </Box>
              </Box>
            ) : (
              moveDirectories.map((folder) => (
                folder.type === "directory" && (
                  <Grid item xs={10} sm={8} md={2} key={folder.id}>
                    <Card
                      onClick={() => handleMoveFolderClick(folder)}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: '16px 0 30px 0',
                        cursor: folder.type === "directory" ? "pointer" : "default",
                        borderRadius: "12px",
                        boxShadow: "none",
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.3s",
                        "&:hover": { backgroundColor: "#f0f0f0" },
                      }}
                    >
                      <img src={FolderIcon} alt="Folder" style={{ width: "50px" }} />
                      <Typography
                        fontSize="1rem"
                        fontWeight={500}
                        sx={{
                          textAlign: 'center',
                          p: 0,
                          color: Colors.black,
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          wordBreak: "break-word",
                        }}
                      >
                        {folder.name}
                      </Typography>
                      {folder.totalFiles > 0 && (
                        <Typography
                          fontSize="0.8rem"
                          fontWeight={500}
                          sx={{
                            p: 0,
                            color: Colors.black,
                            background: Colors.transparent,
                            borderRadius: 30,
                            padding: "3px 10px",
                          }}
                        >
                          {folder.totalFiles} Files
                        </Typography>
                     )}
                    </Card>
                  </Grid>
                )
              ))
            )}
          </Grid>
        </Box>
        <CreateFolderDialogContent
          open={openCreateFolder}
          onClose={() => setOpenCreateFolder(false)}
          folderData={null} // This is a new folder creation
          folderName={folderName}
          setFolderName={setFolderName}
          error={error}
          handleSave={handleSaveFolder}
        />
      </DialogContent>

      <DialogActions sx={{borderTop: Colors.borderUserMessage}}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'capitalize',
            px: 2,
            py: 1,
            borderRadius: 50,
            color: Colors.black,
            boxShadow: 'none',
            borderStyle: 'solid',
            borderWidth: '1px',
            borderColor: Colors.InputBorderColor,
            backgroundColor: Colors.white,
            "&:hover": { backgroundColor: Colors.white, opacity: 0.8, color: Colors.black, boxShadow: 'none', },
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmMove}
          disabled={!selectedMoveParentId}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'capitalize',
            px: 2,
            py: 1,
            borderRadius: 50,
            backgroundColor: Colors.black,
            boxShadow: 'none',
            "&:hover": { backgroundColor: Colors.black, opacity: 0.8, boxShadow: 'none', },
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          Move Here
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateFolderDialog;
