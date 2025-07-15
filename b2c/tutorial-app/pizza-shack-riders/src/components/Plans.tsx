/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Card, CardContent, Button, Container, Grid, Typography } from '@oxygen-ui/react';
import { useNavigate } from 'react-router-dom';
import { InsurancePlanCard } from "../model/insurance-plan";
import React from 'react';

const plans: InsurancePlanCard[] = [
    {
        title: 'Bicycle Rider',
        price: '200',
        description: [
            'Delivery for single location in one ride',
            'Delivery time: 30 minutes',
            'Delivery distance: 5 km',
        ],
        buttonText: 'Get started',
        buttonVariant: 'contained',
    },
    {
        title: 'Car Rider',
        price: '250',
        description: [
            'Delivery for 4 locations in one ride',
            'Delivery time: 2 hour',
            'Delivery distance: 15 km',
        ],
        buttonText: 'Get started',
        buttonVariant: 'contained',
    },
    {
        title: 'Delivery Van',
        price: '300',
        description: [
            'Delivery for 8 locations in one ride',
            'Delivery time: 4 hours',
            'Delivery distance: 30 km',
        ],
        buttonText: 'Get started',
        buttonVariant: 'contained',
    },
];

interface PlanProps {
    isAgeVerified: boolean;
    setIsDrawerOpen: (isDrawerOpen: boolean) => void;
}

export const Plans = (props: PlanProps) => {
    const { isAgeVerified, setIsDrawerOpen } = props;
    const navigate = useNavigate();

    /**
     * If the user is age verified, navigate to the success page. Else, open the age verification drawer.
     *
     * @param plan - The selected insurance plan.
     */
    const handlePlanSelection = (plan: InsurancePlanCard) => {
        if (isAgeVerified) {
            navigate("/success", { state: { plan: plan.title } });
        } else {
            setIsDrawerOpen(true);
        }
    }

    return (
        <Container maxWidth="lg" sx={{ py: 8, position: 'relative' }}>
            <Typography variant="h2" align="center" gutterBottom>
                Choose Your Ride Type
            </Typography>
            <Typography align="center" sx={{ mt: 4, mb: 6 }}>
           Select your rider plan based on your license type, age and your riding preferences.
            </Typography>
            <Grid container spacing={4} justifyContent="center">
                {plans.map((plan: InsurancePlanCard) => (
                    <Grid key={plan.title} xs={12} sm={6} md={4}>
                        <Card
                            elevation={2}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                },
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
                                <Typography 
                                    variant="h3" 
                                    align="center" 
                                    sx={{ 
                                        py: 2, 
                                        backgroundColor: 'background.paper', 
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    {plan.title}
                                </Typography>
                                <CardContent>
                                    <Typography variant="h4" align="center" sx={{ mb: 2, mt: 1 }}>
                                        ${plan.price}<Typography component="span" variant="body2">/mo</Typography>
                                    </Typography>
                                    {plan.description.map((line) => (
                                        <Typography key={line} align="center" sx={{ mb: 1 }}>
                                            {line}
                                        </Typography>
                                    ))}
                                </CardContent>
                            </CardContent>
                            <CardContent>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    disabled={!isAgeVerified}
                                    onClick={() => handlePlanSelection(plan)}
                                >
                                    {plan.buttonText}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
