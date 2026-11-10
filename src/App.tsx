import './App.css'

function App() {
  return (
    <>
      <main className="shell" id="app">
        <aside className="side" />
        <section className="stage" aria-label="En cours de lecture" />
        <div className="right qopen" id="right" />
        <footer className="strip" />
      </main>

      <div id="toast" role="status" aria-live="polite" />
    </>
  )
}

export default App
