import React, { useRef, useEffect } from 'react';
import { CarbonFineCharts } from './CarbonFineCharts/CarbonFineCharts';
import { property, energy } from "@prisma/client";

interface ChartProps {
    propertyData: { property: Array<property> };
    energyData: { energy: Array<energy> };
    propertyId: number;
  }

const Charts: React.FC<ChartProps> = ({ propertyData, energyData, propertyId }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            new CarbonFineCharts({
                el: chartRef.current,
                propertyData: propertyData.property,
                energyData: energyData.energy,
                propertyId: propertyId
            });
        }
    }, [chartRef, propertyData, energyData, propertyId]);

    return (
        <div ref={chartRef} style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}></div>
    )
    
};

export default Charts;
