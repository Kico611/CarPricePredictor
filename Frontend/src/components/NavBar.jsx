import { NavLink } from "react-router-dom";
import "./NavBar.css";

function NavBar() {
  return (
    <nav className="navbar">
      <NavLink
        to="/eda"
        className={({ isActive }) =>
          isActive ? "nav-link active-link" : "nav-link"
        }
      >
        🔍 EDA
      </NavLink>
      <NavLink
        to="/vizualizacija"
        className={({ isActive }) =>
          isActive ? "nav-link active-link" : "nav-link"
        }
      >
        📊 Vizualizacija
      </NavLink>
      <NavLink
        to="/predikcija"
        className={({ isActive }) =>
          isActive ? "nav-link active-link" : "nav-link"
        }
      >
        🔮 Predikcija
      </NavLink>
    </nav>
  );
}

export default NavBar;
