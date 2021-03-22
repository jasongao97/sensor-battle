import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Play from "./Play";

function App() {
  return (
    <Router>
      <div className="App">
        <div className="container">
          <Switch>
            <Route path="/play">
              <Play />
            </Route>
            <Route path="/">
              <Index />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

function Index() {
  return (
    <>
      <div>
        <h1 className="heading">
          Sensor Battle <br />
          传感器之战
        </h1>
        <p className="info">
          2020 <br />
          互动游戏
        </p>
        <ul className="authors">
          <li>高亦非</li>
          <li>노혜수</li>
          <li>방민영</li>
          <li>尚蕊</li>
          <li>刘钊志</li>
        </ul>
        <p className="intro">
          在新冠大流行中，散落在世界各地的人们如何在物理世界中互动娱乐？我们创建了通过
          UDP
          服务器连接的实时传感器之战，三位玩家分别使用肌肉传感器、弯曲传感器和操纵杆来远程控制在真实世界中同一地点的遥控车。每辆车都装有帆布和喷枪，玩家通过在对方的画布上射击涂料消除对手。
        </p>
      </div>

      <Link to="/play" className="start-button">
        开始驾驶
      </Link>
    </>
  );
}

export default App;
