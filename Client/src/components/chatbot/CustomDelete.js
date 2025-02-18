// MUI Imports
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// Image Imports
import TrashIcon from "../../assets/icons/trash.svg";
import Colors from '../../Helper/Colors';

const CsDelete = (props) => {
    // Props
    const { open, onClose, handleDelete, label, loading } = props;

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={onClose}
            sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 512, borderRadius: '1rem' } }}
        >
            <DialogContent sx={{p: '40px 24px 10px 24px'}}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                    }}
                >
                    <Box sx={{ maxWidth: '85%' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                p: '1rem',
                                bgcolor: 'rgba(217, 45, 32, 0.2)',
                                borderRadius: '50%',
                                width: 'max-content',
                                mx: 'auto'
                            }}
                        >
                            <Box component={'img'} src={TrashIcon} sx={{ width: 50, height: 50 }} />
                        </Box>
                        <Typography sx={{ color: Colors.black, fontWeight: 500, fontSize: '2rem' }}>
                            Are you sure?
                        </Typography>
                    </Box>
                    <Typography>You won't be able to revert {label}!</Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', gap: '1rem', pb: '40px' }}>
                <Button
                    variant="outlined"
                    size="large"
                    onClick={onClose}
                    disabled={loading}
                    sx={{ borderRadius: '8px', borderColor: Colors.black, color: Colors.black }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleDelete}
                    disabled={loading}
                    sx={{ borderRadius: '8px', bgcolor: Colors.black, color: Colors.white }}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CsDelete;
