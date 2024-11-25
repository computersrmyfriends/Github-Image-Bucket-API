const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Initialize Express app
const app = express();
const PORT = 3000;
app.use(express.json());

// Configure Multer for file uploads
const upload = multer({ dest: "upload/" });

// GitHub API details
const GITHUB_API_BASE = "https://api.github.com";
const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH } = process.env;

// Utility functions
const readFileAsBase64 = (filePath) => fs.readFileSync(filePath, { encoding: "base64" });
const deleteLocalFile = (filePath) => fs.unlinkSync(filePath);
const getGithubFileSha = async (fileName) => {
    const githubFilePath = `uploads/${fileName}`;
    const response = await axios.get(
        `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${githubFilePath}`,
        { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
    );
    return response.data.sha;
};

const uploadFileToGithub = async (file, content) => {
    const githubFilePath = `uploads/${file.originalname}`;
    const response = await axios.put(
        `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${githubFilePath}`,
        {
            message: `Upload ${file.originalname}`,
            content,
            branch: GITHUB_BRANCH,
        },
        { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
    );
    return `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${githubFilePath}`;
};

const deleteFileFromGithub = async (fileName, sha) => {
    const githubFilePath = `uploads/${fileName}`;
    await axios.delete(
        `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${githubFilePath}`,
        {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
            data: {
                message: `Delete ${fileName}`,
                branch: GITHUB_BRANCH,
                sha: sha,
            },
        }
    );
};

// Route to upload and get public link
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const { file } = req;
        const filePath = path.resolve(file.path);
        const content = readFileAsBase64(filePath);
        const publicUrl = await uploadFileToGithub(file, content);
        deleteLocalFile(filePath);
        res.json({ publicUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to upload the file" });
    }
});

// Route to list all file URLs
app.get("/files", async (req, res) => {
    try {
        const response = await axios.get(
            `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/uploads`,
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
            }
        );
        const fileUrls = response.data.map((file) => ({
            name: file.name,
            url: `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/uploads/${file.name}`,
        }));
        res.json(fileUrls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve files" });
    }
});

// Route to delete a file
app.delete("/delete", async (req, res) => {
    const fileName = req.body.fileName;
    if (!fileName) {
        return res.status(400).json({ error: "File name is required" });
    }

    try {
        const sha = await getGithubFileSha(fileName);
        await deleteFileFromGithub(fileName, sha);
        res.json({ message: `File "${fileName}" deleted successfully` });
    } catch (error) {
        console.error("Error deleting file:", error.response?.data || error);
        res.status(500).json({ error: "Failed to delete the file" });
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
