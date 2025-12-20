# ⚛️ Frontend (React/Vite)

This directory contains the user interface for the AI Symptom Checker, built using React and Vite.

## Installation and Running

To install and run the application, ensure you have Node.js (version 20.10.0 or higher) installed.

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
The application will typically start on http://localhost:5173.

Note: The application expects the Python FastAPI Backend (running on port 8000) to be running simultaneously to handle symptom processing and disease prediction.
### 4. Commit and Push the Changes

Finally, commit the new `README.md` file and push your work up to the new branch on GitHub.

```bash
# 1. Return to the root directory
cd .. 

# 2. Add the new README file
git add frontend/README.md

# 3. Commit the documentation
git commit -m "docs: Added installation README to frontend directory"

# 4. Push the latest changes to the current branch
git push
```