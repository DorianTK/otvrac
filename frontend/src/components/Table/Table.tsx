import {
    buttonClasses,
    Container,
    ThemeProvider,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import theme from "../../styles/theme";
import {
    DataGrid,
    GridAutosizeOptions,
    gridClasses,
    GridColDef,
} from "@mui/x-data-grid";
import CustomToolbar from "../CustomToolbar/CustomToolbar";

const columns: GridColDef[] = [
    {
        field: "store_id",
        headerName: "Store_Id",
        width: 70,
    },
    {
        field: "store_name",
        headerName: "Store Name",
        width: 200,
    },
    {
        field: "address",
        headerName: "Address",
        width: 300,
    },
    {
        field: "latitude",
        headerName: "Latitude",
        width: 150,
    },
    {
        field: "longitude",
        headerName: "Longitude",
        width: 150,
    },
    {
        field: "opening_hours",
        headerName: "Opening Hours",
        width: 150,
    },
    {
        field: "store_type",
        headerName: "Store Type",
        width: 150,
    },
    {
        field: "parking_availability",
        headerName: "Parking Availability",
        width: 150,
        type: "boolean",
    },
    {
        field: "chain_name",
        headerName: "Chain Name",
        width: 200,
    },
    {
        field: "departments",
        headerName: "Departments",
        width: 300,
        valueGetter: (params) => {
            if (Array.isArray(params)) {
                return params.map((param) => param.department_name).join(", ");
            }
        },
    },
];

interface StoreData {
    store_id: number;
    store_name: string;
    address: string;
    latitude: number;
    longitude: number;
    opening_hours: string;
    store_type: string;
    parking_availability: boolean;
    chain_name: string;
    departments: { department_name: string }[];
}

const Table = () => {
    const [rows, setRows] = useState<StoreData[]>([]);
    const autosizeOptions: GridAutosizeOptions = {
        includeOutliers: true,
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    "http://localhost:4000/api/stores"
                );
                const data = await response.json();
                const rowsWithId = data.map((row) => ({
                    ...row,
                }));
                setRows(rowsWithId);
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <Container
                sx={{
                    mb: 4,
                    mt: 4,
                    gap: 2,
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    height: "100vh",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography variant="h4" fontWeight={500}>
                    Popis lokalnih dućana - otvoreni podaci - Data Table
                </Typography>
                <Typography variant="h6" fontWeight={500}>
                    Ovo je web stranica koja prikazuje popis lokalnih dućana
                    koristeći otvorene podatke
                </Typography>
                <DataGrid
                    getRowId={(row) => row.store_id}
                    getRowHeight={() => "auto"}
                    autosizeOptions={autosizeOptions}
                    columns={columns}
                    rows={rows}
                    checkboxSelection
                    slots={{
                        toolbar: CustomToolbar,
                    }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                        },
                    }}
                    sx={{
                        backgroundColor: "white",
                        [`& .${gridClasses.cell}`]: {
                            mt: 1,
                            mb: 1,
                            display: "flex",
                            alignItems: "center",
                        },
                        [`& .${gridClasses.toolbarContainer}`]: {
                            p: 2
                        },
                        [`& .${buttonClasses.root}`]: {
                            color: "black",
                        },
                    }}
                ></DataGrid>
            </Container>
        </ThemeProvider>
    );
};

export default Table;
