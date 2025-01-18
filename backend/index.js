const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const PORT = 4000;

const clientId = "z7tN3TmIsD7pCDHiGciMLrOw8NkAKYB8";
const clientSecret =
    "SnOV6nYgAjDxBdWn_iI2B9MxF6CKVH9Vz5CtSilhxvEahXTn_WzGxpC4ul536IfD";

app.use(cors());
app.use(express.json());
app.use("/files", express.static(path.join(__dirname)));

const Pool = require("pg").Pool;
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "otvrac",
    password: "orbit",
    port: 5432,
});

app.get("/api/refresh-data", async (req, res) => {
    try {
        const query = `
        SELECT json_agg(
            json_build_object(
                'store_id', s.store_id,
                'store_name', s.store_name,
                'address', s.address,
                'latitude', s.latitude,
                'longitude', s.longitude,
                'opening_hours', s.opening_hours,
                'store_type', s.store_type,
                'parking_availability', s.parking_availability,
                'chain_name', s.chain_name,
                'departments', (
                    SELECT json_agg(
                        json_build_object('department_name', d.department_name)
                    )
                    FROM departments d
                    WHERE d.store_id = s.store_id
                    )
                )
            ) AS stores_json
        FROM stores s;`;

        const data = await pool.query(query);
        const stores = data.rows[0].stores_json || [];
        console.log("Fetched stores: ", stores);

        // Save JSON file
        const jsonFilePath = path.join(__dirname, "popis-lokalnih-ducana.json");
        console.log("json path ", jsonFilePath);
        fs.writeFileSync(jsonFilePath, JSON.stringify(stores, null, 2));

        // Save CSV file
        const csvFilePath = path.join(__dirname, "popis-lokalnih-ducana.csv");
        const csvHeaders = [
            "store_id",
            "store_name",
            "address",
            "latitude",
            "longitude",
            "opening_hours",
            "store_type",
            "parking_availability",
            "chain_name",
            "departments",
        ];
        const csvRows = [
            csvHeaders.join(","), // Add header row
            ...stores.map((store) =>
                [
                    store.store_id,
                    store.store_name,
                    store.address,
                    store.latitude,
                    store.longitude,
                    store.opening_hours,
                    store.store_type,
                    store.parking_availability,
                    store.chain_name,
                    JSON.stringify(store.departments),
                ]
                    .map((value) => `"${value || ""}"`) // Escape values
                    .join(",")
            ),
        ];
        fs.writeFileSync(csvFilePath, csvRows.join("\n"));

        res.status(200).json({
            status: "OK",
            message: "Data refreshed and files saved successfully",
            jsonFile: jsonFilePath,
            csvFile: csvFilePath,
        });
    } catch (error) {
        console.error("Error refreshing data:", error);
        res.status(500).json({
            status: "Error",
            message: "Failed to refresh data",
        });
    }
});

app.get("/api/stores", async (req, res) => {
    try {
        const query = `
        SELECT json_agg(
            json_build_object(
                'store_id', s.store_id,
                'store_name', s.store_name,
                'address', s.address,
                'latitude', s.latitude,
                'longitude', s.longitude,
                'opening_hours', s.opening_hours,
                'store_type', s.store_type,
                'parking_availability', s.parking_availability,
                        'chain_name', s.chain_name,
                'departments', (
                    SELECT json_agg(
                        json_build_object('department_name', d.department_name)
                    )
                    FROM departments d
                    WHERE d.store_id = s.store_id
                    )
                )
            ) AS stores_json
        FROM stores s;`;

        const data = await pool.query(query);
        const stores = data.rows[0]?.stores_json || [];

        const enrichedStores = stores.map((store) => ({
            "@context": "https://schema.org",
            "@type": "Store",
            name: store.store_name,
            address: {
                "@type": "PostalAddress",
                streetAddress: store.address,
            },
            geo: {
                "@type": "GeoCoordinates",
                latitude: store.latitude,
                longitude: store.longitude,
            },
            openingHours: store.opening_hours,
            additionalType: store.store_type,
            amenityFeature: {
                "@type": "LocationFeatureSpecification",
                name: "parking available: " + store.parking_availability,
            },
            brand: {
                "@type": "Brand",
                name: store.chain_name,
            },
            department: store.departments.map((dept) => ({
                "@type": "Organization",
                name: dept.department_name,
            })),
        }));
        res.status(200).json({
            status: "OK",
            message: "Fetched stores successfully",
            response: enrichedStores,
        });
    } catch (error) {
        console.log(error);
    }
});

app.post("/api/stores", async (req, res) => {
    const {
        store_name,
        address,
        latitude,
        longitude,
        opening_hours,
        store_type,
        parking_availability,
        chain_name,
        departments,
    } = req.body;

    console.log(req.body);

    if (
        !store_name ||
        !address ||
        !latitude ||
        !longitude ||
        !store_type ||
        !opening_hours ||
        !chain_name ||
        !departments
    ) {
        return res.status(400).json({
            status: "Error",
            message: "Invalid input data",
            response: null,
        });
    }

    try {
        const insertStoreQuery = `
        INSERT INTO stores (store_name, address, latitude, longitude, opening_hours, store_type, parking_availability, chain_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING store_id;
        `;
        const storeResult = await pool.query(insertStoreQuery, [
            store_name,
            address,
            latitude,
            longitude,
            opening_hours,
            store_type,
            parking_availability,
            chain_name,
        ]);

        const storeId = storeResult.rows[0].store_id;

        for (const department of departments) {
            const insertDepartmentQuery = `
            INSERT INTO departments (store_id, department_name)
            VALUES ($1, $2);
            `;
            await pool.query(insertDepartmentQuery, [
                storeId,
                department.department_name,
            ]);
        }
        

        res.status(201).json({
            status: "Created",
            message: "Store created successfully",
            response: {
                store_id: storeId,
                store_name,
                address,
                latitude,
                longitude,
                opening_hours,
                store_type,
                parking_availability,
                chain_name,
                departments,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            status: "Error",
            message: "Invalid input data",
            response: null,
        });
    }
});

app.get("/api/stores/:id", async (req, res) => {
    const storeId = req.params.id;

    try {
        const query = `
        SELECT json_build_object(
            'store_id', s.store_id,
            'store_name', s.store_name,
            'address', s.address,
            'latitude', s.latitude,
            'longitude', s.longitude,
            'opening_hours', s.opening_hours,
            'store_type', s.store_type,
            'parking_availability', s.parking_availability,
            'chain_name', s.chain_name,
            'departments', (
                SELECT json_agg(
                    json_build_object('department_name', d.department_name)
                )
                FROM departments d
                WHERE d.store_id = s.store_id
            )
        ) AS store_json
        FROM stores s
        WHERE s.store_id = $1;`;

        const data = await pool.query(query, [storeId]);

        if (data.rows.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "Store with given ID doesn't exist",
                response: null,
            });
        }

        res.status(200).json({
            status: "OK",
            message: "Fetched store",
            response: data.rows[0].store_json,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "Error fetching store",
            response: null,
        });
    }
});

app.put("/api/stores/:storeId", async (req, res) => {
    const storeId = req.params.storeId;
    const {
        store_name,
        address,
        latitude,
        longitude,
        opening_hours,
        store_type,
        parking_availability,
        chain_name,
        departments,
    } = req.body;

    try {
        const updateStoreQuery = `
        UPDATE stores
        SET store_name = $1, address = $2, latitude = $3, longitude = $4,
            opening_hours = $5, store_type = $6, parking_availability = $7, chain_name = $8
        WHERE store_id = $9;
        `;
        await pool.query(updateStoreQuery, [
            store_name,
            address,
            latitude,
            longitude,
            opening_hours,
            store_type,
            parking_availability,
            chain_name,
            storeId,
        ]);

        await pool.query("DELETE FROM departments WHERE store_id = $1", [
            storeId,
        ]);

        for (const department of departments) {
            const insertDepartmentQuery = `
            INSERT INTO departments (store_id, department_name)
            VALUES ($1, $2);
            `;
            await pool.query(insertDepartmentQuery, [
                storeId,
                department.department_name,
            ]);
        }

        res.status(200).json({
            status: "Updated",
            message: "Store updated successfully",
            response: {
                store_id: storeId,
                store_name,
                address,
                latitude,
                longitude,
                opening_hours,
                store_type,
                parking_availability,
                chain_name,
                departments,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            status: "Error",
            message: "Store with given ID doesn't exist",
            response: null,
        });
    }
});

app.delete("/api/stores/:id", async (req, res) => {
    const storeId = req.params.id;

    if (isNaN(storeId)) {
        return res.status(400).json({
            status: "Error",
            message: "Store with given ID doesn't exist",
            response: null,
        });
    }

    try {
        const checkStoreQuery = `
        SELECT * FROM stores WHERE store_id = $1;
        `;
        const storeResult = await pool.query(checkStoreQuery, [storeId]);

        if (storeResult.rows.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "Store with given ID doesn't exist",
                response: null,
            });
        }

        // Delete associated departments first to avoid foreign key constraints
        await pool.query("DELETE FROM departments WHERE store_id = $1", [
            storeId,
        ]);

        // Then delete the store
        const deleteStoreQuery = `
        DELETE FROM stores WHERE store_id = $1 RETURNING store_id;
        `;
        const deleteResult = await pool.query(deleteStoreQuery, [storeId]);

        // Check if the deletion was successful
        if (deleteResult.rows.length === 0) {
            return res.status(500).json({
                status: "Error",
                message: "Error deleting store",
                response: null,
            });
        }

        // Respond with success and the deleted ID
        res.status(200).json({
            status: "OK",
            message: "Store deleted",
            response: {
                deleted_id: deleteResult.rows[0].store_id,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "Error deleting store",
            response: null,
        });
    }
});

app.get("/api/store/opening_hours/:id", async (req, res) => {
    const storeId = req.params.id;

    if (isNaN(storeId)) {
        return res.status(400).json({
            status: "Error",
            message: "Invalid ID was given",
            response: null,
        });
    }

    try {
        const query = `
            SELECT s.store_id, s.store_name, s.opening_hours
            FROM stores s
            WHERE s.store_id = $1;
        `;
        const result = await pool.query(query, [storeId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "Store with given ID doesn't exist",
                response: null,
            });
        }

        const store = result.rows[0];
        res.status(200).json({
            status: "OK",
            message: "Fetched store time",
            response: {
                store_id: store.store_id,
                store_name: store.store_name,
                opening_hours: store.opening_hours,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "Internal server error",
            response: null,
        });
    }
});

app.get("/api/store/location/:id", async (req, res) => {
    const storeId = req.params.id;

    if (isNaN(storeId)) {
        return res.status(400).json({
            status: "Error",
            message: "Invalid ID was given",
            response: null,
        });
    }

    try {
        const query = `
            SELECT store_id, store_name, address, latitude, longitude
            FROM stores
            WHERE store_id = $1;
        `;
        const result = await pool.query(query, [storeId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "Store with given ID doesn't exist",
                response: null,
            });
        }

        const store = result.rows[0];
        res.status(200).json({
            status: "OK",
            message: "Fetched store location",
            response: {
                store_id: store.store_id,
                store_name: store.store_name,
                address: store.address,
                latitude: store.latitude,
                longitude: store.longitude,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "Internal server error",
            response: null,
        });
    }
});

app.get("/api/store/name/:id", async (req, res) => {
    const storeId = req.params.id;

    if (isNaN(storeId)) {
        return res.status(400).json({
            status: "Error",
            message: "Invalid ID was given",
            response: null,
        });
    }

    try {
        const query = `
            SELECT store_id, store_name
            FROM stores
            WHERE store_id = $1;
        `;
        const result = await pool.query(query, [storeId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "Store with given ID doesn't exist",
                response: null,
            });
        }

        const store = result.rows[0];
        res.status(200).json({
            status: "OK",
            message: "Fetched store name",
            response: {
                store_id: store.store_id,
                store_name: store.store_name,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "Internal server error",
            response: null,
        });
    }
});

app.get("/api-docs", (req, res) => {
    const openapiFilePath = path.resolve(__dirname, "../openapi.json");
    fs.readFile(openapiFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading OpenAPI spec file:", err);
            return res.status(500).json({
                status: "Error",
                message: "Failed to load OpenAPI specification",
                response: null,
            });
        }

        try {
            const openapiSpec = JSON.parse(data);
            res.status(200).json(openapiSpec);
        } catch (parseError) {
            console.error("Error parsing OpenAPI spec file:", parseError);
            return res.status(500).json({
                status: "Error",
                message: "Invalid OpenAPI specification",
                response: null,
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Running on: localhost:${PORT}`);
});
