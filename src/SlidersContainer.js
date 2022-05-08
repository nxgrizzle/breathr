import React from 'react'

export default function SlidersContainer(props) {
  return (
    <div style={{background:"inherit", textAlign:"center"}}>
        <h3 style={{background:"inherit", marginBottom:"1rem"}}>Change Duration Sliders</h3>
        {props.children}
    </div>
  )
}
