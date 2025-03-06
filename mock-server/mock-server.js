const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Mock API for /api/v1/hero/owe-money
app.get('/api/v1/hero/owe-money', (req, res) => {
    const natid = req.query.natid;

    // ❌ Validate `natid` - Only numeric values allowed
    if (!natid || isNaN(natid)) {
        return res.status(400).json({ error: "Invalid or missing natid. It should be a number." });
    }

    // ✅ Simulated response from external system
    const externalResponse = {
        "data": `natid-${natid}`,
        "status": natid % 2 === 0 ? "NIL" : "OWE" // Even numbers return NIL, odd return OWE
    };

    // ✅ Final system response
    const systemResponse = {
        "message": externalResponse,
        "timestamp": new Date().toISOString()
    };

    console.log(`✅ Returning mock response for natid=${natid}:`, systemResponse);
    res.status(200).json(systemResponse);
});

// ✅ Mock API for /api/v1/voucher/by-person-and-type
app.get('/api/v1/voucher/by-person-and-type', (req, res) => {
    const mockResponse = {
        "data": [
            {
                "name": "John Doe",
                "voucherType": "Food",
                "count": 3
            },
            {
                "name": "Jane Smith",
                "voucherType": "Travel",
                "count": 5
            }
        ]
    };

    console.log("✅ Returning mock response for vouchers:", mockResponse);
    res.status(200).json(mockResponse);
});

// ✅ Start the mock server on port 5002
const PORT = 5002;
app.listen(PORT, () => {
    console.log(`✅ Mock API running at http://localhost:${PORT}`);
});

