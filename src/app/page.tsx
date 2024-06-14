'use client'

import { useState, useEffect, useRef } from 'react';
import { main, property, energy, violations } from "@prisma/client";
import SearchBar from "../components/SearchBar";
import SearchResult from "../components/SearchResult";
import Map from "../components/Map";
import Profile from "../components/Profile";
import useSWR from 'swr';
import Container from '@mui/material/Container';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import { Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Charts from "../components/Charts";
import EnergyUsageTable from "../components/EnergyUsageTable";
import CarbonFineTable from "../components/CarbonFineTable";
import ViolationTable from "../components/ViolationTable";
import { Suspense } from 'react';

const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

const fetchPosts = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch posts");
    }
    return response.json();
};

const Home = () => {
    const [mainData, setMainData] = useState<main | null>(null);
    const [propertyData, setPropertyData] = useState<{ property: Array<property> } | null>(null);
    const [energyData, setEnergyData] = useState<{ energy: Array<energy> } | null>(null);
    const [violationData, setViolationData] = useState<{ violations: Array<violations> } | null>(null);

    const { data: property } = useSWR<{ property: Array<property> }>(
        mainData ? `api/search?table=property&q=${mainData.id}` : null,
        fetchPosts
    );

    const { data: energy } = useSWR<{ energy: Array<energy> }>(
        mainData ? `api/search?table=energy&q=${mainData.id}` : null,
        fetchPosts
    );

    const { data: violations } = useSWR<{ violations: Array<violations> }>(
        mainData ? `api/search?table=violations&q=${mainData.nyc_borough_block_and_lot}` : null,
        fetchPosts
    );

    function onLoad(item: main) {
        setMainData(item);
    }

    useEffect(() => {
        if (property) {
            setPropertyData(property)
        }
        if (energy) {
            setEnergyData(energy)
        }
        if (violations) {
            setViolationData(violations)
        }
    }, [property, energy, violations]);

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Container fixed>
                <Box mt={10}>
                    <Stack spacing={5}>
                    <Typography variant='h2' sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        inbuilding
                    </Typography>
                    <SearchBar />
                    <Suspense>
                        <SearchResult onLoad={onLoad}/>
                    </Suspense>
                    {mainData && propertyData && energyData && violationData && (
                        <div>
                            <Divider />
                            <Typography variant='h5' sx={{display: 'flex', justifyContent: 'left', alignItems: 'left', mt: 3}}>
                                {mainData.property_name}
                            </Typography>
                            <Typography variant='body2' color="text.secondary">
                                {mainData.address_1}
                            </Typography>
                            <Grid container justifyContent="center" alignItems="center" spacing={10} sx={{ mt: 3 }} >
                                <Grid item xs={6}>
                                    <Map latitude={mainData.latitude} longitude={mainData.longitude} />
                                </Grid>
                                <Grid item xs={6}>
                                    <Profile propertyData={propertyData} />
                                </Grid>
                                <Grid item xs={12}>
                                    <EnergyUsageTable energyData={energyData} />
                                </Grid>
                                <Grid item xs={12}>
                                    <CarbonFineTable mainData={mainData} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Charts propertyData={propertyData} energyData={energyData} propertyId={mainData.id} />
                                </Grid>
                                <Grid item xs={12}>
                                    <ViolationTable violationData={violationData} />
                                </Grid>
                            </Grid>
                        </div>
                    )}
                    </Stack>
                </Box>
            </Container>
        </ThemeProvider>
    )
}

export default Home;