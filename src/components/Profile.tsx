import React from 'react';
import { property } from "@prisma/client"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Typography } from '@mui/material';


interface propetyPros {
    propertyData: { property: Array<property> } | null
}

const Profile: React.FC<propetyPros> = ({ propertyData }) => {

    if (!propertyData) {
        return null;
    }

    return (
        <div>
            <TableContainer sx={{ width: 500 }}>
                <Table aria-label="profile">
                    <TableHead>
                        <TableRow>
                            <TableCell>Property Use Type</TableCell>
                            <TableCell>Floor Area (sqft)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {propertyData.property.map((item, index) => (
                            <TableRow
                                key={`${item.property_id}_${index}`}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>{item.property_use_type}</TableCell>
                                <TableCell>{item.floor_area_sqft?.toString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography color="text.secondary" variant='body2' sx={{display: 'flex', justifyContent: 'left', alignItems: 'left', p: 1}}>
                *only largest, 2nd largest, and 3rd largest property type would be displayed
            </Typography>
        </div>

  );
};

export default Profile;


// interface propetyPros {
//     propertyData: { property: Array<property> } | null
// }

// const Profile: React.FC<propetyPros> = ({ propertyData }) => {

//     if (!propertyData) {
//         return null;
//     }

//     // Define table headers
//     const tableHeaders = [
//         "Property Use Type",
//         "Floor Area (sqft)"
//     ];

//     return (
//     <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '20px' }}>
//         <table style={{ borderCollapse: 'separate', borderSpacing: '15px' }}>
//             <thead>
//                 <tr>
//                     {tableHeaders.map((header) => (
//                         <th key={header}>{header}</th>
//                     ))}
//                 </tr>
//             </thead>
//             <tbody>
//                 {propertyData.property.map((item, index) => (
//                     <tr key={`${item.property_id}_${index}`}>
//                         <td style={{textAlign: 'center' }}>{item.property_use_type}</td>
//                         <td style={{textAlign: 'center' }}>{item.floor_area_sqft}</td>
//                     </tr>
//                 ))}
//             </tbody>
//         </table>
//     </div>
    
//   );
// };

// export default Profile;




