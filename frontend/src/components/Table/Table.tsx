import {
    Box,
    Button,
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
import StoreForm from "../Forms/StoreForm";
import axios from "axios";

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

export interface StoreData {
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

const initialStore = {
    store_id: 0,
    store_name: "",
    address: "",
    latitude: 0,
    longitude: 0,
    opening_hours: "",
    store_type: "",
    parking_availability: false,
    chain_name: "",
    departments: [{ department_name: "" }],
};

const Table = () => {
    const [rows, setRows] = useState<StoreData[]>([]);
    const autosizeOptions: GridAutosizeOptions = {
        includeOutliers: true,
    };
    const [formState, setFormState] = useState<"add" | "update" | null>(null);
    const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);

    const submitForm = async (
        currentFormState: "add" | "update" | null,
        store: StoreData
    ) => {
        try {
            if (currentFormState === "add") {
                console.log("add");
                const response = await axios.post(
                    "http://localhost:4000/api/stores",
                    store
                );
                setRows((prevRows) => [...prevRows, response.data]);
            } else if (currentFormState === "update") {
                console.log("update");
                const response = await axios.put(
                    `http://localhost:4000/api/stores/${store.store_id}`,
                    store
                );
                setRows((prevRows) =>
                    prevRows.map((row) =>
                        row.store_id === store.store_id ? store : row
                    )
                );
            } else {
                console.log("Error: cannot submit.");
            }
        } catch (error) {
            console.error("Error submiting form:", error);
        }
    };

    const handleUpdateClick = (id: number) => {
        const storeToUpdate = rows.find((row) => row.store_id === id);
        if (storeToUpdate) {
            setFormState("update");
            setSelectedStore(storeToUpdate);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:4000/api/stores");
        
                // Assuming the response structure is { status, message, response }
                const data = response.data.response;  // The stores are inside the "response" field
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
                    height: "100dvh",
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
                <Box
                    sx={{
                        width: "100%",
                        height: "500px",
                        display: "flex",
                        flexDirection: "column",

                    }}
                >
                    <DataGrid
                        getRowId={(row) => row.store_id}
                        getRowHeight={() => "auto"}
                        autosizeOptions={autosizeOptions}
                        columns={columns}
                        rows={rows}
                        checkboxSelection
                        onRowClick={(params) => handleUpdateClick(params.id as number)}
                        slots={{
                            toolbar: CustomToolbar,
                        }}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                            },
                        }}
                        sx={{
                            width: "100%",
                            backgroundColor: "white",
                            [`& .${gridClasses.cell}`]: {
                                mt: 1,
                                mb: 1,
                                display: "flex",
                                alignItems: "center",
                            },
                            [`& .${gridClasses.toolbarContainer}`]: {
                                p: 2,
                            },
                            [`& .${buttonClasses.root}`]: {
                                color: "black",
                            },
                        }}
                    ></DataGrid>

                </Box>
                <Button onClick={() => setFormState("add")}>Add store</Button>
                <Button onClick={() => setFormState("update")}>
                    Update store
                </Button>
                {formState && (
                    <StoreForm
                        mode={formState}
                        initialValues={formState === "add" ? initialStore : selectedStore || initialStore}
                        onSubmit={submitForm}
                    ></StoreForm>
                )}
            </Container>
        </ThemeProvider>
    );
};

export default Table;
