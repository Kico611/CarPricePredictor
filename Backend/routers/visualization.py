import matplotlib
matplotlib.use("Agg")

from fastapi import APIRouter
from fastapi.responses import JSONResponse
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
import pandas as pd

router = APIRouter()
data = pd.read_csv("data_viz.csv")

# Keš u memoriji za slike
cache = {}

# Utility funkcija za konverziju figure u base64
def fig_to_base64(fig=None):
    buf = io.BytesIO()
    if fig is None:
        plt.savefig(buf, format="png", bbox_inches="tight")
        plt.close()
    else:
        fig.savefig(buf, format="png", bbox_inches="tight")
        plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")

# Pomoćna funkcija za histograme s keširanjem
def get_histogram_image(column, title, xlim=None):
    key = f"histogram_{column}"
    if key in cache:
        return cache[key]

    fig, ax = plt.subplots(figsize=(6, 4))
    sns.histplot(data[column].dropna(), kde=True, ax=ax)
    ax.set_title(title)
    if xlim:
        ax.set_xlim(*xlim)
    img = fig_to_base64(fig)
    cache[key] = img
    return img

# Rute za histograme
@router.get("/histogram/engine_hp")
def histogram_engine_hp():
    img = get_histogram_image('Engine HP', 'Distribucija: Engine HP')
    return JSONResponse(content={"image_base64": img})

@router.get("/histogram/engine_cylinders")
def histogram_engine_cylinders():
    img = get_histogram_image('Engine Cylinders', 'Distribucija: Engine Cylinders')
    return JSONResponse(content={"image_base64": img})

@router.get("/histogram/number_of_doors")
def histogram_number_of_doors():
    img = get_histogram_image('Number of Doors', 'Distribucija: Number of Doors')
    return JSONResponse(content={"image_base64": img})

@router.get("/histogram/highway_mpg")
def histogram_highway_mpg():
    img = get_histogram_image('highway MPG', 'Distribucija: Highway MPG')
    return JSONResponse(content={"image_base64": img})

@router.get("/histogram/city_mpg")
def histogram_city_mpg():
    img = get_histogram_image('city mpg', 'Distribucija: City MPG')
    return JSONResponse(content={"image_base64": img})

@router.get("/histogram/popularity")
def histogram_popularity():
    img = get_histogram_image('Popularity', 'Distribucija: Popularity')
    return JSONResponse(content={"image_base64": img})

@router.get("/histogram/msrp")
def histogram_msrp():
    img = get_histogram_image('MSRP', 'Distribucija: MSRP', xlim=(0, 100000))
    return JSONResponse(content={"image_base64": img})

@router.get("/histogram/vehicle_age")
def histogram_vehicle_age():
    img = get_histogram_image('Vehicle Age', 'Distribucija: Vehicle Age')
    return JSONResponse(content={"image_base64": img})

# Kategorijske varijable s keširanjem
# Pomoćna funkcija za countplot s keširanjem
def get_countplot_image(column, title):
    key = f"countplot_{column}"
    if key in cache:
        return cache[key]

    fig, ax = plt.subplots(figsize=(10, 4))
    sns.countplot(data=data, x=column, ax=ax)
    ax.set_title(title)
    ax.set_xlabel('')
    ax.set_ylabel('')
    ax.tick_params(axis='x', rotation=90)
    plt.tight_layout()

    img = fig_to_base64(fig)
    cache[key] = img
    return img

# Rute za kategorijske varijable (svaka zasebno)
@router.get("/categorical/make")
def categorical_make():
    img = get_countplot_image('Make', 'Distribucija za Make')
    return JSONResponse(content={"image_base64": img})

@router.get("/categorical/engine_fuel_type")
def categorical_engine_fuel_type():
    img = get_countplot_image('Engine Fuel Type', 'Distribucija za Engine Fuel Type')
    return JSONResponse(content={"image_base64": img})

@router.get("/categorical/transmission_type")
def categorical_transmission_type():
    img = get_countplot_image('Transmission Type', 'Distribucija za Transmission Type')
    return JSONResponse(content={"image_base64": img})

@router.get("/categorical/driven_wheels")
def categorical_driven_wheels():
    img = get_countplot_image('Driven_Wheels', 'Distribucija za Driven Wheels')
    return JSONResponse(content={"image_base64": img})

@router.get("/categorical/vehicle_size")
def categorical_vehicle_size():
    img = get_countplot_image('Vehicle Size', 'Distribucija za Vehicle Size')
    return JSONResponse(content={"image_base64": img})

@router.get("/categorical/vehicle_style")
def categorical_vehicle_style():
    img = get_countplot_image('Vehicle Style', 'Distribucija za Vehicle Style')
    return JSONResponse(content={"image_base64": img})

# MSRP scatter s keširanjem
@router.get("/msrp-scatter")
def get_msrp_scatter():
    key = "msrp_scatter"
    if key in cache:
        return JSONResponse(content={"image_base64": cache[key]})

    sorted_data = data.sort_values(by='MSRP')
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.scatter(sorted_data.index, sorted_data['MSRP'], alpha=0.5)
    ax.set_ylim(0, 100000)
    ax.set_ylabel('MSRP')
    ax.set_xlabel('Index (sortirano po MSRP)')
    ax.set_title('MSRP (sortirano, ograničeno na $100k)')
    plt.tight_layout()

    img = fig_to_base64(fig)
    cache[key] = img
    return JSONResponse(content={"image_base64": img})

# Scatter plot snage motora i broja cilindara s keširanjem
@router.get("/engine-plots")
def get_engine_scatterplots():
    key = "engine_plots"
    if key in cache:
        return JSONResponse(content={"image_base64": cache[key]})

    fig, axes = plt.subplots(2, 1, figsize=(10, 10))
    sns.scatterplot(data=data, x='Engine HP', y='MSRP', alpha=0.6, ax=axes[0])
    axes[0].set_title('Ovisnost MSRP o snazi motora (Engine HP)')
    axes[0].set_xlabel('Engine HP')
    axes[0].set_ylabel('MSRP')

    sns.scatterplot(data=data, x='Engine Cylinders', y='Engine HP', alpha=0.6, ax=axes[1])
    axes[1].set_title('Ovisnost snage motora (Engine HP) o broju cilindara')
    axes[1].set_xlabel('Engine Cylinders')
    axes[1].set_ylabel('Engine HP')

    plt.tight_layout()

    img = fig_to_base64(fig)
    cache[key] = img
    return JSONResponse(content={"image_base64": img})



