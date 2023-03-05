const { ipcRenderer } = require("electron");
import { useEffect, useState } from "react";
import "./style.scss";
let prevS = -1;

export default function LrcBox(props) {
  const [lrc, setLrc] = useState(null);
  const [line, setLine] = useState("");
  const [swl, setSwl] = useState(true);
  const [delay, setDelay] = useState(0);
  const { audioState } = props;

  useEffect(() => {
    ipcRenderer.on("lrcReader", (e, args) => {
      let res = mmsdk.parseData(args);
      console.log(res);
      if (res.code == 0) {
        setLrc(res.data.lrc);
        prevS = -1;
      }
    });
  }, []);
  useEffect(() => {
    let curTime = Math.floor(audioState.currentTime);

    if (lrc) {
      let prev = 0;
      let next = 0;
      for (let i = 0; i < lrc.length; i++) {
        let item = lrc[i];
        if (curTime >= item.seconds) {
          prev = i;
        }
        if (curTime < item.seconds) {
          next = i;
          break;
        }
      }

      if (lrc[prev].content != "" && prev != prevS) {
        console.log(prev, prevS);
        setSwl(false);
        prevS = prev;
        if (prev < lrc.length) {
          setDelay(lrc[next].seconds - lrc[prev].seconds);
        } else {
          setDelay(audioState.info.duration - lrc[prev].seconds);
        }
        setTimeout(() => {
          setLine(lrc[prev].content);
          setSwl(true);
        }, 4);
      }
    }
  }, [audioState]);
  return (
    <div className="lrc-box">
      {swl ? (
        <div className="line-text" style={{ animationDuration: `${delay / 2}s` }}>
          {lrc ? line : "未找到歌词"}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
