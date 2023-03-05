import "./style.scss";
import { useNavigate } from "react-router-dom";
const { ipcRenderer } = require("electron");
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faMinus } from "@fortawesome/free-solid-svg-icons";
import { parseData } from "@/utils/message";
import Player from "@/components/Player";
import PlayCard from "@/components/PlayCard";
import BottomBar from "@/components/BottomBar";
import LeftBar from "@/components/LeftBar";
import LrcBox from "@/components/LrcBox";
export default function Home() {
  const [audioState, setAudioState] = useState({
    playing: false,
    currentTime: 0,
    info: {},
    volume: 80,
  });
  const [hideList, setHideList] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const startGame = () => {
    navigate("/main");
  };
  const [playList, setPlayList] = useState(null);
  useEffect(() => {
    ipcRenderer.on("getPlaylist", (event, args) => {
      let res = parseData(args);
      if (res.code == 0) {
        setPlayList(res.data.playList);
      }
      setLoading(false);
      console.log(res);
      // setPlayList(JSON.parse(args));
    });
    ipcRenderer.send("getDefaultList");
  }, []);

  const setHide = (bool) => {
    setHideList(bool);
  };
  const closeWindow = () => {
    mmsdk.closeWindow();
  };
  const minimizeWindow = () => {
    mmsdk.minimizeWindow();
  };
  return (
    <div className="home-container">
      <div className="cls-btn top-btn" onClick={closeWindow}>
        <FontAwesomeIcon icon={faClose} />
      </div>{" "}
      <div className="mini-btn top-btn" onClick={minimizeWindow}>
        <FontAwesomeIcon icon={faMinus} />
      </div>
      <div className="exp-btn" onClick={() => setHide(false)}>
        展开
      </div>
      <LeftBar
        loading={loading}
        setLoading={setLoading}
        playList={playList}
        setPlayList={setPlayList}
        hideList={hideList}
        setHide={setHide}
      />
      <Player audioState={audioState} setAudioState={setAudioState} />
      <div className={`p-container ${hideList ? "p_expand" : ""}`}>
        <PlayCard audioState={audioState} />
        <BottomBar audioState={audioState} setAudioState={setAudioState} />
        <LrcBox audioState={audioState}></LrcBox>
      </div>
      {/* <button onClick={openFileSystem}>打开目录</button> */}
    </div>
  );
}
