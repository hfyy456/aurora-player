import "./app.scss";
// console.log(
//   "[App.tsx]",
//   `Hello world from Electron ${process.versions.electron}!`
// );

function App(props) {
  const { children } = props;

  return (
    <div className="App">
      <div className="top-drag-area"></div>
      <div className="main-page">{children}</div>
    </div>
  );
}

export default App;
