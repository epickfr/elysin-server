const express = require("express");

const app = express();

const PORT = process.env.PORT || 10000;

// Allow JSON requests
app.use(express.json({
    limit: "256kb"
}));

// In-memory storage
const submissions = new Map();


// ========================================
// HOME
// ========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        status: "online",
        service: "Elysian Script Server"
    });
});


// ========================================
// SUBMIT SCRIPT
// ========================================

app.post("/api/scripts", (req, res) => {

    const {
        id,
        username,
        script
    } = req.body;


    // ------------------------------------
    // Validate ID
    // ------------------------------------

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            success: false,
            error: "id must be an integer"
        });
    }

    if (id < 10000000 || id > 99999999) {
        return res.status(400).json({
            success: false,
            error: "id must be exactly 8 digits"
        });
    }


    // ------------------------------------
    // Validate username
    // ------------------------------------

    if (
        typeof username !== "string" ||
        username.trim().length === 0
    ) {
        return res.status(400).json({
            success: false,
            error: "username is required"
        });
    }


    // ------------------------------------
    // Validate script
    // ------------------------------------

    if (
        typeof script !== "string" ||
        script.length === 0
    ) {
        return res.status(400).json({
            success: false,
            error: "script is required"
        });
    }


    // ------------------------------------
    // Limit username
    // ------------------------------------

    if (username.length > 100) {
        return res.status(400).json({
            success: false,
            error: "username is too long"
        });
    }


    // ------------------------------------
    // Create submission
    // ------------------------------------

    const submission = {
        id: id,
        username: username,
        script: script,
        receivedAt: new Date().toISOString()
    };


    // ------------------------------------
    // Store submission
    // ------------------------------------

    submissions.set(
        String(id),
        submission
    );


    // ------------------------------------
    // Server console
    // ------------------------------------

    console.log(
        `[Elysian] Received script`
    );

    console.log(
        `ID: ${id}`
    );

    console.log(
        `Username: ${username}`
    );


    // ------------------------------------
    // Response
    // ------------------------------------

    return res.status(201).json({
        success: true,
        id: id,
        message: "Script received successfully"
    });
});


// ========================================
// GET SCRIPT BY ID
// ========================================

app.get("/api/scripts/:id", (req, res) => {

    const id = req.params.id;

    const submission = submissions.get(id);


    if (!submission) {
        return res.status(404).json({
            success: false,
            error: "Submission not found"
        });
    }


    return res.json({
        success: true,
        submission: submission
    });
});


// ========================================
// GET ALL SUBMISSIONS
// ========================================

app.get("/api/scripts", (req, res) => {

    const allSubmissions =
        Array.from(submissions.values());

    return res.json({
        success: true,
        count: allSubmissions.length,
        submissions: allSubmissions
    });
});


// ========================================
// START SERVER
// ========================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `[Elysian] Server running on port ${PORT}`
        );

    }
);
