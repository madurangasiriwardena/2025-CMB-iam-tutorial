import React, { useState } from 'react';
import { useAuthContext } from '@asgardeo/auth-react'
import './App.css'

function App() {
  const { state, signIn, signOut } = useAuthContext();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <>
    {state.isAuthenticated ? (
    <div className="app-container">
      <nav className="top-nav">
        <img src="/images/logo.jpg" alt="Pizza Shack Logo" className="logo" />
        <h1>Pizza Shack</h1>
        <div className="nav-buttons">
          <div className="dropdown">
            <span className="username" onClick={toggleDropdown}>Welcome! {state.username}</span>
            {dropdownVisible && (
              <div className="dropdown-content">
                <a href="https://myaccount.asgardeo.io/t/jayangak" className="account-button">My Account</a>
                <button onClick={() => signOut()} className="logout-button">Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <header>
        <p></p>
      </header>

      <main>
        {/* Pizza Menu Section */}
        <section className="menu">
          <h2>Our Menu</h2>
          <ul>
            <li>
              <img src="/images/margherita.jpg" alt="Margherita" />
              Margherita - $10
            </li>
            <li>
              <img src="/images/4-cheese.jpg" alt="4 Cheese" />
              4 Cheese - $12
            </li>
            <li>
              <img src="/images/pizza-marinara.jpg" alt="Pizza Marinara" />
              Pizza Marinara - $11
            </li>
          </ul>
        </section>

        {/* Order Form Section */}
        <section className="order">
          <h2>Place Your Order</h2>
          <form onSubmit={(e) => { e.preventDefault(); alert('Order placed!'); }}>
            <div>
              <label htmlFor="pizzaSelect">Select Pizza:</label>
              <select id="pizzaSelect" name="pizza">
                <option value="margherita">Margherita</option>
                <option value="pepperoni">Pepperoni</option>
                <option value="veggie">Veggie</option>
              </select>
            </div>
            <div>
              <label htmlFor="quantity">Quantity:</label>
              <input type="number" id="quantity" name="quantity" min="1" defaultValue="1" />
            </div>
            <button type="submit">Order Now</button>
          </form>
        </section>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} Pizza Shack. All rights reserved.</p>
      </footer>
    </div>
  ) : (
    <div className="login-box">
      <img src="/images/logo.jpg" alt="Pizza Shack Logo" className="login-logo" />
      <h1>Pizza Shack</h1>
      <p>Your favorite pizza delivery app!</p>
      <p>Please login</p>
      <button onClick={() => signIn()}>Login</button>
    </div>
  )}
  </>
  )
}

export default App;
