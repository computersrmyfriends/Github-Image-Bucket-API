
# Github Image Bucket API

![UI](UI.png)

This project is a proof of concept for using a GitHub repository as an image hosting service. The API allows users to upload, list, and delete image files from the repository, providing an easy interface to manage files hosted on GitHub.

## Table of Contents
-   [Installation](#installation)
-   [Environment Variables](#environment-variables)
-   [API Endpoints](#api-endpoints)
    -   [POST /upload](#post-upload)
    -   [GET /files](#get-files)
    -   [DELETE /delete](#delete)
-   [Utility Functions](#utility-functions)
-   [Running the Server](#running-the-server)

----------

## Installation

To set up and run this project, you need Node.js and npm installed on your system.

1.  Clone the repository:
    
    ```bash
    git clone https://github.com/MasFana/Github-Image-Bucket-API
    cd Github-Image-Bucket-API
    
    ```
    
2.  Install dependencies:
    
    ```bash
    npm install
    
    ```
    
3.  Set up environment variables by creating a `.env` file in the root directory with the following values:
    
    ```env
    GITHUB_TOKEN=<your_github_token>
    GITHUB_REPO=<your_github_repo>
    GITHUB_BRANCH=<your_github_branch>
    
    ```
    
4.  Start the server:
    
    ```bash
    npm start
    
    ```
    

The server will run on `http://localhost:3000`.

----------

## Environment Variables

The API requires the following environment variables to be set:

-   `GITHUB_TOKEN`: GitHub Personal Access Token for authentication.
-   `GITHUB_REPO`: GitHub repository name in the format `owner/repository`.
-   `GITHUB_BRANCH`: GitHub branch name where files will be uploaded.

----------

## API Endpoints

### POST /upload

Uploads a file to the configured GitHub repository.

#### Request

-   **Content-Type**: `multipart/form-data`
-   **Body**: A form-data containing a file under the key `file`.

#### Response

-   **200 OK**: If the file is successfully uploaded, returns the public URL of the uploaded file.
    
    ```json
    {
      "publicUrl": "https://raw.githubusercontent.com/<repo>/<branch>/uploads/<file_name>"
    }
    
    ```
    
-   **500 Internal Server Error**: If the upload fails, an error message is returned.
    
    ```json
    {
      "error": "Failed to upload the file"
    }
    
    ```
    

----------

### GET /files

Retrieves a list of all files uploaded to the GitHub repository.

#### Request

-   No parameters are required.

#### Response

-   **200 OK**: Returns a list of file names with their corresponding public URLs.
    
    ```json
    [
      {
        "name": "<file_name>",
        "url": "https://raw.githubusercontent.com/<repo>/<branch>/uploads/<file_name>"
      },
      ...
    ]
    
    ```
    
-   **500 Internal Server Error**: If there is an issue retrieving the file list, an error message is returned.
    
    ```json
    {
      "error": "Failed to retrieve files"
    }
    
    ```
    

----------

### DELETE /delete

Deletes a file from the GitHub repository.

#### Request

-   **Content-Type**: `application/json`
    
-   **Body**: JSON object with the file name to be deleted.
    
    ```json
    {
      "fileName": "<file_name>"
    }
    
    ```
    

#### Response

-   **200 OK**: If the file is successfully deleted, returns a success message.
    
    ```json
    {
      "message": "File \"<file_name>\" deleted successfully"
    }
    
    ```
    
-   **400 Bad Request**: If the file name is not provided in the request body.
    
    ```json
    {
      "error": "File name is required"
    }
    
    ```
    
-   **500 Internal Server Error**: If there is an error deleting the file, an error message is returned.
    
    ```json
    {
      "error": "Failed to delete the file"
    }
    
    ```
    

----------

## Utility Functions

-   **readFileAsBase64(filePath)**: Reads a file from the specified `filePath` and returns its content encoded as Base64.
-   **deleteLocalFile(filePath)**: Deletes a local file from the given `filePath`.
-   **getGithubFileSha(fileName)**: Retrieves the SHA hash of a file stored in the GitHub repository for deletion.
-   **uploadFileToGithub(file, content)**: Uploads a file to the GitHub repository with its Base64 content.
-   **deleteFileFromGithub(fileName, sha)**: Deletes a file from the GitHub repository using its SHA hash.

----------

## Running the Server

1.  Install all required dependencies:
    
    ```bash
    npm install
    
    ```
    
2.  Start the Express server:
    
    ```bash
    npm start
    
    ```
    
    The API will be available at `http://localhost:3000`.
    

----------

## Notes

-   Ensure that your GitHub repository is set up to accept file uploads and has the correct permissions for your GitHub token.
-   This API assumes that the uploaded files will be stored in the `uploads/` directory in the GitHub repository.