import React from 'react'
import { useState } from 'react'
import "./settings.css"
export default function Settings(props) {
    const [menu, setMenu] = useState(false)
  return (
    <div className="menu-container">
        <div onClick={()=>setMenu(!menu)}className={`hamburger-menu ${menu ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div className={`settings-menu ${menu ? "open" : ""}`}>
            {props.children}
        </div>
    </div>
  )
}
