import React from 'react'
import {ReactComponent as Logo} from "./logo.svg"

// logo source: https://www.svgrepo.com/svg/264279/lotus

export default function Branding() {
  return (
    <div style={{padding:"1rem 0", display:"flex", alignItems:"center"}}>
        <Logo width="2rem" height="2rem" fill="white"/>
        <h2 style={{marginLeft:"0.5rem", letterSpacing:"1px", color:"white", fontSize:"2rem"}}>breathr</h2>
    </div>
  )
}
