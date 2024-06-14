import React from 'react';
import { energy } from "@prisma/client"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Typography } from '@mui/material';


interface energyProps {
    energyData: { energy: Array<energy> } | null
}

const EnergyUsageTable: React.FC<energyProps> = ({ energyData }) => {

    if (!energyData) {
        return null;
    }

    return (
        <div>
            <Typography variant='h6' sx={{display: 'flex', justifyContent: 'left', alignItems: 'left'}}>
                Energy Usage
            </Typography>
            <TableContainer sx={{ width: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Table aria-label="energy">
                    <TableHead>
                        <TableRow>
                            <TableCell>Year</TableCell>
                            <TableCell>Energy Type</TableCell>
                            <TableCell>Unit</TableCell>
                            <TableCell>Usage</TableCell>
                            <TableCell>Carbon Emission 2024-2029 (tco2e)</TableCell>
                            <TableCell>Carbon Emission 2030-2034 (tco2e)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {energyData.energy.map((item, index) => (
                            <TableRow
                                key={`${item.property_id}_${index}`}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>2022</TableCell>
                                <TableCell>{item.energy_type}</TableCell>
                                <TableCell>{item.energy_usage_unit}</TableCell>
                                <TableCell>{item.energy_usage?.toString()}</TableCell>
                                <TableCell>{item.cce_2024_2029_tco2e?.toString()}</TableCell>
                                <TableCell>{item.cce_2030_2034_tco2e?.toString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography color="text.secondary" variant='body2' sx={{display: 'flex', justifyContent: 'left', alignItems: 'left', p: 1}}>
                *Based on Local Law 84 dataset
            </Typography>
        </div>

  );
};

export default EnergyUsageTable;