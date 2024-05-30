import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const { q: query } = req.query;

            if (typeof query !== "string") {
                throw new Error("Invalid request")
            }

            // Search on the main table
            if (req.query.table === 'main') {
                const main = await prisma.main.findMany({
                    where: {
                        OR: [
                            {
                                property_name: {
                                    contains: query,
                                    mode: 'insensitive'
                                },
                            },
                            {
                                nyc_borough_block_and_lot: {
                                    contains: query,
                                    mode: 'insensitive'
                                },
                            },
                            {
                                nyc_building_identification: {
                                    contains: query,
                                    mode: 'insensitive'
                                },
                            },
                            {
                                address_1: {
                                    contains: query,
                                    mode: 'insensitive'
                                },
                            }
                        ]
                    }
                });
                res.status(200).json({ main });
            }
            // Search on the property table
            else if (req.query.table === 'property') {
                const queryValue = parseInt(query, 10); // Convert string to number
                // Check if the parsed queryValue is a valid number
                if (!isNaN(queryValue)) {
                    const property = await prisma.property.findMany({
                        where: {
                            property_id: {
                                equals: queryValue,
                            },
                        }
                    });
                    res.status(200).json({ property });
                } else {
                    throw new Error("Invalid provider id");
                };
            // Invalid table name provided
            } 
            // Search on the property table
            else if (req.query.table === 'energy') {
                const queryValue = parseInt(query, 10); // Convert string to number
                // Check if the parsed queryValue is a valid number
                if (!isNaN(queryValue)) {
                    const energy = await prisma.energy.findMany({
                        where: {
                            property_id: {
                                equals: queryValue,
                            },
                        }
                    });
                    res.status(200).json({ energy });
                } else {
                    throw new Error("Invalid provider id");
                };
            } else {
                throw new Error("Invalid table name");
            }
        } catch (error) {
            console.log(error);
            res.status(500).end();
        }
    }
    
};