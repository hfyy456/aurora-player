const { ipcRenderer } = require("electron");
import { useEffect, useState } from "react";
import { parseData } from "@/utils/message";
import Image from "@/assets/cm_bg.jpg";
import "./style.scss";
export default function PlayCard(props) {
  const { audioState, setAudioState } = props;
  const [meta, setMeta] = useState(null);
  const [metaCover, setMetaCover] = useState("");
  const getTime = (ts) => {
    return mmsdk.formatTime(ts);
  };
  const initHanlder = () => {
    ipcRenderer.on("getMediaInfo", (event, args) => {
      let res = parseData(args);
      console.log(res);
      if (res.code == 0) {
        setMeta(res.data.meta);
        setMetaCover(mmsdk.getMetaPic(res.data.meta) || Image);
      }
    });
  };
  useEffect(() => {
    initHanlder();
  }, []);
  return (
    <div
      className={`play-card ${`play-card_${
        audioState.playing ? "playing" : ""
      }`}`}
    >
      <div
        className="player_bg"
        style={{
          backgroundImage: `url(${metaCover})`,
        }}
      ></div>
      <div className="back">
        <div className="al-cover">
          <canvas id="audio_cavs"></canvas>
          <div
            className={`pic pic_playing`}
            style={{
              animationPlayState:
                audioState.playing == true ? "running" : "paused",
              backgroundImage: `url(${metaCover})`,
            }}
          />
        </div>
        {meta ? (
          <div className="ms-info">
            {meta.artist || "未知"} - {meta.title || "未知"}
            <br />
            <div className="timeupdate">
              {getTime(audioState.currentTime)} /{" "}
              {getTime(audioState.info.duration)}
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
