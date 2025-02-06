import React, {useState, useEffect} from 'react'

function App(){
  
  const [data, setData] = useState([{}])

  useEffect(() => {
      fetch("/tests").then(
          res => res.json()
      ).then(
          data => {
            setData(data)
            console.log(data)
          }
      )
  }, [])

  return (
    <div>
      {(typeof data.tests === 'undefined') ? (
        <p>Loading...</p>
      ):(
        data.tests.map((test, i) => (
          <p key = {i}>{test}</p>
        ))
      )}
    </div>
  )
}

export default App
