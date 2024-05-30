'use client'

import { main } from '@prisma/client';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { fetchPosts } from '@/app/page';
import { useState } from 'react'; 
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'; 
import Button from '@mui/material/Button';

const SearchResult = (props: {onLoad: Function}) => {
    const search = useSearchParams();
    const searchQuery = search ? search.get('q') : null;
    const encodedSearchQuery = encodeURI(searchQuery || '')

    const { data } = useSWR<{ main: Array<main> }>(
        encodedSearchQuery !== '' ? `api/search?table=main&q=${encodedSearchQuery}` : null, 
        encodedSearchQuery !== '' ? fetchPosts : null
    )

    const [visible, setVisible] = useState(true)

    if (data === null || !data || !data.main || visible === false) {
        return null;
    } else {
        const currentMainData: Array<main> = data.main

        const handleLoadClick = (item: main) => {
            props.onLoad(item);
            setVisible(false)
        }

        const columns: GridColDef[] = [
            { 
                field: 'action',
                headerName: '',
                width: 100,
                renderCell: (params: GridRenderCellParams) => (
                    <Button 
                        variant="outlined"
                        color="success"
                        onClick={() => handleLoadClick(params.row)}
                    >
                        LOAD
                    </Button>
                )},
            { field: 'property_name', headerName: 'Property Name', width: 350 },
            { field: 'address_1', headerName: 'Address', width: 350 },
            { field: 'nyc_building_identification', headerName: 'BIN', width: 130 },
            { field: 'nyc_borough_block_and_lot', headerName: 'BBL', width: 130 }
          ];
    
        return (
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={currentMainData}
                    columns={columns}
                    initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    },
                    }}
                    pageSizeOptions={[5, 10]}
                />
            </div>
        );
    }
};

export default SearchResult;