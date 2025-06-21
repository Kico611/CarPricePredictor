from fastapi import APIRouter, Query, HTTPException
import pandas as pd

router = APIRouter()

# Učitaj podatke jednom prilikom starta
data = pd.read_csv("data.csv")

column_descriptions = {
    "Make": "Naziv proizvođača automobila",
    "Model": "Model automobila",
    "Year": "Godina proizvodnje automobila",
    "Engine Fuel Type": "Vrsta goriva koje koristi motor",
    "Engine HP": "Snaga motora izražena u konjskim snagama (HP)",
    "Engine Cylinders": "Broj cilindara u motoru",
    "Transmission Type": "Vrsta prijenosa (npr. automatski, ručni)",
    "Driven_Wheels": "Pogon (npr. prednji, stražnji, 4x4)",
    "Number of Doors": "Broj vrata na vozilu",
    "Market Category": "Tržišna kategorija vozila (npr. luksuzni, sportski itd.)",
    "Vehicle Size": "Veličina vozila (npr. kompaktno, srednje, veliko)",
    "Vehicle Style": "Stil karoserije (npr. SUV, limuzina, hatchback)",
    "highway MPG": "Potrošnja goriva na autocesti (milje po galonu)",
    "city mpg": "Potrošnja goriva u gradu (milje po galonu)",
    "Popularity": "Popularnost brenda izražena brojem glasova",
    "MSRP": "Cijena vozila (USD)",
    "avg_mpg": "Prosječna potrošnja goriva (milje po galonu), izračunata kao prosjek highway i city MPG"  
}

@router.get("/info")
def get_data_info():
    info = {
        "total_rows": data.shape[0],
        "total_columns": data.shape[1],
        "columns": []
    }
    for col in data.columns:
        col_info = {
            "name": col,
            "dtype": str(data[col].dtype),
            "unique_values": data[col].nunique(),
            "description": column_descriptions.get(col, "Opis nije dostupan")
        }
        info["columns"].append(col_info)
    return info

@router.get("/summary")
def get_summary():
    desc = data.describe().to_dict()
    return desc

@router.get("/missing_values")
def get_missing_values():
    total_rows = len(data)
    missing_counts = data.isnull().sum()
    missing_info = {}

    for col, missing_count in missing_counts.items():
        missing_info[col] = {
            "missing_count": int(missing_count),
            "missing_percentage": round((missing_count / total_rows) * 100, 2),
        }

    return missing_info

@router.get("/value_counts")
async def value_counts():
    categorical_columns = [
        "Make",
        "Engine Fuel Type",
        "Transmission Type",
        "Driven_Wheels",
        "Market Category",
        "Vehicle Size",
        "Vehicle Style"
    ]

    result = {}
    for col in categorical_columns:
        counts = data[col].value_counts(dropna=True)
        total = counts.sum()
        # Vraćamo dict s count i percentage za svaku vrijednost
        counts_percent = {
            val: {
                "count": int(count),
                "percentage": round(count / total * 100, 2)
            }
            for val, count in counts.items()
        }
        result[col] = counts_percent

    return result

@router.get("/category_counts")
def get_category_counts(column: str = Query(..., description="Ime kategorijskog stupca")):
    if column not in data.columns:
        raise HTTPException(status_code=400, detail="Ne postoji takav stupac")
    if not pd.api.types.is_categorical_dtype(data[column]) and data[column].dtype != object:
        raise HTTPException(status_code=400, detail="Stupac nije kategorijski")
    counts = data[column].value_counts().to_dict()
    return counts

@router.get("/highlights")
def get_highlights():
    highlights = {}

    # Najskuplji i najjeftiniji
    max_price_row = data.loc[data["MSRP"].idxmax()]
    min_price_row = data.loc[data["MSRP"].idxmin()]
    highlights["najskuplji"] = {
        "Make": max_price_row["Make"],
        "Model": max_price_row["Model"],
        "Year": int(max_price_row["Year"]),
        "MSRP": int(max_price_row["MSRP"]),
        "Engine HP": float(max_price_row.get("Engine HP", 0)),
        "Driven Wheels": max_price_row.get("Driven_Wheels", "Nepoznato")
    }
    highlights["najjeftiniji"] = {
        "Make": min_price_row["Make"],
        "Model": min_price_row["Model"],
        "Year": int(min_price_row["Year"]),
        "MSRP": int(min_price_row["MSRP"]),
        "Engine Cylinders": int(min_price_row.get("Engine Cylinders", 0)),
        "Driven Wheels": min_price_row.get("Driven_Wheels", "Nepoznato")
    }

    # Najjači auto
    if "Engine HP" in data.columns:
        hp_row = data.loc[data["Engine HP"].idxmax()]
        highlights["najjaci"] = {
            "Make": hp_row["Make"],
            "Model": hp_row["Model"],
            "Year": int(hp_row["Year"]),
            "HP": float(hp_row["Engine HP"]),
            "MSRP": int(hp_row["MSRP"])
        }

    # Najekonomičniji auto (uzimajući u obzir i highway i city MPG)
    if "highway MPG" in data.columns and "city mpg" in data.columns:
        data["avg_mpg"] = (data["highway MPG"] + data["city mpg"]) / 2
        econ_row = data.loc[data["avg_mpg"].idxmax()]
        highlights["najekonomicniji"] = {
            "Make": econ_row["Make"],
            "Model": econ_row["Model"],
            "Year": int(econ_row["Year"]),
            "Highway MPG": int(econ_row["highway MPG"]),
            "City MPG": int(econ_row["city mpg"]),
            "Avg MPG": round(float(econ_row["avg_mpg"]), 2),
            "Engine Cylinders": int(econ_row.get("Engine Cylinders", 0))
        }
    elif "highway MPG" in data.columns:
        econ_row = data.loc[data["highway MPG"].idxmax()]
        highlights["najekonomicniji"] = {
            "Make": econ_row["Make"],
            "Model": econ_row["Model"],
            "Year": int(econ_row["Year"]),
            "Highway MPG": int(econ_row["highway MPG"]),
            "Engine Cylinders": int(econ_row.get("Engine Cylinders", 0))
        }

    # Najpopularnija marka
    top_make = data["Make"].value_counts().idxmax()
    highlights["najcesca_marka"] = top_make

    # Najčešći broj cilindara
    if "Engine Cylinders" in data.columns:
        top_cylinders = data["Engine Cylinders"].mode().iloc[0]
        highlights["najcesci_broj_cilindara"] = int(top_cylinders)

    # Najčešći tip pogona
    if "Driven_Wheels" in data.columns:
        top_drive = data["Driven_Wheels"].mode().iloc[0]
        highlights["najcesci_tip_pogona"] = top_drive

    # Najstariji auto
    if "Year" in data.columns:
        oldest_row = data.loc[data["Year"].idxmin()]
        highlights["najstariji_auto"] = {
            "Make": oldest_row["Make"],
            "Model": oldest_row["Model"],
            "Year": int(oldest_row["Year"]),
            "MSRP": int(oldest_row.get("MSRP", 0))
        }

    return highlights
