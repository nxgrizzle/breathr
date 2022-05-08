import React from 'react'
import { useState, useEffect } from 'react'
import "./range.css"
export default function Slider(props) {
    let [style, setStyle] = useState({})
    useEffect(()=>{
        // for setting the fill in Chrome
        let fillValue = ((props.value-props.min) / (props.max-props.min))*100
        setStyle({background:`linear-gradient(to right, #00a6fb 0%, #00a6fb ${fillValue}%, white ${fillValue}%, white 100%)`})
    }, [props.value])
    const handleChange = (value) =>{
      // if value===0, set true on skip, else false
        props.handleDurationChange(props.breathState, value, value===0)
    }
  return (
    <div className="range">
        <p>{props.breathState}</p>
        <input style={style} type="range" min={props.min} max={props.max} value={props.value} onChange={(e)=>handleChange(parseInt(e.target.value))} className="slider" />
        <div className="value"><span>{props.value}</span></div>
    </div>
  )
}
