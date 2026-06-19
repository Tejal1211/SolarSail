import ErrorBoundary from './components/ErrorBoundary.jsx';

function App() {
  return (
    <ErrorBoundary>
      <main className="app-root">
        <section>
          <h1>SolarSail</h1>
          <p>Welcome to your sustainability assistant.</p>
          <p>Log in to track carbon savings, complete missions, and earn achievements.</p>
        </section>
      </main>
    </ErrorBoundary>
  );
}

export default App;
