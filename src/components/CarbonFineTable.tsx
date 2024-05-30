import React from 'react';
import { main } from "@prisma/client"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Typography } from '@mui/material';


interface mainProps {
    mainData: main | null
}

const CarbonFineTable: React.FC<mainProps> = ({ mainData }) => {

    if (!mainData) {
        return null;
    }

    return (
        <div>
            <Typography variant='h6' sx={{display: 'flex', justifyContent: 'left', alignItems: 'left'}}>
                Carbon Emission & Fines
            </Typography>
            <TableContainer sx={{ width: 900, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Table aria-label="carbonFine">
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>2024-2029</TableCell>
                            <TableCell>2030-2034</TableCell>
                            <TableCell>2035-2039</TableCell>
                            <TableCell>2040-2049</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            <TableRow
                                key={`${mainData.id}_emission`}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>Emissions (tCO2e/ yr)</TableCell>
                                <TableCell>{mainData.cce_total_2024_2029?.toString()}</TableCell>
                                <TableCell>{mainData.cce_total_2030_2034?.toString()}</TableCell>
                                <TableCell>{mainData.cce_total_2030_2034?.toString()}</TableCell>
                                <TableCell>{mainData.cce_total_2030_2034?.toString()}</TableCell>
                            </TableRow>
                            <TableRow
                                key={`${mainData.id}_threshold`}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>Threshold (tCO2/ yr)</TableCell>
                                <TableCell>{mainData.cap_2024_2029?.toString()}</TableCell>
                                <TableCell>{mainData.cap_2030_2034?.toString()}</TableCell>
                                <TableCell>{mainData.cap_2035_2039?.toString()}</TableCell>
                                <TableCell>{mainData.cap_2040_2049?.toString()}</TableCell>
                            </TableRow>
                            <TableRow
                                key={`${mainData.id}_penalty`}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>Penalty($/ yr)</TableCell>
                                <TableCell>{mainData.fines_2024_2029?.toString()}</TableCell>
                                <TableCell>{mainData.fines_2030_2034?.toString()}</TableCell>
                                <TableCell>{mainData.fines_2035_2039?.toString()}</TableCell>
                                <TableCell>{mainData.fines_2040_2049?.toString()}</TableCell>
                            </TableRow>
                        </>
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography color="text.secondary" variant='body2' sx={{ textAlign: 'left', p: 2}}>
                *Emission is calculated based on 2022 Local Law 84 data <br />
                *2035-2039 and 2040-2049 carbon emssion were calculated based on 2030-2034 coefficient
            </Typography>
        </div>

  );
};

export default CarbonFineTable;