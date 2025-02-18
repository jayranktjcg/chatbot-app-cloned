import { Box, Typography } from '@mui/material';
import React from 'react'
import Colors from '../../Helper/Colors';


const LoaderMessage = ({ isLoading }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                color: '#000',
                gap: '5px',
                padding: '10px 12px',
                width: 'max-content',
                border: Colors.borderUserMessage,
                borderRadius: '40px',
            }}
        >
             <Box className="bar-loader">
                <Box className="bar"></Box>
                <Box className="bar"></Box>
                <Box className="bar"></Box>
                <Box className="bar"></Box>
                <Box className="bar"></Box>
            </Box>
            <Typography variant="body2" sx={{whiteSpace: 'nowrap'}}>Analyzing...</Typography>
        </Box>
    );
};


export default LoaderMessage
