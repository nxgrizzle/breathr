import React from 'react'

export default function Header(props) {
  return (
    <div style={{width:"calc(100vw - 1rem)", display:"flex", justifyContent:"space-between", alignItems:"center", margin:"0.25rem 1rem"}}>
        {props.children}
    </div>
  )
}
