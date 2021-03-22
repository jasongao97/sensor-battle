import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import socketIOClient from "socket.io-client";
import "./Play.css";

const INTERVAL = 200;

function Play() {
  const carNames = ["🟥 1号车", "🟦 2号车", "🟨 3号车"];
  const [playing, setPlaying] = useState(null);
  const [players, setPlayers] = useState([]);
  const intervals = [null, null, null, null, null];
  const socket = useRef();

  useEffect(() => {
    socket.current = socketIOClient();
    socket.current.on("connect", function () {
      console.log("connected");
      socket.current.emit("join", "Anonymous");
    });

    socket.current.on("status", function (players) {
      setPlayers(players);
    });

    return () => socket.current.disconnect();
  }, []);

  return (
    <>
      <div>
        <Link to="/" className="link">
          <h1 className="heading">
            Sensor Battle <br />
            传感器之战
          </h1>
        </Link>

        {playing !== null ? (
          <p className="info">
            正在驾驶 {carNames[playing]} <br />{" "}
            请使用下方键盘“前后移动”、“左右转弯”、“开火”
          </p>
        ) : (
          <p className="info">
            {players.length
              ? players.reduce((pre, cur) => cur && pre, true)
                ? "当前所有车辆都被占用，请稍等"
                : "点击选择一辆空闲车开始驾驶"
              : "正在连接服务器..."}
          </p>
        )}
      </div>

      {playing !== null ? (
        <div className="control-panel">
          <div className="key-pad">
            <div></div>
            <div
              className="key"
              onTouchStart={() => {
                intervals[0] = setInterval(() => {
                  socket.current.emit("action", "go");
                }, INTERVAL);
              }}
              onTouchEnd={() => {
                clearInterval(intervals[0]);
              }}
            >
              ↑
            </div>
            <div></div>
            <div
              className="key"
              onTouchStart={() => {
                intervals[1] = setInterval(() => {
                  socket.current.emit("action", "left");
                }, INTERVAL);
              }}
              onTouchEnd={() => {
                clearInterval(intervals[1]);
              }}
            >
              ←
            </div>
            <div
              className="key"
              onTouchStart={() => {
                intervals[2] = setInterval(() => {
                  socket.current.emit("action", "fire");
                }, INTERVAL);
              }}
              onTouchEnd={() => {
                clearInterval(intervals[2]);
              }}
            >
              开火
            </div>
            <div
              className="key"
              onTouchStart={() => {
                intervals[3] = setInterval(() => {
                  socket.current.emit("action", "right");
                }, INTERVAL);
              }}
              onTouchEnd={() => {
                clearInterval(intervals[3]);
              }}
            >
              →
            </div>
            <div></div>
            <div
              className="key"
              onTouchStart={() => {
                intervals[4] = setInterval(() => {
                  socket.current.emit("action", "back");
                }, INTERVAL);
              }}
              onTouchEnd={() => {
                clearInterval(intervals[4]);
              }}
            >
              ↓
            </div>
            <div></div>
          </div>
          <div
            className="release-button"
            onClick={() => {
              socket.current.emit("releasePosition");
              setPlaying(null);
            }}
          >
            结束驾驶并释放空位
          </div>
        </div>
      ) : (
        <ul className="car-list">
          {players.map((player, index) => (
            <li
              onClick={() => {
                if (player) return;
                socket.current.emit("requestToOperate", index);
                setPlaying(index);
              }}
              className={player && "disable"}
              key={index}
            >
              <h1>{carNames[index]}</h1>
              <p>{player ? "已占用" : "当前空闲（可选择）"}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default Play;
