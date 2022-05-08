import { useState, useLayoutEffect } from "react"

export default function useFullscreen(ref) {
    const [isFullscreen, setIsFullscreen] = useState(document[getFullscreenElement()] != null)
    const setFullscreen = () =>{
        if(ref==null) return;
        ref.current
        .requestFullscreen()
        .then(()=>{
            setIsFullscreen(document[getFullscreenElement()] != null)
        })
        .catch(()=>{
            setIsFullscreen(false)
        })
    }
    useLayoutEffect(()=>{
        document.onfullscreenchange = () => setIsFullscreen(document[getFullscreenElement()]!=null)
        return () => (document.onfullscreenchange = undefined)
    })
    return [isFullscreen, setFullscreen]
}
function getFullscreenElement() {
  let error = new Error("fullscreen API is not supported")
    if(!document.fullscreenEnabled){
      throw error
    }
    else if (typeof document.fullscreenElement !== "undefined") {
    return "fullscreenElement";
  } else if (typeof document.mozFullScreenElement !== "undefined") {
    return "mozFullScreenElement";
  } else if (typeof document.msFullscreenElement !== "undefined") {
    return "msFullscreenElement";
  } else if (typeof document.webkitFullscreenElement !== "undefined") {
    return "webkitFullscreenElement";
  } else {
    throw error
  }
}