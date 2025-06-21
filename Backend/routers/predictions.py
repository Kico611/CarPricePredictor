from fastapi import APIRouter
from pydantic import BaseModel
import joblib
import numpy as np
import os
import pandas as pd
import tensorflow as tf

# --- Postavi direktorij modela (apsolutna putanja) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # npr. Backend/routers
MODEL_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "models"))  # Backend/models

# --- Uvoz modela i skalera za XGBoost model ---
columns_to_encode = [
    'Make', 'Engine Fuel Type', 'Transmission Type',
    'Driven_Wheels', 'Vehicle Size', 'Vehicle Style'
]
label_encoders = {}
for col in columns_to_encode:
    file_path = os.path.join(MODEL_DIR, f"label_encoder_{col}.pkl")
    label_encoders[col] = joblib.load(file_path)

scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
model = joblib.load(os.path.join(MODEL_DIR, "xgb_model.pkl"))

# --- Definicija API Routera i ulaznog modela ---
router = APIRouter()

class CarFeatures(BaseModel):
    Make: str
    Engine_Fuel_Type: str
    Engine_HP: float
    Engine_Cylinders: float
    Transmission_Type: str
    Driven_Wheels: str
    Number_of_Doors: int
    Vehicle_Size: str
    Vehicle_Style: str
    Popularity: float
    Vehicle_Age: float
    average_mpg: float

# --- XGBoost endpoint ---
@router.post("/predict")
def predict(features: CarFeatures):
    try:
        encoded_features = {
            'Make': label_encoders['Make'].transform([features.Make])[0],
            'Engine Fuel Type': label_encoders['Engine Fuel Type'].transform([features.Engine_Fuel_Type])[0],
            'Transmission Type': label_encoders['Transmission Type'].transform([features.Transmission_Type])[0],
            'Driven_Wheels': label_encoders['Driven_Wheels'].transform([features.Driven_Wheels])[0],
            'Vehicle Size': label_encoders['Vehicle Size'].transform([features.Vehicle_Size])[0],
            'Vehicle Style': label_encoders['Vehicle Style'].transform([features.Vehicle_Style])[0]
        }
    except ValueError as e:
        return {"error": f"Unknown category in input: {str(e)}"}

    input_vector = [
        encoded_features['Make'],
        encoded_features['Engine Fuel Type'],
        features.Engine_HP,
        features.Engine_Cylinders,
        encoded_features['Transmission Type'],
        encoded_features['Driven_Wheels'],
        features.Number_of_Doors,
        encoded_features['Vehicle Size'],
        encoded_features['Vehicle Style'],
        features.Popularity,
        features.Vehicle_Age,
        features.average_mpg
    ]

    numeric_indices = [2, 3, 9, 10, 11]
    numeric_values = np.array([input_vector[i] for i in numeric_indices]).reshape(1, -1)
    numeric_values_scaled = scaler.transform(numeric_values).flatten()

    for idx, val in zip(numeric_indices, numeric_values_scaled):
        input_vector[idx] = val

    input_np = np.array(input_vector).reshape(1, -1)
    prediction = model.predict(input_np)

    return {"predicted_MSRP": float(prediction[0])}

# --- Učitavanje DL modela ---
ordinal_encoder = joblib.load(os.path.join(MODEL_DIR, "ordinal_encoder.pkl"))
scaler_dl = joblib.load(os.path.join(MODEL_DIR, "standard_scaler_dl.pkl"))
columns_template = joblib.load(os.path.join(MODEL_DIR, "columns_template.pkl"))
dl_model = tf.keras.models.load_model(os.path.join(MODEL_DIR, "dl_model.h5"))

ordinal_cat_cols = ['Make', 'Engine Fuel Type', 'Transmission Type', 'Driven_Wheels']

@router.post("/predict_dl")
def predict_dl(features: CarFeatures):
    input_dict = features.dict()
    if 'popularity' in input_dict:
        input_dict.pop('popularity')

    df = pd.DataFrame([input_dict])
    
    # Ispravno rename (dodaj Engine HP i Vehicle Age)
    df.rename(columns={
        'Engine_Fuel_Type': 'Engine Fuel Type',
        'Transmission_Type': 'Transmission Type',
        'Number_of_Doors': 'Number of Doors',
        'Vehicle_Size': 'Vehicle Size',
        'Vehicle_Style': 'Vehicle Style',
        'Engine_HP': 'Engine HP',
        'Vehicle_Age': 'Vehicle Age'
    }, inplace=True)

    # Provjeri postoji li 'Driven_Wheels'
    missing_cols = [col for col in ordinal_cat_cols if col not in df.columns]
    if missing_cols:
        return {"error": f"Missing columns in input: {missing_cols}"}

    try:
        df[ordinal_cat_cols] = ordinal_encoder.transform(df[ordinal_cat_cols])
    except ValueError as e:
        return {"error": f"Unknown category in input: {str(e)}"}

    # Pretvori ove stupce u string prije one-hot encodinga
    for col in ['Engine_Cylinders', 'Number_of_Doors']:
        if col in df.columns:
            df[col] = df[col].astype(str)

    # One-hot encoding
    df = pd.get_dummies(df, columns=[
        'Number of Doors', 'Vehicle Size', 'Vehicle Style'
    ])

    # Dodaj nedostajuće stupce iz templatea
    for col in columns_template:
        if col not in df.columns:
            df[col] = 0

    # Osiguraj točan redoslijed stupaca
    df = df[columns_template]

    # Skaliraj numeričke značajke, prvo provjeri da svi postoje
    numeric_cols = ['Engine HP', 'Vehicle Age', 'average_mpg']
    for col in numeric_cols:
        if col not in df.columns:
            df[col] = 0

    df[numeric_cols] = scaler_dl.transform(df[numeric_cols])

    # Pretvori u numpy array i predvidi
    input_np = df.values.astype(np.float32)  # osiguraj float32

    y_pred_log = dl_model.predict(input_np).flatten()
    y_pred = np.expm1(y_pred_log[0])

    return {"predicted_MSRP": float(y_pred)}