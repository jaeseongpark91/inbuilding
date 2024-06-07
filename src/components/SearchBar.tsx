'use client'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react';
import { TextField } from '@mui/material';

const SearchBar = () => {
    const [searchValue, setSearchValue] = useState('');
    const router = useRouter();

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const encodedSearchValue = encodeURI(searchValue);
        router.push(`/?q=${encodedSearchValue}`);
    };

    return (
        <form onSubmit={onSubmit} className="flex justify-center items-center">
            <TextField
                sx={{ width: 400}}
                id='search'
                label='Search'
                variant='outlined'
                onChange={(event) => setSearchValue(event.target.value)}
                />
        </form>
    );
};

export default SearchBar;
