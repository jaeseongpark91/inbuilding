import React from 'react';
import { violations } from "@prisma/client"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Typography } from '@mui/material';


interface violationProps {
    violationData: { violations: Array<violations> } | null
}

const ViolationTable: React.FC<violationProps> = ({ violationData }) => {

    if (!violationData) {
        return null;
    }

    return (
        <div>
            <Typography variant='h6' sx={{display: 'flex', justifyContent: 'left', alignItems: 'left'}}>
                Violations
            </Typography>
            <TableContainer sx={{ width: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Table aria-label="violations">
                    <TableHead>
                        <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell>Number</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>File Date</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Disposition Date</TableCell>
                            <TableCell>Disposition Comments</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {violationData.violations.map((item, index) => (
                            <TableRow
                                key={`${item.isn_dob_bis_viol}_${index}`}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>Energy Related</TableCell>
                                <TableCell>{item.violation_number?.toString()}</TableCell>
                                <TableCell>{item.violation_type_clean?.toString()}</TableCell>
                                <TableCell>{item.issue_date?.toString()}</TableCell>
                                <TableCell>{item.description?.toString()}</TableCell>
                                <TableCell>{item.disposition_date?.toString()}</TableCell>
                                <TableCell>{item.disposition_comments?.toString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography color="text.secondary" variant='body2' sx={{ textAlign: 'left', p: 2}}>
                *Last updated 06/11/24 <br />
            </Typography>
        </div>

  );
};

export default ViolationTable;