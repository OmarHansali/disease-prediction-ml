# 🏥 Disease Prediction & Details App  
*A symptom-based disease prediction web application*

---

## 🎯 What This App Does

This application allows users to:

- Select symptoms
- Predict the **top 5 most likely diseases**
- Click on any predicted disease to view:
  - 📋 Disease description
  - ⚠️ Precautions
  - 💊 Medications
  - 🥗 Diet recommendations
  - 🏃 Workout / activity advice

The goal is to assist **learning, awareness, and decision support**, not to replace medical professionals.

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- **Python 3.9+**
- **Node.js 18+**
- **npm**
- **Git**

---

## 📁 Project Structure

```
disease-prediction-ml/
│
├── backend/
│ ├── main.py
│ ├── data/
│ └── model/
│
├── frontend/
│ ├── src/
│ └── package.json
│
└── README.md
```

---

## 🚀 Setup & Run the Application

### 1️⃣ Clone the Repository
```bash
git clone <your-repository-url>
cd project-root
```

### 2️⃣ Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```
✔️ When successful, the backend will start running and load disease information.

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
✔️ Open your browser and go to the displayed local URL
(usually http://localhost:5173).

## 🧭 How to Use the App

### Step 1: Select Symptoms
- Choose symptoms from the list provided in the interface.

### Step 2: Analyze
- Click the **Analyze** button.
- The system predicts the **Top 5 most likely diseases**.

### Step 3: Explore Disease Details
- Click on **any predicted disease name**.
- A modal window opens showing:
  - 📋 Disease description  
  - ⚠️ Precautions  
  - 💊 Medications  
  - 🥗 Diet suggestions  
  - 🏃 Workout advice  

### Step 4: Compare Diseases
- Inside the modal, you can click **other diseases** from the list.
- Close the modal using:
  - ❌ Close button  
  - Clicking outside the modal  

---

## 📊 Output You’ll See
- Ranked disease predictions
- Probability-based confidence
- Medical guidance for each disease
- Clean, interactive interface

---

## ⚠️ Important Notes
- Disease names must match **exactly** between predictions and medical data.
- Some diseases may not display all sections if information is unavailable.
- The app is for **educational and decision-support purposes only**.

---

## 🩺 Intended Users
- Students (medical, data science, AI)
- Researchers
- Educators
- Developers exploring healthcare ML
- Clinicians (as a reference aid)

---

## ❗ Disclaimer
This application **does not provide medical diagnoses**.  
Always consult a qualified healthcare professional for medical advice.

---

✅ You’re now ready to run and use the app.
