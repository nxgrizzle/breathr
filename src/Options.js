import React from 'react'
import "./options.css"
export default function Options(props) {
  return (
    <div className="options-container" style={{width:"calc(100% - 1rem)", display:"flex", justifyContent:"space-between", alignItems:"center", margin:"1rem"}}>
        {props.children}
    </div>
  )
}
